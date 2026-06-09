"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createDirectConversation } from "@/lib/actions/conversations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, MapPin, MessageCircle, Phone, Search, Sparkles, UserRound, type LucideIcon } from "lucide-react"
import type { User } from "@/lib/db/schema"

interface Props {
  users: User[]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function statusLabel(status: string | null) {
  if (status === "online") return "в сети"
  if (status === "away") return "не на месте"
  if (status === "busy") return "занят"
  return "был недавно"
}

function statusClass(status: string | null) {
  if (status === "online") return "bg-[var(--online)]"
  if (status === "away") return "bg-[var(--away)]"
  if (status === "busy") return "bg-destructive"
  return "bg-muted-foreground"
}

export function ContactsPage({ users }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return users

    return users.filter((u) =>
      [u.name, u.email, u.username, u.phone, u.location, u.bio]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q))
    )
  }, [query, users])

  const suggested = filtered.slice(0, 6)
  const contacts = filtered.slice(6)

  function openDirect(userId: string) {
    startTransition(async () => {
      const conversationId = await createDirectConversation(userId)
      router.push(`/chat/${conversationId}`)
    })
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-6 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Контакты</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Люди из базы Aster Chat: быстрые диалоги, телефоны и контактные данные.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по имени, телефону, email"
              className="h-10 bg-card pl-9"
            />
          </div>
        </header>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Предлагаемые люди</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {suggested.map((u) => (
              <ContactCard key={u.id} user={u} disabled={isPending} onMessage={() => openDirect(u.id)} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserRound className="size-4 text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Контакты профиля</h2>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {contacts.length > 0 ? (
              contacts.map((u, index) => (
                <div key={u.id} className={index === 0 ? "" : "border-t border-border"}>
                  <ContactRow user={u} disabled={isPending} onMessage={() => openDirect(u.id)} />
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <Search className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Контакты не найдены</p>
                <p className="text-xs text-muted-foreground">Попробуйте изменить поисковый запрос.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function ContactCard({
  user,
  disabled,
  onMessage,
}: {
  user: User
  disabled: boolean
  onMessage: () => void
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="size-12">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-card ${statusClass(user.status)}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">{user.name}</h3>
              <p className="truncate text-xs text-muted-foreground">@{user.username ?? "contact"}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-[11px]">
              {statusLabel(user.status)}
            </Badge>
          </div>

          {user.bio && <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{user.bio}</p>}

          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <ContactLine icon={Phone} value={user.phone} fallback="Телефон не указан" />
            <ContactLine icon={Mail} value={user.email} />
            <ContactLine icon={MapPin} value={user.location} fallback="Локация не указана" />
          </div>

          <Button disabled={disabled} onClick={onMessage} size="sm" className="mt-4 w-full gap-2">
            <MessageCircle className="size-4" />
            Написать
          </Button>
        </div>
      </div>
    </article>
  )
}

function ContactRow({ user, disabled, onMessage }: { user: User; disabled: boolean; onMessage: () => void }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <Avatar className="size-11">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-muted text-sm font-semibold text-muted-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-card ${statusClass(user.status)}`} />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">{user.name}</h3>
            <Badge variant="outline" className="text-[11px]">
              {statusLabel(user.status)}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{user.bio ?? "Контакт Aster Chat"}</p>
        </div>
      </div>

      <div className="grid gap-2 text-xs text-muted-foreground md:min-w-[420px] md:grid-cols-3">
        <ContactLine icon={Phone} value={user.phone} fallback="—" />
        <ContactLine icon={Mail} value={user.email} />
        <ContactLine icon={MapPin} value={user.location} fallback="—" />
      </div>

      <Button disabled={disabled} onClick={onMessage} variant="outline" size="sm" className="gap-2 md:shrink-0">
        <MessageCircle className="size-4" />
        Диалог
      </Button>
    </div>
  )
}

function ContactLine({
  icon: Icon,
  value,
  fallback,
}: {
  icon: LucideIcon
  value?: string | null
  fallback?: string
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{value || fallback || "—"}</span>
    </div>
  )
}
