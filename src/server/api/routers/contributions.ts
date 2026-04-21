import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

const contributionInput = z.object({
  department:  z.string().min(1).max(50),
  task:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  outcome:     z.string().max(500).optional(),
  priority:    z.enum(["low", "medium", "high"]),
  event_id:    z.string().uuid().optional(),
})

export const contributionsRouter = createTRPCRouter({

  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase //waiting for data cannot do other things
      .from("contributions")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("submitted_at", { ascending: false })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data
  }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("role")
      .eq("id", ctx.user.id)
      .single()

    if (profile?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" })
    }

    const { data, error } = await ctx.supabase
      .from("contributions")
      .select("*, profiles(name, department)")
      .order("submitted_at", { ascending: false })

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
    return data
  }),

  create: protectedProcedure
    .input(contributionInput)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("contributions")
        .insert({ ...input, user_id: ctx.user.id })
        .select()
        .single()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),

  update: protectedProcedure
    .input(contributionInput.partial().extend({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...fields } = input
      const { data, error } = await ctx.supabase
        .from("contributions")
        .update(fields)
        .eq("id", id)
        .eq("user_id", ctx.user.id)
        .select()
        .single()

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message })
      return data
    }),
})
