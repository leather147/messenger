import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} />
}

/** Skeleton for a conversation list item */
export function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3 w-44" />
      </div>
    </div>
  )
}

/** Skeleton for a message bubble */
export function MessageSkeleton({ isOwn = false }: { isOwn?: boolean }) {
  return (
    <div className={`flex gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {!isOwn && <Skeleton className="w-7 h-7 rounded-full shrink-0 self-end" />}
      <div className={`flex flex-col gap-1 ${isOwn ? "items-end" : "items-start"}`}>
        <Skeleton className={`h-9 rounded-2xl ${isOwn ? "w-40" : "w-52"}`} />
      </div>
    </div>
  )
}

/** Skeleton for a chat window */
export function ChatWindowSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface)] border-b border-border shrink-0">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="flex-1 flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-2">
        <MessageSkeleton />
        <MessageSkeleton isOwn />
        <MessageSkeleton />
        <MessageSkeleton isOwn />
        <MessageSkeleton />
        <MessageSkeleton isOwn />
      </div>
    </div>
  )
}

/** Skeleton for a user card in contacts */
export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-40" />
      </div>
    </div>
  )
}
