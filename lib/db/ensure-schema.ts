import { pool } from '@/lib/db'

let schemaPromise: Promise<void> | null = null

export function ensureDatabaseSchema() {
  schemaPromise ??= createSchema()
  return schemaPromise
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "user" (
      "id" text PRIMARY KEY,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "emailVerified" boolean NOT NULL DEFAULT false,
      "image" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      "username" text UNIQUE,
      "bio" text,
      "phone" text,
      "location" text,
      "status" text DEFAULT 'offline',
      "lastSeen" timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "session" (
      "id" text PRIMARY KEY,
      "expiresAt" timestamp NOT NULL,
      "token" text NOT NULL UNIQUE,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      "ipAddress" text,
      "userAgent" text,
      "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "account" (
      "id" text PRIMARY KEY,
      "accountId" text NOT NULL,
      "providerId" text NOT NULL,
      "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
      "accessToken" text,
      "refreshToken" text,
      "idToken" text,
      "accessTokenExpiresAt" timestamp,
      "refreshTokenExpiresAt" timestamp,
      "scope" text,
      "password" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "verification" (
      "id" text PRIMARY KEY,
      "identifier" text NOT NULL,
      "value" text NOT NULL,
      "expiresAt" timestamp NOT NULL,
      "createdAt" timestamp DEFAULT now(),
      "updatedAt" timestamp DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "conversation" (
      "id" text PRIMARY KEY,
      "name" text,
      "description" text,
      "type" text NOT NULL DEFAULT 'direct',
      "avatar" text,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now(),
      "createdBy" text NOT NULL,
      "lastMessageAt" timestamp DEFAULT now(),
      "lastMessageText" text,
      "lastMessageUserId" text
    );

    CREATE TABLE IF NOT EXISTS "conversation_member" (
      "id" text PRIMARY KEY,
      "conversationId" text NOT NULL,
      "userId" text NOT NULL,
      "role" text NOT NULL DEFAULT 'member',
      "joinedAt" timestamp NOT NULL DEFAULT now(),
      "lastReadAt" timestamp DEFAULT now(),
      "isMuted" boolean NOT NULL DEFAULT false,
      "isPinned" boolean NOT NULL DEFAULT false
    );

    CREATE TABLE IF NOT EXISTS "message" (
      "id" text PRIMARY KEY,
      "conversationId" text NOT NULL,
      "userId" text NOT NULL,
      "content" text,
      "type" text NOT NULL DEFAULT 'text',
      "fileUrl" text,
      "fileName" text,
      "fileSize" integer,
      "replyToId" text,
      "isEdited" boolean NOT NULL DEFAULT false,
      "isDeleted" boolean NOT NULL DEFAULT false,
      "createdAt" timestamp NOT NULL DEFAULT now(),
      "updatedAt" timestamp NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "message_reaction" (
      "id" text PRIMARY KEY,
      "messageId" text NOT NULL,
      "userId" text NOT NULL,
      "emoji" text NOT NULL,
      "createdAt" timestamp NOT NULL DEFAULT now()
    );
  `)
}
