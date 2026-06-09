"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
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
      {/* Header */}
      <div className="bg-card border-b border-border p-6 flex items-start gap-6">
        <div className="relative">
          <Avatar className="size-24 ring-4 ring-background">
            <AvatarImage src={user.image ?? undefined} alt={name} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span
            className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-background ${
              user.status === "online" ? "bg-green-500" : "bg-gray-400"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-foreground truncate">{name}</h1>
            <CheckCircle2 className="size-5 text-primary shrink-0" />
          </div>
          {user.username && (
            <p className="text-muted-foreground text-sm mt-0.5">@{user.username}</p>
          )}
          <p className={`text-sm font-medium mt-1 ${user.status === "online" ? "text-green-500" : "text-muted-foreground"}`}>
            {user.status === "online" ? "Онлайн" : "Не в сети"}
          </p>
          {bio && !editing && (
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">{bio}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isSelf && (
            <>
              <Button size="sm" variant="outline" className="gap-2">
                <MessageSquare className="size-4" />
                <span className="hidden sm:inline">Написать</span>
              </Button>
              <Button size="sm" variant="outline" className="gap-2">
                <Phone className="size-4" />
                <span className="hidden sm:inline">Позвонить</span>
              </Button>
            </>
          )}
          {isSelf && !editing && (
            <Button size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Edit2 className="size-4" />
              Редактировать
            </Button>
          )}
          {isSelf && editing && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                Отмена
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Info Card */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Информация</h2>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Имя</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Имя пользователя</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="@username" />
              </div>
              <div className="space-y-1.5">
                <Label>О себе</Label>
                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Расскажите о себе..." />
              </div>
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (xxx) xxx-xx-xx" />
              </div>
              <div className="space-y-1.5">
                <Label>Местоположение</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Москва, Россия" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {phone && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Phone className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{phone}</p>
                    <p className="text-xs text-muted-foreground">Мобильный</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Email</p>
                </div>
              </div>
              {user.username && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <AtSign className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">@{user.username}</p>
                    <p className="text-xs text-muted-foreground">Имя пользователя</p>
                  </div>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MapPin className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{location}</p>
                    <p className="text-xs text-muted-foreground">Местоположение</p>
                  </div>
                </div>
              )}
              {!phone && !user.username && !location && (
                <p className="text-sm text-muted-foreground">Нет дополнительной информации</p>
              )}
            </div>
          )}
        </div>

        {/* Stats/About */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-base font-semibold text-foreground mb-4">О пользователе</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Зарегистрирован</span>
              <span className="text-sm font-medium text-foreground">
                {new Date(user.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Статус</span>
              <Badge
                variant="outline"
                className={user.status === "online" ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-950" : ""}
              >
                {user.status === "online" ? "Онлайн" : "Не в сети"}
              </Badge>
            </div>
            {user.lastSeen && user.status !== "online" && (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Последний визит</span>
                <span className="text-sm font-medium text-foreground">
                  {new Date(user.lastSeen).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
