"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversation, conversationMember, message, user } from "@/lib/db/schema"
import { and, desc, eq, inArray, ne, or, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getConversations() {
  const userId = await getUserId()

  const members = await db
    .select()
    .from(conversationMember)
    .where(eq(conversationMember.userId, userId))

  if (!members.length) return []

  const convIds = members.map((m) => m.conversationId)
  const convs = await db
    .select()
    .from(conversation)
    .where(inArray(conversation.id, convIds))
    .orderBy(desc(conversation.lastMessageAt))

  // For direct conversations, get the other user's info
  const result = await Promise.all(
    convs.map(async (conv) => {
      const member = members.find((m) => m.conversationId === conv.id)
      let displayName = conv.name
      let displayAvatar = conv.avatar
      let otherUser = null

      if (conv.type === "direct") {
        const otherMember = await db
          .select()
          .from(conversationMember)
          .where(
            and(
              eq(conversationMember.conversationId, conv.id),
              ne(conversationMember.userId, userId)
            )
          )
          .limit(1)

        if (otherMember[0]) {
          const [other] = await db
            .select()
            .from(user)
            .where(eq(user.id, otherMember[0].userId))
            .limit(1)
          if (other) {
            displayName = other.name
            displayAvatar = other.image
            otherUser = other
          }
        }
      }

      // Count unread messages
      const unreadCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(message)
        .where(
          and(
            eq(message.conversationId, conv.id),
            ne(message.userId, userId),
            member?.lastReadAt
              ? sql`${message.createdAt} > ${member.lastReadAt}`
              : sql`1=1`
          )
        )

      return {
        ...conv,
        displayName,
        displayAvatar,
        otherUser,
        isPinned: member?.isPinned ?? false,
        isMuted: member?.isMuted ?? false,
        unreadCount: Number(unreadCount[0]?.count ?? 0),
      }
    })
  )

  return result
}

export async function getConversation(conversationId: string) {
  const userId = await getUserId()

  const [member] = await db
    .select()
    .from(conversationMember)
    .where(
      and(
        eq(conversationMember.conversationId, conversationId),
        eq(conversationMember.userId, userId)
      )
    )
    .limit(1)

  if (!member) throw new Error("Access denied")

  const [conv] = await db
    .select()
    .from(conversation)
    .where(eq(conversation.id, conversationId))
    .limit(1)

  return conv
}

export async function createDirectConversation(targetUserId: string) {
  const userId = await getUserId()

  // Check if direct conversation already exists
  const existing = await db
    .select({ convId: conversationMember.conversationId })
    .from(conversationMember)
    .where(eq(conversationMember.userId, userId))

  for (const row of existing) {
    const [conv] = await db
      .select()
      .from(conversation)
      .where(and(eq(conversation.id, row.convId), eq(conversation.type, "direct")))
      .limit(1)

    if (conv) {
      const [targetMember] = await db
        .select()
        .from(conversationMember)
        .where(
          and(
            eq(conversationMember.conversationId, conv.id),
            eq(conversationMember.userId, targetUserId)
          )
        )
        .limit(1)

      if (targetMember) return conv.id
    }
  }

  // Create new direct conversation
  const convId = randomUUID()
  await db.insert(conversation).values({
    id: convId,
    type: "direct",
    createdBy: userId,
  })

  await db.insert(conversationMember).values([
    { id: randomUUID(), conversationId: convId, userId },
    { id: randomUUID(), conversationId: convId, userId: targetUserId },
  ])

  revalidatePath("/chat")
  return convId
}

export async function createGroupConversation(name: string, memberIds: string[]) {
  const userId = await getUserId()

  const convId = randomUUID()
  await db.insert(conversation).values({
    id: convId,
    name,
    type: "group",
    createdBy: userId,
  })

  const allMemberIds = Array.from(new Set([userId, ...memberIds]))
  await db.insert(conversationMember).values(
    allMemberIds.map((mid) => ({
      id: randomUUID(),
      conversationId: convId,
      userId: mid,
      role: mid === userId ? "admin" : "member",
    }))
  )

  revalidatePath("/chat")
  return convId
}

export async function markAsRead(conversationId: string) {
  const userId = await getUserId()
  await db
    .update(conversationMember)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(conversationMember.conversationId, conversationId),
        eq(conversationMember.userId, userId)
      )
    )
}

export async function togglePin(conversationId: string, pinned: boolean) {
  const userId = await getUserId()
  await db
    .update(conversationMember)
    .set({ isPinned: pinned })
    .where(
      and(
        eq(conversationMember.conversationId, conversationId),
        eq(conversationMember.userId, userId)
      )
    )
  revalidatePath("/chat")
}

export async function getConversationMembers(conversationId: string) {
  const userId = await getUserId()
  const [member] = await db
    .select()
    .from(conversationMember)
    .where(
      and(
        eq(conversationMember.conversationId, conversationId),
        eq(conversationMember.userId, userId)
      )
    )
    .limit(1)

  if (!member) throw new Error("Access denied")

  const members = await db
    .select()
    .from(conversationMember)
    .where(eq(conversationMember.conversationId, conversationId))

  const users = await Promise.all(
    members.map(async (m) => {
      const [u] = await db.select().from(user).where(eq(user.id, m.userId)).limit(1)
      return { ...m, user: u }
    })
  )

  return users
}
