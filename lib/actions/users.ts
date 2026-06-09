"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { and, eq, ilike, ne, or } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getCurrentUser() {
  const userId = await getUserId()
  const [u] = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  return u
}

export async function getUserById(id: string) {
  const [u] = await db.select().from(user).where(eq(user.id, id)).limit(1)
  return u ?? null
}

export async function searchUsers(query: string) {
  if (!query.trim()) return []
  const userId = await getUserId()
  return db
    .select()
    .from(user)
    .where(
      and(
        ne(user.id, userId),
        or(
          ilike(user.name, `%${query}%`),
          ilike(user.email, `%${query}%`),
          ilike(user.username, `%${query}%`)
        )
      )
    )
    .limit(20)
}

export async function updateProfile(data: {
  name?: string
  username?: string
  bio?: string
  phone?: string
  location?: string
  image?: string
}) {
  const userId = await getUserId()
  await db
    .update(user)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(user.id, userId))
  revalidatePath("/chat/profile")
}

export async function updateStatus(status: string) {
  const userId = await getUserId()
  await db
    .update(user)
    .set({ status, lastSeen: new Date(), updatedAt: new Date() })
    .where(eq(user.id, userId))
}
