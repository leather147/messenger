import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const v0RuntimeUrl = process.env.V0_RUNTIME_URL
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined
const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

const trustedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
]

if (v0RuntimeUrl) trustedOrigins.push(v0RuntimeUrl)
if (vercelUrl) trustedOrigins.push(vercelUrl)
if (productionUrl) trustedOrigins.push(productionUrl)

// Allow all vusercontent.net subdomains (v0 preview iframes)
// Better Auth supports wildcard origins
trustedOrigins.push('https://*.vusercontent.net')

export const auth = betterAuth({
  database: pool,
  baseURL:
    process.env.BETTER_AUTH_URL ??
    productionUrl ??
    vercelUrl ??
    v0RuntimeUrl ??
    'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none' as const,
      secure: true,
    },
  },
})