import { Bookmark } from "lucide-react"
import { EmptyMobilePage } from "@/components/chat/empty-mobile-page"

export default function BookmarksPage() {
  return (
    <EmptyMobilePage
      icon={Bookmark}
      title="Закладки"
      description="Здесь будут сохранённые сообщения и важные материалы. Страница открывается корректно на телефоне и десктопе."
    />
  )
}
