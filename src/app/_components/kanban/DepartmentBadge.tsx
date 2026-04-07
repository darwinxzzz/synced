import type { CSSProperties } from "react";

const DEPT_COLORS: Record<string, { bg: string; color: string }> = {
  software:   { bg: "rgba(74,124,89,0.15)",   color: "var(--bamboo-green)" },
  inspire:    { bg: "rgba(196,163,90,0.15)",   color: "var(--accent-gold)" },
  "meet-ups": { bg: "rgba(168,197,160,0.25)",  color: "var(--deep-forest)" },
  meetups:    { bg: "rgba(168,197,160,0.25)",  color: "var(--deep-forest)" },
  publicity:  { bg: "rgba(212,145,74,0.15)",   color: "var(--deadline-amber)" },
  connectors: { bg: "rgba(28,58,43,0.10)",     color: "var(--deep-forest)" },
  labs:       { bg: "rgba(61,139,94,0.15)",    color: "var(--deadline-green)" },
};

const DEFAULT_COLOR = { bg: "rgba(140,140,140,0.12)", color: "var(--stone-grey)" };

interface DepartmentBadgeProps {
  department: string;
  style?: CSSProperties;
}

export function DepartmentBadge({ department, style }: DepartmentBadgeProps) {
  const key = department.toLowerCase().trim();
  const colors = DEPT_COLORS[key] ?? DEFAULT_COLOR;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "99px",
        background: colors.bg,
        color: colors.color,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {department}
    </span>
  );
}
