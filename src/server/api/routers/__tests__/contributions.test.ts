import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { contributionsRouter } from "../contributions"

const createCaller = createCallerFactory(contributionsRouter)

const USER_ID = "00000000-0000-0000-0000-000000000001"

function makeSupabase(overrides: Record<string, unknown> = {}) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    ...overrides,
  }
}

function makeCtx(user: unknown = { id: USER_ID }) {
  return { supabase: makeSupabase(), user, headers: new Headers() }
}

const sampleContribution = {
  id: "00000000-0000-0000-0000-000000000010",
  user_id: USER_ID,
  department: "Engineering",
  task: "Built login page",
  priority: "high" as const,
}

describe("contributionsRouter", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("list", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.list()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns contributions for current user", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [sampleContribution], error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.list()
      expect(result).toEqual([sampleContribution])
    })

    it("throws INTERNAL_SERVER_ERROR on DB error", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: "db error" } }),
      })
      const caller = createCaller(ctx as never)
      await expect(caller.list()).rejects.toThrow("db error")
    })
  })

  describe("listAll", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.listAll()).rejects.toThrow("UNAUTHORIZED")
    })

    it("throws FORBIDDEN when user is not admin", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { role: "member" }, error: null }),
      })
      const caller = createCaller(ctx as never)
      await expect(caller.listAll()).rejects.toThrow("Admin only")
    })

    it("returns all contributions when user is admin", async () => {
      const ctx = makeCtx()
      let callCount = 0
      ctx.supabase.from = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [sampleContribution], error: null }),
        }
      })
      const caller = createCaller(ctx as never)
      const result = await caller.listAll()
      expect(result).toEqual([sampleContribution])
    })
  })

  describe("create", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(
        caller.create({ department: "Eng", task: "Task", priority: "low" })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("creates a contribution and returns it", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: sampleContribution, error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.create({
        department: "Engineering",
        task: "Built login page",
        priority: "high",
      })
      expect(result).toEqual(sampleContribution)
    })

    it("rejects task longer than 100 chars", async () => {
      const caller = createCaller(makeCtx() as never)
      await expect(
        caller.create({ department: "Eng", task: "x".repeat(101), priority: "low" })
      ).rejects.toThrow()
    })
  })

  describe("update", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(
        caller.update({ id: sampleContribution.id, task: "New task" })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("updates and returns the contribution", async () => {
      const updated = { ...sampleContribution, task: "Updated task" }
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.update({ id: sampleContribution.id, task: "Updated task" })
      expect(result).toEqual(updated)
    })
  })
})
