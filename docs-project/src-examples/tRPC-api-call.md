# Example: Calling a tRPC Procedure

## Purpose
Demonstrates how client components call tRPC procedures using the generated React hooks.

## Prerequisites
- Component must be a client component (`"use client"`)
- The TRPCProvider must wrap the component tree (done in root layout)

## Code

### Query Example
```tsx
"use client";

import { api } from "~/trpc/react";

export function MyEvents() {
  const { data: events, isLoading, error } = api.events.list.useQuery();

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Failed to load events: {error.message}</div>;

  return (
    <ul>
      {events?.map((event) => (
        <li key={event.id}>{event.name}</li>
      ))}
    </ul>
  );
}
```

### Mutation Example
```tsx
"use client";

import { api } from "~/trpc/react";

export function EventStatusToggle({ eventId }: { eventId: string }) {
  const utils = api.useUtils();

  const updateStatus = api.events.updateStatus.useMutation({
    onSuccess: () => {
      // Invalidate the events list to refetch
      utils.events.list.invalidate();
    },
  });

  return (
    <button
      onClick={() =>
        updateStatus.mutate({ id: eventId, status: "archived" })
      }
      disabled={updateStatus.isPending}
    >
      {updateStatus.isPending ? "Updating..." : "Archive Event"}
    </button>
  );
}
```

## Key Files
- `src/trpc/react.tsx` — tRPC React provider and hooks
- `src/trpc/query-client.ts` — React Query client configuration
- `src/server/api/root.ts` — Router composition
- `src/server/api/routers/events.ts` — Example router with `list` and `updateStatus` procedures

## Notes
- Use `api.<router>.<procedure>.useQuery()` for data fetching
- Use `api.<router>.<procedure>.useMutation()` for data mutations
- Call `utils.<router>.<procedure>.invalidate()` to refetch after mutations
