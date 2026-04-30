import { describe, it, expect } from "vitest"
import {
  applyOptimisticMove,
  applyOptimisticContributionUpdate,
  applyAdminOptimisticMove,
} from "~/lib/optimistic-updates"
import type { KanbanTask } from "~/app/_components/kanban/KanbanCard"
import type { AdminTask } from "~/app/_components/admin/AdminTaskCard"

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<KanbanTask> = {}): KanbanTask {
  return {
    id: "task-1",
    name: "Build slides",
    department: "Marketing",
    priority: "medium",
    pillarStatus: "new",
    deadline: null,
    assignedBy: "Admin",
    contributionId: "contrib-1",
    isEditable: true,
    ...overrides,
  }
}

function makeAdminTask(overrides: Partial<AdminTask> = {}): AdminTask {
  return {
    id: "task-1",
    name: "Build slides",
    department: "Marketing",
    pillarStatus: "new",
    assigneeId: "user-1",
    assigneeName: "Alice",
    assigneeAvatar: null,
    ...overrides,
  }
}

// ─── applyOptimisticMove ──────────────────────────────────────────────────────

describe("applyOptimisticMove", () => {
  it("moves the target task to the new status", () => {
    const tasks = [makeTask({ id: "task-1", pillarStatus: "new" })]
    const result = applyOptimisticMove(tasks, "task-1", "in_progress")
    expect(result[0]?.pillarStatus).toBe("in_progress")
  })

  it("leaves all other tasks unchanged", () => {
    const tasks = [
      makeTask({ id: "task-1", pillarStatus: "new" }),
      makeTask({ id: "task-2", pillarStatus: "in_progress" }),
    ]
    const result = applyOptimisticMove(tasks, "task-1", "in_progress")
    expect(result[1]?.pillarStatus).toBe("in_progress")
    expect(result[1]?.id).toBe("task-2")
  })

  it("returns the same array length", () => {
    const tasks = [makeTask(), makeTask({ id: "task-2" })]
    const result = applyOptimisticMove(tasks, "task-1", "in_review")
    expect(result).toHaveLength(2)
  })

  it("does not mutate the original array", () => {
    const tasks = [makeTask({ pillarStatus: "new" })]
    const original = tasks[0]!
    applyOptimisticMove(tasks, "task-1", "in_progress")
    expect(original.pillarStatus).toBe("new")
  })

  it("returns unchanged array when taskId not found", () => {
    const tasks = [makeTask({ id: "task-1", pillarStatus: "new" })]
    const result = applyOptimisticMove(tasks, "unknown-id", "in_progress")
    expect(result[0]?.pillarStatus).toBe("new")
  })

  it("handles empty array", () => {
    const result = applyOptimisticMove([], "task-1", "in_progress")
    expect(result).toHaveLength(0)
  })

  it("sets isEditable to false when moved to done", () => {
    const tasks = [makeTask({ id: "task-1", pillarStatus: "in_review", isEditable: true })]
    const result = applyOptimisticMove(tasks, "task-1", "done")
    expect(result[0]?.isEditable).toBe(false)
  })

  it("keeps isEditable true when moved to non-done status", () => {
    const tasks = [makeTask({ id: "task-1", pillarStatus: "new", isEditable: true })]
    const result = applyOptimisticMove(tasks, "task-1", "in_progress")
    expect(result[0]?.isEditable).toBe(true)
  })
})

// ─── applyOptimisticContributionUpdate ───────────────────────────────────────

describe("applyOptimisticContributionUpdate", () => {
  it("updates priority for the matching contribution", () => {
    const tasks = [makeTask({ contributionId: "contrib-1", priority: "low" })]
    const result = applyOptimisticContributionUpdate(tasks, "contrib-1", { priority: "high" })
    expect(result[0]?.priority).toBe("high")
  })

  it("does not affect tasks with a different contributionId", () => {
    const tasks = [
      makeTask({ id: "task-1", contributionId: "contrib-1", priority: "low" }),
      makeTask({ id: "task-2", contributionId: "contrib-2", priority: "medium" }),
    ]
    const result = applyOptimisticContributionUpdate(tasks, "contrib-1", { priority: "high" })
    expect(result[1]?.priority).toBe("medium")
  })

  it("does not mutate the original task object", () => {
    const tasks = [makeTask({ contributionId: "contrib-1", priority: "low" })]
    const original = tasks[0]!
    applyOptimisticContributionUpdate(tasks, "contrib-1", { priority: "high" })
    expect(original.priority).toBe("low")
  })

  it("handles tasks with no contributionId gracefully", () => {
    const tasks = [makeTask({ contributionId: null })]
    const result = applyOptimisticContributionUpdate(tasks, "contrib-1", { priority: "high" })
    expect(result[0]?.priority).toBe("medium")
  })

  it("handles empty array", () => {
    const result = applyOptimisticContributionUpdate([], "contrib-1", { priority: "high" })
    expect(result).toHaveLength(0)
  })

  it("applies multiple fields at once", () => {
    const tasks = [makeTask({ contributionId: "contrib-1", priority: "low" })]
    const result = applyOptimisticContributionUpdate(tasks, "contrib-1", {
      priority: "high",
      name: "Updated name",
    })
    expect(result[0]?.priority).toBe("high")
    expect(result[0]?.name).toBe("Updated name")
  })
})

// ─── applyAdminOptimisticMove ─────────────────────────────────────────────────

describe("applyAdminOptimisticMove", () => {
  it("moves the target admin task to the new status", () => {
    const tasks = [makeAdminTask({ id: "task-1", pillarStatus: "new" })]
    const result = applyAdminOptimisticMove(tasks, "task-1", "in_progress")
    expect(result[0]?.pillarStatus).toBe("in_progress")
  })

  it("leaves other admin tasks unchanged", () => {
    const tasks = [
      makeAdminTask({ id: "task-1", pillarStatus: "new" }),
      makeAdminTask({ id: "task-2", pillarStatus: "in_review" }),
    ]
    const result = applyAdminOptimisticMove(tasks, "task-1", "done")
    expect(result[1]?.pillarStatus).toBe("in_review")
  })

  it("does not mutate the original admin task", () => {
    const tasks = [makeAdminTask({ id: "task-1", pillarStatus: "new" })]
    const original = tasks[0]!
    applyAdminOptimisticMove(tasks, "task-1", "in_progress")
    expect(original.pillarStatus).toBe("new")
  })

  it("returns unchanged array when taskId not found", () => {
    const tasks = [makeAdminTask({ id: "task-1", pillarStatus: "new" })]
    const result = applyAdminOptimisticMove(tasks, "ghost-id", "done")
    expect(result[0]?.pillarStatus).toBe("new")
  })

  it("handles empty array", () => {
    const result = applyAdminOptimisticMove([], "task-1", "done")
    expect(result).toHaveLength(0)
  })
})
