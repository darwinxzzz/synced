import { describe, it, expect, vi, beforeEach } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { authRouter } from "../auth"

const createCaller = createCallerFactory(authRouter)

function makeCtx(user: unknown = null) {
  const supabase = {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }
  return { supabase, user, headers: new Headers() }
}

describe("authRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("getUser", () => {
    it("returns null when no user in context", async () => {
      const caller = createCaller(makeCtx(null) as never)
      const result = await caller.getUser()
      expect(result).toBeNull()
    })

    it("returns user when authenticated", async () => {
      const user = { id: "abc-123", email: "test@example.com" }
      const caller = createCaller(makeCtx(user) as never)
      const result = await caller.getUser()
      expect(result).toEqual(user)
    })
  })

  describe("getProfile", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.getProfile()).rejects.toThrow("UNAUTHORIZED")
    })

    it("returns profile data when authenticated", async () => {
      const user = { id: "abc-123", email: "test@example.com" }
      const profileData = { id: "abc-123", name: "Test User", role: "member" }
      const ctx = makeCtx(user)
      ctx.supabase.from = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: profileData, error: null }),
      })
      const caller = createCaller(ctx as never)
      const result = await caller.getProfile()
      expect(result).toEqual(profileData)
    })
  })

  describe("signOut", () => {
    it("throws UNAUTHORIZED when no user", async () => {
      const caller = createCaller(makeCtx(null) as never)
      await expect(caller.signOut()).rejects.toThrow("UNAUTHORIZED")
    })

    it("calls supabase.auth.signOut and returns success", async () => {
      const user = { id: "abc-123", email: "test@example.com" }
      const ctx = makeCtx(user)
      const caller = createCaller(ctx as never)
      const result = await caller.signOut()
      expect(ctx.supabase.auth.signOut).toHaveBeenCalledOnce()
      expect(result).toEqual({ success: true })
    })
  })
})
