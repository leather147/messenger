import { SettingsPage } from "@/components/chat/settings-page"
import { getCurrentUser } from "@/lib/actions/users"

export default async function Page() {
  const user = await getCurrentUser()
  return <SettingsPage user={user} />
}
