"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { User as DbUser } from "@/lib/db/schema"
import {
  User,
  Palette,
  Bell,
  MessageSquare,
  Shield,
  Monitor,
  Globe,
  HardDrive,
  Sun,
  Moon,
  Laptop,
  Search,
  RotateCcw,
  Check,
} from "lucide-react"

type SettingsPageProps = {
  currentUser?: DbUser | null
}

const STORAGE_KEY = "aster-chat-settings"

const SECTIONS = [
  { id: "account", label: "Мой аккаунт", icon: User },
  { id: "appearance", label: "Внешний вид", icon: Palette },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "chats", label: "Чаты", icon: MessageSquare },
  { id: "privacy", label: "Конфиденциальность", icon: Shield },
  { id: "devices", label: "Устройства", icon: Monitor },
  { id: "language", label: "Язык и регион", icon: Globe },
  { id: "storage", label: "Хранилище", icon: HardDrive },
]

const ACCENT_COLORS = [
  { name: "Синий", value: "#2563eb" },
  { name: "Фиолетовый", value: "#7c3aed" },
  { name: "Зелёный", value: "#16a34a" },
  { name: "Оранжевый", value: "#ea580c" },
  { name: "Красный", value: "#dc2626" },
]

const DEFAULT_SETTINGS = {
  accentColor: "#2563eb",
  compactMode: false,
  showAvatars: true,
  reduceMotion: false,
  fontSize: 100,
  msgDensity: "comfortable",
  notifSound: true,
  notifDesktop: true,
  notifPreview: true,
  lastRead: true,
  enterSend: true,
}

type StoredSettings = typeof DEFAULT_SETTINGS

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

function readStoredSettings(): StoredSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsPage({ currentUser }: SettingsPageProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState("appearance")
  const [search, setSearch] = useState("")
  const [accentColor, setAccentColor] = useState(DEFAULT_SETTINGS.accentColor)
  const [compactMode, setCompactMode] = useState(DEFAULT_SETTINGS.compactMode)
  const [showAvatars, setShowAvatars] = useState(DEFAULT_SETTINGS.showAvatars)
  const [reduceMotion, setReduceMotion] = useState(DEFAULT_SETTINGS.reduceMotion)
  const [fontSize, setFontSize] = useState(DEFAULT_SETTINGS.fontSize)
  const [msgDensity, setMsgDensity] = useState(DEFAULT_SETTINGS.msgDensity)
  const [notifSound, setNotifSound] = useState(DEFAULT_SETTINGS.notifSound)
  const [notifDesktop, setNotifDesktop] = useState(DEFAULT_SETTINGS.notifDesktop)
  const [notifPreview, setNotifPreview] = useState(DEFAULT_SETTINGS.notifPreview)
  const [lastRead, setLastRead] = useState(DEFAULT_SETTINGS.lastRead)
  const [enterSend, setEnterSend] = useState(DEFAULT_SETTINGS.enterSend)
  const [saved, setSaved] = useState(false)

  const filteredSections = SECTIONS.filter((s) => s.label.toLowerCase().includes(search.toLowerCase()))

  function applySettingsToState(settings: StoredSettings) {
    setAccentColor(settings.accentColor)
    setCompactMode(settings.compactMode)
    setShowAvatars(settings.showAvatars)
    setReduceMotion(settings.reduceMotion)
    setFontSize(settings.fontSize)
    setMsgDensity(settings.msgDensity)
    setNotifSound(settings.notifSound)
    setNotifDesktop(settings.notifDesktop)
    setNotifPreview(settings.notifPreview)
    setLastRead(settings.lastRead)
    setEnterSend(settings.enterSend)
  }

  function getCurrentSettings(): StoredSettings {
    return {
      accentColor,
      compactMode,
      showAvatars,
      reduceMotion,
      fontSize,
      msgDensity,
      notifSound,
      notifDesktop,
      notifPreview,
      lastRead,
      enterSend,
    }
  }

  useEffect(() => {
    const stored = readStoredSettings()
    applySettingsToState(stored)
    applyVisualSettings(stored)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    applyVisualSettings(getCurrentSettings())
  }, [mounted, accentColor, compactMode, reduceMotion, fontSize])

  function handleSave() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getCurrentSettings()))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setTheme("light")
    applySettingsToState(DEFAULT_SETTINGS)
    applyVisualSettings(DEFAULT_SETTINGS)
    window.localStorage.removeItem(STORAGE_KEY)
  }

  function handleCancel() {
    const stored = readStoredSettings()
    applySettingsToState(stored)
    applyVisualSettings(stored)
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground mb-3">Настройки</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск настроек" className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {filteredSections.map((section) => {
            const Icon = section.icon
            const active = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                  active ? "bg-accent text-primary" : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {section.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSection === "account" && (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground">Мой аккаунт</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Основная информация текущего пользователя.</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                <SettingRow title="Имя" description="Отображаемое имя аккаунта.">
                  <span className="text-sm text-foreground">{currentUser?.name ?? "Не указано"}</span>
                </SettingRow>
                <Separator />
                <SettingRow title="Email" description="Адрес для входа и уведомлений.">
                  <span className="text-sm text-muted-foreground">{currentUser?.email ?? "Не указано"}</span>
                </SettingRow>
                <Separator />
                <SettingRow title="Имя пользователя" description="Публичный username.">
                  <span className="text-sm text-muted-foreground">{currentUser?.username ? `@${currentUser.username}` : "Не указано"}</span>
                </SettingRow>
              </div>
            </>
          )}

          {activeSection === "appearance" && (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground">Внешний вид</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Настройте внешний вид Aster Chat под себя.</p>
              </div>

              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                <SettingRow title="Тема" description="Выберите внешний вид приложения.">
                  <div className="flex gap-2">
                    {[
                      { value: "light", label: "Светлая", icon: Sun },
                      { value: "dark", label: "Тёмная", icon: Moon },
                      { value: "system", label: "Системная", icon: Laptop },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setTheme(value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          (mounted ? theme : "light") === value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background text-foreground border-border hover:border-primary"
                        }`}
                      >
                        <Icon className="size-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <Separator />
                <SettingRow title="Акцентный цвет" description="Выберите любимый акцентный цвет.">
                  <div className="flex items-center gap-2">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        title={c.name}
                        onClick={() => setAccentColor(c.value)}
                        className="size-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110"
                        style={{
                          backgroundColor: c.value,
                          borderColor: accentColor === c.value ? "#fff" : c.value,
                          outline: accentColor === c.value ? `2px solid ${c.value}` : "none",
                        }}
                      >
                        {accentColor === c.value && <Check className="size-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <Separator />
                <SettingRow title="Компактный режим" description="Отображать больше контента в меньшем пространстве.">
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </SettingRow>
                <Separator />
                <SettingRow title="Размер шрифта" description="Настройте размер текста во всём приложении.">
                  <div className="flex items-center gap-3 w-64">
                    <span className="text-xs text-muted-foreground">А</span>
                    <input type="range" min={75} max={150} step={5} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="flex-1 accent-primary" />
                    <span className="text-sm text-muted-foreground">А</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{fontSize}%</span>
                  </div>
                </SettingRow>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Окно и макет</h4>
                <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                  <SettingRow title="Плотность списка сообщений" description="Выберите, сколько места занимают сообщения.">
                    <select value={msgDensity} onChange={(e) => setMsgDensity(e.target.value)} className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="compact">Компактный</option>
                      <option value="comfortable">Комфортный</option>
                      <option value="spacious">Просторный</option>
                    </select>
                  </SettingRow>
                  <Separator />
                  <SettingRow title="Показывать аватары" description="Отображать аватары в списке сообщений и чатах.">
                    <Switch checked={showAvatars} onCheckedChange={setShowAvatars} />
                  </SettingRow>
                  <Separator />
                  <SettingRow title="Уменьшить движение" description="Минимизировать анимации и визуальные эффекты.">
                    <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
                  </SettingRow>
                </div>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <SettingsBlock title="Уведомления" description="Настройте уведомления.">
              <SettingRow title="Звук уведомлений" description="Воспроизводить звук при новых сообщениях."><Switch checked={notifSound} onCheckedChange={setNotifSound} /></SettingRow>
              <Separator />
              <SettingRow title="Уведомления рабочего стола" description="Показывать уведомления на рабочем столе."><Switch checked={notifDesktop} onCheckedChange={setNotifDesktop} /></SettingRow>
              <Separator />
              <SettingRow title="Предпросмотр сообщений" description="Показывать содержимое сообщений в уведомлениях."><Switch checked={notifPreview} onCheckedChange={setNotifPreview} /></SettingRow>
            </SettingsBlock>
          )}

          {activeSection === "chats" && (
            <SettingsBlock title="Чаты" description="Настройте поведение чатов.">
              <SettingRow title="Отправка по Enter" description="Нажмите Enter для отправки сообщения (Shift+Enter для новой строки)."><Switch checked={enterSend} onCheckedChange={setEnterSend} /></SettingRow>
              <Separator />
              <SettingRow title="Отметка о прочтении" description="Автоматически отмечать сообщения прочитанными."><Switch checked={lastRead} onCheckedChange={setLastRead} /></SettingRow>
            </SettingsBlock>
          )}

          {activeSection === "language" && (
            <SettingsBlock title="Язык и регион" description="Управляйте языком и региональными настройками.">
              <SettingRow title="Язык интерфейса" description="Выберите язык приложения.">
                <select className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </SettingRow>
              <Separator />
              <SettingRow title="Формат даты и времени" description="Выберите формат отображения даты и времени.">
                <select className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="ru">ДД.ММ.ГГГГ ЧЧ:ММ</option>
                  <option value="en">MM/DD/YYYY HH:MM</option>
                </select>
              </SettingRow>
            </SettingsBlock>
          )}

          {(activeSection === "privacy" || activeSection === "devices" || activeSection === "storage") && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                {(() => {
                  const section = SECTIONS.find((x) => x.id === activeSection)
                  if (!section) return null
                  const Icon = section.icon
                  return <Icon className="size-6" />
                })()}
              </div>
              <p className="text-sm">Раздел «{SECTIONS.find((x) => x.id === activeSection)?.label}» в разработке</p>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="size-4" />
            Сбросить
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCancel}>Отмена</Button>
            <Button size="sm" onClick={handleSave} className="gap-2">
              {saved ? <Check className="size-4" /> : null}
              {saved ? "Сохранено!" : "Сохранить изменения"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingsBlock({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <>
      <div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="bg-card rounded-xl border border-border p-5 space-y-5">{children}</div>
    </>
  )
}

function SettingRow({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
