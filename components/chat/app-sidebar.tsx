"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
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

  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 shrink-0 items-center gap-1 overflow-x-auto border-t border-border bg-[var(--sidebar)] px-2 pb-[env(safe-area-inset-bottom)] md:static md:inset-auto md:h-screen md:w-14 md:flex-col md:overflow-visible md:border-r md:border-t-0 md:px-0 md:py-3 md:pb-3">
      <Link href="/chat" className="hidden h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm md:mb-3 md:flex">
        <Asterisk className="h-5 w-5 text-white" />
      </Link>

      <div className="flex flex-1 items-center justify-around gap-1 md:flex-col md:justify-start">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = href === "/chat"
            ? pathname === "/chat" || (pathname.startsWith("/chat/") && !pathname.startsWith("/chat/settings") && !pathname.startsWith("/chat/profile") && !pathname.startsWith("/chat/contacts") && !pathname.startsWith("/chat/groups"))
            : pathname.startsWith(href)

          return (
            <Tooltip key={href}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  aria-label={label}
                  className={`relative flex h-12 min-w-12 flex-col items-center justify-center rounded-xl text-[10px] font-medium transition-colors md:h-10 md:w-10 md:min-w-10 ${
                    isActive
                      ? "bg-accent text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="mt-0.5 max-w-14 truncate md:hidden">{label}</span>
                  {href === "/chat" && (
                    <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-primary md:right-1.5" />
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="hidden md:block">{label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      <div className="flex items-center gap-1 md:flex-col">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
              aria-label={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/chat/profile" className="relative ml-1 md:ml-0 md:mt-1" aria-label="Профиль">
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent transition-all hover:ring-primary/40 md:h-8 md:w-8">
                <AvatarImage src={currentUser.image ?? undefined} alt={currentUser.name} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[var(--sidebar)] bg-[var(--online)]" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Профиль</TooltipContent>
        </Tooltip>
      </div>
    </nav>
  )
}
