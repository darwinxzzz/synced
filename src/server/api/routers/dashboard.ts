import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

interface UpcomingMeeting {
  id: string
  name: string
  date: string | null
  start_time: string | null
  end_time: string | null
  event_members: {
    profiles: { id: string; name: string | null; avatar_url: string | null } | null
  }[]
}

export const dashboardRouter = createTRPCRouter({

  getMemberKPIs: protectedProcedure.query(async ({ ctx }) => {
    const [tasksRes, rateRes, deadlineRes] = await Promise.all([
      ctx.supabase.rpc("get_member_kpi_remaining_tasks"),
      ctx.supabase.rpc("get_member_kpi_completion_rate"),
      ctx.supabase.rpc("get_member_kpi_next_deadline"),
    ])

    if (tasksRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tasksRes.error.message })
    if (rateRes.error)  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: rateRes.error.message })
    if (deadlineRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: deadlineRes.error.message })

    const deadlines = deadlineRes.data as { days_away: number; event_date: string; event_name: string }[]

    return {
      remainingTasks:  Number(tasksRes.data),
      completionRate:  Number(rateRes.data),
      nextDeadline:    deadlines?.[0] ?? null,
    }
  }),

  getPendingMilestones: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase.rpc("get_member_pending_milestones")

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return (data ?? []) as {
      department:   string
      task:         string
      event_name:   string
      event_id:     string
      event_date:   string
      pillar_status: string
    }[]
  }),

  getUpcomingMeeting: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("events")
      .select("*, event_members(*, profiles(id, name, avatar_url))")
      .eq("status", "active")
      .order("date", { ascending: true })
      .limit(1)
      .single()

    // PGRST116 = no rows found — not an error condition here
    if (error?.code === "PGRST116") return null
    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })

    return data as unknown as UpcomingMeeting
  }),
})
