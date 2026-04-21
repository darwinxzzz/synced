import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";

export const reflectionsRouter = createTRPCRouter({
  getMyReflections: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("reflections")
      .select(`
        id,
        status,
        current_task,
        description,
        impact,
        challenges,
        personal_learning,
        org_learning,
        submitted_at,
        created_at,
        contributions(id, task, department)
      `)
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false }) as unknown as {
        data: Array<{
          id: string;
          status: string;
          current_task: string | null;
          description: string | null;
          impact: string | null;
          challenges: string | null;
          personal_learning: string | null;
          org_learning: string | null;
          submitted_at: string | null;
          created_at: string;
          contributions: { id: string; task: string | null; department: string | null } | null;
        }> | null;
        error: { message: string } | null;
      };

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return data ?? [];
  }),

  submitReflection: protectedProcedure
    .input(
      z.object({
        reflectionId: z.string().uuid(),
        currentTask: z.string().min(1).max(200),
        description: z.string().min(1).max(500),
        impact: z.string().min(1).max(500),
        challenges: z.string().min(1).max(500),
        personalLearning: z.string().min(1).max(500),
        orgLearning: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from("reflections")
        .update({
          current_task: input.currentTask,
          description: input.description,
          impact: input.impact,
          challenges: input.challenges,
          personal_learning: input.personalLearning,
          org_learning: input.orgLearning,
          status: "archived",
          submitted_at: new Date().toISOString(),
        })
        .eq("id", input.reflectionId)
        .eq("user_id", ctx.user.id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  saveDraft: protectedProcedure
    .input(
      z.object({
        reflectionId: z.string().uuid(),
        currentTask: z.string().optional(),
        description: z.string().optional(),
        impact: z.string().optional(),
        challenges: z.string().optional(),
        personalLearning: z.string().optional(),
        orgLearning: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { reflectionId, ...fields } = input;
      const payload: Record<string, string | undefined> = {};
      if (fields.currentTask !== undefined) payload.current_task = fields.currentTask;
      if (fields.description !== undefined) payload.description = fields.description;
      if (fields.impact !== undefined) payload.impact = fields.impact;
      if (fields.challenges !== undefined) payload.challenges = fields.challenges;
      if (fields.personalLearning !== undefined) payload.personal_learning = fields.personalLearning;
      if (fields.orgLearning !== undefined) payload.org_learning = fields.orgLearning;

      const { data, error } = await ctx.supabase
        .from("reflections")
        .update(payload)
        .eq("id", reflectionId)
        .eq("user_id", ctx.user.id)
        .eq("status", "pending")
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  adminUpdateReflection: adminProcedure
    .input(
      z.object({
        reflectionId: z.string().uuid(),
        currentTask: z.string().min(1).max(200).optional(),
        description: z.string().max(500).optional(),
        impact: z.string().max(500).optional(),
        challenges: z.string().max(500).optional(),
        personalLearning: z.string().max(500).optional(),
        orgLearning: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { reflectionId, ...fields } = input;
      const payload: Record<string, string> = {};
      if (fields.currentTask !== undefined) payload.current_task = fields.currentTask;
      if (fields.description !== undefined) payload.description = fields.description;
      if (fields.impact !== undefined) payload.impact = fields.impact;
      if (fields.challenges !== undefined) payload.challenges = fields.challenges;
      if (fields.personalLearning !== undefined) payload.personal_learning = fields.personalLearning;
      if (fields.orgLearning !== undefined) payload.org_learning = fields.orgLearning;

      const { data, error } = await ctx.supabase
        .from("reflections")
        .update(payload)
        .eq("id", reflectionId)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),
});
