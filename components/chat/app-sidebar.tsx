"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Users,
  Bookmark,
  Star,
  CheckSquare,
  Settings,
  Moon,
  Sun,
  Asterisk,
  UserCircle2,
  Users2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { User } from "@/lib/db/schema"

const navItems = [
  { icon: MessageSquare, label: "Сообщения", href: "/chat", badge: true },
  { icon: Users, label: "Контакты", href: "/chat/contacts" },
  { icon: Users2, label: "Группы", href: "/chat/groups" },
  { icon: Bookmark, label: "Закладки", href: "/chat/bookmarks" },
  { icon: Star, label: "Избранное", href: "/chat/starred" },
  { icon: CheckSquare, label: "Задачи", href: "/chat/tasks" },
  { icon: Settings, label: "Настройки", href: "/chat/settings" },
]

interface Props {
  currentUser: User
}

export function AppSidebar({ currentUser }: Props) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <nav className="w-14 shrink-0 flex flex-col items-center py-3 gap-1 bg-[var(--sidebar)] border-r border-border">
      {/* Logo */}
      <Link href="/chat" className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center mb-3 shadow-sm">
        <Asterisk className="w-5 h-5 text-white" />
      </Link>

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = href === "/chat" ? pathname === "/chat" || (pathname.startsWith("/chat/") && !pathname.startsWith("/chat/settings") && !pathname.startsWith("/chat/profile") && !pathname.startsWith("/chat/contacts") && !pathname.startsWith("/chat/groups")) : pathname.startsWith(href)
          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {href === "/chat" && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 items-center">
        {/* Theme toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </TooltipContent>
        </Tooltip>

        {/* Avatar / profile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/chat/profile" className="relative mt-1">
              <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all">
                <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[var(--online)] border-2 border-[var(--sidebar)]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Профиль</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  )
}
