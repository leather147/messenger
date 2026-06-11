/**
 * Seed via Better Auth HTTP API — avoids scrypt memory limits.
 * Run: node --env-file-if-exists=/vercel/share/.env.project scripts/seed.mjs
 */
import pg from "pg"
import { randomBytes } from "crypto"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const BASE = "http://localhost:3000"

function uuid() {
  return randomBytes(16).toString("hex").replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5")
}

const USERS = [
  { name: "Администратор", email: "admin@karavan.app", password: "Admin1234!", username: "admin", bio: "Корневой администратор Каравана", phone: "+7 900 000 0000", location: "Москва, Россия" },
  { name: "Алия Сейткали", email: "aliya@karavan.app", password: "Aliya1234!", username: "aliya", bio: "Дизайнер продукта", phone: "+7 701 111 2222", location: "Алматы, Казахстан" },
  { name: "Марат Нурланов", email: "marat@karavan.app", password: "Marat1234!", username: "marat", bio: "Backend инженер", phone: "+7 702 333 4444", location: "Астана, Казахстан" },
  { name: "Дана Ахметова", email: "dana@karavan.app", password: "Dana1234!", username: "dana", bio: "Продакт-менеджер", phone: "+7 705 555 6666", location: "Шымкент, Казахстан" },
  { name: "Рустам Каримов", email: "rustam@karavan.app", password: "Rustam1234!", username: "rustam", bio: "Frontend разработчик", phone: "+7 707 777 8888", location: "Ташкент, Узбекистан" },
]

async function signUpUser(u) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": BASE },
    body: JSON.stringify({ name: u.name, email: u.email, password: u.password }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (data?.message?.toLowerCase().includes("exist") || data?.code === "USER_ALREADY_EXISTS") {
      return "exists"
    }
    throw new Error(`Sign-up failed for ${u.email}: ${res.status} ${JSON.stringify(data)}`)
  }
  return data?.user?.id ?? null
}

async function run() {
  const client = await pool.connect()
  try {
    const userIds = {}

    for (const u of USERS) {
      // Check if already exists
      const existing = await client.query(`SELECT id FROM "user" WHERE email = $1`, [u.email])
      if (existing.rows.length > 0) {
        console.log(`Exists: ${u.email} (id=${existing.rows[0].id})`)
        userIds[u.email] = existing.rows[0].id
        continue
      }

      const result = await signUpUser(u)
      if (result === "exists") {
        const row = await client.query(`SELECT id FROM "user" WHERE email = $1`, [u.email])
        userIds[u.email] = row.rows[0]?.id
        console.log(`Already existed: ${u.email}`)
      } else {
        userIds[u.email] = result
        console.log(`Created: ${u.email} / ${u.password} (id=${result})`)
      }

      // Update extra profile fields
      if (userIds[u.email]) {
        await client.query(
          `UPDATE "user" SET username=$1, bio=$2, phone=$3, location=$4, "emailVerified"=true WHERE id=$5`,
          [u.username, u.bio, u.phone, u.location, userIds[u.email]]
        )
      }
    }

    // Create "Favourite" self-conversation for each user
    for (const u of USERS) {
      const userId = userIds[u.email]
      if (!userId) continue

      const existing = await client.query(
        `SELECT c.id FROM conversation c
         JOIN conversation_member cm ON cm."conversationId" = c.id
         WHERE c.type = 'favourite' AND cm."userId" = $1 LIMIT 1`,
        [userId]
      )
      if (existing.rows.length > 0) {
        console.log(`Favourite for ${u.email} already exists`)
        continue
      }

      const convId = uuid()
      const now = new Date()
      await client.query(
        `INSERT INTO conversation (id, name, description, type, "createdAt", "updatedAt", "createdBy", "lastMessageAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [convId, "Избранное", "Ваши заметки и избранные сообщения", "favourite", now, now, userId, now]
      )
      await client.query(
        `INSERT INTO conversation_member (id, "conversationId", "userId", role, "joinedAt", "lastReadAt")
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [uuid(), convId, userId, "admin", now, now]
      )
      console.log(`Favourite created for ${u.email}`)
    }

    console.log("\n=== LOGIN CREDENTIALS ===")
    USERS.forEach((u) => console.log(`  ${u.name.padEnd(20)} | ${u.email.padEnd(25)} | ${u.password}`))
    console.log("=========================\n")
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(console.error)
