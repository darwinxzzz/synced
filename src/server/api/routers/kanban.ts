import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const PILLAR_STATUSES = ["new", "in_progress", "in_review", "done"] as const;

export const kanbanRouter = createTRPCRouter({
  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    const { data: memberships, error: memErr } = await ctx.supabase
      .from("event_members")
      .select("event_id")
      .eq("user_id", ctx.user.id);

    if (memErr) throw new Error(memErr.message);
    if (!memberships?.length) return [];

    const eventIds = memberships.map((m) => m.event_id);

    const { data: events, error: evtErr } = await ctx.supabase
      .from("events")
      .select("id, name, date")
      .in("id", eventIds)
      .neq("status", "archived");

    if (evtErr) throw new Error(evtErr.message);
    return events ?? [];
  }),

  getMyTasks: protectedProcedure
    .input(z.object({ eventId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("event_members")
        .select("event_id, task, department, pillar_status, events(id, name, date)")
        .eq("user_id", ctx.user.id);

      if (input.eventId) {
        query = query.eq("event_id", input.eventId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    }),

  updateTaskStatus: protectedProcedure
    .input(z.object({
      eventId: z.string().uuid(),
      status: z.enum(PILLAR_STATUSES),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("event_members")
        .update({ pillar_status: input.status })
        .eq("event_id", input.eventId)
        .eq("user_id", ctx.user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),
});
