import { createClient } from "@supabase/supabase-js"
import type { Database } from "~/types/database"

type SupabaseClient = ReturnType<typeof createClient<Database>>

export interface TestCtx {
  supabase: SupabaseClient
  user: { id: string; email?: string } | null
  headers: Headers
}

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}. Add it to your .env file.`)
  return value
}

function buildClient(): SupabaseClient {
  return createClient<Database>(
    getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/** Unauthenticated context — for testing UNAUTHORIZED guards. */
export function makeUnauthCtx(): TestCtx {
  return {
    supabase: buildClient(),
    user: null,
    headers: new Headers(),
  }
}

/**
 * Authenticated context — signs in via TEST_USER_EMAIL / TEST_USER_PASSWORD.
 * The resulting Supabase client carries the user's JWT so auth.uid() works
 * in RPC functions and RLS policies apply correctly.
 */
export async function makeSignedInCtx(): Promise<TestCtx & { user: { id: string; email: string } }> {
  const email = getEnv("TEST_USER_EMAIL")
  const password = getEnv("TEST_USER_PASSWORD")

  const client = buildClient()
  const { data: { user }, error } = await client.auth.signInWithPassword({ email, password })

  if (error ?? !user) {
    throw new Error(`Test sign-in failed: ${error?.message ?? "no user returned"}`)
  }

  return {
    supabase: client,
    user: { id: user.id, email: user.email! },
    headers: new Headers(),
  }
}
