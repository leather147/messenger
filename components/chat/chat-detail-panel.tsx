"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Phone, Video, Bell, Lock, Trash2, X, Users2 } from "lucide-react"
import type { Conversation, User } from "@/lib/db/schema"
import Link from "next/link"

type MemberWithUser = { user: User; role: string; userId: string }

interface Props {
  conversation: Conversation
  members: MemberWithUser[]
  currentUser: User
  otherUser: User | null
  onClose: () => void
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function ChatDetailPanel({ conversation, members, currentUser, otherUser, onClose }: Props) {
  const displayName = conversation.type === "direct"
    ? (otherUser?.name ?? "Пользователь")
    : (conversation.name ?? "Группа")

  const displayAvatar = conversation.type === "direct" ? otherUser?.image : conversation.avatar
  const bio = conversation.type === "direct" ? otherUser?.bio : conversation.description

  return (
    <aside className="w-[280px] shrink-0 flex flex-col bg-[var(--surface)] border-l border-border overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-semibold text-foreground text-sm">Подробности</span>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile */}
      <div className="flex flex-col items-center px-4 py-5 gap-3">
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarImage src={displayAvatar ?? undefined} alt={displayName} />
            <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
              {conversation.type === "group" ? <Users2 className="w-7 h-7" /> : getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {conversation.type === "direct" && (
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--online)] border-2 border-[var(--surface)]" />
          )}
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground text-base">{displayName}</p>
          <p className="text-xs text-[var(--online)] mt-0.5">
            {conversation.type === "direct" ? "В сети" : `${members.length} участников`}
          </p>
          {bio && <p className="text-xs text-muted-foreground mt-2 text-center leading-relaxed">{bio}</p>}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-1">
          {[
            { icon: MessageSquare, label: "Чат" },
            { icon: Phone, label: "Звонок" },
            { icon: Video, label: "Видео" },
            { icon: Bell, label: "Звук" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <button className="w-10 h-10 rounded-xl bg-secondary hover:bg-accent hover:text-primary transition-colors flex items-center justify-center text-muted-foreground">
                <Icon className="w-4 h-4" />
              </button>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Info */}
      {conversation.type === "direct" && otherUser && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Информация</p>
          <div className="flex flex-col gap-2">
            {otherUser.email && (
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm text-foreground">{otherUser.email}</p>
              </div>
            )}
            {otherUser.username && (
              <div>
                <p className="text-xs text-muted-foreground">Имя пользователя</p>
                <p className="text-sm text-foreground">@{otherUser.username}</p>
              </div>
            )}
            {otherUser.location && (
              <div>
                <p className="text-xs text-muted-foreground">Местоположение</p>
                <p className="text-sm text-foreground">{otherUser.location}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Group members */}
      {conversation.type === "group" && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Участники ({members.length})
          </p>
          <div className="flex flex-col gap-2">
            {members.slice(0, 5).map((m) => (
              <div key={m.userId} className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={m.user?.image ?? undefined} />
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                    {getInitials(m.user?.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate font-medium">{m.user?.name ?? "Пользователь"}</p>
                  {m.role === "admin" && (
                    <p className="text-[10px] text-primary">Администратор</p>
                  )}
                </div>
              </div>
            ))}
            {members.length > 5 && (
              <p className="text-xs text-primary cursor-pointer hover:underline">
                Ещё {members.length - 5} участников
              </p>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="px-4 py-3 flex flex-col gap-1">
        <button className="flex items-center justify-between w-full px-2 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Bell className="w-4 h-4 text-muted-foreground" />
            Уведомления
          </div>
          <span className="text-xs text-[var(--online)] font-medium">Вкл</span>
        </button>
        <button className="flex items-center justify-between w-full px-2 py-2.5 rounded-lg hover:bg-secondary transition-colors text-left">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Конфиденциальность
          </div>
        </button>
        <button className="flex items-center gap-2 w-full px-2 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors text-left text-destructive">
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Очистить чат</span>
        </button>
      </div>
    </aside>
  )
}
