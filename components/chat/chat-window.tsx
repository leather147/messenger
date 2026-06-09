"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { getMessages, sendMessage, editMessage, deleteMessage, addReaction } from "@/lib/actions/messages"
import { markAsRead } from "@/lib/actions/conversations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowLeft, Search, Phone, Video, MoreVertical,
  Send, Smile, Paperclip, Mic, Reply, Edit3, Trash2, X, ChevronRight, Users2,
} from "lucide-react"
import type { Conversation, User } from "@/lib/db/schema"
import { ChatDetailPanel } from "@/components/chat/chat-detail-panel"
import Link from "next/link"

type MessageWithMeta = Awaited<ReturnType<typeof getMessages>>[number]
type MemberWithUser = { user: User; role: string; userId: string; isMuted: boolean; isPinned: boolean; joinedAt: Date; lastReadAt: Date | null; conversationId: string; id: string }

interface Props {
  conversation: Conversation
  initialMessages: MessageWithMeta[]
  members: MemberWithUser[]
  currentUser: User
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"]

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
}

function formatDateSeparator(date: Date | string) {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000 && d.getDate() === now.getDate()) return "Сегодня"
  if (diff < 172800000) return "Вчера"
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })
}

export function ChatWindow({ conversation, initialMessages, members, currentUser }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<MessageWithMeta[]>(initialMessages)
  const [input, setInput] = useState("")
  const [replyTo, setReplyTo] = useState<MessageWithMeta | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [emojiFor, setEmojiFor] = useState<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Get other user for direct chat
  const otherMember = conversation.type === "direct"
    ? members.find((m) => m.userId !== currentUser.id)
    : null
  const otherUser = otherMember?.user ?? null
  const displayName = conversation.type === "direct"
    ? (otherUser?.name ?? "Пользователь")
    : (conversation.name ?? "Группа")
  const displayAvatar = conversation.type === "direct" ? otherUser?.image : conversation.avatar

  // Poll for new messages
  useEffect(() => {
    markAsRead(conversation.id)
    const interval = setInterval(() => {
      startTransition(async () => {
        const data = await getMessages(conversation.id)
        setMessages(data)
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [conversation.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text) return

    if (editingId) {
      await editMessage(editingId, text)
      setEditingId(null)
      setInput("")
      const data = await getMessages(conversation.id)
      setMessages(data)
      return
    }

    setInput("")
    setReplyTo(null)
    await sendMessage(conversation.id, text, "text", replyTo?.id)
    const data = await getMessages(conversation.id)
    setMessages(data)
  }

  function startEdit(msg: MessageWithMeta) {
    setEditingId(msg.id)
    setInput(msg.content ?? "")
    inputRef.current?.focus()
  }

  async function handleDelete(msgId: string) {
    await deleteMessage(msgId)
    const data = await getMessages(conversation.id)
    setMessages(data)
  }

  async function handleReaction(msgId: string, emoji: string) {
    setEmojiFor(null)
    await addReaction(msgId, emoji)
    const data = await getMessages(conversation.id)
    setMessages(data)
  }

  // Group messages by date
  const grouped: { date: string; messages: MessageWithMeta[] }[] = []
  messages.forEach((msg) => {
    const d = formatDateSeparator(msg.createdAt)
    const last = grouped[grouped.length - 1]
    if (!last || last.date !== d) grouped.push({ date: d, messages: [msg] })
    else last.messages.push(msg)
  })

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] border-b border-border shrink-0">
          <button
            onClick={() => router.push("/chat")}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button onClick={() => setShowDetail(!showDetail)} className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity">
            <div className="relative shrink-0">
              <Avatar className="w-9 h-9">
                <AvatarImage src={displayAvatar ?? undefined} alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {conversation.type === "group" ? <Users2 className="w-4 h-4" /> : getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              {conversation.type === "direct" && (
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[var(--online)] border-2 border-background" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{displayName}</p>
              <p className="text-xs text-[var(--online)]">
                {conversation.type === "direct" ? "В сети" : `${members.length} участников`}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            {[
              { icon: Search, label: "Поиск" },
              { icon: Phone, label: "Звонок" },
              { icon: Video, label: "Видеозвонок" },
            ].map(({ icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                    <Icon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
            <button
              onClick={() => setShowDetail(!showDetail)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {showDetail ? <X className="w-4 h-4" /> : <MoreVertical className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="flex flex-col gap-1 max-w-3xl mx-auto">
            {grouped.map(({ date, messages: msgs }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-background rounded-full border border-border">
                    {date}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {msgs.map((msg, i) => {
                  const isOwn = msg.userId === currentUser.id
                  const showAvatar = !isOwn && (i === 0 || msgs[i - 1]?.userId !== msg.userId)
                  const replyMsg = msg.replyToId ? messages.find((m) => m.id === msg.replyToId) : null

                  // Group reactions
                  const reactionGroups: Record<string, number> = {}
                  msg.reactions.forEach((r) => {
                    reactionGroups[r.emoji] = (reactionGroups[r.emoji] || 0) + 1
                  })

                  if (msg.isDeleted) {
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-0.5`}>
                        <span className="text-xs text-muted-foreground italic px-3 py-1">Сообщение удалено</span>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 mb-0.5 group ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {/* Avatar */}
                      <div className="w-7 shrink-0 self-end">
                        {showAvatar && !isOwn && (
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={msg.sender?.image ?? undefined} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                              {getInitials(msg.sender?.name ?? "?")}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* Bubble */}
                      <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                        {showAvatar && !isOwn && conversation.type === "group" && (
                          <span className="text-xs font-semibold text-primary mb-0.5 px-1">
                            {msg.sender?.name}
                          </span>
                        )}

                        {/* Reply preview */}
                        {replyMsg && (
                          <div className={`text-xs px-2 py-1 rounded-lg mb-1 border-l-2 border-primary opacity-70 max-w-full ${isOwn ? "bg-primary/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                            <span className="font-semibold">{replyMsg.sender?.name ?? "Пользователь"}</span>
                            <p className="truncate">{replyMsg.content}</p>
                          </div>
                        )}

                        <div className="relative">
                          <div
                            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed relative ${
                              isOwn
                                ? "bg-[var(--bubble-own)] text-[var(--bubble-own-fg)] rounded-br-md"
                                : "bg-[var(--bubble-other)] text-[var(--bubble-other-fg)] rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                            <span className={`text-[10px] ml-2 opacity-70 ${isOwn ? "text-blue-100" : "text-muted-foreground"}`}>
                              {formatTime(msg.createdAt)}
                              {msg.isEdited && " (ред.)"}
                              {isOwn && " ✓✓"}
                            </span>
                          </div>

                          {/* Hover actions */}
                          <div className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                            <button
                              onClick={() => setEmojiFor(emojiFor === msg.id ? null : msg.id)}
                              className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Smile className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => { setReplyTo(msg); inputRef.current?.focus() }}
                              className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                            >
                              <Reply className="w-3 h-3" />
                            </button>
                            {isOwn && (
                              <>
                                <button
                                  onClick={() => startEdit(msg)}
                                  className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(msg.id)}
                                  className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Emoji picker */}
                          {emojiFor === msg.id && (
                            <div className={`absolute top-0 ${isOwn ? "right-0" : "left-0"} -translate-y-full mb-1 bg-[var(--surface)] border border-border rounded-xl shadow-lg p-1.5 flex gap-1 z-10`}>
                              {EMOJIS.map((e) => (
                                <button
                                  key={e}
                                  onClick={() => handleReaction(msg.id, e)}
                                  className="w-7 h-7 rounded-lg hover:bg-secondary flex items-center justify-center text-base transition-colors"
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Reactions */}
                        {Object.entries(reactionGroups).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(reactionGroups).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg.id, emoji)}
                                className="flex items-center gap-0.5 bg-secondary border border-border rounded-full px-1.5 py-0.5 text-xs hover:bg-accent transition-colors"
                              >
                                {emoji} <span className="text-muted-foreground">{count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="px-4 py-3 bg-[var(--surface)] border-t border-border shrink-0">
          {/* Reply preview */}
          {replyTo && (
            <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2 mb-2">
              <Reply className="w-3 h-3 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-primary">{replyTo.sender?.name}</span>
                <p className="text-xs text-muted-foreground truncate">{replyTo.content}</p>
              </div>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Edit indicator */}
          {editingId && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 mb-2">
              <Edit3 className="w-3 h-3 text-amber-600 shrink-0" />
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium flex-1">Редактирование сообщения</span>
              <button onClick={() => { setEditingId(null); setInput("") }} className="text-amber-600 hover:text-amber-800">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>

            <Input
              ref={inputRef}
              placeholder="Написать сообщение..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
                if (e.key === "Escape") {
                  setReplyTo(null)
                  setEditingId(null)
                  setInput("")
                }
              }}
              className="flex-1 bg-secondary border-0 text-sm"
            />

            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Smile className="w-4 h-4" />
            </button>

            {input.trim() ? (
              <Button
                onClick={handleSend}
                className="w-9 h-9 rounded-full bg-primary hover:bg-primary/90 p-0 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <button className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {showDetail && (
        <ChatDetailPanel
          conversation={conversation}
          members={members}
          currentUser={currentUser}
          otherUser={otherUser}
          onClose={() => setShowDetail(false)}
        />
      )}
    </div>
  )
}
