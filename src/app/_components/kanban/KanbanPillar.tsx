"use client";

import { useState } from "react";
import { Inbox, Clock, Eye, CheckCircle } from "lucide-react";
import { KanbanCard, type KanbanTask } from "./KanbanCard";

type PillarStatus = "new" | "in_progress" | "in_review" | "done";

const PILLAR_CONFIG: Record<
  PillarStatus,
  { label: string; Icon: typeof Inbox }
> = {
  new:         { label: "New",         Icon: Inbox },
  in_progress: { label: "In Progress", Icon: Clock },
  in_review:   { label: "In Review",   Icon: Eye },
  done:        { label: "Done",        Icon: CheckCircle },
};

interface KanbanPillarProps {
  status: PillarStatus;
  tasks: KanbanTask[];
  highlightedTaskId?: string | null;
  shakenTaskId?: string | null;
  onDrop: (taskId: string, targetStatus: PillarStatus) => void;
  onCardClick: (task: KanbanTask) => void;
  onMoveRequest?: (task: KanbanTask) => void;
}

export function KanbanPillar({
  status,
  tasks,
  highlightedTaskId,
  shakenTaskId,
  onDrop,
  onCardClick,
  onMoveRequest,
}: KanbanPillarProps) {
  const [isOver, setIsOver] = useState(false);
  const cfg = PILLAR_CONFIG[status];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the pillar entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) onDrop(taskId, status);
  };

  return (
    <div
      className="scroll-snap-align-start"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minWidth: "240px",
        maxWidth: "320px",
        // Mobile: full-width snap
      }}
    >
      {/* Pillar header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: "1px solid rgba(140,140,140,0.12)",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
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
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={isOver ? "kanban-drop-active" : ""}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          borderRadius: "12px",
          padding: isOver ? "8px" : "0",
          transition: "padding 0.15s ease",
          minHeight: "120px",
        }}
      >
        {tasks.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              border: "2px dashed var(--sage-mist)",
              borderRadius: "12px",
              padding: "28px 16px",
              minHeight: "120px",
            }}
          >
            <cfg.Icon size={20} color="var(--stone-grey)" />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: "var(--stone-grey)",
                textAlign: "center",
              }}
            >
              No tasks here yet
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              highlighted={highlightedTaskId === task.id}
              shake={shakenTaskId === task.id}
              onClick={onCardClick}
              onMoveRequest={onMoveRequest}
            />
          ))
        )}
      </div>
    </div>
  );
}
