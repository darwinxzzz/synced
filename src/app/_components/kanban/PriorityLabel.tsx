import type { CSSProperties } from "react";

type Priority = "low" | "medium" | "high";

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "var(--deadline-green)" },
  medium: { label: "Medium", color: "var(--deadline-amber)" },
  high:   { label: "High",   color: "var(--deadline-red)" },
};

interface PriorityLabelProps {
  priority: Priority;
  style?: CSSProperties;
}

export function PriorityLabel({ priority, style }: PriorityLabelProps) {
  const cfg = PRIORITY_CONFIG[priority];

  return (
    <span
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "11px",
        fontWeight: 600,
        color: cfg.color,
        letterSpacing: "0.04em",
        ...style,
      }}
    >
      {cfg.label}
    </span>
  );
}
