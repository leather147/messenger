'use client'

import { createAuthClient } from 'better-auth/react'

// When rendered inside the v0 preview iframe, window.location.origin is
// the vusercontent.net address, not localhost. We must explicitly point
// the auth client at the Next.js server so requests go to /api/auth/*.
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined'
    ? window.location.origin.includes('vusercontent.net')
      ? 'http://localhost:3000'
      : window.location.origin
    : 'http://localhost:3000',
})

export const { signIn, signUp, signOut, useSession } = authClient
