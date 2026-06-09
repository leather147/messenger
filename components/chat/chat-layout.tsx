"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/chat/app-sidebar"
import { ConversationList } from "@/components/chat/conversation-list"
import type { User } from "@/lib/db/schema"

interface Props {
  currentUser: User
  children: React.ReactNode
}

export function ChatLayout({ currentUser, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Icon sidebar */}
      <AppSidebar currentUser={currentUser} />

      {/* Conversation list */}
      <aside
        className={`
          flex flex-col w-[300px] shrink-0 bg-[var(--sidebar)] border-r border-border
          transition-transform duration-300
          md:translate-x-0 md:relative md:flex
          ${mobileOpen ? "translate-x-0 fixed inset-y-0 left-14 z-30" : "-translate-x-full fixed inset-y-0 left-14 z-30 md:translate-x-0 md:relative md:left-0"}
        `}
      >
        <ConversationList currentUser={currentUser} onSelect={() => setMobileOpen(false)} />
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
