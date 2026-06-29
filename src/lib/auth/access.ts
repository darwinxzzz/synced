import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "~/types/database";

/**
 * The single source of truth for "is this account allowed in?".
 *
 * Used by BOTH the tRPC procedures (Ring 2 security boundary) and the server-side
 * route guards, so the account-status / role rule is expressed exactly once and
 * cannot drift between the edge and the API. See docs/architecture/security-layers.md.
 */

export type UserRole = "admin" | "member";

export interface AccessProfile {
  role: string | null;
  status: string | null;
}

export type AccessDecision =
  | { ok: true; role: UserRole }
  | { ok: false; code: "UNAUTHENTICATED" | "FORBIDDEN"; reason: string };

export interface EvaluateAccessOptions {
  /** When set, the profile must additionally hold this role (e.g. "admin"). */
  requireRole?: UserRole;
}

/**
 * Pure access decision. No I/O — given a profile (already fetched), decide whether
 * the request may proceed. Status is checked before role so a pending admin still
 * sees the approval message rather than a misleading role error.
 */
export function evaluateAccess(
  profile: AccessProfile | null,
  opts: EvaluateAccessOptions = {},
): AccessDecision {
  if (!profile) {
    return { ok: false, code: "UNAUTHENTICATED", reason: "UNAUTHORIZED" };
  }

  const { status, role } = profile;

  if (status === "pending") {
    return { ok: false, code: "FORBIDDEN", reason: "ACCOUNT_PENDING_APPROVAL" };
  }

  if (status === "rejected" || status === "inactive") {
    return { ok: false, code: "FORBIDDEN", reason: "ACCOUNT_REJECTED" };
  }

  if (status !== "active") {
    return { ok: false, code: "FORBIDDEN", reason: "ACCOUNT_NOT_ACTIVE" };
  }

  if (opts.requireRole && role !== opts.requireRole) {
    const reason =
      opts.requireRole === "admin" ? "ADMIN_REQUIRED" : "ROLE_REQUIRED";
    return { ok: false, code: "FORBIDDEN", reason };
  }

  return { ok: true, role: role === "admin" ? "admin" : "member" };
}

export interface AuthState {
  user: User | null;
  profile: AccessProfile | null;
}

/**
 * Fetch the authenticated user and their profile from a Supabase server client.
 * `getUser()` validates the token against the Auth server (never trust the cookie).
 * Shared by the tRPC context and the server route guards so the fetch happens the
 * same way everywhere.
 */
export async function getAuthState(
  supabase: SupabaseClient<Database>,
): Promise<AuthState> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  return { user, profile: profile ?? null };
}
