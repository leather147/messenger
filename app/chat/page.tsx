import { MessageSquare } from "lucide-react"

export default function ChatIndexPage() {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center p-8 bg-background">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
        <MessageSquare className="w-8 h-8 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-foreground">Выберите чат</h2>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs">
          Выберите существующий диалог или начните новый, нажав на иконку редактирования.
        </p>
      </div>
    </div>
  )
}
