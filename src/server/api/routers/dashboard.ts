import { TRPCError } from "@trpc/server"
import { createTRPCRouter, adminProcedure, protectedProcedure } from "~/server/api/trpc"

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

type EventRef = { name: string; date: string | null } | null

export const dashboardRouter = createTRPCRouter({

  getMemberKPIs: protectedProcedure.query(async ({ ctx }) => {
    const [tasksRes, rateRes, deadlineRes, syncRes] = await Promise.all([
      ctx.supabase.rpc("get_member_kpi_remaining_tasks"),
      ctx.supabase.rpc("get_member_kpi_completion_rate"),
      ctx.supabase.rpc("get_member_kpi_next_deadline"),
      ctx.supabase.rpc("get_member_kpi_team_sync_count"),
    ])

    if (tasksRes.error)    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tasksRes.error.message })
    if (rateRes.error)     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: rateRes.error.message })
    if (deadlineRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: deadlineRes.error.message })
    if (syncRes.error)     throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: syncRes.error.message })

    const deadlines = deadlineRes.data as { days_away: number; event_date: string; event_name: string }[]

    return {
      remainingTasks: Number(tasksRes.data),
      completionRate: Number(rateRes.data),
      teamSyncCount:  Number(syncRes.data),
      nextDeadline:   deadlines?.[0] ?? null,
    }
  }),

  getPendingMilestones: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("event_members")
      .select("id, department, task, pillar_status, event_id, events(name, date)")
      .eq("user_id", ctx.user.id)
      .neq("pillar_status", "done")
      .order("created_at", { ascending: true })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })

    return (data ?? []).map((m) => {
      const event = m.events as unknown as EventRef
      return {
        task_id:       m.id,
        department:    m.department ?? "",
        task:          m.task ?? "",
        event_name:    event?.name ?? "",
        event_id:      m.event_id,
        event_date:    event?.date ?? "",
        pillar_status: m.pillar_status,
      }
    })
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

  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, name, email, department, role, avatar_url, joined_date")
      .eq("id", ctx.user.id)
      .single()

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    if (!data) throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" })

    return {
      id:          data.id,
      name:        data.name,
      email:       data.email,
      department:  data.department,
      role:        data.role,
      avatar_url:  data.avatar_url,
      joined_date: data.joined_date,
    }
  }),

  getReflectionStreak: protectedProcedure.query(async ({ ctx }) => {
    const { count, error } = await ctx.supabase
      .from("reflections")
      .select("*", { count: "exact", head: true })
      .eq("user_id", ctx.user.id)

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })

    const streakCount = count ?? 0
    return {
      streakCount,
      streakPercent: Math.min(streakCount * 10, 100),
    }
  }),

  getAdminDashboard: adminProcedure.query(async ({ ctx }) => {
    // ── KPIs ──────────────────────────────────────────────────────────────────
    const [activeEventsRes, totalMembersRes, completionRateRes, tasksDueRes] = await Promise.all([
      ctx.supabase.rpc("get_admin_kpi_active_events"),
      ctx.supabase.rpc("get_admin_kpi_total_members"),
      ctx.supabase.rpc("get_admin_kpi_completion_rate"),
      ctx.supabase.rpc("get_admin_kpi_tasks_due"),
    ])

    if (activeEventsRes.error)   throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: activeEventsRes.error.message })
    if (totalMembersRes.error)   throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: totalMembersRes.error.message })
    if (completionRateRes.error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: completionRateRes.error.message })
    if (tasksDueRes.error)       throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: tasksDueRes.error.message })

    // ── Ongoing Initiatives ───────────────────────────────────────────────────
    const { data: eventsData, error: eventsError } = await ctx.supabase
      .from("events")
      .select("id, name, description, cover_url, date, event_members(pillar_status, profiles(avatar_url))")
      .neq("status", "archived")
      .order("date", { ascending: true })

    if (eventsError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: eventsError.message })

    type EventMemberRow = { pillar_status: string; profiles: { avatar_url: string | null } | null }

    const ongoingInitiatives = (eventsData ?? []).map((ev) => {
      const members = (ev.event_members ?? []) as unknown as EventMemberRow[]
      const totalMembers = members.length
      const doneCount = members.filter((m) => m.pillar_status === "done").length
      const progress = totalMembers > 0 ? Math.round((doneCount / totalMembers) * 100) : 0
      const memberAvatars = members
        .map((m) => m.profiles?.avatar_url)
        .filter((url): url is string => typeof url === "string" && url.length > 0)
        .slice(0, 4)

      return {
        id:           ev.id,
        name:         ev.name,
        description:  ev.description ?? "",
        coverUrl:     ev.cover_url ?? null,
        deadline:     ev.date ? new Date(ev.date) : null,
        progress,
        memberAvatars,
        totalMembers,
      }
    })

    // ── Pending Submissions ───────────────────────────────────────────────────
    type PendingRow = {
      event_id:   string
      event_name: string
      user_id:    string
      member_name: string
      department: string | null
      task:       string | null
      event_date: string
    }

    const { data: subsData, error: subsError } = await ctx.supabase
      .rpc("get_admin_pending_submissions")

    if (subsError) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: subsError.message })

    const subs = (subsData ?? []) as PendingRow[]

    // Batch-fetch avatars for all assignees in a single query
    const userIds = [...new Set(subs.map((s) => s.user_id))]
    let avatarMap: Record<string, string | null> = {}
    if (userIds.length > 0) {
      const { data: profilesData } = await ctx.supabase
        .from("profiles")
        .select("id, avatar_url")
        .in("id", userIds)
      avatarMap = Object.fromEntries(
        (profilesData ?? []).map((p) => [p.id, p.avatar_url ?? null])
      )
    }

    const pendingSubmissions = subs.map((s, i) => ({
      taskId:            `${s.event_id}-${s.user_id}-${i}`,
      eventId:           s.event_id,
      taskName:          s.task ?? "",
      eventName:         s.event_name ?? "",
      memberName:        s.member_name ?? "",
      department:        s.department ?? "",
      dueAt:             new Date(s.event_date),
      assigneeAvatarUrl: avatarMap[s.user_id] ?? null,
    }))

    return {
      kpi: {
        activeEvents:    Number(activeEventsRes.data),
        totalMembers:    Number(totalMembersRes.data),
        completionRate:  Math.round(Number(completionRateRes.data)),
        tasksDueSoon:    Number(tasksDueRes.data),
      },
      ongoingInitiatives,
      pendingSubmissions,
    }
  }),
})
