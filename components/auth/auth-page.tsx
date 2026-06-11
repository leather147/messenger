"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, Asterisk } from "lucide-react"
import Link from "next/link"

interface Props {
  mode: "sign-in" | "sign-up"
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
    <div className="min-h-screen flex flex-col bg-[#f0f4ff] dark:bg-[#0f172a]">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
          <Asterisk className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-foreground text-lg">Aster Chat</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12">
          {/* Left marketing panel */}
          <div className="flex-1 hidden lg:flex flex-col gap-8 max-w-lg">
            <div>
              {mode === "sign-in" ? (
                <>
                  <h1 className="text-4xl font-bold text-foreground leading-tight">
                    Безопасные командные{" "}
                    <span className="text-primary">коммуникации.</span>
                  </h1>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Aster Chat помогает командам сотрудничать в режиме реального времени
                    с защищёнными сообщениями, обменом файлами и многим другим.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-4xl font-bold text-foreground leading-tight">
                    Объедините вашу команду,{" "}
                    <span className="text-primary">безопасно.</span>
                  </h1>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Aster Chat помогает командам сотрудничать в режиме реального времени
                    с защищёнными сообщениями, обменом файлами и многим другим.
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "🔒",
                  title: "Защита по умолчанию",
                  desc: "Сквозное шифрование и корпоративный уровень безопасности защищают ваши данные.",
                },
                {
                  icon: "👥",
                  title: "Создан для команд",
                  desc: "Упрощайте общение, делитесь файлами и оставайтесь в курсе событий.",
                },
                {
                  icon: "⚡",
                  title: "Быстро и надёжно",
                  desc: "Обмен сообщениями в реальном времени, который всегда держит всех в курсе.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start bg-white dark:bg-card rounded-xl p-4 shadow-sm border border-border">
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

            <blockquote className="bg-white dark:bg-card border border-border rounded-xl p-5 shadow-sm">
              <p className="text-muted-foreground text-sm italic leading-relaxed">
                &ldquo;Aster Chat изменил то, как наша команда общается. Это быстро, безопасно и просто работает.&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">БТ</div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Бен Томпсон</div>
                  <div className="text-muted-foreground text-xs">Продакт-менеджер в Nebula Labs</div>
                </div>
              </div>
            </blockquote>
          </div>

          {/* Auth form card */}
          <div className="w-full max-w-md bg-white dark:bg-card rounded-2xl shadow-lg border border-border p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {mode === "sign-in" ? "С возвращением!" : "Создайте аккаунт"}
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {mode === "sign-in"
                  ? "Войдите, чтобы продолжить в Aster Chat."
                  : "Начните работу с Aster Chat за секунды."}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg px-3 py-2.5 text-sm mb-4">
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
                  {mode === "sign-up" ? "Рабочий email" : "Email"}
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
                className="w-full h-11 text-base font-medium bg-primary hover:bg-primary/90"
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
      <footer className="text-center py-6 text-xs text-muted-foreground flex flex-col gap-2">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <span className="hover:text-foreground cursor-pointer transition-colors">Политика конфиденциальности</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Условия использования</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Безопасность</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Контакты</span>
        </div>
        <p>© 2024 Aster Chat. Все права защищены.</p>
      </footer>
    </div>
  )
}
