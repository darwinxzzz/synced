import { createTRPCRouter, adminProcedure } from "~/server/api/trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createAdminClient } from "~/lib/supabase/admin"

const PAGE_SIZE = 10


export const attendanceRouter = createTRPCRouter({

  // ── KPIs ──────────────────────────────────────────────────────────────────
  getKPIs: adminProcedure.query(async ({ ctx }) => {
    const today = new Date().toISOString().split("T")[0]!

    // Only count past events (attendance registry tracks what already happened)
    const { data: events, error: evErr } = await ctx.supabase
      .from("events")
      .select("id, name")
      .lt("date", today)
      .neq("status", "draft")

    if (evErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: evErr.message })

    const totalEvents = events?.length ?? 0

    if (totalEvents === 0) {
      return {
        totalEvents: 0,
        avgAttendance: 0,
        highestRate: null as { name: string; pct: number } | null,
        lowestRate: null as { name: string; pct: number } | null,
      }
    }

    const eventIds = (events ?? []).map((e) => e.id)

    const [attResult, emResult] = await Promise.all([
      ctx.supabase
        .from("attendance")
        .select("event_id, status")
        .eq("type", "event")
        .in("event_id", eventIds),
      ctx.supabase
        .from("event_members")
        .select("event_id")
        .in("event_id", eventIds),
    ])

    if (attResult.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: attResult.error.message })

    // Build member count per event from event_members (real denominator)
    const memberCountMap = new Map<string, number>()
    for (const row of emResult.data ?? []) {
      memberCountMap.set(row.event_id, (memberCountMap.get(row.event_id) ?? 0) + 1)
    }

    const statsMap = new Map<string, { attended: number; name: string }>()
    for (const ev of events ?? []) {
      statsMap.set(ev.id, { attended: 0, name: ev.name })
    }
    for (const row of attResult.data ?? []) {
      if (!row.event_id) continue
      const stat = statsMap.get(row.event_id)
      if (!stat) continue
      if (row.status === "attended") stat.attended++
    }

    // Rate = attended / total assigned members for that event (only events with assigned members)
    const rates = Array.from(statsMap.entries())
      .filter(([id]) => (memberCountMap.get(id) ?? 0) > 0)
      .map(([id, stat]) => ({
        name: stat.name,
        pct: Math.round((stat.attended / memberCountMap.get(id)!) * 100),
      }))

    const avgAttendance = rates.length
      ? Math.round(rates.reduce((acc, r) => acc + r.pct, 0) / rates.length)
      : 0

    const sorted = [...rates].sort((a, b) => b.pct - a.pct)

    return {
      totalEvents,
      avgAttendance,
      highestRate: sorted[0] ?? null,
      lowestRate: sorted[sorted.length - 1] ?? null,
    }
  }),

  // ── Members tab ───────────────────────────────────────────────────────────
  getMembers: adminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      search: z.string().optional(),
      department: z.string().optional(),
      status: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const from = (input.page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = ctx.supabase
        .from("profiles")
        .select("id, name, email, avatar_url, department, role, joined_date, status", { count: "exact" })

      if (input.search) {
        query = query.ilike("name", `%${input.search}%`)
      }
      if (input.department) {
        query = query.eq("department", input.department)
      }
      if (input.status) {
        query = query.eq("status", input.status)
      }

      const { data: profiles, count, error } = await query
        .order("name")
        .range(from, to)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })

      const memberIds = (profiles ?? []).map((p) => p.id)
      const attendanceStats: Record<string, { attended: number }> = {}
      const eventMemberCounts: Record<string, number> = {}

      if (memberIds.length > 0) {
        const [attResult, emResult] = await Promise.all([
          ctx.supabase
            .from("attendance")
            .select("user_id, status")
            .in("user_id", memberIds)
            .eq("type", "event"),
          ctx.supabase
            .from("event_members")
            .select("user_id")
            .in("user_id", memberIds),
        ])

        for (const row of attResult.data ?? []) {
          attendanceStats[row.user_id] ??= { attended: 0 }
          if (row.status === "attended") attendanceStats[row.user_id]!.attended++
        }

        for (const row of emResult.data ?? []) {
          eventMemberCounts[row.user_id] = (eventMemberCounts[row.user_id] ?? 0) + 1
        }
      }

      const members = (profiles ?? []).map((p) => ({
        ...p,
        total_events: eventMemberCounts[p.id] ?? 0,
        // Denominator is total events the member is assigned to, not just recorded ones
        attendance_pct: (() => {
          const attended = attendanceStats[p.id]?.attended ?? 0
          const totalAssigned = eventMemberCounts[p.id] ?? 0
          return totalAssigned > 0 ? Math.round((attended / totalAssigned) * 100) : 0
        })(),
      }))

      return { members, total: count ?? 0 }
    }),

  // All active members (for assignment dropdowns)
  getAllActiveMembers: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, name, email, avatar_url, department, role")
      .eq("status", "active")
      .order("name")

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data ?? []
  }),

  // Single member + attendance history (for drawer)
  getMemberProfile: adminProcedure
    .input(z.object({ memberId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [profileResult, historyResult] = await Promise.all([
        ctx.supabase
          .from("profiles")
          .select("id, name, email, avatar_url, department, role, joined_date, status")
          .eq("id", input.memberId)
          .single(),
        ctx.supabase
          .from("attendance")
          .select("id, type, status, date, notes, meeting_week, event_id, events(name)")
          .eq("user_id", input.memberId)
          .order("date", { ascending: false })
          .limit(20),
      ])

      if (profileResult.error) {
        throw new TRPCError({ code: "NOT_FOUND", message: profileResult.error.message })
      }

      return {
        profile: profileResult.data,
        history: historyResult.data ?? [],
      }
    }),

  addMember: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      department: z.string().optional(),
      role: z.enum(["member", "admin"]).default("member"),
      joined_date: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const adminClient = createAdminClient()

      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
        input.email,
        { data: { full_name: input.name } },
      )

      if (inviteError) {
        throw new TRPCError({ code: "BAD_REQUEST", message: inviteError.message })
      }

      const userId = inviteData.user.id
      const joinedDate = input.joined_date ?? new Date().toISOString().split("T")[0]

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data, error } = await adminClient
        .from("profiles")
        .upsert({
          id: userId,
          name: input.name,
          email: input.email,
          role: input.role,
          department: input.department ?? null,
          joined_date: joinedDate,
          status: "active",
        })
        .select()
        .single()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return data
    }),

  // ── Event Participation tab ───────────────────────────────────────────────
  getEventParticipation: adminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      statusFilter: z.enum(["not_recorded", "ended", "archived"]).default("not_recorded"),
    }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split("T")[0]!

      let query = ctx.supabase
        .from("events")
        .select("id, name, date, status")

      if (input.statusFilter === "archived") {
        query = query.eq("status", "archived")
      } else {
        // ended or not_recorded: past events that aren't archived
        query = query.lt("date", today).neq("status", "archived")
      }

      const { data: events, error } = await query
        .order("date", { ascending: false })

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })

      const allEvents = events ?? []
      const eventIds = allEvents.map((e) => e.id)

      const recordedIds = new Set<string>()
      const memberCounts: Record<string, number> = {}

      if (eventIds.length > 0) {
        const [attResult, emResult] = await Promise.all([
          ctx.supabase
            .from("attendance")
            .select("event_id")
            .in("event_id", eventIds)
            .eq("type", "event"),
          ctx.supabase
            .from("event_members")
            .select("event_id")
            .in("event_id", eventIds),
        ])

        for (const row of attResult.data ?? []) {
          if (row.event_id) recordedIds.add(row.event_id)
        }
        for (const row of emResult.data ?? []) {
          memberCounts[row.event_id] = (memberCounts[row.event_id] ?? 0) + 1
        }
      }

      let result = allEvents.map((ev) => ({
        ...ev,
        member_count: memberCounts[ev.id] ?? 0,
        is_recorded: recordedIds.has(ev.id),
      }))

      if (input.statusFilter === "not_recorded") {
        result = result.filter((ev) => !ev.is_recorded)
      }

      // Manual pagination after in-memory filter
      const total = result.length
      const from = (input.page - 1) * PAGE_SIZE
      const paginated = result.slice(from, from + PAGE_SIZE)

      return { events: paginated, total }
    }),

  getEventMembers: adminProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("event_members")
        .select("user_id, profiles(id, name, avatar_url, department)")
        .eq("event_id", input.eventId)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data ?? []
    }),

  getAttendanceByEvent: adminProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("attendance")
        .select("user_id, status, notes")
        .eq("event_id", input.eventId)
        .eq("type", "event")

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data ?? []
    }),

  // ── Weekly Meetings tab ───────────────────────────────────────────────────
  getWeeklyMeetings: adminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
    }))
    .query(async ({ ctx, input }) => {
      const from = (input.page - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const { data, count, error } = await ctx.supabase
        .from("attendance")
        .select("id, user_id, meeting_week, status, date, notes, profiles(id, name, avatar_url, department)", {
          count: "exact",
        })
        .eq("type", "weekly_meeting")
        .order("date", { ascending: false })
        .range(from, to)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return { meetings: data ?? [], total: count ?? 0 }
    }),

  // ── Record Attendance (batch insert) ─────────────────────────────────────
  recordAttendance: adminProcedure
    .input(z.object({
      records: z.array(z.object({
        user_id: z.string().uuid(),
        event_id: z.string().uuid().optional(),
        meeting_week: z.number().int().min(1).max(53).optional(),
        type: z.enum(["event", "weekly_meeting"]),
        status: z.enum(["attended", "absent", "excused"]),
        notes: z.string().optional(),
        date: z.string(), // ISO date "YYYY-MM-DD"
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const rows = input.records.map((r) => ({
        user_id: r.user_id,
        event_id: r.event_id ?? null,
        meeting_week: r.meeting_week ?? null,
        type: r.type,
        status: r.status,
        notes: r.notes ?? null,
        date: r.date,
      }))

      const { data, error } = await ctx.supabase
        .from("attendance")
        .insert(rows)
        .select()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data ?? []
    }),

  // ── Legacy — admin-gated for safety ──────────────────────────────────────
  getByWeek: adminProcedure
    .input(z.object({ week: z.number().int().min(1).max(53) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("attendance")
        .select("*, profiles(id, name, avatar_url, department)")
        .eq("type", "weekly_meeting")
        .eq("meeting_week", input.week)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data ?? []
    }),

  getByEvent: adminProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("attendance")
        .select("*, profiles(id, name, avatar_url, department)")
        .eq("type", "event")
        .eq("event_id", input.eventId)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data ?? []
    }),

  upsertAttendance: adminProcedure
    .input(z.object({
      user_id: z.string().uuid(),
      event_id: z.string().uuid().optional(),
      meeting_week: z.number().int().optional(),
      type: z.enum(["event", "weekly_meeting"]),
      status: z.enum(["attended", "absent", "excused"]),
      notes: z.string().optional(),
      date: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("attendance")
        .insert(input)
        .select()
        .single()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),
})

