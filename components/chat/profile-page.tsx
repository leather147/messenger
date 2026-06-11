"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/lib/actions/users"
import { MessageSquare, Phone, MapPin, Mail, AtSign, CheckCircle2, Edit2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/db/schema"

interface ProfilePageProps {
  user: User
  isSelf?: boolean
}

export function ProfilePage({ user, isSelf = false }: ProfilePageProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio ?? "")
  const [phone, setPhone] = useState(user.phone ?? "")
  const [location, setLocation] = useState(user.location ?? "")
  const [username, setUsername] = useState(user.username ?? "")
  const [saving, setSaving] = useState(false)

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleSave() {
    setSaving(true)
    await updateProfile({ name, bio, phone, location, username })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="border-b border-border bg-card p-4 sm:p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5 md:gap-6">
          <div className="relative mx-auto shrink-0 sm:mx-0">
            <Avatar className="size-24 ring-4 ring-background sm:size-24">
              <AvatarImage src={user.image ?? undefined} alt={name} />
              <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-background ${
                user.status === "online" ? "bg-green-500" : "bg-gray-400"
              }`}
            />
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="truncate text-2xl font-bold text-foreground md:text-3xl">{name}</h1>
              <CheckCircle2 className="size-5 shrink-0 text-primary" />
            </div>
            {user.username && <p className="mt-0.5 text-sm text-muted-foreground">@{user.username}</p>}
            <p className={`mt-1 text-sm font-medium ${user.status === "online" ? "text-green-500" : "text-muted-foreground"}`}>
              {user.status === "online" ? "Онлайн" : "Не в сети"}
            </p>
            {bio && !editing && <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground sm:mx-0">{bio}</p>}
          </div>

          <div className="flex shrink-0 flex-wrap justify-center gap-2 sm:justify-end">
            {!isSelf && (
              <>
                <Button size="sm" variant="outline" className="h-10 flex-1 gap-2 sm:h-9 sm:flex-none">
                  <MessageSquare className="size-4" />
                  <span>Написать</span>
                </Button>
                <Button size="sm" variant="outline" className="h-10 flex-1 gap-2 sm:h-9 sm:flex-none">
                  <Phone className="size-4" />
                  <span>Позвонить</span>
                </Button>
              </>
            )}
            {isSelf && !editing && (
              <Button size="sm" onClick={() => setEditing(true)} className="h-10 w-full gap-2 sm:h-9 sm:w-auto">
                <Edit2 className="size-4" />
                Редактировать
              </Button>
            )}
            {isSelf && editing && (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="h-10 flex-1 sm:h-9 sm:flex-none">
                  Отмена
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="h-10 flex-1 sm:h-9 sm:flex-none">
                  {saving ? "Сохраняем..." : "Сохранить"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid max-w-4xl grid-cols-1 gap-4 p-4 sm:p-5 md:gap-6 md:p-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Информация</h2>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Имя</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 md:h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Имя пользователя</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" className="h-11 md:h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>О себе</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Расскажите о себе..." />
              </div>
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (xxx) xxx-xx-xx" className="h-11 md:h-10" />
              </div>
              <div className="space-y-1.5">
                <Label>Местоположение</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Москва, Россия" className="h-11 md:h-10" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {phone && <InfoLine icon={Phone} title={phone} caption="Мобильный" />}
              <InfoLine icon={Mail} title={user.email} caption="Email" />
              {user.username && <InfoLine icon={AtSign} title={`@${user.username}`} caption="Имя пользователя" />}
              {location && <InfoLine icon={MapPin} title={location} caption="Местоположение" />}
              {!phone && !user.username && !location && <p className="text-sm text-muted-foreground">Нет дополнительной информации</p>}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">О пользователе</h2>
          <div className="space-y-3">
            <StatLine label="Зарегистрирован" value={new Date(user.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })} />
            <div className="flex flex-col gap-2 border-b border-border py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-muted-foreground">Статус</span>
              <Badge variant="outline" className={user.status === "online" ? "w-fit border-green-500 bg-green-50 text-green-600 dark:bg-green-950" : "w-fit"}>
                {user.status === "online" ? "Онлайн" : "Не в сети"}
              </Badge>
            </div>
            {user.lastSeen && user.status !== "online" && (
              <StatLine label="Последний визит" value={new Date(user.lastSeen).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoLine({ icon: Icon, title, caption }: { icon: typeof Phone; title: string; caption: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </div>
    </div>
  )
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground sm:text-right">{value}</span>
    </div>
  )
}
