"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, Plus } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { createClient } from "~/lib/supabase/client";
import { applyOptimisticMove, applyOptimisticContributionUpdate } from "~/lib/optimistic-updates";
import { KanbanPillar } from "~/app/_components/kanban/KanbanPillar";
import { InReviewModal } from "~/app/_components/kanban/InReviewModal";
import { TaskDetailDrawer } from "~/app/_components/kanban/TaskDetailDrawer";
import { EventSelectorDropdown } from "~/app/_components/kanban/EventSelectorDropdown";
import { FilterPanel, type KanbanFilters } from "~/app/_components/kanban/FilterPanel";
import { AddContributionDrawer } from "~/app/_components/kanban/AddContributionDrawer";
import { ReflectionDrawer } from "~/app/_components/kanban/ReflectionDrawer";
import type { KanbanTask } from "~/app/_components/kanban/KanbanCard";

type PillarStatus = "new" | "in_progress" | "in_review" | "done";

const PILLARS: PillarStatus[] = ["new", "in_progress", "in_review", "done"];
const PILLAR_LABELS: Record<PillarStatus, string> = {
  new: "New",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
};

// Members cannot move cards backward, skip stages, or move to done
const ALLOWED_MEMBER_TRANSITIONS: Record<PillarStatus, PillarStatus[]> = {
  new: ["in_progress"],
  in_progress: ["in_review"],
  in_review: [],
  done: [],
};

function applySortAndFilter(tasks: KanbanTask[], filters: KanbanFilters): KanbanTask[] {
  let result = [...tasks];

  if (filters.priorityFilter) {
    result = result.filter((t) => t.priority === filters.priorityFilter);
  }

  if (filters.dateSort) {
    result.sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      const diff = a.deadline.getTime() - b.deadline.getTime();
      return filters.dateSort === "asc" ? diff : -diff;
    });
  }

  return result;
}

function KanbanBoard() {
  const searchParams = useSearchParams();
  const highlightTaskId = searchParams.get("taskId");

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filters, setFilters] = useState<KanbanFilters>({ dateSort: null, priorityFilter: null });
  const [addContributionOpen, setAddContributionOpen] = useState(false);
  const [reflectionDrawerOpen, setReflectionDrawerOpen] = useState(false);
  const [inReviewOpen, setInReviewOpen] = useState(false);
  const [pendingMoveTaskId, setPendingMoveTaskId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<KanbanTask | null>(null);
  const [shakenTaskId, setShakenTaskId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(highlightTaskId);
  const [mobilePillar, setMobilePillar] = useState<PillarStatus>("new");
  const [moveSheetTask, setMoveSheetTask] = useState<KanbanTask | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = api.useUtils();

  // Queries
  const { data: events = [] } = api.kanban.getMyEvents.useQuery();
  const { data: tasks = [], refetch: refetchTasks } = api.kanban.getMemberKanban.useQuery(
    { eventId: selectedEventId ?? "" },
    { enabled: !!selectedEventId }
  );
  const { data: reflectionCount = 0, refetch: refetchReflections } =
    api.kanban.getPendingReflectionCount.useQuery();
  const { data: profile } = api.dashboard.getMyProfile.useQuery();

  // Mutations with optimistic updates
  const moveTask = api.kanban.moveTask.useMutation({
    onMutate: async ({ eventMemberId, newStatus }) => {
      const eventId = selectedEventId;
      if (!eventId) return { prev: undefined, eventId: null };
      await utils.kanban.getMemberKanban.cancel({ eventId });
      const prev = utils.kanban.getMemberKanban.getData({ eventId });
      utils.kanban.getMemberKanban.setData(
        { eventId },
        (old) => old ? applyOptimisticMove(old, eventMemberId, newStatus) : old,
      );
      return { prev, eventId };
    },
    onError: (err, { eventMemberId }, ctx) => {
      if (ctx?.eventId && ctx.prev !== undefined) {
        utils.kanban.getMemberKanban.setData({ eventId: ctx.eventId }, ctx.prev);
      }
      shakeCard(eventMemberId);
      toast.error(err.message);
    },
    onSettled: () => void refetchTasks(),
  });

  const updateContribution = api.kanban.updateOwnContribution.useMutation({
    onMutate: async ({ contributionId, priority }) => {
      const eventId = selectedEventId;
      if (!eventId || !priority) return { prev: undefined, eventId: null };
      await utils.kanban.getMemberKanban.cancel({ eventId });
      const prev = utils.kanban.getMemberKanban.getData({ eventId });
      utils.kanban.getMemberKanban.setData(
        { eventId },
        (old) => old ? applyOptimisticContributionUpdate(old, contributionId, { priority }) : old,
      );
      return { prev, eventId };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.eventId && ctx.prev !== undefined) {
        utils.kanban.getMemberKanban.setData({ eventId: ctx.eventId }, ctx.prev);
      }
      toast.error(err.message);
    },
    onSettled: () => void refetchTasks(),
  });

  // Auto-select first event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0]!.id);
    }
  }, [events, selectedEventId]);

  // Highlight card from URL param, clear after 3s
  useEffect(() => {
    if (highlightTaskId) {
      setHighlightedId(highlightTaskId);
      const t = setTimeout(() => setHighlightedId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [highlightTaskId]);

  // Supabase Realtime — kanban updates
  useEffect(() => {
    if (!selectedEventId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`kanban-${selectedEventId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "event_members" }, () => {
        void refetchTasks();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [selectedEventId, refetchTasks]);

  // Supabase Realtime — reflection badge
  useEffect(() => {
    const userId = profile?.id;
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`reflections-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "reflections", filter: `user_id=eq.${userId}` }, () => {
        void refetchReflections();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [profile?.id, refetchReflections]);

  // Group tasks by pillar
  const tasksByPillar = useMemo(() => {
    const grouped: Record<PillarStatus, KanbanTask[]> = {
      new: [], in_progress: [], in_review: [], done: [],
    };
    for (const task of tasks) {
      const s = task.pillarStatus as PillarStatus;
      grouped[s].push(task);
    }
    return grouped;
  }, [tasks]);

  // Apply filters per pillar
  const filteredByPillar = useMemo(() => {
    const result: Record<PillarStatus, KanbanTask[]> = {
      new: [], in_progress: [], in_review: [], done: [],
    };
    for (const p of PILLARS) {
      result[p] = applySortAndFilter(tasksByPillar[p], filters);
    }
    return result;
  }, [tasksByPillar, filters]);

  const shakeCard = (taskId: string) => {
    setShakenTaskId(taskId);
    setTimeout(() => setShakenTaskId(null), 500);
  };

  const handleDrop = useCallback(
    (taskId: string, targetStatus: PillarStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const allowed = ALLOWED_MEMBER_TRANSITIONS[task.pillarStatus];

      if (!allowed.includes(targetStatus)) {
        shakeCard(taskId);
        toast.error("You can't move this card here");
        return;
      }

      // After the guard above, targetStatus is guaranteed to be a valid member move
      const validTarget = targetStatus as "in_progress" | "in_review";

      if (validTarget === "in_review") {
        // Must check contribution exists first
        void (async () => {
          try {
            const exists = await utils.kanban.checkContributionExists.fetch({
              eventId: selectedEventId ?? "",
            });
            if (!exists) {
              shakeCard(taskId);
              toast("Please add a contribution before moving to In Review");
              return;
            }
            // Open in-review modal
            setPendingMoveTaskId(taskId);
            setInReviewOpen(true);
          } catch {
            toast.error("Could not verify contribution. Please try again.");
          }
        })();
        return;
      }

      // Direct move (new → in_progress)
      moveTask.mutate({ eventMemberId: taskId, newStatus: validTarget });
    },
    [tasks, selectedEventId, utils, moveTask]
  );

  const handleInReviewConfirm = (changes: string, challengesFaced: string) => {
    if (!pendingMoveTaskId) return;
    moveTask.mutate(
      { eventMemberId: pendingMoveTaskId, newStatus: "in_review", changes, challengesFaced },
      {
        onSuccess: () => {
          toast.success("Task moved to In Review 🎋");
          void refetchReflections();
        },
      }
    );
    setInReviewOpen(false);
    setPendingMoveTaskId(null);
  };

  const handleInReviewCancel = () => {
    if (pendingMoveTaskId) shakeCard(pendingMoveTaskId);
    setInReviewOpen(false);
    setPendingMoveTaskId(null);
  };

  const handleCardClick = (task: KanbanTask) => {
    setDetailTask(task);
  };

  const handleSaveContribution = async (data: Parameters<NonNullable<React.ComponentProps<typeof TaskDetailDrawer>["onSave"]>>[0]) => {
    await updateContribution.mutateAsync({
      contributionId: data.contributionId,
      description: data.description,
      outcome: data.outcome,
      changes: data.changes,
      challengesFaced: data.challengesFaced,
      priority: data.priority,
    });
  };

  // Mobile: tap-to-move bottom sheet
  const handleMoveRequest = (task: KanbanTask) => {
    setMoveSheetTask(task);
  };

  const handleMobileMoveConfirm = (targetStatus: PillarStatus) => {
    if (!moveSheetTask) return;
    handleDrop(moveSheetTask.id, targetStatus);
    setMoveSheetTask(null);
  };

  // Mobile: scroll pillar tabs
  const scrollToPillar = (status: PillarStatus) => {
    setMobilePillar(status);
    const idx = PILLARS.indexOf(status);
    if (scrollRef.current) {
      const pillarWidth = scrollRef.current.scrollWidth / PILLARS.length;
      scrollRef.current.scrollTo({ left: idx * pillarWidth, behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--ivory-paper)",
        paddingBottom: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div style={{ paddingTop: "32px", paddingBottom: "24px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 700,
              color: "var(--deep-forest)",
              marginBottom: "20px",
            }}
          >
            My Kanban Board
          </h1>

          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {/* Left: Event selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "var(--stone-grey)",
                  flexShrink: 0,
                }}
              >
                Viewing:
              </span>
              <EventSelectorDropdown
                events={events}
                selectedId={selectedEventId}
                onChange={setSelectedEventId}
              />
            </div>

            {/* Right: Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              {/* Reflections badge */}
              <button
                onClick={() => setReflectionDrawerOpen(true)}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(28,58,43,0.18)",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--deep-forest)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Bell size={14} />
                Reflections
                {reflectionCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "var(--deadline-red)",
                      color: "#fff",
                      borderRadius: "99px",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {reflectionCount}
                  </span>
                )}
              </button>

              {/* Add Contribution */}
              <button
                onClick={() => setAddContributionOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--deep-forest)",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bamboo-green)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--deep-forest)")}
              >
                <Plus size={14} />
                Add Contribution
              </button>

              {/* Filter */}
              <FilterPanel filters={filters} onChange={setFilters} />
            </div>
          </div>
        </div>

        {/* ── Mobile pillar tab bar ─────────────────────────────────────────── */}
        <div
          className="md:hidden"
          style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "12px",
            scrollbarWidth: "none",
          }}
        >
          {PILLARS.map((p) => (
            <button
              key={p}
              onClick={() => scrollToPillar(p)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: "99px",
                border: "none",
                background: mobilePillar === p ? "var(--bamboo-green)" : "rgba(140,140,140,0.10)",
                color: mobilePillar === p ? "#fff" : "var(--stone-grey)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                fontWeight: mobilePillar === p ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {PILLAR_LABELS[p]}
              <span
                style={{
                  marginLeft: "6px",
                  background: mobilePillar === p ? "rgba(255,255,255,0.25)" : "rgba(140,140,140,0.15)",
                  borderRadius: "99px",
                  padding: "1px 6px",
                  fontSize: "10px",
                }}
              >
                {filteredByPillar[p].length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Kanban board ─────────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            overflowX: "auto",
            // Mobile: snap scroll
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            paddingBottom: "16px",
          }}
        >
          {PILLARS.map((pillar) => (
            <div
              key={pillar}
              style={{
                // Mobile: one pillar at a time
                minWidth: "clamp(260px, 85vw, 300px)",
                scrollSnapAlign: "start",
                flex: "1 0 auto",
              }}
            >
              <KanbanPillar
                status={pillar}
                tasks={filteredByPillar[pillar]}
                highlightedTaskId={highlightedId}
                shakenTaskId={shakenTaskId}
                onDrop={handleDrop}
                onCardClick={handleCardClick}
                onMoveRequest={handleMoveRequest}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Modals & drawers ──────────────────────────────────────────────── */}

      <InReviewModal
        open={inReviewOpen}
        onConfirm={handleInReviewConfirm}
        onCancel={handleInReviewCancel}
      />

      <TaskDetailDrawer
        open={!!detailTask}
        task={detailTask}
        onClose={() => setDetailTask(null)}
        onSave={handleSaveContribution}
      />

      <AddContributionDrawer
        open={addContributionOpen}
        onClose={() => setAddContributionOpen(false)}
        eventId={selectedEventId}
        onSuccess={() => void refetchTasks()}
      />

      <ReflectionDrawer
        open={reflectionDrawerOpen}
        onClose={() => setReflectionDrawerOpen(false)}
      />

      {/* Mobile: tap-to-move bottom sheet */}
      {moveSheetTask && (
        <>
          <div
            onClick={() => setMoveSheetTask(null)}
            style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(28,58,43,0.40)" }}
          />
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 60,
              background: "var(--cream-white)",
              borderRadius: "24px 24px 0 0",
              padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
              boxShadow: "0 -8px 32px rgba(28,58,43,0.15)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                background: "rgba(140,140,140,0.25)",
                borderRadius: "99px",
                margin: "0 auto 16px",
              }}
            />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--charcoal-ink)",
                marginBottom: "12px",
              }}
            >
              Move to:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {ALLOWED_MEMBER_TRANSITIONS[moveSheetTask.pillarStatus].map((target) => (
                <button
                  key={target}
                  onClick={() => handleMobileMoveConfirm(target)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(74,124,89,0.20)",
                    background: "rgba(74,124,89,0.06)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "var(--bamboo-green)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s",
                  }}
                >
                  {PILLAR_LABELS[target]}
                </button>
              ))}
              {ALLOWED_MEMBER_TRANSITIONS[moveSheetTask.pillarStatus].length === 0 && (
                <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "var(--stone-grey)", textAlign: "center", padding: "12px" }}>
                  No valid moves available
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function MemberKanbanPage() {
  return (
    <Suspense>
      <KanbanBoard />
    </Suspense>
  );
}
