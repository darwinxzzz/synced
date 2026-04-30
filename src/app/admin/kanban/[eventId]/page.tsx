"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { createClient } from "~/lib/supabase/client";
import { applyAdminOptimisticMove } from "~/lib/optimistic-updates";
import { AdminTaskCard, type AdminTask } from "~/app/_components/admin/AdminTaskCard";
import { TaskDetailDrawer } from "~/app/_components/kanban/TaskDetailDrawer";
import { NewTaskModal } from "~/app/_components/kanban/NewTaskModal";
import type { KanbanTask } from "~/app/_components/kanban/KanbanCard";

type PillarStatus = "new" | "in_progress" | "in_review" | "done";

const PILLARS: PillarStatus[] = ["new", "in_progress", "in_review", "done"];

const PILLAR_CONFIG: Record<PillarStatus, { label: string; dotColor: string }> = {
  new:         { label: "New",         dotColor: "var(--stone-grey)" },
  in_progress: { label: "In Progress", dotColor: "var(--deadline-amber)" },
  in_review:   { label: "In Review",   dotColor: "var(--bamboo-green)" },
  done:        { label: "Done",        dotColor: "var(--deep-forest)" },
};

interface FilterState {
  department: string;
  search: string;
}

export default function AdminOpenBoardPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [mobilePillar, setMobilePillar] = useState<PillarStatus>("new");
  const [dragOverPillar, setDragOverPillar] = useState<PillarStatus | null>(null);
  const [detailTask, setDetailTask] = useState<KanbanTask | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ department: "", search: "" });
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = api.kanban.getOpenBoard.useQuery({ eventId }, { enabled: !!eventId });
  const utils = api.useUtils();

  const adminMoveTask = api.kanban.adminMoveTask.useMutation({
    onMutate: async ({ eventMemberId, newStatus }) => {
      await utils.kanban.getOpenBoard.cancel({ eventId });
      const prev = utils.kanban.getOpenBoard.getData({ eventId });
      utils.kanban.getOpenBoard.setData({ eventId }, (old) => {
        if (!old) return old;
        return { ...old, tasks: applyAdminOptimisticMove(old.tasks, eventMemberId, newStatus) };
      });
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) utils.kanban.getOpenBoard.setData({ eventId }, ctx.prev);
      toast.error(err.message);
    },
    onSettled: () => void refetch(),
  });

  // Realtime subscription
  useEffect(() => {
    if (!eventId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`kanban-${eventId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "event_members" }, () => {
        void refetch();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [eventId, refetch]);

  const allTasks = useMemo<AdminTask[]>(() => data?.tasks ?? [], [data?.tasks]);

  // Unique departments for filter
  const departments = useMemo(
    () => [...new Set(allTasks.map((t) => t.department).filter(Boolean))].sort(),
    [allTasks]
  );

  // Apply filters
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (filters.department && t.department !== filters.department) return false;
      if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !t.assigneeName.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [allTasks, filters]);

  const tasksByPillar = useMemo(() => {
    const grouped: Record<PillarStatus, AdminTask[]> = { new: [], in_progress: [], in_review: [], done: [] };
    for (const t of filteredTasks) {
      grouped[t.pillarStatus].push(t);
    }
    return grouped;
  }, [filteredTasks]);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: PillarStatus) => {
      e.preventDefault();
      setDragOverPillar(null);
      const taskId = e.dataTransfer.getData("taskId");
      if (!taskId) return;
      adminMoveTask.mutate({ eventMemberId: taskId, newStatus: targetStatus });
    },
    [adminMoveTask]
  );

  const handleCardClick = (task: AdminTask) => {
    // Map AdminTask → KanbanTask shape expected by TaskDetailDrawer
    const kanbanTask: KanbanTask = {
      id: task.id,
      name: task.name,
      department: task.department,
      priority: "medium",
      pillarStatus: task.pillarStatus,
      deadline: null,
      assignedBy: task.assigneeName,
      contributionId: null,
      isEditable: task.pillarStatus !== "done",
    };
    setDetailTask(kanbanTask);
  };

  const scrollToPillar = (status: PillarStatus) => {
    setMobilePillar(status);
    const idx = PILLARS.indexOf(status);
    if (scrollRef.current) {
      const w = scrollRef.current.scrollWidth / PILLARS.length;
      scrollRef.current.scrollTo({ left: idx * w, behavior: "smooth" });
    }
  };

  const eventName = data?.event.name ?? "Loading…";
  const formattedDate = data?.event.date
    ? new Date(data.event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ivory-paper)", paddingBottom: "40px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>

        {/* Breadcrumb */}
        <div style={{ paddingTop: "24px", marginBottom: "4px" }}>
          <Link
            href="/admin/kanban"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              color: "var(--stone-grey)",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bamboo-green)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--stone-grey)")}
          >
            <ArrowLeft size={12} />
            Back to Kanban
            {data && (
              <span style={{ color: "var(--sage-mist)", fontWeight: 400, letterSpacing: 0 }}>
                &nbsp;·&nbsp;{eventName.toUpperCase()}
              </span>
            )}
          </Link>
        </div>

        {/* Header */}
        <div style={{ paddingTop: "12px", paddingBottom: "24px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(24px, 4vw, 36px)",
              fontWeight: 700,
              color: "var(--deep-forest)",
              margin: "0 0 6px",
            }}
          >
            {eventName}
          </h1>
          {data && (
            <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "var(--stone-grey)", margin: 0 }}>
              {data.taskCount} task{data.taskCount !== 1 ? "s" : ""}
              {" · "}
              {data.deptCount} department{data.deptCount !== 1 ? "s" : ""}
              {formattedDate && ` · ${formattedDate}`}
            </p>
          )}

          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginTop: "16px",
              flexWrap: "wrap",
            }}
          >
            {/* Filter button */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  border: "1px solid rgba(28,58,43,0.20)",
                  background: filterOpen ? "rgba(28,58,43,0.06)" : "transparent",
                  color: "var(--deep-forest)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <SlidersHorizontal size={14} />
                Filter
                {(filters.department || filters.search) && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "var(--bamboo-green)",
                      flexShrink: 0,
                    }}
                  />
                )}
              </button>

              {filterOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 6px)",
                    left: 0,
                    zIndex: 100,
                    background: "var(--cream-white)",
                    borderRadius: "12px",
                    border: "1px solid rgba(140,140,140,0.15)",
                    boxShadow: "0 8px 24px rgba(28,58,43,0.12)",
                    padding: "16px",
                    minWidth: "240px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Sans'", fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--bamboo-green)", marginBottom: "6px" }}>
                      Search
                    </label>
                    <input
                      style={{ width: "100%", height: "36px", padding: "0 10px", borderRadius: "8px", border: "1px solid rgba(74,124,89,0.20)", background: "var(--ivory-paper)", fontFamily: "'DM Sans'", fontSize: "13px", color: "var(--charcoal-ink)", outline: "none", boxSizing: "border-box" }}
                      placeholder="Task or member name…"
                      value={filters.search}
                      onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: "'DM Sans'", fontSize: "10px", fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase", color: "var(--bamboo-green)", marginBottom: "6px" }}>
                      Department
                    </label>
                    <select
                      style={{ width: "100%", height: "36px", padding: "0 10px", borderRadius: "8px", border: "1px solid rgba(74,124,89,0.20)", background: "var(--ivory-paper)", fontFamily: "'DM Sans'", fontSize: "13px", color: "var(--charcoal-ink)", outline: "none", cursor: "pointer" }}
                      value={filters.department}
                      onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                    >
                      <option value="">All departments</option>
                      {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {(filters.department || filters.search) && (
                    <button
                      onClick={() => setFilters({ department: "", search: "" })}
                      style={{ background: "transparent", border: "none", fontFamily: "'DM Sans'", fontSize: "12px", color: "var(--stone-grey)", cursor: "pointer", textAlign: "left", padding: 0 }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setNewTaskOpen(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: "var(--deep-forest)",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bamboo-green)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--deep-forest)")}
            >
              <Plus size={14} />
              New Task
            </button>
          </div>
        </div>

        {/* Mobile pillar tab bar */}
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
          {PILLARS.map((p) => {
            const cfg = PILLAR_CONFIG[p];
            return (
              <button
                key={p}
                onClick={() => scrollToPillar(p)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "99px",
                  border: "none",
                  background: mobilePillar === p ? "var(--deep-forest)" : "rgba(140,140,140,0.10)",
                  color: mobilePillar === p ? "#fff" : "var(--stone-grey)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: mobilePillar === p ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: mobilePillar === p ? "#fff" : cfg.dotColor, flexShrink: 0 }} />
                {cfg.label}
                <span style={{ background: mobilePillar === p ? "rgba(255,255,255,0.20)" : "rgba(140,140,140,0.15)", borderRadius: "99px", padding: "1px 6px", fontSize: "10px" }}>
                  {tasksByPillar[p].length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Kanban board */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            paddingBottom: "16px",
          }}
        >
          {PILLARS.map((pillar) => {
            const cfg = PILLAR_CONFIG[pillar];
            const colTasks = tasksByPillar[pillar];
            const isOver = dragOverPillar === pillar;

            return (
              <div
                key={pillar}
                style={{
                  minWidth: "clamp(260px, 85vw, 300px)",
                  scrollSnapAlign: "start",
                  flex: "1 0 auto",
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "1px solid rgba(140,140,140,0.12)",
                  }}
                >
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: cfg.dotColor, flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "var(--stone-grey)",
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--cream-white)",
                      background: "var(--stone-grey)",
                      borderRadius: "99px",
                      padding: "1px 7px",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverPillar(pillar); }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverPillar(null);
                    }
                  }}
                  onDrop={(e) => handleDrop(e, pillar)}
                  className={isOver ? "kanban-drop-active" : ""}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    borderRadius: "12px",
                    padding: isOver ? "8px" : "0",
                    transition: "padding 0.15s ease",
                    minHeight: "120px",
                  }}
                >
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed var(--sage-mist)",
                        borderRadius: "12px",
                        padding: "28px 16px",
                        minHeight: "120px",
                      }}
                    >
                      <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", color: "var(--stone-grey)", textAlign: "center" }}>
                        No tasks here
                      </p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <AdminTaskCard
                        key={task.id}
                        task={task}
                        onClick={handleCardClick}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <TaskDetailDrawer
        open={!!detailTask}
        task={detailTask}
        onClose={() => setDetailTask(null)}
      />

      <NewTaskModal
        open={newTaskOpen}
        eventId={eventId}
        onClose={() => setNewTaskOpen(false)}
        onSuccess={() => void refetch()}
      />

      {/* Close filter dropdown on outside click */}
      {filterOpen && (
        <div
          onClick={() => setFilterOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 99 }}
        />
      )}
    </div>
  );
}
