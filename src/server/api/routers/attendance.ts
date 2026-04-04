import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

export const attendanceRouter = createTRPCRouter({

  getMembers: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("id, name, email, avatar_url, department, role, status")
      .eq("status", "active")
      .order("name")

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data
  }),

  getByWeek: protectedProcedure
    .input(z.object({ week: z.number().int().min(1).max(53) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("attendance")
        .select("*, profiles(id, name, avatar_url, department)")
        .eq("type", "weekly_meeting")
        .eq("meeting_week", input.week)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),

  getByEvent: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("attendance")
        .select("*, profiles(id, name, avatar_url, department)")
        .eq("type", "event")
        .eq("event_id", input.eventId)

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),

  upsertAttendance: protectedProcedure
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
        .upsert(input, { onConflict: "user_id,event_id" })
        .select()
        .single()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),
})
