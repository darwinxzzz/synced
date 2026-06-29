# Folder structure (target)

Adopt the conventions now; grow into the empty parts. **YAGNI** — do not scaffold `billing/`,
`gmail/`, `webhooks/`, or `cron/` until those features are actually being built. Empty layers rot.

```
src/
  app/
    (marketing)/ (auth)/                  # public + auth route groups
    admin/        member/                 # role route groups   ← VIEW divergence
    _components/   { shared, admin, member, ui, kanban, … }
    api/
      trpc/[trpc]/route.ts                # USER entry point
      webhooks/{stripe,resend}/route.ts   # MACHINE entry (signature-verified)   [future]
      cron/gmail-sync/route.ts            # MACHINE entry (cron secret)           [future]
  server/
    api/
      root.ts  trpc.ts                    # context + procedure builders
      routers/  { auth, events, kanban, attendance, contributions,
                  reflections, testimonials, dashboard, newsletter }   # thin, BY DOMAIN
    services/    { testimonials/, billing/[future], gmail/[future],
                  notifications/, … }     # business logic + colocated schemas.ts
    integrations/{ openai, stripe, google, resend }   # thin typed clients   [as needed]
  lib/
    auth/         access.ts               # evaluateAccess (pure) + getAuthState   ← shared rule
    supabase/     { client, server, admin }
    rate-limit/   policies.ts             # ONE policy module; edge + node adapters
  types/database.ts                       # generated Supabase types
  middleware.ts                           # session refresh + rate limit ONLY
```

## Why the service layer earns its place

The app once had a single caller (tRPC), so routers could hold logic. Adding **webhooks, cron,
and integrations** introduces entry points that cannot pass through a tRPC procedure (Stripe has
a signature, not a session). Business logic must drop **below** the router so the user path and
the machine path share one implementation:

```
            ┌── tRPC procedure (user session)        ┐
entry pts ──┼── webhook route (signature verified)   ├──→  SERVICE  ──→ integration adapter ──→ external
            └── cron route (cron secret)              ┘         │
                                                               └──→ Supabase (ctx.supabase OR admin client)
```

## `integrations/` vs `services/`

- **`integrations/`** — *thin* typed clients: auth, base URL, request wrappers. No business logic.
- **`services/`** — *orchestration* using those clients (e.g. compose a testimonial prompt, call
  OpenAI, persist the result). This is the ports-and-adapters seam.

## `rate-limit/` — one policy, two adapters

Define limits once in `lib/rate-limit/policies.ts`. Consume from a thin **edge** adapter
(middleware) and a thin **node** adapter (service). Do not implement the algorithm twice. Moving
from the in-memory `Map` to Upstash Redis later changes only the adapter.
