"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { conversation, conversationMember, message, messageReaction, user } from "@/lib/db/schema"
import { and, asc, desc, eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getMessages(conversationId: string, limit = 50) {
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

  // Get all members to check read timestamps
  const allMembers = await db
    .select()
    .from(conversationMember)
    .where(eq(conversationMember.conversationId, conversationId))

  // Find the latest "other member" lastReadAt for read receipts
  const otherMembers = allMembers.filter((m) => m.userId !== userId)
  const otherLastReadAt = otherMembers.length > 0
    ? otherMembers.reduce((latest, m) => {
        if (!m.lastReadAt) return latest
        if (!latest) return m.lastReadAt
        return m.lastReadAt > latest ? m.lastReadAt : latest
      }, null as Date | null)
    : null

  const messages = await db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(asc(message.createdAt))
    .limit(limit)

  // Attach sender info
  const userIds = [...new Set(messages.map((m) => m.userId))]
  const users = await db.select().from(user).where(inArray(user.id, userIds))
  const usersMap = Object.fromEntries(users.map((u) => [u.id, u]))

  // Attach reactions
  const messageIds = messages.map((m) => m.id)
  const reactions =
    messageIds.length > 0
      ? await db.select().from(messageReaction).where(inArray(messageReaction.messageId, messageIds))
      : []

  return messages.map((msg) => {
    // Read status for own messages: single tick = sent, double tick = delivered, blue double tick = read
    const isOwnMsg = msg.userId === userId
    let readStatus: "sent" | "delivered" | "read" = "sent"
    if (isOwnMsg && otherLastReadAt) {
      if (otherLastReadAt >= msg.createdAt) {
        readStatus = "read"
      } else {
        readStatus = "delivered"
      }
    }
    return {
      ...msg,
      sender: usersMap[msg.userId],
      reactions: reactions.filter((r) => r.messageId === msg.id),
      readStatus,
    }
  })
}

export async function sendMessage(
  conversationId: string,
  content: string,
  type: string = "text",
  replyToId?: string
) {
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

  const msgId = randomUUID()
  await db.insert(message).values({
    id: msgId,
    conversationId,
    userId,
    content,
    type,
    replyToId,
  })

  // Update conversation last message
  await db
    .update(conversation)
    .set({
      lastMessageText: content.length > 60 ? content.slice(0, 60) + "..." : content,
      lastMessageUserId: userId,
      lastMessageAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(conversation.id, conversationId))

  revalidatePath(`/chat/${conversationId}`)
  return msgId
}

export async function editMessage(messageId: string, content: string) {
  const userId = await getUserId()
  await db
    .update(message)
    .set({ content, isEdited: true, updatedAt: new Date() })
    .where(and(eq(message.id, messageId), eq(message.userId, userId)))
  revalidatePath("/chat")
}

export async function deleteMessage(messageId: string) {
  const userId = await getUserId()
  await db
    .update(message)
    .set({ isDeleted: true, content: null, updatedAt: new Date() })
    .where(and(eq(message.id, messageId), eq(message.userId, userId)))
  revalidatePath("/chat")
}

export async function addReaction(messageId: string, emoji: string) {
  const userId = await getUserId()

  // Toggle reaction
  const [existing] = await db
    .select()
    .from(messageReaction)
    .where(
      and(
        eq(messageReaction.messageId, messageId),
        eq(messageReaction.userId, userId),
        eq(messageReaction.emoji, emoji)
      )
    )
    .limit(1)

  if (existing) {
    await db
      .delete(messageReaction)
      .where(and(eq(messageReaction.messageId, messageId), eq(messageReaction.userId, userId), eq(messageReaction.emoji, emoji)))
  } else {
    await db.insert(messageReaction).values({
      id: randomUUID(),
      messageId,
      userId,
      emoji,
    })
  }
  revalidatePath("/chat")
}
