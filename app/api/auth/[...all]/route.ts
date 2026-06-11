import { auth } from '@/lib/auth'
import { ensureDatabaseSchema } from '@/lib/db/ensure-schema'
import { toNextJsHandler } from 'better-auth/next-js'

const handlers = toNextJsHandler(auth.handler)

export async function GET(request: Request) {
  await ensureDatabaseSchema()
  return handlers.GET(request)
}

export async function POST(request: Request) {
  await ensureDatabaseSchema()
  return handlers.POST(request)
}
