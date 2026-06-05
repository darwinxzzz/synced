import { describe, expect, it, vi } from "vitest";
import { createCallerFactory } from "~/server/api/trpc";
import { kanbanRouter } from "~/server/api/routers/kanban";

const createCaller = createCallerFactory(kanbanRouter);

function makeCtx(pillarStatus = "in_review") {
  const single = vi.fn().mockResolvedValue({
    data: {
      id: "event-member-1",
      event_id: "00000000-0000-0000-0000-000000000001",
      user_id: "user-1",
      pillar_status: pillarStatus,
    },
    error: null,
  });

  const query = {
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    select: vi.fn(() => query),
    single,
  };

  return {
    ctx: {
      supabase: {
        from: vi.fn(() => query),
      },
      user: { id: "user-1" },
      profile: { role: "member", status: "active" },
      headers: new Headers(),
    },
    query,
  };
}

describe("kanbanRouter member transition invariants", () => {
  it("does not let the legacy member status mutation mark a task done", async () => {
    const { ctx } = makeCtx("in_review");
    const caller = createCaller(ctx as never);

    await expect(
      caller.updateTaskStatus({
        eventId: "00000000-0000-0000-0000-000000000001",
        status: "done",
      }),
    ).rejects.toThrow(/Cannot move|FORBIDDEN/i);
  });

  it("still allows the legacy member status mutation to move to the next status", async () => {
    const { ctx, query } = makeCtx("new");
    const caller = createCaller(ctx as never);

    await expect(
      caller.updateTaskStatus({
        eventId: "00000000-0000-0000-0000-000000000001",
        status: "in_progress",
      }),
    ).resolves.toMatchObject({ id: "event-member-1" });

    expect(query.update).toHaveBeenCalledWith({ pillar_status: "in_progress" });
    expect(query.eq).toHaveBeenCalledWith("id", "event-member-1");
    expect(query.eq).toHaveBeenCalledWith("user_id", "user-1");
  });
});
