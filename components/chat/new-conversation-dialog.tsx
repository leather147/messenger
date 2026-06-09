"use client"

import { useState, useEffect, useTransition } from "react"
import { searchUsers } from "@/lib/actions/users"
import { createGroupConversation } from "@/lib/actions/conversations"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users2, X } from "lucide-react"
import type { User } from "@/lib/db/schema"

interface Props {
  currentUser: User
  onClose: () => void
  onSelectUser: (userId: string) => void
}

export function NewConversationDialog({ currentUser, onClose, onSelectUser }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<User[]>([])
  const [selected, setSelected] = useState<User[]>([])
  const [groupMode, setGroupMode] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        startTransition(async () => {
          const users = await searchUsers(query)
          setResults(users)
        })
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [query])

  function toggleSelect(u: User) {
    setSelected((prev) =>
      prev.find((x) => x.id === u.id) ? prev.filter((x) => x.id !== u.id) : [...prev, u]
    )
  }

  async function handleCreateGroup() {
    if (!groupName.trim() || selected.length === 0) return
    const id = await createGroupConversation(
      groupName,
      selected.map((u) => u.id)
    )
    onClose()
    router.push(`/chat/${id}`)
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {groupMode ? "Создать группу" : "Новый диалог"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setGroupMode(false)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                !groupMode ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              Личный чат
            </button>
            <button
              onClick={() => setGroupMode(true)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                groupMode ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users2 className="w-4 h-4" />
              Группа
            </button>
          </div>

          {groupMode && (
            <Input
              placeholder="Название группы"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск пользователей..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Selected chips */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map((u) => (
                <span
                  key={u.id}
                  className="flex items-center gap-1 bg-accent text-primary text-xs font-medium px-2 py-1 rounded-full"
                >
                  {u.name}
                  <button onClick={() => toggleSelect(u)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Results */}
          <div className="max-h-56 overflow-y-auto space-y-1">
            {results.map((u) => {
              const isSelected = selected.some((x) => x.id === u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    if (groupMode) {
                      toggleSelect(u)
                    } else {
                      onSelectUser(u.id)
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected ? "bg-accent" : "hover:bg-secondary"
                  }`}
                >
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={u.image ?? undefined} alt={u.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[10px]">✓</span>
                  )}
                </button>
              )
            })}
            {query && results.length === 0 && !isPending && (
              <p className="text-center text-sm text-muted-foreground py-4">Пользователи не найдены</p>
            )}
          </div>

          {groupMode && (
            <Button
              className="w-full"
              disabled={selected.length === 0 || !groupName.trim()}
              onClick={handleCreateGroup}
            >
              Создать группу ({selected.length} участников)
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
