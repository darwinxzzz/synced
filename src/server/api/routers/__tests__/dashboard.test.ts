// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { dashboardRouter } from "../dashboard"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"

const createCaller = createCallerFactory(dashboardRouter)

describe("dashboardRouter", () => {
  let ctx: TestCtx & { user: { id: string } }

  beforeAll(async () => {
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    await ctx.supabase.auth.signOut()
  })

  // ─── getMemberKPIs ──────────────────────────────────────────────────────────
  describe("getMemberKPIs", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getMemberKPIs()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns KPI object with expected numeric fields", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMemberKPIs()
      expect(typeof result.remainingTasks).toBe("number")
      expect(typeof result.completionRate).toBe("number")
      expect(typeof result.teamSyncCount).toBe("number")
      expect(result.nextDeadline === null || typeof result.nextDeadline === "object").toBe(true)
    })

    it("nextDeadline has expected shape when present", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMemberKPIs()
      if (result.nextDeadline !== null) {
        expect(result.nextDeadline).toHaveProperty("days_away")
        expect(result.nextDeadline).toHaveProperty("event_date")
        expect(result.nextDeadline).toHaveProperty("event_name")
      }
    })
  })

  // ─── getPendingMilestones ───────────────────────────────────────────────────
  describe("getPendingMilestones", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getPendingMilestones()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns an array of milestones with expected shape", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getPendingMilestones()
      expect(Array.isArray(result)).toBe(true)
      result.forEach(m => {
        expect(m).toHaveProperty("task_id")
        expect(m).toHaveProperty("department")
        expect(m).toHaveProperty("task")
        expect(m).toHaveProperty("event_name")
        expect(m).toHaveProperty("event_id")
        expect(m).toHaveProperty("event_date")
        expect(m).toHaveProperty("pillar_status")
        expect(typeof m.task_id).toBe("string")
      })
    })

    it("does not include tasks with pillar_status = done", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getPendingMilestones()
      result.forEach(m => {
        expect(m.pillar_status).not.toBe("done")
      })
    })
  })

  // ─── getUpcomingMeeting ─────────────────────────────────────────────────────
  describe("getUpcomingMeeting", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getUpcomingMeeting()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns null or an event object with expected shape", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getUpcomingMeeting()
      if (result !== null) {
        expect(result).toHaveProperty("id")
        expect(result).toHaveProperty("name")
        expect(result).toHaveProperty("event_members")
        expect(Array.isArray(result.event_members)).toBe(true)
      } else {
        expect(result).toBeNull()
      }
    })
  })

  // ─── getMyProfile ───────────────────────────────────────────────────────────
  describe("getMyProfile", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getMyProfile()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns profile with expected string fields", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyProfile()
      expect(typeof result.id).toBe("string")
      expect(typeof result.name).toBe("string")
      expect(typeof result.email).toBe("string")
      expect(typeof result.role).toBe("string")
    })

    it("returns department, joined_date, avatar_url (nullable)", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyProfile()
      expect("department" in result).toBe(true)
      expect("joined_date" in result).toBe(true)
      expect("avatar_url" in result).toBe(true)
    })

    it("returned id matches the authenticated user id", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyProfile()
      expect(result.id).toBe(ctx.user.id)
    })
  })

  // ─── getReflectionStreak ────────────────────────────────────────────────────
  describe("getReflectionStreak", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getReflectionStreak()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns streakCount and streakPercent as numbers", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getReflectionStreak()
      expect(typeof result.streakCount).toBe("number")
      expect(typeof result.streakPercent).toBe("number")
    })

    it("streakPercent is capped at 100", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getReflectionStreak()
      expect(result.streakPercent).toBeLessThanOrEqual(100)
    })

    it("streakPercent is non-negative", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getReflectionStreak()
      expect(result.streakPercent).toBeGreaterThanOrEqual(0)
    })
  })
})
