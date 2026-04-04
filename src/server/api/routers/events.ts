import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

const eventInput = z.object({
  name:         z.string().min(1).max(100),
  description:  z.string().max(500).optional(),
  date:         z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
  start_time:   z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM").optional(),
  end_time:     z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM").optional(),
  cover_url:    z.string().url().optional(),
  is_recurring: z.boolean().default(false),
  member_ids:   z.array(z.string().uuid()).default([]),
})

export const eventsRouter = createTRPCRouter({

  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("events")
        .select("*, event_members(*, profiles(id, name, avatar_url, department))")
        .eq("id", input.id)
        .single()

      if (error) throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" })
      return data
    }),

  create: protectedProcedure
    .input(eventInput)
    .mutation(async ({ ctx, input }) => {
      const { member_ids, ...eventFields } = input

      // Calls the DB function which enforces admin check server-side
      const { data, error } = await ctx.supabase.rpc("create_event", {
        p_name:         eventFields.name,
        p_description:  eventFields.description ?? "",
        p_date:         eventFields.date ?? "",
        p_start_time:   eventFields.start_time ?? "",
        p_end_time:     eventFields.end_time ?? "",
        p_cover_url:    eventFields.cover_url ?? "",
        p_is_recurring: eventFields.is_recurring,
        p_member_ids:   member_ids,
      })

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id:     z.string().uuid(),
      status: z.enum(["draft", "active", "archived"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("events")
        .update({ status: input.status })
        .eq("id", input.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),
})
