import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { AuthPage } from "@/components/auth/auth-page"

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/chat")
  return <AuthPage mode="sign-up" />
}
