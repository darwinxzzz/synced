// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { kanbanRouter } from "~/server/api/routers/kanban"
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
      result.forEach((event) => {
        expect(event).toHaveProperty("id")
        expect(event).toHaveProperty("name")
      })
    })
  })

  // ─── getMemberKanban ──────────────────────────────────────────────────────────
  describe("getMemberKanban", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.getMemberKanban({ eventId: "00000000-0000-0000-0000-000000000001" })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("rejects invalid UUID", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.getMemberKanban({ eventId: "not-a-uuid" })
      ).rejects.toThrow()
    })

    it("returns empty array for event not in user memberships", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMemberKanban({
        eventId: "00000000-0000-0000-0000-000000000099",
      })
      expect(result).toEqual([])
    })

    it("returns tasks with expected shape when event exists", async () => {
      const caller = createCaller(ctx as never)
      const events = await caller.getMyEvents()
      if (!events.length) return // No test data — skip

      const result = await caller.getMemberKanban({ eventId: events[0]!.id })
      expect(Array.isArray(result)).toBe(true)
      result.forEach((task) => {
        expect(task).toHaveProperty("id")
        expect(task).toHaveProperty("name")
        expect(task).toHaveProperty("department")
        expect(task).toHaveProperty("priority")
        expect(task).toHaveProperty("pillarStatus")
        expect(task).toHaveProperty("deadline")
        expect(task).toHaveProperty("assignedBy")
        expect(task).toHaveProperty("contributionId")
        expect(task).toHaveProperty("isEditable")
      })
    })

    it("isEditable is false for done tasks", async () => {
      const caller = createCaller(ctx as never)
      const events = await caller.getMyEvents()
      if (!events.length) return

      const result = await caller.getMemberKanban({ eventId: events[0]!.id })
      result.forEach((task) => {
        if (task.pillarStatus === "done") {
          expect(task.isEditable).toBe(false)
        }
      })
    })

    it("priority is one of low|medium|high", async () => {
      const caller = createCaller(ctx as never)
      const events = await caller.getMyEvents()
      if (!events.length) return

      const result = await caller.getMemberKanban({ eventId: events[0]!.id })
      result.forEach((task) => {
        expect(["low", "medium", "high"]).toContain(task.priority)
      })
    })
  })

  // ─── checkContributionExists ──────────────────────────────────────────────────
  describe("checkContributionExists", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.checkContributionExists({ eventId: "00000000-0000-0000-0000-000000000001" })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns boolean", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.checkContributionExists({
        eventId: "00000000-0000-0000-0000-000000000099",
      })
      expect(typeof result).toBe("boolean")
    })

    it("returns false for event with no contribution", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.checkContributionExists({
        eventId: "00000000-0000-0000-0000-000000000099",
      })
      expect(result).toBe(false)
    })
  })

  // ─── moveTask ─────────────────────────────────────────────────────────────────
  describe("moveTask", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.moveTask({
          eventMemberId: "00000000-0000-0000-0000-000000000001",
          newStatus: "in_progress",
        })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("rejects invalid status (done is not allowed for members)", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.moveTask({
          eventMemberId: "00000000-0000-0000-0000-000000000001",
          newStatus: "done" as never,
        })
      ).rejects.toThrow()
    })

    it("throws NOT_FOUND for an eventMemberId not owned by user", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.moveTask({
          eventMemberId: "00000000-0000-0000-0000-000000000099",
          newStatus: "in_progress",
        })
      ).rejects.toThrow()
    })
  })

  // ─── updateOwnContribution ────────────────────────────────────────────────────
  describe("updateOwnContribution", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.updateOwnContribution({
          contributionId: "00000000-0000-0000-0000-000000000001",
          priority: "high",
        })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("throws for contribution not owned by user", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.updateOwnContribution({
          contributionId: "00000000-0000-0000-0000-000000000099",
          priority: "low",
        })
      ).rejects.toThrow()
    })

    it("rejects priority outside enum", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.updateOwnContribution({
          contributionId: "00000000-0000-0000-0000-000000000001",
          priority: "critical" as never,
        })
      ).rejects.toThrow()
    })
  })

  // ─── getPendingReflectionCount ────────────────────────────────────────────────
  describe("getPendingReflectionCount", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getPendingReflectionCount()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns a non-negative number", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getPendingReflectionCount()
      expect(typeof result).toBe("number")
      expect(result).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── getMyTasks (legacy) ──────────────────────────────────────────────────────
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
      if (!events.length) return

      const eventId = events[0]!.id
      const result = await caller.getMyTasks({ eventId })
      expect(Array.isArray(result)).toBe(true)
      result.forEach((task) => {
        expect(task.event_id).toBe(eventId)
      })
    })

    it("returns empty array for a UUID not in the user's memberships", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyTasks({ eventId: "00000000-0000-0000-0000-000000000099" })
      expect(result).toEqual([])
    })
  })

  // ─── updateTaskStatus (legacy) ────────────────────────────────────────────────
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
  })
})
