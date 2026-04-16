"use client";

import Image from "next/image";

export interface AdminTask {
  id: string;
  name: string;
  department: string;
  pillarStatus: "new" | "in_progress" | "in_review" | "done";
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string | null;
}

interface AdminTaskCardProps {
  task: AdminTask;
  onClick: (task: AdminTask) => void;
  dragging?: boolean;
}

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  publicity:   { bg: "rgba(139,92,246,0.10)",  color: "#7c3aed" },
  inspire:     { bg: "rgba(59,130,246,0.10)",   color: "#2563eb" },
  logistics:   { bg: "rgba(249,115,22,0.10)",   color: "#c2410c" },
  operations:  { bg: "rgba(16,185,129,0.10)",   color: "#047857" },
  finance:     { bg: "rgba(245,158,11,0.10)",   color: "#b45309" },
  marketing:   { bg: "rgba(236,72,153,0.10)",   color: "#be185d" },
};

const STATUS_DOT: Record<string, string> = {
  new:        "var(--stone-grey)",
  in_progress: "var(--deadline-amber)",
  in_review:  "var(--bamboo-green)",
  done:       "var(--deep-forest)",
};

function DepartmentBadge({ dept }: { dept: string }) {
  const key = dept.toLowerCase().replace(/\s+/g, "");
  const style = DEPT_COLORS[key] ?? { bg: "rgba(140,140,140,0.10)", color: "var(--stone-grey)" };
  return (
    <span
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "9px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: "6px",
        background: style.bg,
        color: style.color,
        whiteSpace: "nowrap",
      }}
    >
      {dept}
    </span>
  );
}

export function AdminTaskCard({ task, onClick, dragging }: AdminTaskCardProps) {
  const dotColor = STATUS_DOT[task.pillarStatus] ?? "var(--stone-grey)";
  const initials = task.assigneeName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClick(task)}
      className="card-shadow"
      style={{
        background: "var(--cream-white)",
        borderRadius: "12px",
        padding: "13px 14px",
        border: "1px solid rgba(140,140,140,0.12)",
        cursor: "grab",
        opacity: dragging ? 0.5 : 1,
        transition: "box-shadow 0.15s, opacity 0.15s",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 12px rgba(28,58,43,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
    >
      {/* Dept badge */}
      <DepartmentBadge dept={task.department || "General"} />

      {/* Task name */}
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--charcoal-ink)",
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        {task.name || "Untitled task"}
      </p>

      {/* Assignee row */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        {task.assigneeAvatar ? (
          <div
            style={{
              position: "relative",
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              border: "1.5px solid var(--sage-mist)",
            }}
          >
            <Image src={task.assigneeAvatar} alt="" fill style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              background: "var(--sage-mist)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              color: "var(--deep-forest)",
            }}
          >
            {initials || "?"}
          </div>
        )}
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            color: "var(--stone-grey)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          Assigned: {task.assigneeName}
        </span>

        {/* Status dot */}
        <div
          style={{
            marginLeft: "auto",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
}
