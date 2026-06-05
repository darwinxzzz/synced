# Synced

![Next.js](https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat-square&logo=trpc&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

Synced is a full-stack community event coordination platform for admins and members. It supports event operations, attendance tracking, contribution visibility, workflow coordination, and testimonial/reflection flows in one role-aware application.

## Project Overview

Synced is designed around two primary user groups:

- **Admins** manage the operational side of community events through dashboard views, attendance workflows, kanban/event tracking, and testimonial moderation.
- **Members** use dedicated views for their dashboard, contribution tracking, kanban participation, and testimonial or reflection submissions.

The application is built with the Next.js App Router, TypeScript, tRPC routers, and Supabase. Supabase Auth handles identity, Postgres stores the application data, Row Level Security protects access at the database layer, and a server-side admin client is used only for trusted server operations that require elevated privileges.

Reliability and security are core design concerns. Synced uses RLS-first access control, protected tRPC procedures, schema validation at API and environment boundaries, optimistic UI with server reconciliation for responsive workflows, and a test strategy that includes unit, integration, and end-to-end coverage.

## Current Status

Synced is still under active development. The current focus is fixing bugs, improving stability, and hardening reliability across critical admin and member workflows.

The project should not be treated as production-ready until `pnpm run check`, the test suite, and critical user flows are consistently green.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| API | tRPC v11 |
| Styling | Tailwind CSS v4 |
| Auth + Database | Supabase Auth, Postgres, RLS |
| Testing | Vitest, Playwright |

## Local Setup

### Prerequisites

- Node.js
- pnpm
- Supabase project

### Install and Run

```bash
pnpm install
cp .env.example .env
```

Fill the Supabase environment variables in `.env`, including the public project URL, anon key, and any server-only keys required by local workflows.

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Testing

```bash
pnpm test
pnpm run typecheck
pnpm run check
```

Integration and end-to-end commands should be run only when the required Supabase credentials and test environment variables are configured.

## Next Steps

- Resolve known lint and build issues.
- Simplify large routers and page components.
- Expand integration and end-to-end coverage for critical flows.
- Improve error handling and loading states.
- Document Supabase setup, RLS assumptions, and required environment variables.
- Add CI checks before merging changes.

## Security Notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Route privileged operations through protected server procedures.
- Treat RLS policies as the first line of data access control.
- Validate inputs at system boundaries before performing mutations.
- Review migrations and access policy changes carefully before applying them to shared environments.
