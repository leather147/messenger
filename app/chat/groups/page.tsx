import { Users2 } from "lucide-react"
import { EmptyMobilePage } from "@/components/chat/empty-mobile-page"

export default function GroupsPage() {
  return (
    <EmptyMobilePage
      icon={Users2}
      title="Группы"
      description="Здесь будут групповые чаты, съёмочные команды и общие обсуждения проекта. Раздел уже адаптирован под мобильную навигацию."
    />
  )
}
