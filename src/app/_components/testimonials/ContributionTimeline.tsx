"use client";

import type { ReflectionItem } from "~/app/_components/shared/ReflectionDetailModal";

interface ContributionEntry {
  id: string;
  title: string;
  date: string | null;
  description?: string | null;
  reflection: ReflectionItem | null;
}

interface ContributionTimelineProps {
  entries: ContributionEntry[];
  onSelectReflection: (reflection: ReflectionItem) => void;
}

export function ContributionTimeline({ entries, onSelectReflection }: ContributionTimelineProps) {
  if (entries.length === 0) return null;

  return (
    <div>
      <span className="bamboo-label" style={{ marginBottom: "28px", display: "block" }}>
        Contribution History
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {entries.map((entry, idx) => {
          const dateStr = entry.date
            ? new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : "—";
          const isLast = idx === entries.length - 1;
          const hasReflection = !!entry.reflection;

          return (
            <div key={entry.id} style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
              {/* Date */}
              <div style={{ width: "100px", flexShrink: 0, paddingTop: "4px", paddingRight: "16px", textAlign: "right" }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "var(--stone-grey)" }}>
                  {dateStr}
                </span>
              </div>

              {/* Timeline dot + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--bamboo-green)", flexShrink: 0, marginTop: "4px" }} />
                {!isLast && (
                  <div style={{ width: "2px", flex: 1, background: "var(--bamboo-green)", opacity: 0.25, minHeight: "24px" }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingLeft: "16px", paddingBottom: isLast ? "0" : "28px", paddingTop: "2px" }}>
                <button
                  onClick={() => { if (hasReflection) onSelectReflection(entry.reflection!); }}
                  aria-label={hasReflection ? `View reflection for ${entry.title}` : entry.title}
                  style={{ background: "none", border: "none", padding: "0", textAlign: "left", cursor: hasReflection ? "pointer" : "default", width: "100%" }}
                >
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: hasReflection ? "var(--bamboo-green)" : "var(--charcoal-ink)", marginBottom: "4px", textDecoration: hasReflection ? "underline" : "none", textDecorationColor: "rgba(74,124,89,0.4)" }}>
                    {entry.title}
                    {hasReflection && (
                      <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: 400, color: "var(--stone-grey)" }}>
                        (view reflection)
                      </span>
                    )}
                  </p>
                  {entry.description && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", lineHeight: 1.6 }}>
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
