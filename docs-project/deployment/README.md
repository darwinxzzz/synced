# Deployment

## Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | http://localhost:3000 | Development |
| Production | [production URL - TBD] | Live application |

## Prerequisites

- Node.js (no `.nvmrc` or `package.json` `engines` value is currently defined; use a Node.js version supported by Next.js 15)
- pnpm 10.30.1 or newer (`package.json` declares `pnpm@10.30.1`)
- A Supabase project for Postgres, authentication, and project API keys
- A Vercel account for hosting, if using the recommended Vercel deployment path

## Configuration

### Environment Variables

Runtime environment variables are validated by `src/env.js`. Required variables in the current schema:

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key; server-only and must never be exposed to clients | Supabase Dashboard |
| `GOOGLE_STITCH_API_KEY` | Google Stitch API key used by server-side application features | Google Cloud / Google AI tooling |
| `NODE_ENV` | Application runtime environment; defaults to `development` and must be `development`, `test`, or `production` when set | Runtime platform |

`.env.example` also includes authentication-related placeholders that may be needed by auth integrations but are not currently validated in `src/env.js`:

| Variable | Description | Source |
|----------|-------------|--------|
| `AUTH_SECRET` | NextAuth secret | Generated with `npx auth secret` |
| `AUTH_DISCORD_ID` | Discord OAuth client ID | Discord Developer Portal |
| `AUTH_DISCORD_SECRET` | Discord OAuth client secret | Discord Developer Portal |

Copy `.env.example` to `.env.local` for local development and populate the required values. The example file currently notes copying to `.env`; use `.env.local` for standard local Next.js development and `.env` / `.env.test` where required by the integration and end-to-end test scripts.

## Deploy Steps

### Deployment Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Environment                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      Browser Client                      │   │
│  │                 (Next.js Static Assets)                  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Vercel Edge / Serverless               │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │              Next.js 15 App Router                 │  │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │   │
│  │  │  │Marketing │ │   Auth   │ │ Admin / Member   │   │  │   │
│  │  │  │  Pages   │ │  Routes  │ │    Portals       │   │  │   │
│  │  │  └──────────┘ └──────────┘ └──────────────────┘   │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                         │                                 │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │           tRPC HTTP Handler (/api/trpc)            │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Supabase Cloud Platform                       │   │
│  │  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐  │   │
│  │  │ Supabase Auth │  │  PostgreSQL   │  │  Row-Level   │  │   │
│  │  │ (OAuth + SSR) │  │  (Data Store) │  │  Security    │  │   │
│  │  └──────────────┘  └───────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Environment Variables                       │   │
│  │  NEXT_PUBLIC_SUPABASE_URL  (client)                     │   │
│  │  NEXT_PUBLIC_SUPABASE_ANON_KEY (client)                 │   │
│  │  SUPABASE_SERVICE_ROLE_KEY   (server-only)               │   │
│  │  GOOGLE_STITCH_API_KEY       (server-only)               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Local Development

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs `next dev --turbo`.

### Production Build

```bash
pnpm build
pnpm start
```

Before deployment, run the relevant validation commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Additional test scripts are available for integration and Playwright flows:

```bash
pnpm test:integration
pnpm e2e:setup:member
pnpm e2e:setup:admin
pnpm e2e:audit
pnpm e2e:member
pnpm e2e:admin
```

There is no top-level `pnpm e2e` script currently defined in `package.json`; use the specific `e2e:*` scripts above.

### Vercel Deployment (recommended)

1. Connect the repository to Vercel.
2. Set all required environment variables in Vercel project settings for the appropriate environment (`Production`, `Preview`, and/or `Development`).
3. Deploy. Vercel should auto-detect the Next.js application configuration; no `vercel.json` file is currently present.
4. Configure a custom domain if needed.
5. Confirm the deployed site can reach Supabase and that server-only secrets are not exposed to the browser.

### Database Setup

1. Create a Supabase project.
2. Apply database migrations from `supabase/migrations/`.
3. Configure Supabase Auth settings and any required OAuth providers used by the application.
4. Set the site URL and redirect URLs in Supabase Auth settings for local, preview, and production deployments.
5. Seed data only when appropriate for the target environment:

```bash
pnpm seed:auth-users:dry
pnpm seed:auth-users
pnpm seed:admin-sql
```

Use caution with seed scripts in production. `seed:admin-sql` runs against the linked Supabase project.

### Docker

Not applicable. No Dockerfile or Docker Compose configuration was found in the repository.

## Rollback

- Vercel: Use the Vercel dashboard to redeploy a previous deployment.
- Database: Use Supabase point-in-time recovery or restore from backup. Treat schema rollbacks separately from application rollbacks and verify compatibility before redeploying an older application build.

## Operational Checks

- [ ] Environment variables set correctly in the hosting platform
- [ ] Supabase URL and anon key are available to the client runtime
- [ ] Supabase service role key is configured only as a server-side secret
- [ ] `GOOGLE_STITCH_API_KEY` is configured for server-side usage
- [ ] OAuth providers and redirect URLs are configured if auth flows are enabled
- [ ] Database migrations applied
- [ ] RLS policies active in Supabase
- [ ] Seed scripts were not run against production unless explicitly intended
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck`, and relevant tests pass before production release

## CI/CD

No CI/CD configuration was found in the repository. This is a future improvement area. If deployed on Vercel, Vercel can provide automatic deployments from connected Git branches even without repository-managed CI configuration.

## Monitoring and Logging

- Vercel provides deployment logs, runtime logs, and analytics for hosted deployments.
- Supabase provides database logs, Auth logs, API logs, and monitoring in the Supabase Dashboard.
- Application-level logging: no dedicated logging framework or external log drain configuration was identified in the deployment configuration. Use platform logs unless or until an application logging provider is added.

## See Also

- [Supabase Deployment Guide](https://supabase.com/docs/guides/deployment)
- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
