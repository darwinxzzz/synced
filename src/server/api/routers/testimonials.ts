import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

export const testimonialsRouter = createTRPCRouter({

  getMemberTestimonial: protectedProcedure
    .input(z.object({ memberId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { memberId } = input

      // Verify caller is the member themselves or an admin
      if (memberId !== ctx.user.id) {
        const { data: callerProfile } = await ctx.supabase
          .from("profiles")
          .select("role")
          .eq("id", ctx.user.id)
          .single()
        if (callerProfile?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" })
        }
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

  getTestimonialRequests: protectedProcedure.query(async ({ ctx }) => {
    const { data: callerProfile } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", ctx.user.id)
      .single()

    if (callerProfile?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" })
    }

    const { data, error } = await ctx.supabase
      .from("testimonial_requests")
      .select("id, status, requested_at, profiles(id, name, email, avatar_url, department, joined_date)")
      .order("requested_at", { ascending: false })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data
  }),

  updateTestimonial: protectedProcedure
    .input(
      z.object({
        testimonialId: z.string().uuid(),
        endorsementQuote: z.string().optional(),
        endorsementName: z.string().optional(),
        endorsementTitle: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: callerProfile } = await ctx.supabase
        .from("profiles")
        .select("role")
        .eq("id", ctx.user.id)
        .single()

      if (callerProfile?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" })
      }

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

  finaliseTestimonial: protectedProcedure
    .input(
      z.object({
        memberId: z.string().uuid(),
        endorsementQuote: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data: adminProfile } = await ctx.supabase
        .from("profiles")
        .select("role, name, department")
        .eq("id", ctx.user.id)
        .single()

      if (adminProfile?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" })
      }

      const { data: existing } = await ctx.supabase
        .from("testimonials")
        .select("id")
        .eq("user_id", input.memberId)
        .maybeSingle()

      const testimonialPayload = {
        endorsement_quote: input.endorsementQuote,
        endorsement_name: adminProfile.name,
        endorsement_title: adminProfile.department ?? "Admin",
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
