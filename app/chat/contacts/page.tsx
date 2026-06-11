import { getCurrentUser } from "@/lib/actions/users"
import { redirect } from "next/navigation"
import { ContactsPage } from "@/components/chat/contacts-page"

export default async function Page() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect("/sign-in")
  return <ContactsPage currentUser={currentUser} />
}
