# Security Guidelines

- Treat Postgres RLS as the non-bypassable data boundary and pair it with tRPC procedure guards.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`.
- Never import the server-only Supabase admin client into browser code.
- For schema or policy changes, add a timestamped migration under `supabase/migrations/`.
- Test both member and admin access paths for authorization changes.
- Keep `.env`, `.env.test`, and other secret-bearing files out of commits.
