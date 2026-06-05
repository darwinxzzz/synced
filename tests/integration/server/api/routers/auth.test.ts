// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { authRouter } from "~/server/api/routers/auth"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"

const createCaller = createCallerFactory(authRouter)

describe("authRouter", () => {
  let ctx: TestCtx & { user: { id: string; email: string } }

  beforeAll(async () => {
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    await ctx.supabase.auth.signOut()
  })

  // ─── getUser ─────────────────────────────────────────────────────────────────
  describe("getUser", () => {
    it("returns null when unauthenticated", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      const result = await caller.getUser()
      expect(result).toBeNull()
    })

    it("returns the user object when authenticated", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getUser()
      expect(result).toHaveProperty("id", ctx.user.id)
    })
  })

  // ─── getProfile ───────────────────────────────────────────────────────────────
  describe("getProfile", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.getProfile()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns profile or null for the authenticated user", async () => {
      const caller = createCaller(ctx as never)
      const result = await caller.getProfile()
      // Router returns null on error (profile may not exist for test user)
      if (result !== null) {
        expect(result).toHaveProperty("id", ctx.user.id)
        expect(result).toHaveProperty("email")
        expect(result).toHaveProperty("role")
      }
    })
  })

  // ─── signOut ──────────────────────────────────────────────────────────────────
  describe("signOut", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeUnauthCtx() as never)
      await expect(caller.signOut()).rejects.toThrow("UNAUTHORIZED")
    })

    it("signs out and returns { success: true }", async () => {
      // Use a dedicated session so the shared ctx remains valid
      const signOutCtx = await makeSignedInCtx()
      const caller = createCaller(signOutCtx as never)
      const result = await caller.signOut()
      expect(result).toEqual({ success: true })
    })
  })
})
