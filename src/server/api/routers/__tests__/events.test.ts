import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { eventsRouter } from "../events"

const createCaller = createCallerFactory(eventsRouter)

const EVENT_ID = "00000000-0000-0000-0000-000000000020"

function makeCtx(user: unknown = { id: "00000000-0000-0000-0000-000000000001" }) {
  const supabase = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
  }
  return { supabase, user, headers: new Headers() }
}

const sampleEvent = {
  id: EVENT_ID,
  name: "Year-End Gala",
  status: "draft",
  is_recurring: false,
}

describe("eventsRouter", () => {
  beforeEach(() => vi.clearAllMocks())

  describe("list", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.list()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns list of events", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [sampleEvent], error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.list()
      expect(result).toEqual([sampleEvent])
    })

    it("throws on DB error", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
      })
      const caller = createCaller(ctx as never)
      await expect(caller.list()).rejects.toThrow("fail")
    })
  })

  describe("getById", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.getById({ id: EVENT_ID })).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns event by id", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: sampleEvent, error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.getById({ id: EVENT_ID })
      expect(result).toEqual(sampleEvent)
    })

    it("throws NOT_FOUND on error", async () => {
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
      })
      const caller = createCaller(ctx as never)
      await expect(caller.getById({ id: EVENT_ID })).rejects.toThrow("Event not found")
    })

    it("rejects invalid uuid", async () => {
      const caller = createCaller(makeCtx() as never)
      await expect(caller.getById({ id: "not-a-uuid" })).rejects.toThrow()
    })
  })

  describe("create", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.create({ name: "Event" })).rejects.toThrow("UNAUTHORIZED")
    })

    it("calls create_event RPC and returns result", async () => {
      const ctx = makeCtx()
      ctx.supabase.rpc = vi.fn().mockResolvedValue({ data: sampleEvent, error: null })
      const caller = createCaller(ctx as never)
      const result = await caller.create({ name: "Year-End Gala" })
      expect(ctx.supabase.rpc).toHaveBeenCalledWith("create_event", expect.objectContaining({
        p_name: "Year-End Gala",
      }))
      expect(result).toEqual(sampleEvent)
    })

    it("rejects name longer than 100 chars", async () => {
      const caller = createCaller(makeCtx() as never)
      await expect(caller.create({ name: "x".repeat(101) })).rejects.toThrow()
    })
  })

  describe("updateStatus", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(
        caller.updateStatus({ id: EVENT_ID, status: "active" })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("updates event status", async () => {
      const updated = { ...sampleEvent, status: "active" }
      const ctx = makeCtx()
      ctx.supabase.from = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.updateStatus({ id: EVENT_ID, status: "active" })
      expect(result).toEqual(updated)
    })

    it("rejects invalid status enum", async () => {
      const caller = createCaller(makeCtx() as never)
      await expect(
        caller.updateStatus({ id: EVENT_ID, status: "published" as never })
      ).rejects.toThrow()
    })
  })
})
