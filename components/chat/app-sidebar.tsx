"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Users,
  BookmarkIcon,
  Settings,
  Moon,
  Sun,
  UserCircle2,
  Users2,
  Star,
  Menu,
  X,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { User } from "@/lib/db/schema"

const navItems = [
  { icon: MessageSquare, label: "Сообщения", href: "/chat", badge: true },
  { icon: Users, label: "Контакты", href: "/chat/contacts" },
  { icon: Users2, label: "Группы", href: "/chat/groups" },
  { icon: Star, label: "Избранное", href: "/chat/starred" },
  { icon: Settings, label: "Настройки", href: "/chat/settings" },
]

interface Props {
  currentUser: User
  onMenuToggle?: () => void
  menuOpen?: boolean
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

export function AppSidebar({ currentUser, onMenuToggle, menuOpen }: Props) {
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
      <Tooltip>
        <TooltipTrigger>
          <Link href="/chat" className="w-10 h-10 rounded-xl text-primary flex items-center justify-center mb-1 hover-lift">
            <KaravanLogo className="w-10 h-10" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Карavan</TooltipContent>
      </Tooltip>

      {/* Mobile menu toggle */}
      {onMenuToggle && (
        <Tooltip>
          <TooltipTrigger>
            <button
              onClick={onMenuToggle}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 mb-2"
              aria-label="Меню"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Меню</TooltipContent>
        </Tooltip>
      )}

      {/* Nav items */}      <div className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = href === "/chat"
            ? pathname === "/chat" || (pathname.startsWith("/chat/") && !pathname.startsWith("/chat/settings") && !pathname.startsWith("/chat/profile") && !pathname.startsWith("/chat/contacts") && !pathname.startsWith("/chat/groups") && !pathname.startsWith("/chat/starred"))
            : pathname.startsWith(href)
          return (
            <Tooltip key={href}>
              <TooltipTrigger>
                <Link
                  href={href}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-accent text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-105"
                  }`}
                >
                  <Icon className="w-5 h-5" />
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
          <TooltipTrigger>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200 hover:scale-105"
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
          <TooltipTrigger>
            <Link href="/chat/profile" className="relative mt-1">
              <Avatar className="w-8 h-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200">
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
