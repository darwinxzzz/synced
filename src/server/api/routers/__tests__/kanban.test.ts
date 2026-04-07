// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { kanbanRouter } from "../kanban"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"

const createCaller = createCallerFactory(kanbanRouter)

describe("kanbanRouter", () => {
  let ctx: TestCtx & { user: { id: string } }

  beforeAll(async () => {
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    await ctx.supabase.auth.signOut()
  })

  // ─── getMyEvents ─────────────────────────────────────────────────────────────
  describe("getMyEvents", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getMyEvents()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns an array of events for the authenticated user", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyEvents()
      expect(Array.isArray(result)).toBe(true)
      result.forEach(event => {
        expect(event).toHaveProperty("id")
        expect(event).toHaveProperty("name")
      })
    })
  })

  // ─── getMyTasks ───────────────────────────────────────────────────────────────
  describe("getMyTasks", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getMyTasks({})).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns all tasks for the authenticated user", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyTasks({})
      expect(Array.isArray(result)).toBe(true)
    })

    it("returns tasks filtered by eventId when provided", async () => {
      const caller = createCaller(ctx as never)
      const events = await caller.getMyEvents()
      if (events.length === 0) return // No test data — skip

      const eventId = events[0]!.id
      const result = await caller.getMyTasks({ eventId })
      expect(Array.isArray(result)).toBe(true)
      result.forEach(task => {
        expect(task.event_id).toBe(eventId)
      })
    })

    it("returns empty array for a UUID not in the user's memberships", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyTasks({ eventId: "00000000-0000-0000-0000-000000000099" })
      expect(result).toEqual([])
    })
  })

  // ─── updateTaskStatus ─────────────────────────────────────────────────────────
  describe("updateTaskStatus", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.updateTaskStatus({ eventId: "00000000-0000-0000-0000-000000000099", status: "in_progress" }),
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("throws on invalid status value", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.updateTaskStatus({ eventId: "00000000-0000-0000-0000-000000000099", status: "invalid" as never }),
      ).rejects.toThrow()
    })

    it("updates pillar_status and restores it after", async () => {
      const caller = createCaller(ctx as never)
      const events = await caller.getMyEvents()
      if (events.length === 0) return // No test data — skip

      const eventId = events[0]!.id
      const tasks = await caller.getMyTasks({ eventId })
      if (tasks.length === 0) return // No membership row — skip

      const original = (tasks[0]!.pillar_status ?? "new") as "new" | "in_progress" | "in_review" | "done"
      const target: typeof original = original === "new" ? "in_progress" : "new"

      const result = await caller.updateTaskStatus({ eventId, status: target })
      expect(result).toMatchObject({ pillar_status: target })

      // Restore so tests are idempotent
      await caller.updateTaskStatus({ eventId, status: original })
    })
  })
})
