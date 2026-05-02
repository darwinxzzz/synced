import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, adminProcedure, protectedProcedure } from "~/server/api/trpc"

export const testimonialsRouter = createTRPCRouter({

  getMemberTestimonial: protectedProcedure
    .input(z.object({ memberId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { memberId } = input

      if (!ctx.profile) {
        throw new TRPCError({ code: "UNAUTHORIZED" })
      }

      // Allow self access, plus admins viewing other members.
      if (memberId !== ctx.user.id && ctx.profile.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" })
      }

      const { data: profile, error: profileError } = await ctx.supabase
        .from("profiles")
        .select("id, name, email, avatar_url, department, joined_date")
        .eq("id", memberId)
        .single()

      if (profileError || !profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Member not found" })
      }

      // Run all metric queries in parallel
      const [contribRes, attendanceRes, eventMembersRes, testimonialRes, requestRes] =
        await Promise.all([
          ctx.supabase
            .from("contributions")
            .select("id, event_id, task, description, department, submitted_at, created_at")
            .eq("user_id", memberId)
            .order("submitted_at", { ascending: false }),

          ctx.supabase
            .from("attendance")
            .select("status")
            .eq("user_id", memberId)
            .eq("type", "weekly_meeting"),

          ctx.supabase
            .from("event_members")
            .select("id, role, event_id")
            .eq("user_id", memberId),

          ctx.supabase
            .from("testimonials")
            .select("id, endorsement_quote, endorsement_name, endorsement_title, finalised_at")
            .eq("user_id", memberId)
            .maybeSingle(),

          ctx.supabase
            .from("testimonial_requests")
            .select("status")
            .eq("user_id", memberId)
            .maybeSingle(),
        ])

      if (contribRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: contribRes.error.message })
      if (attendanceRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: attendanceRes.error.message })
      if (eventMembersRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: eventMembersRes.error.message })

      const contributions = contribRes.data ?? []
      const attendanceRecords = attendanceRes.data ?? []
      const eventMemberRows = eventMembersRes.data ?? []

      // eventsContributed — distinct events the member has contributed to
      const eventsContributed = new Set(
        contributions.filter((c) => c.event_id).map((c) => c.event_id)
      ).size

      // weeklyAttendancePct
      const weeklyAttendancePct =
        attendanceRecords.length === 0
          ? 0
          : Math.round(
              (attendanceRecords.filter((a) => a.status === "attended").length /
                attendanceRecords.length) *
                100
            )

      // projectLeads — event_members entries where role = 'lead'
      const projectLeads = eventMemberRows.filter((em) => em.role === "lead").length

      // collaborations — distinct events where at least one other member also participated
      const memberEventIds = eventMemberRows.map((em) => em.event_id).filter(Boolean)
      let collaborations = 0
      if (memberEventIds.length > 0) {
        const { data: collabData } = await ctx.supabase
          .from("event_members")
          .select("event_id")
          .in("event_id", memberEventIds)
          .neq("user_id", memberId)
        collaborations = new Set((collabData ?? []).map((r) => r.event_id)).size
      }

      // totalContributions — count of contribution rows (no hours column in schema)
      const totalContributions = contributions.length

      // Fetch reflections for each contribution
      const contributionIds = contributions.map((c) => c.id)
      const reflectionsByContribId: Record<string, {
        id: string
        status: string
        current_task: string | null
        description: string | null
        impact: string | null
        challenges: string | null
        personal_learning: string | null
        org_learning: string | null
        submitted_at: string | null
        created_at: string | null
      }> = {}

      if (contributionIds.length > 0) {
        const { data: reflectionsData } = await ctx.supabase
          .from("reflections")
          .select("id, contribution_id, status, current_task, description, impact, challenges, personal_learning, org_learning, submitted_at, created_at")
          .in("contribution_id", contributionIds)
          .eq("status", "archived")
        for (const r of reflectionsData ?? []) {
          reflectionsByContribId[r.contribution_id] = r
        }
      }

      const contributionHistory = contributions.map((c) => {
        const reflection = reflectionsByContribId[c.id] ?? null
        return {
          id: c.id,
          date: c.submitted_at ?? c.created_at,
          title: c.task,
          description: c.description ?? "",
          department: c.department,
          reflection: reflection
            ? {
                id: reflection.id,
                status: reflection.status,
                current_task: reflection.current_task,
                description: reflection.description,
                impact: reflection.impact,
                challenges: reflection.challenges,
                personal_learning: reflection.personal_learning,
                org_learning: reflection.org_learning,
                submitted_at: reflection.submitted_at,
                created_at: reflection.created_at ?? new Date().toISOString(),
                contributions: { id: c.id, task: c.task, department: c.department },
              }
            : null,
        }
      })

      const testimonial = testimonialRes.data
      const endorsement =
        testimonial?.finalised_at
          ? {
              testimonialId: testimonial.id,
              quote: testimonial.endorsement_quote ?? "",
              adminName: testimonial.endorsement_name ?? "",
              adminTitle: testimonial.endorsement_title ?? "",
              finalisedAt: testimonial.finalised_at,
            }
          : null

      return {
        profile: {
          name: profile.name,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          department: profile.department,
          joinedDate: profile.joined_date,
        },
        metrics: {
          eventsContributed,
          weeklyAttendancePct,
          projectLeads,
          collaborations,
          totalContributions,
        },
        contributionHistory,
        endorsement,
        hasRequestedTestimonial: !!requestRes.data,
        requestStatus: requestRes.data?.status ?? null,
      }
    }),

  requestTestimonial: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from("testimonial_requests")
      .upsert({ user_id: ctx.user.id, status: "pending" }, { onConflict: "user_id" })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return { success: true }
  }),

  getTestimonialRequests: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("testimonial_requests")
      .select("id, status, requested_at, profiles(id, name, email, avatar_url, department, joined_date)")
      .order("requested_at", { ascending: false })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data
  }),

  getAdminTestimonialsOverview: adminProcedure
    .input(
      z.object({
        department: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const [totalMembersRes, activeMembersRes, pendingReqRes, departmentsRes, totalReqRes] = await Promise.all([
        ctx.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member"),
        ctx.supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "member").eq("status", "active"),
        ctx.supabase.from("testimonial_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        ctx.supabase.from("profiles").select("department").eq("role", "member").not("department", "is", null),
        ctx.supabase.from("testimonial_requests").select("id", { count: "exact", head: true }),
      ])

      let membersQuery = ctx.supabase
        .from("profiles")
        .select("id, name, email, avatar_url, department, joined_date, status")
        .eq("role", "member")

      if (input.search?.trim()) {
        membersQuery = membersQuery.ilike("name", `%${input.search.trim()}%`)
      }
      if (input.department?.trim()) {
        membersQuery = membersQuery.eq("department", input.department.trim())
      }

      const { data: members, error: membersError } = await membersQuery.order("name")
      if (membersError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: membersError.message })
      }

      const memberIds = (members ?? []).map((m) => m.id)
      if (memberIds.length === 0) {
        const deptSet = new Set((departmentsRes.data ?? []).map((d) => d.department).filter(Boolean))
        return {
          kpi: {
            totalMembers: totalMembersRes.count ?? 0,
            activeMembers: activeMembersRes.count ?? 0,
            testimonialRequests: totalReqRes.count ?? 0,
            pendingRequests: pendingReqRes.count ?? 0,
          },
          departments: Array.from(deptSet).sort(),
          statuses: ["pending", "generated", "sent"],
          cards: [],
        }
      }

      const { data: requests, error: requestsError } = await ctx.supabase
        .from("testimonial_requests")
        .select("user_id, status, requested_at")
        .in("user_id", memberIds)

      if (requestsError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: requestsError.message })
      }

      const { data: eventMembers, error: eventMembersError } = await ctx.supabase
        .from("event_members")
        .select("user_id, event_id")
        .in("user_id", memberIds)

      if (eventMembersError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: eventMembersError.message })
      }

      const { data: attendance, error: attendanceError } = await ctx.supabase
        .from("attendance")
        .select("user_id, status")
        .in("user_id", memberIds)
        .eq("type", "weekly_meeting")

      if (attendanceError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: attendanceError.message })
      }

      const { data: contributions, error: contributionsError } = await ctx.supabase
        .from("contributions")
        .select("id, user_id, description, submitted_at, created_at")
        .in("user_id", memberIds)

      if (contributionsError) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: contributionsError.message })
      }

      const contributionIds = (contributions ?? []).map((c) => c.id)
      const reflections =
        contributionIds.length > 0
          ? await ctx.supabase
              .from("reflections")
              .select("contribution_id, description, status, submitted_at, created_at")
              .in("contribution_id", contributionIds)
              .eq("status", "archived")
          : { data: [], error: null }

      if (reflections.error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: reflections.error.message })
      }

      const requestsMap = new Map((requests ?? []).map((r) => [r.user_id, r]))

      const eventsByUser = new Map<string, Set<string>>()
      for (const row of eventMembers ?? []) {
        if (!eventsByUser.has(row.user_id)) eventsByUser.set(row.user_id, new Set())
        eventsByUser.get(row.user_id)?.add(row.event_id)
      }

      const attendanceByUser = new Map<string, { total: number; attended: number }>()
      for (const row of attendance ?? []) {
        const prev = attendanceByUser.get(row.user_id) ?? { total: 0, attended: 0 }
        prev.total += 1
        if (row.status === "attended") prev.attended += 1
        attendanceByUser.set(row.user_id, prev)
      }

      const contributionsByUser = new Map<
        string,
        Array<{ id: string; description: string | null; submitted_at: string | null; created_at: string | null }>
      >()
      for (const row of contributions ?? []) {
        const list = contributionsByUser.get(row.user_id) ?? []
        list.push(row)
        contributionsByUser.set(row.user_id, list)
      }

      const reflectionsByContribution = new Map(
        (reflections.data ?? []).map((r) => [r.contribution_id, r])
      )

      const cards = (members ?? [])
        .map((member) => {
          const memberContributions = contributionsByUser.get(member.id) ?? []
          const eventCount = eventsByUser.get(member.id)?.size ?? 0
          const attendanceStat = attendanceByUser.get(member.id) ?? { total: 0, attended: 0 }
          const attendancePct =
            attendanceStat.total > 0
              ? Math.round((attendanceStat.attended / attendanceStat.total) * 100)
              : 0

          let quoteSnippet = "No archived reflection yet."
          const latestReflections = memberContributions
            .map((contribution) => reflectionsByContribution.get(contribution.id))
            .filter((reflection): reflection is NonNullable<typeof reflection> => Boolean(reflection))
            .sort((a, b) => {
              const aTime = new Date(a.submitted_at ?? a.created_at ?? 0).getTime()
              const bTime = new Date(b.submitted_at ?? b.created_at ?? 0).getTime()
              return bTime - aTime
            })

          if (latestReflections[0]?.description) {
            quoteSnippet = latestReflections[0].description
          } else if (memberContributions[0]?.description) {
            quoteSnippet = memberContributions[0].description
          }

          const req = requestsMap.get(member.id)
          const requestStatus = req?.status ?? "none"
          const joinedAt = member.joined_date ? new Date(member.joined_date) : null
          const monthDiff = joinedAt
            ? Math.max(
                1,
                (new Date().getFullYear() - joinedAt.getFullYear()) * 12 +
                  (new Date().getMonth() - joinedAt.getMonth())
              )
            : 1

          return {
            memberId: member.id,
            name: member.name,
            avatarUrl: member.avatar_url,
            department: member.department ?? "General",
            tenure: `${monthDiff} month${monthDiff === 1 ? "" : "s"} at SYAI`,
            stats: {
              events: eventCount,
              contributions: memberContributions.length,
              attendancePct,
            },
            quoteSnippet,
            requestStatus,
            hasRequest: !!req,
          }
        })
        .filter((card) => {
          if (!input.status || input.status === "all") return true
          return card.requestStatus === input.status
        })

      const deptSet = new Set((departmentsRes.data ?? []).map((d) => d.department).filter(Boolean))
      return {
        kpi: {
          totalMembers: totalMembersRes.count ?? 0,
          activeMembers: activeMembersRes.count ?? 0,
          testimonialRequests: totalReqRes.count ?? 0,
          pendingRequests: pendingReqRes.count ?? 0,
        },
        departments: Array.from(deptSet).sort(),
        statuses: ["all", "pending", "generated", "sent"],
        cards,
      }
    }),

  updateTestimonial: adminProcedure
    .input(
      z.object({
        testimonialId: z.string().uuid(),
        endorsementQuote: z.string().optional(),
        endorsementName: z.string().optional(),
        endorsementTitle: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { testimonialId, ...fields } = input
      const updates: Record<string, string> = {}
      if (fields.endorsementQuote !== undefined) updates.endorsement_quote = fields.endorsementQuote
      if (fields.endorsementName !== undefined) updates.endorsement_name = fields.endorsementName
      if (fields.endorsementTitle !== undefined) updates.endorsement_title = fields.endorsementTitle

      const { error } = await ctx.supabase
        .from("testimonials")
        .update(updates)
        .eq("id", testimonialId)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return { success: true }
    }),

  finaliseTestimonial: adminProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        endorsementQuote: z.string().min(1),
        endorsementName: z.string().optional(),
        endorsementTitle: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: adminProfile } = await ctx.supabase
        .from("profiles")
        .select("name, department")
        .eq("id", ctx.user.id)
        .single()

      if (!adminProfile) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Admin profile not found" })
      }

      const { data: existing } = await ctx.supabase
        .from("testimonials")
        .select("id")
        .eq("user_id", input.memberId)
        .maybeSingle()

      const requestedName = input.endorsementName?.trim()
      const requestedTitle = input.endorsementTitle?.trim()

      const testimonialPayload = {
        endorsement_quote: input.endorsementQuote,
        endorsement_name: requestedName && requestedName.length > 0 ? requestedName : adminProfile.name,
        endorsement_title:
          requestedTitle && requestedTitle.length > 0
            ? requestedTitle
            : (adminProfile.department ?? "Admin"),
        finalised_at: new Date().toISOString(),
      }

      const testimonialQuery = existing
        ? ctx.supabase.from("testimonials").update(testimonialPayload).eq("id", existing.id)
        : ctx.supabase.from("testimonials").insert({
            ...testimonialPayload,
            user_id: input.memberId,
            generated_by: ctx.user.id,
          })

      const { error: testimonialError } = await testimonialQuery
      if (testimonialError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: testimonialError.message })

      const { error: requestError } = await ctx.supabase
        .from("testimonial_requests")
        .update({ status: "sent" })
        .eq("user_id", input.memberId)

      if (requestError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: requestError.message })

      return { success: true }
    }),
})
