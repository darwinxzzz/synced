import type { KanbanTask } from "~/app/_components/kanban/KanbanCard";
import type { AdminTask } from "~/app/_components/admin/AdminTaskCard";

type PillarStatus = "new" | "in_progress" | "in_review" | "done";

type ContributionPatchFields = Partial<Pick<KanbanTask, "priority" | "name">>;

/** Immutably moves a member task to a new pillar status. */
export function applyOptimisticMove(
  tasks: KanbanTask[],
  eventMemberId: string,
  newStatus: PillarStatus,
): KanbanTask[] {
  return tasks.map((t) => {
    if (t.id !== eventMemberId) return t;
    return { ...t, pillarStatus: newStatus, isEditable: newStatus !== "done" };
  });
}

/** Immutably patches contribution fields on the task matching the given contributionId. */
export function applyOptimisticContributionUpdate(
  tasks: KanbanTask[],
  contributionId: string,
  fields: ContributionPatchFields,
): KanbanTask[] {
  return tasks.map((t) => {
    if (t.contributionId !== contributionId) return t;
    return { ...t, ...fields };
  });
}

/** Immutably moves an admin task to a new pillar status. */
export function applyAdminOptimisticMove(
  tasks: AdminTask[],
  eventMemberId: string,
  newStatus: PillarStatus,
): AdminTask[] {
  return tasks.map((t) => {
    if (t.id !== eventMemberId) return t;
    return { ...t, pillarStatus: newStatus };
  });
}
