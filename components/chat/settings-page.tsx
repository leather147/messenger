"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { User as DbUser } from "@/lib/db/schema"
import { Bell, Check, HardDrive, Laptop, MessageSquare, Monitor, Moon, Palette, RotateCcw, Search, Shield, Sun, User } from "lucide-react"

type SettingsPageProps = { currentUser?: DbUser | null }

const STORAGE_KEY = "aster-chat-settings"
const DEFAULT_SETTINGS = {
  accentColor: "#2563eb",
  compactMode: false,
  reduceMotion: false,
  fontSize: 100,
  notifSound: true,
  notifDesktop: true,
  notifPreview: true,
  enterSend: true,
  lastRead: true,
}

type StoredSettings = typeof DEFAULT_SETTINGS

const sections = [
  { id: "account", label: "Аккаунт", icon: User },
  { id: "appearance", label: "Вид", icon: Palette },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "chats", label: "Чаты", icon: MessageSquare },
  { id: "privacy", label: "Приватность", icon: Shield },
  { id: "devices", label: "Устройства", icon: Monitor },
  { id: "storage", label: "Память", icon: HardDrive },
]

const colors = ["#2563eb", "#7c3aed", "#16a34a", "#ea580c", "#dc2626"]

function readStoredSettings(): StoredSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function applyVisualSettings(settings: Pick<StoredSettings, "accentColor" | "fontSize" | "compactMode" | "reduceMotion">) {
  if (typeof document === "undefined") return
  const root = document.documentElement
  root.style.setProperty("--primary", settings.accentColor)
  root.style.setProperty("--ring", settings.accentColor)
  root.style.setProperty("--sidebar-primary", settings.accentColor)
  root.style.setProperty("--bubble-own", settings.accentColor)
  root.style.setProperty("--accent", `${settings.accentColor}14`)
  root.style.setProperty("--sidebar-accent", `${settings.accentColor}14`)
  root.style.setProperty("--accent-foreground", settings.accentColor)
  root.style.setProperty("--sidebar-accent-foreground", settings.accentColor)
  root.style.fontSize = `${settings.fontSize}%`
  root.dataset.compact = settings.compactMode ? "true" : "false"
  root.classList.toggle("reduce-motion", settings.reduceMotion)
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("appearance")
  const [search, setSearch] = useState("")
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = readStoredSettings()
    setSettings(stored)
    applyVisualSettings(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) applyVisualSettings(settings)
  }, [mounted, settings])

  const filteredSections = sections.filter((section) => section.label.toLowerCase().includes(search.toLowerCase()))
  const update = <K extends keyof StoredSettings>(key: K, value: StoredSettings[K]) => setSettings((current) => ({ ...current, [key]: value }))

  function handleSave() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  function handleReset() {
    setTheme("light")
    setSettings(DEFAULT_SETTINGS)
    applyVisualSettings(DEFAULT_SETTINGS)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  function handleCancel() {
    const stored = readStoredSettings()
    setSettings(stored)
    applyVisualSettings(stored)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background md:flex-row">
      <aside className="shrink-0 border-b border-border bg-card md:w-64 md:border-b-0 md:border-r">
        <div className="p-4 md:border-b md:border-border">
          <h1 className="mb-3 text-xl font-bold text-foreground">Настройки</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск" className="h-10 pl-9" />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 md:flex-col md:overflow-y-auto md:p-2">
          {filteredSections.map(({ id, label, icon: Icon }) => {
            const active = activeSection === id
            return (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex min-w-fit items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors md:w-full ${active ? "bg-accent text-primary" : "text-foreground hover:bg-muted"}`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            )
          })}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {activeSection === "account" && (
            <SettingsCard title="Аккаунт" description="Основная информация текущего пользователя.">
              <InfoRow label="Имя" value={currentUser?.name ?? "Не указано"} />
              <InfoRow label="Email" value={currentUser?.email ?? "Не указано"} />
              <InfoRow label="Username" value={currentUser?.username ? `@${currentUser.username}` : "Не указано"} />
            </SettingsCard>
          )}

          {activeSection === "appearance" && (
            <div className="space-y-4">
              <SettingsCard title="Внешний вид" description="Тема, цвет, размер текста и плотность интерфейса.">
                <SettingRow title="Тема" description="Выберите оформление приложения.">
                  <div className="grid w-full gap-2 sm:grid-cols-3 md:flex md:w-auto">
                    {[
                      { value: "light", label: "Светлая", icon: Sun },
                      { value: "dark", label: "Тёмная", icon: Moon },
                      { value: "system", label: "Системная", icon: Laptop },
                    ].map(({ value, label, icon: Icon }) => (
                      <button key={value} onClick={() => setTheme(value)} className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium ${((mounted ? theme : "light") === value) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"}`}>
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow title="Акцент" description="Цвет кнопок и выделений.">
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button key={color} onClick={() => update("accentColor", color)} className="flex size-9 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
                        {settings.accentColor === color && <Check className="size-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow title="Размер шрифта" description="Масштаб текста во всём приложении.">
                  <div className="flex w-full items-center gap-3 md:w-64">
                    <input type="range" min={75} max={150} step={5} value={settings.fontSize} onChange={(event) => update("fontSize", Number(event.target.value))} className="flex-1 accent-primary" />
                    <span className="w-10 text-right text-xs text-muted-foreground">{settings.fontSize}%</span>
                  </div>
                </SettingRow>
                <SettingRow title="Компактный режим" description="Больше контента на экране."><Switch checked={settings.compactMode} onCheckedChange={(value) => update("compactMode", value)} /></SettingRow>
                <SettingRow title="Меньше анимации" description="Убрать лишнее движение."><Switch checked={settings.reduceMotion} onCheckedChange={(value) => update("reduceMotion", value)} /></SettingRow>
              </SettingsCard>
            </div>
          )}

          {activeSection === "notifications" && (
            <SettingsCard title="Уведомления" description="Звук, desktop-уведомления и предпросмотр сообщений.">
              <SettingRow title="Звук" description="Звук новых сообщений."><Switch checked={settings.notifSound} onCheckedChange={(value) => update("notifSound", value)} /></SettingRow>
              <SettingRow title="Уведомления рабочего стола" description="Показывать системные уведомления."><Switch checked={settings.notifDesktop} onCheckedChange={(value) => update("notifDesktop", value)} /></SettingRow>
              <SettingRow title="Предпросмотр" description="Показывать текст сообщения."><Switch checked={settings.notifPreview} onCheckedChange={(value) => update("notifPreview", value)} /></SettingRow>
            </SettingsCard>
          )}

          {activeSection === "chats" && (
            <SettingsCard title="Чаты" description="Поведение отправки и прочтения сообщений.">
              <SettingRow title="Enter отправляет" description="Shift+Enter оставляет перенос строки."><Switch checked={settings.enterSend} onCheckedChange={(value) => update("enterSend", value)} /></SettingRow>
              <SettingRow title="Отметка о прочтении" description="Автоматически отмечать сообщения прочитанными."><Switch checked={settings.lastRead} onCheckedChange={(value) => update("lastRead", value)} /></SettingRow>
            </SettingsCard>
          )}

          {(activeSection === "privacy" || activeSection === "devices" || activeSection === "storage") && (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
              <p className="text-sm">Раздел в разработке</p>
            </div>
          )}
        </div>

        <footer className="border-t border-border bg-card p-4 md:px-6">
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="outline" size="sm" onClick={handleReset} className="h-10 gap-2">
              <RotateCcw className="size-4" />
              Сбросить
            </Button>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <Button variant="outline" size="sm" onClick={handleCancel} className="h-10">Отмена</Button>
              <Button size="sm" onClick={handleSave} className="h-10 gap-2">
                {saved ? <Check className="size-4" /> : null}
                {saved ? "Сохранено" : "Сохранить"}
              </Button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-4 rounded-2xl border border-border bg-card p-4 md:p-5">{children}</div>
    </section>
  )
}

function SettingRow({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="min-w-0 sm:shrink-0">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium text-foreground sm:max-w-[60%] sm:text-right">{value}</span>
    </div>
  )
}
