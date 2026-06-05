import { createClient } from "@supabase/supabase-js"
import type { Database } from "~/types/database"

type SupabaseClient = ReturnType<typeof createClient<Database>>

export interface TestCtx {
  supabase: SupabaseClient
  user: { id: string; email?: string } | null
  profile: { role: string | null; status: string | null } | null
  headers: Headers
}

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing env var: ${key}. Add it to your .env file.`)
  return value
}

function getFirstEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]
    if (value) return value
  }

  throw new Error(`Missing env var: ${keys.join(" or ")}. Add it to your .env.test file.`)
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
    profile: null,
    headers: new Headers(),
  }
}

/**
 * Authenticated context — signs in via TEST_USER_EMAIL / TEST_USER_PASSWORD.
 * The resulting Supabase client carries the user's JWT so auth.uid() works
 * in RPC functions and RLS policies apply correctly.
 */
export async function makeSignedInCtx(): Promise<
  TestCtx & {
    user: { id: string; email: string }
    profile: { role: string | null; status: string | null }
  }
> {
  const email = getFirstEnv("TEST_USER_EMAIL", "TEST_MEMBER_EMAIL")
  const password = getFirstEnv("TEST_USER_PASSWORD", "TEST_MEMBER_PASSWORD")

  const client = buildClient()
  const { data: { user }, error } = await client.auth.signInWithPassword({ email, password })

  if (error ?? !user) {
    throw new Error(`Test sign-in failed: ${error?.message ?? "no user returned"}`)
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single()

  if (profileError ?? !profile) {
    throw new Error(`Test profile lookup failed: ${profileError?.message ?? "no profile returned"}`)
  }

  return {
    supabase: client,
    user: { id: user.id, email: user.email! },
    profile,
    headers: new Headers(),
  }
}
