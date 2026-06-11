import { getCurrentUser } from "@/lib/actions/users"
import { ProfilePage } from "@/components/chat/profile-page"
import { redirect } from "next/navigation"

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")
  return <ProfilePage user={user} isSelf={true} />
}
