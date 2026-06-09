"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, Phone, Video, Bell, Lock, Trash2, X, Users2 } from "lucide-react"
import type { Conversation, User } from "@/lib/db/schema"

interface Props {
  conversation: Conversation
  members: { user: User; role: string; userId: string }[]
  currentUser: User
  otherUser: User | null
  onClose: () => void
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function ChatDetailPanel({ conversation, members, otherUser, onClose }: Props) {
  const displayName = conversation.type === "direct"
    ? (otherUser?.name ?? "Пользователь")
    : (conversation.name ?? "Группа")

  const displayAvatar = conversation.type === "direct" ? otherUser?.image : conversation.avatar
  const bio = conversation.type === "direct" ? otherUser?.bio : conversation.description

  return (
    <aside className="fixed inset-x-0 bottom-16 top-0 z-40 flex flex-col overflow-y-auto border-l border-border bg-[var(--surface)] md:static md:inset-auto md:z-auto md:w-[280px] md:shrink-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold text-foreground">Подробности</span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary md:h-7 md:w-7"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 px-4 py-5">
        <div className="relative">
          <Avatar className="h-20 w-20 md:h-16 md:w-16">
            <AvatarImage src={displayAvatar ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
              {conversation.type === "group" ? <Users2 className="h-7 w-7" /> : getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {conversation.type === "direct" && (
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--surface)] bg-[var(--online)]" />
          )}
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-foreground md:text-base">{displayName}</p>
          <p className="mt-0.5 text-xs text-[var(--online)]">
            {conversation.type === "direct" ? "В сети" : `${members.length} участников`}
          </p>
          {bio && <p className="mt-2 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">{bio}</p>}
        </div>

        <div className="mt-1 grid w-full max-w-sm grid-cols-4 gap-3 md:flex md:w-auto">
          {[
            { icon: MessageSquare, label: "Чат" },
            { icon: Phone, label: "Звонок" },
            { icon: Video, label: "Видео" },
            { icon: Bell, label: "Звук" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <button className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-primary md:h-10 md:w-10">
                <Icon className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {conversation.type === "direct" && otherUser && (
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Информация</p>
          <div className="flex flex-col gap-3">
            {otherUser.email && <Info label="Email" value={otherUser.email} />}
            {otherUser.username && <Info label="Имя пользователя" value={`@${otherUser.username}`} />}
            {otherUser.phone && <Info label="Телефон" value={otherUser.phone} />}
            {otherUser.location && <Info label="Местоположение" value={otherUser.location} />}
          </div>
        </div>
      )}

      {conversation.type === "group" && (
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Участники ({members.length})
          </p>
          <div className="flex flex-col gap-2">
            {members.slice(0, 8).map((m) => (
              <div key={m.userId} className="flex items-center gap-2">
                <Avatar className="h-8 w-8 md:h-7 md:w-7">
                  <AvatarImage src={m.user?.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {getInitials(m.user?.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{m.user?.name ?? "Пользователь"}</p>
                  {m.role === "admin" && <p className="text-[10px] text-primary">Администратор</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="flex flex-col gap-1 px-4 py-3">
        <button className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition-colors hover:bg-secondary md:py-2.5">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Уведомления
          </div>
          <span className="text-xs font-medium text-[var(--online)]">Вкл</span>
        </button>
        <button className="flex w-full items-center justify-between rounded-lg px-2 py-3 text-left transition-colors hover:bg-secondary md:py-2.5">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Lock className="h-4 w-4 text-muted-foreground" />
            Конфиденциальность
          </div>
        </button>
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-destructive transition-colors hover:bg-destructive/10 md:py-2.5">
          <Trash2 className="h-4 w-4" />
          <span className="text-sm">Очистить чат</span>
        </button>
      </div>
    </aside>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm text-foreground">{value}</p>
    </div>
  )
}
