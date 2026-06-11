"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/chat/app-sidebar"
import { ConversationList } from "@/components/chat/conversation-list"
import type { User } from "@/lib/db/schema"

interface Props {
  currentUser: User
  children: React.ReactNode
}

export function ChatLayout({ currentUser, children }: Props) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // On mobile, close sidebar when navigating
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Detect if we're in a conversation on mobile (hide list, show window)
  const isInConversation = pathname !== "/chat" && pathname.startsWith("/chat/") && !pathname.startsWith("/chat/settings") && !pathname.startsWith("/chat/profile") && !pathname.startsWith("/chat/contacts") && !pathname.startsWith("/chat/groups") && !pathname.startsWith("/chat/starred")
  
  // On mobile, these pages take full-screen (like conversations do)
  const isFullScreenPage = isInConversation || pathname.startsWith("/chat/settings") || pathname.startsWith("/chat/profile") || pathname.startsWith("/chat/contacts") || pathname.startsWith("/chat/groups") || pathname.startsWith("/chat/starred")

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background">
      {/* ── Icon sidebar — always visible on md+, hidden on mobile ── */}
      <div className={`shrink-0 z-40 ${isFullScreenPage ? "hidden md:flex" : "flex"}`}>
        <AppSidebar currentUser={currentUser} onMenuToggle={() => setSidebarOpen((p) => !p)} menuOpen={sidebarOpen} />
      </div>

      {/* ── Conversation list ── */}
      {/* Desktop: always visible as a column */}
      {/* Mobile: shown as full-width when NOT in a full-screen page; hidden when in one */}
      <aside
        className={`
          flex flex-col shrink-0 bg-[var(--sidebar)] border-r border-border
          transition-all duration-300 ease-in-out
          md:w-[300px] md:flex md:translate-x-0
          ${isFullScreenPage
            ? "hidden md:flex"
            : "flex w-full md:w-[300px]"
          }
          ${sidebarOpen
            ? "fixed inset-y-0 left-14 z-30 w-[280px] shadow-2xl"
            : "md:relative md:left-auto"
          }
        `}
      >
        <ConversationList currentUser={currentUser} onSelect={() => setSidebarOpen(false)} />
      </aside>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main content area ── */}
      <main
        className={`
          flex-1 flex flex-col min-w-0 overflow-hidden
          ${!isFullScreenPage ? "hidden md:flex" : "flex"}
        `}
      >
        {children}
      </main>
    </div>
  )
}
