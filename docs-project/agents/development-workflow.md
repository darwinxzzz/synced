# Development Workflow

Use pnpm (`pnpm@10.30.1`) and keep secrets in `.env` / `.env.test` based on the provided examples.

## Commands

- `pnpm dev` — start the Turbo-powered local server at `http://localhost:3000`.
- `pnpm build` — create a production Next.js build; `pnpm start` serves it.
- `pnpm check` — run Next lint and TypeScript checking.
- `pnpm format:check` — verify Prettier formatting.
- `pnpm test` — run unit tests.
- `pnpm test:integration` — run Supabase-backed router tests.
- `pnpm e2e:setup:member` / `pnpm e2e:setup:admin` — create Playwright auth state.
- `pnpm e2e:member` / `pnpm e2e:admin` — run role-based Playwright journeys.

## Recommended Workflow

```
                    ┌─────────────────────┐
                    │  1. PREPARE         │
                    │  git status         │
                    │  git pull           │
                    │  Check nested repos │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  2. DEVELOP         │
                    │  Make scoped changes │
                    │  pnpm format:check   │
                    │  pnpm check (lint + │
                    │     typecheck)      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  3. VERIFY          │
                    │  pnpm test          │
                    │  pnpm test:integration│
                    │  (if applicable)    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  4. DOCUMENT        │
                    │  Update changelog   │
                    │  Update trouble-    │
                    │  shooting (if bug)  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  5. COMMIT & PUSH   │
                    │  git add .          │
                    │  git commit -m      │
                    │  "type: message"    │
                    │  git push           │
                    └─────────────────────┘
```

Before a task, check the status of the main repository and any nested repository you will touch. Keep changes scoped, then run the most relevant checks before handoff.
