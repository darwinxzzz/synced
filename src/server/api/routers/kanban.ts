import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const PILLAR_STATUSES = ["new", "in_progress", "in_review", "done"] as const;
type PillarStatus = (typeof PILLAR_STATUSES)[number];

// Members can only move forward — no backward, no skip, no → done
const ALLOWED_TRANSITIONS: Record<PillarStatus, PillarStatus[]> = {
  new: ["in_progress"],
  in_progress: ["in_review"],
  in_review: [], // admin-only → done
  done: [],
};

export const kanbanRouter = createTRPCRouter({
  // ── Events the member belongs to ─────────────────────────────────────────
  getMyEvents: protectedProcedure.query(async ({ ctx }) => {
    const { data: memberships, error: memErr } = await ctx.supabase
      .from("event_members")
      .select("event_id")
      .eq("user_id", ctx.user.id);

    if (memErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: memErr.message });
    if (!memberships?.length) return [];

    const eventIds = memberships.map((m) => m.event_id);

    const { data: events, error: evtErr } = await ctx.supabase
      .from("events")
      .select("id, name, date")
      .in("id", eventIds)
      .neq("status", "archived")
      .order("date", { ascending: false });

    if (evtErr) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: evtErr.message });
    return events ?? [];
  }),

  // ── Full kanban task list for one event ───────────────────────────────────
  getMemberKanban: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Use `unknown` cast because optional columns (deadline, priority, assigned_by)
      // may not exist in the generated types yet — Supabase CLI would show SelectQueryError
      const { data, error } = await ctx.supabase
        .from("event_members")
        .select("id, task, department, pillar_status, event_id, contributions(id)")
        .eq("user_id", ctx.user.id)
        .eq("event_id", input.eventId) as unknown as {
          data: Array<{
            id: string;
            task: string | null;
            department: string | null;
            pillar_status: string | null;
            deadline?: string | null;
            priority?: string | null;
            assigned_by?: string | null;
            event_id: string;
            contributions: { id: string }[] | null;
          }> | null;
          error: { message: string } | null;
        };

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });

      return (data ?? []).map((row) => {
        const contribs = row.contributions;
        const contributionId = contribs?.[0]?.id ?? null;
        const status = (row.pillar_status ?? "new") as PillarStatus;

        return {
          id: row.id,
          name: row.task ?? "",
          department: row.department ?? "",
          priority: ((row.priority ?? "medium") as "low" | "medium" | "high"),
          pillarStatus: status,
          deadline: row.deadline ? new Date(row.deadline) : null,
          assignedBy: row.assigned_by ?? "Admin",
          contributionId,
          isEditable: status !== "done",
        };
      });
    }),

  // ── Check if a contributions row exists for this member + event ───────────
  checkContributionExists: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { count, error } = await ctx.supabase
        .from("contributions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.user.id)
        .eq("event_id", input.eventId);

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return (count ?? 0) > 0;
    }),

  // ── Move a task to the next valid pillar ──────────────────────────────────
  moveTask: protectedProcedure
    .input(
      z.object({
        eventMemberId: z.string().uuid(),
        newStatus: z.enum(["in_progress", "in_review"]),
        changes: z.string().max(300).optional(),
        challengesFaced: z.string().max(300).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch current row and verify ownership
      const { data: row, error: fetchErr } = await ctx.supabase
        .from("event_members")
        .select("pillar_status, event_id")
        .eq("id", input.eventMemberId)
        .eq("user_id", ctx.user.id)
        .single();

      if (fetchErr ?? !row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      const current = (row.pillar_status ?? "new") as PillarStatus;
      const allowed = ALLOWED_TRANSITIONS[current];

      if (!allowed.includes(input.newStatus as PillarStatus)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Cannot move from ${current} to ${input.newStatus}`,
        });
      }

      // 2. If moving to in_review, persist changes + challenges on contribution
      if (
        input.newStatus === "in_review" &&
        (input.changes !== undefined || input.challengesFaced !== undefined)
      ) {
        const updatePayload: Record<string, string | undefined> = {};
        if (input.changes !== undefined) updatePayload.changes = input.changes;
        if (input.challengesFaced !== undefined) updatePayload.challenges_faced = input.challengesFaced;

        // Non-fatal — columns may not exist yet; Supabase will return error we ignore
        await ctx.supabase
          .from("contributions")
          .update(updatePayload)
          .eq("user_id", ctx.user.id)
          .eq("event_id", row.event_id);
      }

      // 3. Update pillar_status (DB trigger validates transition)
      const { data, error } = await ctx.supabase
        .from("event_members")
        .update({ pillar_status: input.newStatus })
        .eq("id", input.eventMemberId)
        .eq("user_id", ctx.user.id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  // ── Member edits their own contribution (locked when done) ───────────────
  updateOwnContribution: protectedProcedure
    .input(
      z.object({
        contributionId: z.string().uuid(),
        description: z.string().max(200).optional(),
        outcome: z.string().max(500).optional(),
        changes: z.string().max(200).optional(),
        challengesFaced: z.string().max(200).optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { contributionId, ...fields } = input;

      const updatePayload: Record<string, string | undefined> = {};
      if (fields.description !== undefined) updatePayload.description = fields.description;
      if (fields.outcome !== undefined) updatePayload.outcome = fields.outcome;
      if (fields.changes !== undefined) updatePayload.changes = fields.changes;
      if (fields.challengesFaced !== undefined) updatePayload.challenges_faced = fields.challengesFaced;
      if (fields.priority !== undefined) updatePayload.priority = fields.priority;

      const { data, error } = await ctx.supabase
        .from("contributions")
        .update(updatePayload)
        .eq("id", contributionId)
        .eq("user_id", ctx.user.id) // RLS also enforces this
        .select()
        .single();

      if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
      return data;
    }),

  // ── Pending reflection count for the badge ────────────────────────────────
  getPendingReflectionCount: protectedProcedure.query(async ({ ctx }) => {
    const { count, error } = await ctx.supabase
      .from("reflections")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.user.id)
      .eq("status", "pending");

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    return count ?? 0;
  }),

  // ── Distinct department list (pulled from profiles) ─────────────────────
  getDepartments: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("department")
      .not("department", "is", null);

    if (error) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: error.message });
    const depts = [
      ...new Set(
        (data ?? []).map((d) => d.department).filter((dep): dep is string => dep !== null)
      ),
    ].sort();
    return depts;
  }),

  // ── Legacy: kept for existing tests ──────────────────────────────────────
  getMyTasks: protectedProcedure
    .input(z.object({ eventId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from("event_members")
        .select("id, event_id, task, department, pillar_status, events(id, name, date)")
        .eq("user_id", ctx.user.id);

      if (input.eventId) {
        query = query.eq("event_id", input.eventId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    }),

  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        eventId: z.string().uuid(),
        status: z.enum(PILLAR_STATUSES),
      })
    )
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
