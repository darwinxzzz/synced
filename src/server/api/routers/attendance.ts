import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { z } from "zod"
import { TRPCError } from "@trpc/server"

// TODO: replace stubs with real Supabase queries once ctx.supabase is wired up
export const attendanceRouter = createTRPCRouter({

    getMembers: publicProcedure.query(async () => {
        throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Supabase not yet wired into tRPC context" })
    }),

    getByWeek: publicProcedure
        .input(z.object({ week: z.string() }))
        .query(async () => {
            throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Supabase not yet wired into tRPC context" })
        }),

    createWeek: publicProcedure
        .input(z.object({ week: z.string() }))
        .mutation(async () => {
            throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Supabase not yet wired into tRPC context" })
        }),

    markAttendance: publicProcedure
        .input(z.object({
            member_id: z.string(),
            week: z.string(),
            present: z.boolean(),
        }))
        .mutation(async () => {
            throw new TRPCError({ code: "NOT_IMPLEMENTED", message: "Supabase not yet wired into tRPC context" })
        }),
})
