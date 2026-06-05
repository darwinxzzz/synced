// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { reflectionsRouter } from "~/server/api/routers/reflections"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"

const createCaller = createCallerFactory(reflectionsRouter)

describe("reflectionsRouter", () => {
  let ctx: TestCtx & { user: { id: string; email: string } }
  const createdReflectionIds: string[] = []

  beforeAll(async () => {
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    if (createdReflectionIds.length > 0) {
      await ctx.supabase.from("reflections").delete().in("id", createdReflectionIds)
    }
    await ctx.supabase.auth.signOut()
  })

  // ─── getMyReflections ──────────────────────────────────────────────────────
  describe("getMyReflections", () => {
    it("throws UNAUTHORIZED when not authenticated", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getMyReflections()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns an array for authenticated user", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getMyReflections()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  // ─── submitReflection ──────────────────────────────────────────────────────
  describe("submitReflection", () => {
    it("throws UNAUTHORIZED when not authenticated", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.submitReflection({
          reflectionId: "00000000-0000-0000-0000-000000000000",
          currentTask: "Test task",
          description: "What took place",
          impact: "Impact here",
          challenges: "Challenges here",
          personalLearning: "Personal learning",
          orgLearning: "Org learning",
        })
      ).rejects.toThrow("UNAUTHORIZED")
    })
  })

  // ─── saveDraft ─────────────────────────────────────────────────────────────
  describe("saveDraft", () => {
    it("throws UNAUTHORIZED when not authenticated", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.saveDraft({ reflectionId: "00000000-0000-0000-0000-000000000000" })
      ).rejects.toThrow("UNAUTHORIZED")
    })
  })

  // ─── adminUpdateReflection ─────────────────────────────────────────────────
  describe("adminUpdateReflection", () => {
    it("throws UNAUTHORIZED when not authenticated", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(
        caller.adminUpdateReflection({ reflectionId: "00000000-0000-0000-0000-000000000000" })
      ).rejects.toThrow("UNAUTHORIZED")
    })

    it("throws ADMIN_REQUIRED when caller is not admin", async () => {
      const caller = createCaller(ctx as never)
      await expect(
        caller.adminUpdateReflection({ reflectionId: "00000000-0000-0000-0000-000000000000" })
      ).rejects.toThrow("ADMIN_REQUIRED")
    })
  })
})
