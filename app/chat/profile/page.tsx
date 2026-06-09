import { getCurrentUser } from "@/lib/actions/users"
import { ProfilePage } from "@/components/chat/profile-page"

export default async function Page() {
  const user = await getCurrentUser()
  return <ProfilePage user={user} isSelf={true} />
}
