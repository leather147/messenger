import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { ChatLayout } from "@/components/chat/chat-layout"
import { getCurrentUser } from "@/lib/actions/users"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in")
  const currentUser = await getCurrentUser()
  return <ChatLayout currentUser={currentUser}>{children}</ChatLayout>
}
