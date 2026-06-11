"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  User, Palette, Bell, MessageSquare, Shield, Monitor, Globe, HardDrive,
  Sun, Moon, Laptop, Search, RotateCcw, Check, Sparkles
} from "lucide-react"
import { useAnimation } from "@/components/animation-provider"

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
  { name: "Терракотовый", value: "#c2621e" },
  { name: "Янтарный", value: "#d97706" },
  { name: "Зелёный", value: "#16a34a" },
  { name: "Синий", value: "#2563eb" },
  { name: "Красный", value: "#dc2626" },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { animationsEnabled, toggleAnimations } = useAnimation()
  const [activeSection, setActiveSection] = useState("appearance")
  const [search, setSearch] = useState("")
  const [accentColor, setAccentColor] = useState("#2563eb")
  const [compactMode, setCompactMode] = useState(false)
  const [showAvatars, setShowAvatars] = useState(true)
  const [fontSize, setFontSize] = useState(100)
  const [msgDensity, setMsgDensity] = useState("comfortable")
  const [notifSound, setNotifSound] = useState(true)
  const [notifDesktop, setNotifDesktop] = useState(true)
  const [notifPreview, setNotifPreview] = useState(true)
  const [lastRead, setLastRead] = useState(true)
  const [enterSend, setEnterSend] = useState(true)
  const [saved, setSaved] = useState(false)

  const filteredSections = SECTIONS.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    setTheme("light")
    setAccentColor("#c2621e")
    setCompactMode(false)
    setShowAvatars(true)
    setFontSize(100)
    setMsgDensity("comfortable")
    if (!animationsEnabled) toggleAnimations()
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground mb-3">Настройки</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск настроек"
              className="pl-9 h-9 text-sm"
            />
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
                  active
                    ? "bg-accent text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {section.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSection === "appearance" && (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground">Внешний вид</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Настройте внешний вид Карavana под себя.</p>
              </div>

              {/* Theme */}
              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                <SettingRow
                  title="Тема"
                  description="Выберите внешний вид приложения."
                >
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
                          theme === value
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

                <SettingRow
                  title="Акцентный цвет"
                  description="Выберите любимый акцентный цвет."
                >
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

                <SettingRow
                  title="Компактный режим"
                  description="Отображать больше контента в меньшем пространстве."
                >
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </SettingRow>

                <Separator />

                <SettingRow
                  title="Размер шрифта"
                  description="Настройте размер текста во всём приложении."
                >
                  <div className="flex items-center gap-3 w-64">
                    <span className="text-xs text-muted-foreground">А</span>
                    <input
                      type="range"
                      min={75}
                      max={150}
                      step={5}
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">А</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{fontSize}%</span>
                  </div>
                </SettingRow>
              </div>

              {/* Window & Layout */}
              <div>
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                  Окно и макет
                </h4>
                <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                  <SettingRow
                    title="Плотность списка сообщений"
                    description="Выберите, сколько места занимают сообщения."
                  >
                    <select
                      value={msgDensity}
                      onChange={(e) => setMsgDensity(e.target.value)}
                      className="text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="compact">Компактный</option>
                      <option value="comfortable">Комфортный</option>
                      <option value="spacious">Просторный</option>
                    </select>
                  </SettingRow>
                  <Separator />
                  <SettingRow title="Показывать аватары" description="Отображать аватары в списке сообщений и чатах.">
                    <Switch checked={showAvatars} onCheckedChange={setShowAvatars} />
                  </SettingRow>
                </div>
              </div>

              {/* Advanced */}
                <div>
                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                  Дополнительно
                </h4>
                <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                  <SettingRow
                    title="Плавные анимации"
                    description="Включить анимации появления, переходов и сообщений во всём приложении."
                  >
                    <Switch checked={animationsEnabled} onCheckedChange={toggleAnimations} />
                  </SettingRow>
                  <Separator />
                  <SettingRow
                    title="Уменьшить движение"
                    description="Минимизировать анимации для повышения доступности (отключает анимации)."
                  >
                    <Switch checked={!animationsEnabled} onCheckedChange={(v) => v && toggleAnimations()} />
                  </SettingRow>
                </div>
              </div>
            </>
          )}

          {activeSection === "notifications" && (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground">Уведомления</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Настройте уведомления.</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                <SettingRow title="Звук уведомлений" description="Воспроизводить звук при новых сообщениях.">
                  <Switch checked={notifSound} onCheckedChange={setNotifSound} />
                </SettingRow>
                <Separator />
                <SettingRow title="Уведомления рабочего стола" description="Показывать уведомления на рабочем столе.">
                  <Switch checked={notifDesktop} onCheckedChange={setNotifDesktop} />
                </SettingRow>
                <Separator />
                <SettingRow title="Предпросмотр сообщений" description="Показывать содержимое сообщений в уведомлениях.">
                  <Switch checked={notifPreview} onCheckedChange={setNotifPreview} />
                </SettingRow>
              </div>
            </>
          )}

          {activeSection === "chats" && (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground">Чаты</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Настройте поведение чатов.</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
                <SettingRow title="Отправка по Enter" description="Нажмите Enter для отправки сообщения (Shift+Enter для новой строки).">
                  <Switch checked={enterSend} onCheckedChange={setEnterSend} />
                </SettingRow>
                <Separator />
                <SettingRow title="Отметка о прочтении" description="Автоматически отмечать сообщения прочитанными.">
                  <Switch checked={lastRead} onCheckedChange={setLastRead} />
                </SettingRow>
              </div>
            </>
          )}

          {activeSection === "language" && (
            <>
              <div>
                <h3 className="text-xl font-bold text-foreground">Язык и регион</h3>
                <p className="text-sm text-muted-foreground mt-0.5">Управляйте языком и региональными настройками.</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-5 space-y-5">
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
              </div>
            </>
          )}

          {(activeSection === "account" || activeSection === "privacy" || activeSection === "devices" || activeSection === "storage") && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                {(() => {
                  const s = SECTIONS.find((x) => x.id === activeSection)
                  if (!s) return null
                  const Icon = s.icon
                  return <Icon className="size-6" />
                })()}
              </div>
              <p className="text-sm">Раздел «{SECTIONS.find((x) => x.id === activeSection)?.label}» в разработке</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RotateCcw className="size-4" />
            Сбросить
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">Отмена</Button>
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

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
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
