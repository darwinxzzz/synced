# Project Structure

Synced is a Next.js 15 App Router application written in TypeScript.

- Pages and route groups live in `src/app/` (`(marketing)`, `(auth)`, `admin`, and `member`).
- Shared and feature UI is under `src/app/_components/`.
- tRPC context and procedure builders are in `src/server/api/`.
- Domain routers are in `src/server/api/routers/`; shared business logic belongs in `src/server/services/`.
- Supabase clients and auth helpers are in `src/lib/`.
- Generated database types are in `src/types/database.ts`.
- Database migrations and seed SQL are in `supabase/`.
- Unit tests mirror source areas under `tests/unit/`; integration tests are under `tests/integration/`; Playwright journeys are under `tests/e2e/`.
- `docs-project/` is the selected project documentation root and `docs-project/agents/` contains agent-facing guidance.
- Existing application documentation and assets remain in `docs/`.
- Project workflow metadata is under `project/`.
