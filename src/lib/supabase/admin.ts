import "server-only";

import { createClient } from "@supabase/supabase-js";
import { env } from "~/env";

/**
 * Service-role Supabase client for trusted server operations.
 * Never import this into client-side code.
 */
export function createAdminClient() {
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
