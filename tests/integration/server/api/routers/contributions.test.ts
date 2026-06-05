// @vitest-environment node
import { createClient } from "@supabase/supabase-js"
import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { createCallerFactory } from "~/server/api/trpc"
import { contributionsRouter } from "~/server/api/routers/contributions"
import { makeUnauthCtx, makeSignedInCtx, type TestCtx } from "~/test/helpers"
import type { Database } from "~/types/database"

const createCaller = createCallerFactory(contributionsRouter)

describe("contributionsRouter", () => {
  let ctx: TestCtx & { user: { id: string } }
  let adminSupabase: ReturnType<typeof createClient<Database>>
  const createdIds: string[] = []
  const createdEventMemberIds: string[] = []
  const createdEventIds: string[] = []

  function getRequiredEnv(key: string) {
    const value = process.env[key]
    if (!value) throw new Error(`Missing integration test env var: ${key}`)
    return value
  }

  async function getOtherMemberId() {
    const { data: member, error } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("role", "member")
      .eq("status", "active")
      .neq("id", ctx.user.id)
      .limit(1)
      .maybeSingle()

    if (error) {
      throw new Error(`Second member fixture lookup failed: ${error.message}`)
    }

    if (!member?.id) {
      throw new Error("IDOR integration test needs a second active member profile")
    }

    return member.id
  }

  async function createEditableEventFixture(userId = ctx.user.id) {
    const { data: event, error: eventError } = await adminSupabase
      .from("events")
      .insert({
        name: `Contribution update integration ${Date.now()}`,
        description: "Integration test fixture",
        date: new Date().toISOString().slice(0, 10),
        created_by: ctx.user.id,
        status: "active",
      })
      .select("id")
      .single()

    if (eventError ?? !event) {
      throw new Error(`Test event fixture setup failed: ${eventError?.message ?? "no event returned"}`)
    }

    createdEventIds.push(event.id)

    const { data: eventMember, error: eventMemberError } = await adminSupabase
      .from("event_members")
      .insert({
        event_id: event.id,
        user_id: userId,
        role: "member",
        pillar_status: "new",
        department: "Design",
        task: "Original task",
      })
      .select("id")
      .single()

    if (eventMemberError ?? !eventMember) {
      throw new Error(
        `Test event membership fixture setup failed: ${eventMemberError?.message ?? "no event member returned"}`,
      )
    }

    createdEventMemberIds.push(eventMember.id)

    return event.id
  }

  beforeAll(async () => {
    adminSupabase = createClient<Database>(
      getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    ctx = await makeSignedInCtx()
  })

  afterAll(async () => {
    if (createdIds.length > 0) {
      await adminSupabase.from("contributions").delete().in("id", createdIds)
    }
    if (createdEventMemberIds.length > 0) {
      await adminSupabase.from("event_members").delete().in("id", createdEventMemberIds)
    }
    if (createdEventIds.length > 0) {
      await adminSupabase.from("events").delete().in("id", createdEventIds)
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
      const eventId = await createEditableEventFixture()
      const created = await caller.create({
        department: "Design",
        task: "Original task",
        priority: "medium",
        event_id: eventId,
      })
      if (!created?.id) return
      createdIds.push(created.id)

      const result = await caller.update({ id: created.id, task: "Updated task" })
      expect(result).toMatchObject({ id: created.id, task: "Updated task" })
    })

    it("denies updating another member's contribution", async () => {
      const caller = createCaller(ctx as never)
      const otherMemberId = await getOtherMemberId()
      const eventId = await createEditableEventFixture(otherMemberId)

      const { data: otherContribution, error: contributionError } = await adminSupabase
        .from("contributions")
        .insert({
          event_id: eventId,
          user_id: otherMemberId,
          department: "Design",
          task: "Protected task",
          priority: "medium",
        })
        .select("id")
        .single()

      if (contributionError ?? !otherContribution) {
        throw new Error(
          `Other member contribution fixture setup failed: ${
            contributionError?.message ?? "no contribution returned"
          }`,
        )
      }

      createdIds.push(otherContribution.id)

      await expect(
        caller.update({ id: otherContribution.id, task: "Unauthorized update" }),
      ).rejects.toThrow()

      const visibleContributions = await caller.list()
      expect(visibleContributions.map((contribution) => contribution.id)).not.toContain(otherContribution.id)

      const { data: unchangedContribution, error: reloadError } = await adminSupabase
        .from("contributions")
        .select("id, task, user_id")
        .eq("id", otherContribution.id)
        .single()

      if (reloadError ?? !unchangedContribution) {
        throw new Error(
          `Other member contribution verification failed: ${reloadError?.message ?? "no contribution returned"}`,
        )
      }

      expect(unchangedContribution).toMatchObject({
        id: otherContribution.id,
        task: "Protected task",
        user_id: otherMemberId,
      })
    })
  })
})
