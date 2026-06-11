import { Star } from "lucide-react"
import { EmptyMobilePage } from "@/components/chat/empty-mobile-page"

export default function StarredPage() {
  return (
    <EmptyMobilePage
      icon={Star}
      title="Избранное"
      description="Здесь будут избранные сообщения и контакты. Раздел подготовлен для мобильной версии сайта."
    />
  )
}
