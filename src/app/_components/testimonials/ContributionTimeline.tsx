"use client";

import type { ReflectionItem } from "~/app/_components/shared/ReflectionDetailModal";

interface ContributionEntry {
  id: string;
  title: string;
  role?: string | null;
  date: string | null;
  description?: string | null;
  contributionCount?: number;
  reflection: ReflectionItem | null;
}

interface ContributionTimelineProps {
  entries: ContributionEntry[];
  onSelectReflection: (reflection: ReflectionItem) => void;
}

export function ContributionTimeline({
  entries,
  onSelectReflection,
}: ContributionTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <span
        className="bamboo-label"
        style={{ marginBottom: "28px", display: "block" }}
      >
        Contribution History
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {entries.map((entry, idx) => {
          const monthYear = entry.date
            ? new Date(entry.date).toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
              })
            : "—";
          const isLast = idx === entries.length - 1;
          const hasReflection = !!entry.reflection;
          const countLabel =
            entry.contributionCount != null
              ? `${entry.contributionCount} CONTRIBUTION${entry.contributionCount !== 1 ? "S" : ""}`
              : null;
          const header = entry.role
            ? `${entry.title} (${entry.role})`
            : entry.title;

          return (
            <div
              key={entry.id}
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: "0 32px",
                paddingBottom: isLast ? "0" : "40px",
              }}
            >
              {/* Left: date + count */}
              <div style={{ paddingTop: "2px" }}>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "14px",
                    fontStyle: "italic",
                    fontWeight: 600,
                    color: "var(--deep-forest)",
                    display: "block",
                    lineHeight: 1.3,
                  }}
                >
                  {monthYear}
                </span>
                {countLabel && (
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--stone-grey)",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    {countLabel}
                  </span>
                )}
              </div>

              {/* Right: title + description */}
              <div>
                <button
                  onClick={() => {
                    if (hasReflection) onSelectReflection(entry.reflection!);
                  }}
                  aria-label={
                    hasReflection
                      ? `View reflection for ${entry.title}`
                      : entry.title
                  }
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0",
                    textAlign: "left",
                    cursor: hasReflection ? "pointer" : "default",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "15px",
                      fontWeight: 700,
                      color: hasReflection
                        ? "var(--bamboo-green)"
                        : "var(--charcoal-ink)",
                      margin: 0,
                      lineHeight: 1.35,
                      textDecoration: hasReflection ? "underline" : "none",
                      textDecorationColor: "rgba(74,124,89,0.35)",
                      textUnderlineOffset: "2px",
                    }}
                  >
                    {header}
                    {hasReflection && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "11px",
                          fontWeight: 400,
                          color: "var(--stone-grey)",
                          fontStyle: "italic",
                          textDecoration: "none",
                        }}
                      >
                        view reflection ↗
                      </span>
                    )}
                  </p>
                  {entry.description && (
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        color: "var(--stone-grey)",
                        lineHeight: 1.7,
                        margin: 0,
                      }}
                    >
                      {entry.description}
                    </p>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
