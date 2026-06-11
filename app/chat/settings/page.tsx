import { getCurrentUser } from "@/lib/actions/users"
import { SettingsPage } from "@/components/chat/settings-page"

export default async function Page() {
  const currentUser = await getCurrentUser()

  return <SettingsPage currentUser={currentUser} />
}
