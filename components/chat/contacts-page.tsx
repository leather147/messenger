"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { getAllUsers } from "@/lib/actions/users"
import { createDirectConversation } from "@/lib/actions/conversations"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MessageSquare, Phone, MapPin, Mail, AtSign, UserPlus, Users } from "lucide-react"
import { UserCardSkeleton } from "@/components/ui/skeleton"
import { useAnimation } from "@/components/animation-provider"
import type { User } from "@/lib/db/schema"

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

type UserType = Awaited<ReturnType<typeof getAllUsers>>[number]

function UserCard({
  user,
  onMessage,
  index,
  animationsEnabled,
}: {
  user: UserType
  onMessage: (userId: string) => void
  index: number
  animationsEnabled: boolean
}) {
  const delay = Math.min(index * 50, 400)
  return (
    <div
      className={`bg-card rounded-2xl border border-border p-4 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
        animationsEnabled ? "animate-fade-in-up" : ""
      }`}
      style={animationsEnabled ? { animationDelay: `${delay}ms` } : {}}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
              user.status === "online" ? "bg-[var(--online)]" : "bg-muted-foreground/40"
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
          {user.username && (
            <p className="text-xs text-muted-foreground">@{user.username}</p>
          )}
          <p className={`text-xs font-medium mt-0.5 ${user.status === "online" ? "text-[var(--online)]" : "text-muted-foreground"}`}>
            {user.status === "online" ? "В сети" : "Не в сети"}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="shrink-0 gap-1.5 text-xs h-8 px-3 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-200"
          onClick={() => onMessage(user.id)}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Написать</span>
        </Button>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 px-0.5">
          {user.bio}
        </p>
      )}

      {/* Contact info */}
      <div className="flex flex-col gap-1.5">
        {user.phone && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <Phone className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-foreground">{user.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
            <Mail className="w-3 h-3 text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        </div>
        {user.location && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0">
              <MapPin className="w-3 h-3 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">{user.location}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function ContactsPage({ currentUser }: { currentUser: User }) {
  const router = useRouter()
  const { animationsEnabled } = useAnimation()
  const [users, setUsers] = useState<UserType[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllUsers()
      setUsers(data)
      setLoading(false)
    })
  }, [])

  async function handleMessage(userId: string) {
    const convId = await createDirectConversation(userId)
    router.push(`/chat/${convId}`)
  }

  const filtered = users.filter((u) => {
    const q = query.toLowerCase()
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username?.toLowerCase().includes(q) ?? false) ||
      (u.phone?.includes(q) ?? false)
    )
  })

  const online = filtered.filter((u) => u.status === "online")
  const offline = filtered.filter((u) => u.status !== "online")

  return (
    <div className={`flex-1 overflow-y-auto bg-background ${animationsEnabled ? "page-enter" : ""}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">Контакты</h1>
              <p className="text-xs text-muted-foreground">{users.length} пользователей</p>
            </div>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск контактов..."
              className="pl-9 h-9 bg-secondary border-0 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-5 max-w-5xl mx-auto space-y-6">
        {loading ? (
          <>
            {/* Suggested skeleton */}
            <section>
              <div className="skeleton h-4 w-28 mb-3 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            </section>
            <section>
              <div className="skeleton h-4 w-20 mb-3 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <UserCardSkeleton key={i} />
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Suggested — online users */}
            {online.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-[var(--online)]" />
                  <h2 className="text-xs font-semibold text-[var(--online)] uppercase tracking-wider">
                    Сейчас онлайн — {online.length}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {online.map((u, i) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      onMessage={handleMessage}
                      index={i}
                      animationsEnabled={animationsEnabled}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All contacts — offline */}
            {offline.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Контакты — {offline.length}
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {offline.map((u, i) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      onMessage={handleMessage}
                      index={online.length + i}
                      animationsEnabled={animationsEnabled}
                    />
                  ))}
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mb-4">
                  <Search className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-base font-semibold text-foreground">Никого не найдено</p>
                <p className="text-sm text-muted-foreground mt-1">Попробуйте изменить запрос</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}