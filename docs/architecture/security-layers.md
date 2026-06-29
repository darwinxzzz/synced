# Security layers — the four rings

Authorization is **defence in depth**: four independent layers so no single mistake exposes data.
Trust increases inward. **Only Rings 2–4 are security boundaries.**

| Ring | Layer | Runtime | Responsibility | Security boundary? |
|---|---|---|---|---|
| 1 | `middleware.ts` | Edge | Session-cookie refresh, rate limiting, redirect unauthenticated users off protected routes | ❌ advisory / UX only |
| 2 | Route-group layouts + tRPC procedures | Node | Coarse role redirect (layouts) + per-request auth/role/status gate (procedures) + Zod input validation | ✅ application gate |
| 3 | Postgres Row-Level Security | DB | `auth.uid()` ownership + `is_admin()` role policies | ✅ non-bypassable |
| 4 | `security definer` RPCs | DB | Privileged, audited operations (`create_event`, KPI aggregates) | ✅ narrowest trusted surface |

## Why the edge is not a boundary

`middleware.ts` runs on the Edge runtime. It is the *first* thing a request hits, which makes it
perfect for cheap UX (redirect a logged-out user to `/login`) and rate limiting — but it can be
bypassed and is far from the single-region database. **Never make an authorization decision the
edge is the only enforcer of.** Treat any edge check as advisory; the real gate is Rings 2–3.

## Single source of truth: `evaluateAccess`

The account status rule ("pending / rejected / inactive / active") and the role rule
("admin can do X") are expressed **once**, as a pure function in `lib/auth/access.ts`, and reused
by tRPC procedures and the server layouts. No duplicated `if (status === 'pending')` blocks.

## Request lifecycle (member writes a contribution)

```
Member ──▶ Edge middleware: refresh session cookie, rate-limit, (logged in? continue)
       ──▶ tRPC protectedProcedure: getAuthState() → evaluateAccess(profile)
                                     reject unless status = active
       ──▶ ctx.supabase INSERT (carries the user JWT)
       ──▶ Postgres RLS: auth.uid() = user_id ?  → row or denied
       ──▶ typed result back to the client
```

## Trust split of the Supabase clients

- `lib/supabase/server.ts` & `client.ts` — **anon key**, carry the user session → **RLS applies**.
  Used for all user-initiated reads/writes.
- `lib/supabase/admin.ts` — **service-role key**, `import "server-only"`, bypasses RLS. Used
  **only** where there is no user session (webhooks, cron) or for genuinely privileged ops
  (inviting a member). Never imported into client code.
