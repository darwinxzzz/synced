"use client";

import { useRef, useState } from "react";
import { Calendar } from "lucide-react";
import { DepartmentBadge } from "./DepartmentBadge";
import { PriorityLabel } from "./PriorityLabel";

export interface KanbanTask {
  id: string;
  name: string;
  department: string;
  priority: "low" | "medium" | "high";
  pillarStatus: "new" | "in_progress" | "in_review" | "done";
  deadline: Date | null;
  assignedBy: string;
  contributionId: string | null;
  description: string;
  outcome: string;
  changes: string;
  challengesFaced: string;
  isEditable: boolean;
}

interface KanbanCardProps {
  task: KanbanTask;
  highlighted?: boolean;
  onDragStart?: (taskId: string) => void;
  onClick?: (task: KanbanTask) => void;
  /** Mobile: tap-to-move handler */
  onMoveRequest?: (task: KanbanTask) => void;
  /** Shake the card (blocked drag feedback) */
  shake?: boolean;
}

function formatDeadline(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isUrgent(date: Date | null): boolean {
  if (!date) return false;
  const diff = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= 7;
}

export function KanbanCard({
  task,
  highlighted,
  onDragStart,
  onClick,
  onMoveRequest,
  shake,
}: KanbanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const isDone = task.pillarStatus === "done";
  const urgent = isUrgent(task.deadline);

  const handleClick = () => {
    if (onClick) onClick(task);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isDone) {
      e.preventDefault();
      return;
    }
    setDragging(true);
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
    if (onDragStart) onDragStart(task.id);
  };

  const handleDragEnd = () => setDragging(false);

  return (
    <div
      ref={cardRef}
      draggable={!isDone}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={[
        "card-shadow",
        shake ? "kanban-shake" : "",
        highlighted ? "kanban-highlight" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        background: "var(--cream-white)",
        borderRadius: "12px",
        padding: "14px",
        minHeight: "80px",
        cursor: isDone ? "default" : "grab",
        opacity: dragging ? 0.5 : 1,
        transition: "transform 0.15s ease, opacity 0.15s ease",
        borderLeft: isDone ? "3px solid var(--deadline-green)" : "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!isDone) (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* Row 1: Dept badge + priority */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
        <DepartmentBadge department={task.department} />
        <PriorityLabel priority={task.priority} />
      </div>

      {/* Row 2: Task name */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--charcoal-ink)",
          lineHeight: 1.4,
          marginBottom: "8px",
        }}
      >
        {task.name || "Untitled task"}
      </p>

      {/* Row 3: Deadline + assigned by */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {task.deadline && (
          <>
            <Calendar
              size={12}
              color={urgent ? "var(--deadline-red)" : "var(--stone-grey)"}
              className={urgent ? "deadline-pulse" : ""}
            />
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                color: urgent ? "var(--deadline-red)" : "var(--stone-grey)",
                fontWeight: urgent ? 600 : 400,
              }}
            >
              {formatDeadline(task.deadline)}
            </span>
            <span style={{ color: "var(--stone-grey)", fontSize: "11px" }}>·</span>
          </>
        )}
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            color: "var(--stone-grey)",
          }}
        >
          Assigned by {task.assignedBy}
        </span>

        {/* Mobile: tap-to-move button */}
        {!isDone && onMoveRequest && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveRequest(task);
            }}
            className="md:hidden"
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--bamboo-green)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              padding: "2px 6px",
            }}
          >
            Move →
          </button>
        )}
      </div>

      {/* Done lock indicator */}
      {isDone && (
        <div
          style={{
            marginTop: "8px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ fontSize: "11px", color: "var(--deadline-green)", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>
            ✓ Completed
          </span>
        </div>
      )}
    </div>
  );
}
