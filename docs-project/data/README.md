# Data

## Overview
Synced uses Supabase (Postgres) as its primary data store. Data access is managed through Supabase's Row-Level Security (RLS) combined with role-based access control in the application layer.

## Persistence
- **Database:** PostgreSQL via Supabase
- **Access Pattern:** tRPC server → Supabase client (server/browser/admin) → Postgres
- **RLS:** Row-Level Security policies enforce data access at the database level
- **Types:** Generated TypeScript types from Supabase schema in `src/types/database.ts`
- **Validation:** Zod schemas at the service layer for input validation

## Key Documents
- [Data Models](./data-models.md) — Entity definitions, relationships, and types

## See Also
- [API Reference](../api/) — How data is accessed via tRPC
- [Architecture - Systems](../architecture/systems-architecture.md) — System-level data flow
