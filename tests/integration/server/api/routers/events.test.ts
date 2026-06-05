// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { eventsRouter } from "~/server/api/routers/events"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"

const createCaller = createCallerFactory(eventsRouter)

describe("eventsRouter", () => {
  let ctx: TestCtx & { user: { id: string } }

  beforeAll(async () => {
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    await ctx.supabase.auth.signOut()
  })

  // ─── list ─────────────────────────────────────────────────────────────────────
  describe("list", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.list()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns array of events with expected shape", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.list()
      expect(Array.isArray(result)).toBe(true)
      result.forEach(event => {
        expect(event).toHaveProperty("id")
        expect(event).toHaveProperty("name")
        expect(event).toHaveProperty("status")
      })
    })
  })

  // ─── getById ──────────────────────────────────────────────────────────────────
  describe("getById", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getById({ id: "00000000-0000-0000-0000-000000000020" })).rejects.toThrow("UNAUTHORIZED")
    })

    it("rejects a non-UUID string", async () => {
      const caller = createCaller(ctx as never)
      await expect(caller.getById({ id: "not-a-uuid" })).rejects.toThrow()
    })

    it("throws NOT_FOUND for a UUID that does not exist", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.getById({ id: "00000000-0000-0000-0000-000000000099" }),
      ).rejects.toThrow("Event not found")
    })

    it("returns the event when the UUID exists", async () => {
      const caller = createCaller(ctx as never)
      const events = await caller.list()
      if (events.length === 0) return // No test data — skip

      const event = await caller.getById({ id: events[0]!.id })
      expect(event).toMatchObject({ id: events[0]!.id, name: events[0]!.name })
      expect(event).toHaveProperty("event_members")
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────────
  describe("create", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.create({ name: "Event" })).rejects.toThrow("UNAUTHORIZED")
    })

    it("rejects a name longer than 100 characters", async () => {
      const caller = createCaller(ctx as never)
      await expect(caller.create({ name: "x".repeat(101) })).rejects.toThrow()
    })
  })

  // ─── updateStatus ─────────────────────────────────────────────────────────────
  describe("updateStatus", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.updateStatus({ id: "00000000-0000-0000-0000-000000000020", status: "active" }),
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("rejects an invalid status enum value", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.updateStatus({ id: "00000000-0000-0000-0000-000000000020", status: "published" as never }),
      ).rejects.toThrow()
    })
  })
})
