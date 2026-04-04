import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { dashboardRouter } from "../dashboard"

const createCaller = createCallerFactory(dashboardRouter)

const USER_ID = "00000000-0000-0000-0000-000000000001"
const EVENT_ID = "00000000-0000-0000-0000-000000000020"

function makeCtx(user: unknown = { id: USER_ID }) {
  const supabase = {
    rpc: vi.fn(),
    from: vi.fn(),
  }
  return { supabase, user, headers: new Headers() }
}

describe("dashboardRouter", () => {
  beforeEach(() => vi.clearAllMocks())

  // ─── getMemberKPIs ──────────────────────────────────────────────────────────
  describe("getMemberKPIs", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.getMemberKPIs()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns combined KPI object", async () => {
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn()
        .mockResolvedValueOnce({ data: 5, error: null })      // remaining_tasks
        .mockResolvedValueOnce({ data: 72, error: null })     // completion_rate
        .mockResolvedValueOnce({ data: [{ days_away: 3, event_date: "2026-04-10", event_name: "Gala" }], error: null }) // next_deadline

      const caller = createCaller(ctx as never)
      const result = await caller.getMemberKPIs()

      expect(result.remainingTasks).toBe(5)
      expect(result.completionRate).toBe(72)
      expect(result.nextDeadline).toMatchObject({ days_away: 3, event_name: "Gala" })
    })

    it("returns null nextDeadline when no upcoming deadlines", async () => {
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn()
        .mockResolvedValueOnce({ data: 0, error: null })
        .mockResolvedValueOnce({ data: 100, error: null })
        .mockResolvedValueOnce({ data: [], error: null })

      const caller = createCaller(ctx as never)
      const result = await caller.getMemberKPIs()
      expect(result.nextDeadline).toBeNull()
    })

    it("throws INTERNAL_SERVER_ERROR on remaining_tasks DB error", async () => {
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn()
        .mockResolvedValueOnce({ data: null, error: { message: "db fail" } })

      const caller = createCaller(ctx as never)
      await expect(caller.getMemberKPIs()).rejects.toThrow("db fail")
    })
  })

  // ─── getPendingMilestones ───────────────────────────────────────────────────
  describe("getPendingMilestones", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.getPendingMilestones()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns list of milestones", async () => {
      const milestones = [
        { department: "Engineering", task: "Build login", event_name: "Gala", event_id: EVENT_ID, event_date: "2026-04-15", pillar_status: "New" },
      ]
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn().mockResolvedValue({ data: milestones, error: null })

      const caller = createCaller(ctx as never)
      const result = await caller.getPendingMilestones()
      expect(result).toEqual(milestones)
    })

    it("returns empty array when no milestones", async () => {
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn().mockResolvedValue({ data: [], error: null })

      const caller = createCaller(ctx as never)
      const result = await caller.getPendingMilestones()
      expect(result).toEqual([])
    })

    it("throws on DB error", async () => {
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "rpc error" } })

      const caller = createCaller(ctx as never)
      await expect(caller.getPendingMilestones()).rejects.toThrow("rpc error")
    })
  })

  // ─── getUpcomingMeeting ─────────────────────────────────────────────────────
  describe("getUpcomingMeeting", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.getUpcomingMeeting()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns null when no active events", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
      })

      const caller = createCaller(ctx as never)
      const result = await caller.getUpcomingMeeting()
      expect(result).toBeNull()
    })

    it("returns event with members when active event exists", async () => {
      const event = {
        id: EVENT_ID,
        name: "Year-End Gala",
        date: "2026-04-20",
        start_time: "18:00",
        status: "active",
        event_members: [
          { profiles: { id: USER_ID, name: "Alice", avatar_url: null } },
        ],
      }
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: event, error: null }),
      })

      const caller = createCaller(ctx as never)
      const result = await caller.getUpcomingMeeting()
      expect(result).toMatchObject({ name: "Year-End Gala", date: "2026-04-20" })
    })

    it("throws INTERNAL_SERVER_ERROR on unexpected DB error", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "500", message: "crash" } }),
      })

      const caller = createCaller(ctx as never)
      await expect(caller.getUpcomingMeeting()).rejects.toThrow("crash")
    })
  })
})
