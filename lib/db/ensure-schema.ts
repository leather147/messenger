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

  await seedGremuchayaUsers()
}

async function seedGremuchayaUsers() {
  await pool.query(`
    INSERT INTO "user" (
      "id",
      "name",
      "email",
      "emailVerified",
      "username",
      "bio",
      "phone",
      "location",
      "status",
      "lastSeen",
      "createdAt",
      "updatedAt"
    ) VALUES
      ('gs-nikolsky', 'Алексей Никольский', 'nikolsky@gremuchaya.local', true, 'nikolsky', 'Оперативная группа. Координация, база, закрытые встречи.', '+7 921 000-10-01', 'Санкт-Петербург', 'online', now(), now(), now()),
      ('gs-karaev', 'Сергей Караев', 'karaev@gremuchaya.local', true, 'karaev', 'Подполковник. Оперативная работа, розыск, связь с полицией.', '+7 921 000-10-02', 'Санкт-Петербург / Северный Кавказ', 'online', now(), now(), now()),
      ('gs-hvan', 'Инна Хван', 'hvan@gremuchaya.local', true, 'hvan', 'Аналитика, камеры, телефоны, цифровой след и закрытые каналы.', '+7 921 000-10-03', 'База', 'online', now(), now(), now()),
      ('gs-kirillov', 'Генерал Кириллов', 'kirillov@gremuchaya.local', true, 'kirillov', 'Руководитель группы. Допуск, координация, служебные решения.', '+7 921 000-10-04', 'База', 'away', now(), now(), now()),
      ('gs-bondarev', 'Бондарев', 'bondarev@gremuchaya.local', true, 'bondarev', 'Следственный блок. Видеосвязь, документы, оперативные поручения.', '+7 921 000-10-05', 'Ленинградская область', 'offline', now(), now(), now()),
      ('gs-chumakova', 'Елена Чумакова', 'chumakova@gremuchaya.local', true, 'chumakova', 'Связана с магазином и линией похищений. Может пользоваться мессенджером для связи.', '+7 921 000-10-06', 'Санкт-Петербург', 'offline', now(), now(), now()),
      ('gs-mustafa', 'Мустафа', 'mustafa@gremuchaya.local', true, 'mustafa', 'Источник. Осторожная связь, встречи, короткие сообщения.', '+7 921 000-10-07', 'Санкт-Петербург', 'away', now(), now(), now()),
      ('gs-iksanov', 'Иксанов', 'iksanov@gremuchaya.local', true, 'iksanov', 'Северный Кавказ. Документы, контакты, тревожная связь.', '+7 928 000-10-08', 'Северный Кавказ', 'offline', now(), now(), now()),
      ('gs-lana', 'Лана Иксанова', 'lana@gremuchaya.local', true, 'lana.iksanova', 'Личная связь семьи Иксанова. Мессенджер для бытовых и срочных сообщений.', '+7 928 000-10-09', 'Северный Кавказ', 'offline', now(), now(), now()),
      ('gs-masudov', 'Масудов', 'masudov@gremuchaya.local', true, 'masudov', 'Кавказская линия. Организация встреч и передача указаний.', '+7 928 000-10-10', 'Северный Кавказ / Петербург', 'away', now(), now(), now()),
      ('gs-alik', 'Алик Керимов', 'alik@gremuchaya.local', true, 'alik.kerimov', 'Силовая линия. Закрытые контакты, быстрые команды, сменные номера.', '+7 928 000-10-11', 'Санкт-Петербург', 'offline', now(), now(), now()),
      ('gs-emin', 'Эмин Масудов', 'emin@gremuchaya.local', true, 'emin.masudov', 'Курсантская легенда. Личная переписка, Юля, семейные контакты.', '+7 928 000-10-12', 'Санкт-Петербург', 'online', now(), now(), now())
    ON CONFLICT ("id") DO UPDATE SET
      "name" = EXCLUDED."name",
      "email" = EXCLUDED."email",
      "emailVerified" = EXCLUDED."emailVerified",
      "username" = EXCLUDED."username",
      "bio" = EXCLUDED."bio",
      "phone" = EXCLUDED."phone",
      "location" = EXCLUDED."location",
      "status" = EXCLUDED."status",
      "lastSeen" = EXCLUDED."lastSeen",
      "updatedAt" = now();
  `)
}
