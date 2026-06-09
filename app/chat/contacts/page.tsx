import { getContactUsers } from "@/lib/actions/users"
import { ContactsPage } from "@/components/chat/contacts-page"

export default async function Page() {
  const users = await getContactUsers()

  return <ContactsPage users={users} />
}
