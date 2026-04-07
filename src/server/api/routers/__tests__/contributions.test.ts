// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { contributionsRouter } from "../contributions"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"

const createCaller = createCallerFactory(contributionsRouter)

describe("contributionsRouter", () => {
  let ctx: TestCtx & { user: { id: string } }
  const createdIds: string[] = []

  beforeAll(async () => {
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    if (createdIds.length > 0) {
      await ctx.supabase.from("contributions").delete().in("id", createdIds)
    }
    await ctx.supabase.auth.signOut()
  })

  // ─── list ─────────────────────────────────────────────────────────────────────
  describe("list", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.list()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns contributions array for the authenticated user", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.list()
      expect(Array.isArray(result)).toBe(true)
      result.forEach(c => {
        expect(c).toHaveProperty("id")
        expect(c).toHaveProperty("task")
        expect(c).toHaveProperty("department")
        expect(c.user_id).toBe(ctx.user.id)
      })
    })
  })

  // ─── listAll ──────────────────────────────────────────────────────────────────
  describe("listAll", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.listAll()).rejects.toThrow("UNAUTHORIZED")
    })

    it("throws FORBIDDEN when user is not admin", async () => {
      // Test user is a regular member — expects FORBIDDEN
      const caller = createCaller(ctx as never)
      await expect(caller.listAll()).rejects.toThrow("Admin only")
    })
  })

  // ─── create ───────────────────────────────────────────────────────────────────
  describe("create", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.create({ department: "Eng", task: "Task", priority: "low" }),
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("rejects task longer than 100 characters", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.create({ department: "Eng", task: "x".repeat(101), priority: "low" }),
      ).rejects.toThrow()
    })

    it("creates a contribution and returns it", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.create({
        department: "Engineering",
        task: "Integration test task",
        priority: "low",
      })
      expect(result).toMatchObject({
        department: "Engineering",
        task: "Integration test task",
        user_id: ctx.user.id,
      })
      if (result?.id) createdIds.push(result.id)
    })
  })

  // ─── update ───────────────────────────────────────────────────────────────────
  describe("update", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.update({ id: "00000000-0000-0000-0000-000000000099", task: "X" }),
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("updates a contribution and returns the updated row", async () => {
      const caller = createCaller(ctx as never)
      const created = await caller.create({
        department: "Design",
        task: "Original task",
        priority: "medium",
      })
      if (!created?.id) return
      createdIds.push(created.id)

      const result = await caller.update({ id: created.id, task: "Updated task" })
      expect(result).toMatchObject({ id: created.id, task: "Updated task" })
    })
  })
})
