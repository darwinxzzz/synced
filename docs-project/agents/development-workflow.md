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

Before a task, check the status of the main repository and any nested repository you will touch. Keep changes scoped, then run the most relevant checks before handoff.
