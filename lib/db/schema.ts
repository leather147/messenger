import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

// ── Better Auth tables (do not rename columns) ──────────────────────────────
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  // Messenger profile fields
  username: text("username").unique(),
  bio: text("bio"),
  phone: text("phone"),
  location: text("location"),
  status: text("status").default("offline"),
  lastSeen: timestamp("lastSeen").defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// ── Messenger tables ─────────────────────────────────────────────────────────
export const conversation = pgTable("conversation", {
  id: text("id").primaryKey(),
  name: text("name"),
  description: text("description"),
  type: text("type").notNull().default("direct"), // direct | group
  avatar: text("avatar"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  createdBy: text("createdBy").notNull(),
  lastMessageAt: timestamp("lastMessageAt").defaultNow(),
  lastMessageText: text("lastMessageText"),
  lastMessageUserId: text("lastMessageUserId"),
})

export const conversationMember = pgTable("conversation_member", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId").notNull(),
  userId: text("userId").notNull(),
  role: text("role").notNull().default("member"), // admin | member
  joinedAt: timestamp("joinedAt").notNull().defaultNow(),
  lastReadAt: timestamp("lastReadAt").defaultNow(),
  isMuted: boolean("isMuted").notNull().default(false),
  isPinned: boolean("isPinned").notNull().default(false),
})

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId").notNull(),
  userId: text("userId").notNull(),
  content: text("content"),
  type: text("type").notNull().default("text"), // text | image | file | voice
  fileUrl: text("fileUrl"),
  fileName: text("fileName"),
  fileSize: integer("fileSize"),
  replyToId: text("replyToId"),
  isEdited: boolean("isEdited").notNull().default(false),
  isDeleted: boolean("isDeleted").notNull().default(false),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const messageReaction = pgTable("message_reaction", {
  id: text("id").primaryKey(),
  messageId: text("messageId").notNull(),
  userId: text("userId").notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type User = typeof user.$inferSelect
export type Conversation = typeof conversation.$inferSelect
export type ConversationMember = typeof conversationMember.$inferSelect
export type Message = typeof message.$inferSelect
export type MessageReaction = typeof messageReaction.$inferSelect
