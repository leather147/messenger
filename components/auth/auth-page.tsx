"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Lock, Mail, User, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Props {
  mode: "sign-in" | "sign-up"
}

function KaravanLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect width="36" height="36" rx="10" fill="currentColor" />
      <path
        d="M7 24c0-1.1.9-2 2-2h2v-3c0-.55.45-1 1-1h1c.55 0 1 .45 1 1v3h6v-2c0-.55.45-1 1-1h.5c.28 0 .5-.22.5-.5v-1a1.5 1.5 0 013 0v.5c.83 0 1.5.67 1.5 1.5V22h1a2 2 0 012 2v1H7v-1z"
        fill="white"
        opacity="0.95"
      />
      <circle cx="12" cy="26" r="1.5" fill="white" />
      <circle cx="24" cy="26" r="1.5" fill="white" />
    </svg>
  )
}

export function AuthPage({ mode }: Props) {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    agree: false,
    remember: false,
  })

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (mode === "sign-up") {
      if (form.password !== form.confirm) {
        setError("Пароли не совпадают")
        return
      }
      if (!form.agree) {
        setError("Необходимо принять условия использования")
        return
      }
      if (form.password.length < 8) {
        setError("Пароль должен содержать не менее 8 символов")
        return
      }
    }

    setLoading(true)
    try {
      if (mode === "sign-in") {
        const res = await authClient.signIn.email({
          email: form.email,
          password: form.password,
        })
        if (res.error) throw new Error(res.error.message ?? res.error.code ?? "Ошибка входа")
      } else {
        const res = await authClient.signUp.email({
          email: form.email,
          password: form.password,
          name: form.name,
        })
        if (res.error) throw new Error(res.error.message ?? res.error.code ?? "Ошибка регистрации")
      }
      router.push("/chat")
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Произошла ошибка"
      const lower = msg.toLowerCase()
      if (lower.includes("exist") || lower.includes("already")) {
        setError("Пользователь с таким email уже существует")
      } else if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("password")) {
        setError("Неверный email или пароль")
      } else {
        setError(msg || "Произошла ошибка. Попробуйте снова.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-2 animate-fade-in">
        <div className="w-9 h-9 rounded-xl text-primary flex items-center justify-center">
          <KaravanLogo className="w-9 h-9" />
        </div>
        <span className="font-bold text-foreground text-lg tracking-tight">Карavan</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
          {/* Left marketing panel */}
          <div className="flex-1 hidden lg:flex flex-col gap-8 max-w-lg animate-slide-right">
            <div>
              {mode === "sign-in" ? (
                <>
                  <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
                    Тёплые{" "}
                    <span className="text-primary">командные коммуникации.</span>
                  </h1>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Карavan помогает командам общаться в реальном времени с защищёнными сообщениями,
                    красивым дизайном и плавными анимациями.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-foreground leading-tight text-balance">
                    Присоединяйтесь к{" "}
                    <span className="text-primary">Карavan.</span>
                  </h1>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Начните общение с командой в уютном, быстром и безопасном мессенджере нового поколения.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "🏕",
                  title: "Уютный дизайн",
                  desc: "Тёплая палитра и плавные анимации делают общение приятным.",
                },
                {
                  icon: "🔒",
                  title: "Защита данных",
                  desc: "Безопасные сообщения и корпоративная защита для вашей команды.",
                },
                {
                  icon: "⚡",
                  title: "Мгновенные сообщения",
                  desc: "Обмен сообщениями в реальном времени с уведомлениями о прочтении.",
                },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={`flex gap-4 items-start bg-card rounded-xl p-4 shadow-sm border border-border hover-lift animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-lg shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{item.title}</div>
                    <div className="text-muted-foreground text-sm leading-relaxed mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auth form card */}
          <div className="w-full max-w-md bg-card rounded-2xl shadow-lg border border-border p-8 animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {mode === "sign-in" ? "С возвращением!" : "Создайте аккаунт"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === "sign-in"
                  ? "Войдите, чтобы продолжить в Карavan."
                  : "Начните работу с Карavan за секунды."}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm mb-4 animate-scale-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "sign-up" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Полное имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Введите ваше имя"
                      className="pl-9"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  {mode === "sign-up" ? "Email" : "Email"}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-9"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    className="pl-9 pr-9"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "sign-up" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm" className="text-sm font-medium text-foreground">Подтвердите пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Повторите пароль"
                      className="pl-9 pr-9"
                      value={form.confirm}
                      onChange={(e) => set("confirm", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "sign-in" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={form.remember}
                      onCheckedChange={(v) => set("remember", !!v)}
                    />
                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Запомнить меня
                    </label>
                  </div>
                  <span className="text-sm text-primary font-medium cursor-pointer hover:underline">
                    Забыли пароль?
                  </span>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="agree"
                    checked={form.agree}
                    onCheckedChange={(v) => set("agree", !!v)}
                    className="mt-0.5"
                  />
                  <label htmlFor="agree" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                    Я принимаю{" "}
                    <span className="text-primary hover:underline cursor-pointer">Условия использования</span>
                    {" "}и{" "}
                    <span className="text-primary hover:underline cursor-pointer">Политику конфиденциальности</span>.
                  </label>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90 hover-lift transition-all duration-200"
                disabled={loading}
              >
                {loading
                  ? "Загрузка..."
                  : mode === "sign-in"
                  ? "Войти"
                  : "Создать аккаунт"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "sign-in" ? (
                <>
                  Нет аккаунта?{" "}
                  <Link href="/sign-up" className="text-primary font-medium hover:underline">
                    Зарегистрироваться
                  </Link>
                </>
              ) : (
                <>
                  Уже есть аккаунт?{" "}
                  <Link href="/sign-in" className="text-primary font-medium hover:underline">
                    Войти
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-muted-foreground flex flex-col gap-2 animate-fade-in">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="hover:text-foreground cursor-pointer transition-colors">Политика конфиденциальности</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Условия использования</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Безопасность</span>
          <Link href="/contacts" className="hover:text-foreground cursor-pointer transition-colors">Контакты</Link>
        </div>
        <p>© 2024 Карavan. Все права защищены.</p>
      </footer>
    </div>
  )
}