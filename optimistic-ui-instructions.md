# Optimistic UI Pattern — T3 Stack (tRPC + React)

> Give this file to Claude Code when implementing any mutation that needs instant UI feedback.
> Works for: adding items, removing items, reordering (kanban), toggling, updating fields.

---

## What You Are Doing

You are implementing the **Optimistic UI pattern**. The goal is:

1. Update the UI **immediately** when the user does something
2. Send the real request to the server **in the background**
3. If the server **succeeds** → sync real data
4. If the server **fails** → roll back the UI to what it was before

Do NOT wait for the server before showing the change. The user should never see a loading spinner for common actions.

---

## File Structure

Split the code across two files:

```
/src
  /server/api/routers/
    [feature].ts        ← backend: real DB mutations only
  /app or /components/
    [Feature].tsx       ← frontend: optimistic UI logic
```

---

## Backend Template — `/server/api/routers/[feature].ts`

The backend does NOT handle optimistic UI. It only does the real DB work.

```ts
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const featureRouter = createTRPCRouter({
  // Query to fetch all items
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.item.findMany();
  }),

  // Add mutation
  add: protectedProcedure
    .input(z.object({ text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.create({
        data: { text: input.text },
      });
    }),

  // Remove mutation
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.delete({
        where: { id: input.id },
      });
    }),

  // Update mutation (if needed)
  update: protectedProcedure
    .input(z.object({ id: z.string(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.item.update({
        where: { id: input.id },
        data: { text: input.text },
      });
    }),
});
```

**Rules for the backend file:**
- No optimistic logic here
- Always validate input with `z` (zod)
- Always use `protectedProcedure` unless the route is public
- Return the full updated record from the DB after mutations

---

## Frontend Template — `/components/[Feature].tsx`

This is where all optimistic UI logic lives.

```tsx
"use client";
import { api } from "~/trpc/react";

export function FeatureList() {
  // Step 1: Get cache utilities
  const utils = api.useUtils();

  // Step 2: Fetch real data
  const { data: items } = api.feature.getAll.useQuery();

  // -------------------------------------------------------
  // ADD — Optimistic
  // -------------------------------------------------------
  const addItem = api.feature.add.useMutation({
    // Runs BEFORE the server call
    onMutate: async (newItem) => {
      // Stop any background refetches from overwriting optimistic data
      await utils.feature.getAll.cancel();

      // Save current state so we can roll back if needed
      const previous = utils.feature.getAll.getData();

      // Update the UI immediately with a fake temporary item
      utils.feature.getAll.setData(undefined, (old) => [
        ...(old ?? []),
        {
          id: `temp-${Date.now()}`, // temporary ID — replaced after server responds
          text: newItem.text,
        },
      ]);

      // Return snapshot for rollback
      return { previous };
    },

    // If the server returns an error → undo the optimistic update
    onError: (_err, _newItem, ctx) => {
      utils.feature.getAll.setData(undefined, ctx?.previous);
    },

    // Always runs at the end (success or error) → sync real server data
    onSettled: () => {
      void utils.feature.getAll.invalidate();
    },
  });

  // -------------------------------------------------------
  // REMOVE — Optimistic
  // -------------------------------------------------------
  const removeItem = api.feature.remove.useMutation({
    onMutate: async ({ id }) => {
      await utils.feature.getAll.cancel();
      const previous = utils.feature.getAll.getData();

      // Remove the item from cache immediately
      utils.feature.getAll.setData(undefined, (old) =>
        old?.filter((item) => item.id !== id) ?? []
      );

      return { previous };
    },
    onError: (_err, _variables, ctx) => {
      utils.feature.getAll.setData(undefined, ctx?.previous);
    },
    onSettled: () => {
      void utils.feature.getAll.invalidate();
    },
  });

  // -------------------------------------------------------
  // UPDATE — Optimistic
  // -------------------------------------------------------
  const updateItem = api.feature.update.useMutation({
    onMutate: async (updatedItem) => {
      await utils.feature.getAll.cancel();
      const previous = utils.feature.getAll.getData();

      // Replace only the changed item in cache
      utils.feature.getAll.setData(undefined, (old) =>
        old?.map((item) =>
          item.id === updatedItem.id
            ? { ...item, text: updatedItem.text }
            : item
        ) ?? []
      );

      return { previous };
    },
    onError: (_err, _variables, ctx) => {
      utils.feature.getAll.setData(undefined, ctx?.previous);
    },
    onSettled: () => {
      void utils.feature.getAll.invalidate();
    },
  });

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div>
      {items?.map((item) => (
        <div key={item.id}>
          <span>{item.text}</span>

          {/* Disable while a mutation is in flight to avoid double actions */}
          <button
            onClick={() => removeItem.mutate({ id: item.id })}
            disabled={removeItem.isPending}
          >
            Remove
          </button>
        </div>
      ))}

      <button
        onClick={() =>
          addItem.mutate({ text: `Item ${(items?.length ?? 0) + 1}` })
        }
        disabled={addItem.isPending}
      >
        Add Item
      </button>
    </div>
  );
}
```

---

## The Three Callbacks — Quick Reference

| Callback | When it runs | What to do |
|---|---|---|
| `onMutate` | Before server call | Cancel refetches, save snapshot, update cache |
| `onError` | If server fails | Restore snapshot (rollback) |
| `onSettled` | Always at end | Invalidate cache to sync real data |

---

## Checklist Before Shipping

- [ ] `await utils.[router].[query].cancel()` is called first inside `onMutate`
- [ ] A `previous` snapshot is saved and returned from `onMutate`
- [ ] `ctx?.previous` is used in `onError` to roll back
- [ ] `invalidate()` is called inside `onSettled` (not `onSuccess`)
- [ ] Buttons have `disabled={mutation.isPending}` to prevent double-clicks
- [ ] Temporary IDs use `temp-${Date.now()}` pattern for adds
- [ ] No action buttons depend on temp IDs (wait for `onSettled` to resolve first)

---

## Common Mistakes Claude Code Makes — Fix These

**Wrong: Invalidating in onSuccess**
```ts
// BAD — misses rollback sync on error
onSuccess: () => { void utils.feature.getAll.invalidate(); }

// GOOD — always syncs, even after rollback
onSettled: () => { void utils.feature.getAll.invalidate(); }
```

**Wrong: Not cancelling in-flight queries**
```ts
// BAD — background refetch can overwrite your optimistic update
onMutate: async () => {
  const previous = utils.feature.getAll.getData(); // refetch might still run!
}

// GOOD
onMutate: async () => {
  await utils.feature.getAll.cancel(); // stop refetches first
  const previous = utils.feature.getAll.getData();
}
```

**Wrong: Mutating state directly**
```ts
// BAD
old?.push(newItem);

// GOOD — always return a new array
old => [...(old ?? []), newItem]
```

---

## Adapting for Kanban (Event Sync)

For drag-and-drop reorder, the `onMutate` update changes to reorder by index:

```ts
onMutate: async ({ id, newIndex }) => {
  await utils.task.getAll.cancel();
  const previous = utils.task.getAll.getData();

  utils.task.getAll.setData(undefined, (old) => {
    if (!old) return old;
    const items = [...old];
    const fromIndex = items.findIndex((i) => i.id === id);
    const [moved] = items.splice(fromIndex, 1);
    items.splice(newIndex, 0, moved!);
    return items;
  });

  return { previous };
});
```

---

*Pattern: Optimistic UI | Stack: T3 (Next.js + tRPC + Supabase + Prisma) | Last updated: April 2026*
