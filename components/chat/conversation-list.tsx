"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getConversations, createDirectConversation } from "@/lib/actions/conversations"
import { searchUsers } from "@/lib/actions/users"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Edit, Pin, Users2 } from "lucide-react"
import type { User } from "@/lib/db/schema"
import { NewConversationDialog } from "@/components/chat/new-conversation-dialog"

type ConvWithMeta = Awaited<ReturnType<typeof getConversations>>[number]

interface Props {
  currentUser: User
  onSelect?: () => void
}

function formatTime(date: Date | string | null): string {
  if (!date) return ""
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const dayMs = 86400000

  if (diff < dayMs && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }
  if (diff < 2 * dayMs) return "Вчера"
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ConversationList({ currentUser, onSelect }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [conversations, setConversations] = useState<ConvWithMeta[]>([])
  const [query, setQuery] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [isPending, startTransition] = useTransition()

  function load() {
    startTransition(async () => {
      const data = await getConversations()
      setConversations(data)
    })
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [])

  const filtered = conversations.filter((c) => {
    const name = c.displayName ?? c.name ?? ""
    return name.toLowerCase().includes(query.toLowerCase())
  })

  const pinned = filtered.filter((c) => c.isPinned)
  const rest = filtered.filter((c) => !c.isPinned)

  function handleSelect(id: string) {
    onSelect?.()
    router.push(`/chat/${id}`)
  }

  async function handleNewDirect(userId: string) {
    const id = await createDirectConversation(userId)
    setShowNew(false)
    onSelect?.()
    router.push(`/chat/${id}`)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Сообщения</h2>
          <button
            onClick={() => setShowNew(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск сообщений"
            className="pl-9 h-9 bg-secondary border-0 text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {pinned.length > 0 && (
          <>
            <div className="flex items-center gap-1 px-2 py-1.5">
              <Pin className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Закреплённые</span>
            </div>
            {pinned.map((c) => (
              <ConvItem
                key={c.id}
                conv={c}
                isActive={pathname === `/chat/${c.id}`}
                currentUserId={currentUser.id}
                onSelect={() => handleSelect(c.id)}
              />
            ))}
          </>
        )}

        {rest.map((c) => (
          <ConvItem
            key={c.id}
            conv={c}
            isActive={pathname === `/chat/${c.id}`}
            currentUserId={currentUser.id}
            onSelect={() => handleSelect(c.id)}
          />
        ))}

        {filtered.length === 0 && !isPending && (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Диалогов не найдено</p>
            <p className="text-xs text-muted-foreground mt-1">
              {query ? "Попробуйте другой запрос" : "Начните новый диалог"}
            </p>
          </div>
        )}
      </div>

      {showNew && (
        <NewConversationDialog
          currentUser={currentUser}
          onClose={() => setShowNew(false)}
          onSelectUser={handleNewDirect}
        />
      )}
    </div>
  )
}

function ConvItem({
  conv,
  isActive,
  currentUserId,
  onSelect,
}: {
  conv: ConvWithMeta
  isActive: boolean
  currentUserId: string
  onSelect: () => void
}) {
  const name = conv.displayName ?? conv.name ?? "Без названия"
  const initials = getInitials(name)
  const isOwn = conv.lastMessageUserId === currentUserId

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors text-left ${
        isActive ? "bg-accent" : "hover:bg-secondary"
      }`}
    >
      <div className="relative shrink-0">
        <Avatar className="w-10 h-10">
          <AvatarImage src={(conv.displayAvatar as string | undefined) ?? undefined} alt={name} />
          <AvatarFallback className={`text-sm font-semibold ${isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
            {conv.type === "group" ? <Users2 className="w-4 h-4" /> : initials}
          </AvatarFallback>
        </Avatar>
        {conv.type === "direct" && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--online)] border-2 border-[var(--sidebar)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`text-sm font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
            {name}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {formatTime(conv.lastMessageAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-xs text-muted-foreground truncate">
            {isOwn && conv.lastMessageText ? `Вы: ${conv.lastMessageText}` : (conv.lastMessageText ?? "Начните общение")}
          </p>
          {conv.unreadCount > 0 && (
            <Badge className="h-4 min-w-4 px-1 text-[10px] bg-primary text-white rounded-full shrink-0">
              {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
