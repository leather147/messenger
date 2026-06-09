"use client"

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
  const isChatHome = pathname === "/chat"

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-background pb-16 md:h-screen md:pb-0">
      <AppSidebar currentUser={currentUser} />

      <aside
        className={`
          shrink-0 flex-col bg-[var(--sidebar)] border-r border-border
          md:flex md:w-[300px]
          ${isChatHome ? "fixed inset-x-0 top-0 bottom-16 z-20 flex w-full md:static md:inset-auto" : "hidden md:flex"}
        `}
      >
        <ConversationList currentUser={currentUser} />
      </aside>

      <main className={`${isChatHome ? "hidden md:flex" : "flex"} min-w-0 flex-1 flex-col overflow-hidden`}>
        {children}
      </main>
    </div>
  )
}
