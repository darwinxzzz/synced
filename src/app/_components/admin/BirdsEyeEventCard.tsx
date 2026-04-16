"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
import type { MemberProfile } from "~/app/_components/shared/MemberProfileDrawer";

export interface BirdsEyeEvent {
  id: string;
  name: string;
  date: string | null;
  kanbanStatus: "new" | "in_progress" | "in_review" | "done";
  globalProgress: { new: number; in_progress: number; in_review: number; done: number };
  totalMembers: number;
  memberProfiles: MemberProfile[];
  allInReview: boolean;
  deadlineTag: "URGENT" | "IN VIEW" | "NEW";
  daysLeft: number | null;
}

interface BirdsEyeEventCardProps {
  event: BirdsEyeEvent;
  onAvatarClick?: (profile: MemberProfile) => void;
}

const DEADLINE_STYLE: Record<string, { bg: string; color: string }> = {
  URGENT:    { bg: "rgba(220,53,69,0.10)",  color: "var(--deadline-red)" },
  "IN VIEW": { bg: "rgba(255,193,7,0.12)",  color: "var(--deadline-amber)" },
  NEW:       { bg: "rgba(61,139,94,0.10)",  color: "var(--deadline-green)" },
};

export function BirdsEyeEventCard({ event, onAvatarClick }: BirdsEyeEventCardProps) {
  const total = event.totalMembers;
  const { new: nNew, in_progress: nProg, in_review: nRev, done: nDone } = event.globalProgress;
  const deadlineStyle = DEADLINE_STYLE[event.deadlineTag] ?? { bg: "rgba(61,139,94,0.10)", color: "var(--deadline-green)" };

  const segWidths = total > 0
    ? {
        new: (nNew / total) * 100,
        in_progress: (nProg / total) * 100,
        in_review: (nRev / total) * 100,
        done: (nDone / total) * 100,
      }
    : { new: 100, in_progress: 0, in_review: 0, done: 0 };

  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div
      className="card-shadow"
      style={{
        background: "var(--cream-white)",
        borderRadius: "20px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        border: "1px solid rgba(140,140,140,0.08)",
        transition: "box-shadow 0.2s, opacity 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(28,58,43,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
    >
      {/* Row 1: deadline badge + menu */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "6px",
            background: deadlineStyle.bg,
            color: deadlineStyle.color,
          }}
        >
          {event.deadlineTag}
          {event.daysLeft !== null && event.deadlineTag !== "NEW" && (
            <span style={{ fontWeight: 400, marginLeft: "4px" }}>{event.daysLeft}d</span>
          )}
        </span>

        <button
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--stone-grey)",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(140,140,140,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          aria-label="Event options"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Row 2: event name + date */}
      <div style={{ marginBottom: "16px" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "16px",
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--deep-forest)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {event.name}
        </h3>
        {formattedDate && (
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontStyle: "italic",
              color: "var(--stone-grey)",
              margin: "4px 0 0",
            }}
          >
            {formattedDate}
          </p>
        )}
      </div>

      {/* Row 3: GLOBAL PROGRESS label + mini status labels */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "8px" }}>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--bamboo-green)",
          }}
        >
          Global Progress
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          {(["NEW", "PROG", "REV", "DONE"] as const).map((lbl) => (
            <span
              key={lbl}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "7px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: lbl === "PROG" ? "var(--deep-forest)" : lbl === "DONE" ? "var(--bamboo-green)" : "rgba(140,140,140,0.55)",
              }}
            >
              {lbl}
            </span>
          ))}
        </div>
      </div>

      {/* Row 4: 4-segment global progress bar */}
      <div
        style={{
          height: "8px",
          borderRadius: "99px",
          overflow: "hidden",
          display: "flex",
          background: "rgba(140,140,140,0.10)",
          marginBottom: "16px",
        }}
      >
        {segWidths.new > 0 && (
          <div style={{ width: `${segWidths.new}%`, background: "var(--deep-forest)", transition: "width 0.4s" }} />
        )}
        {segWidths.in_progress > 0 && (
          <div style={{ width: `${segWidths.in_progress}%`, background: "var(--bamboo-green)", transition: "width 0.4s" }} />
        )}
        {segWidths.in_review > 0 && (
          <div style={{ width: `${segWidths.in_review}%`, background: "var(--sage-mist)", transition: "width 0.4s" }} />
        )}
        {segWidths.done > 0 && (
          <div style={{ width: `${segWidths.done}%`, background: "var(--stone-grey)", opacity: 0.5, transition: "width 0.4s" }} />
        )}
      </div>

      {/* Row 5: OPEN BOARD (left) + avatar stack (right) — separated by border-top */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: "14px",
          borderTop: "1px solid rgba(140,140,140,0.10)",
        }}
      >
        <Link
          href={`/admin/kanban/${event.id}`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "var(--deep-forest)",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bamboo-green)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--deep-forest)")}
        >
          Open Board →
        </Link>

        {/* Avatar stack with overflow indicator */}
        {event.memberProfiles.length > 0 && (
          <div style={{ display: "flex", alignItems: "center" }}>
            {event.memberProfiles.slice(0, 3).map((member, i) => (
              <button
                key={member.id}
                onClick={() => onAvatarClick?.(member)}
                aria-label={`View profile: ${member.name}`}
                title={member.name}
                style={{
                  position: "relative",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "2px solid var(--cream-white)",
                  overflow: "hidden",
                  marginLeft: i === 0 ? 0 : "-8px",
                  zIndex: 4 - i,
                  flexShrink: 0,
                  background: "var(--sage-mist)",
                  cursor: onAvatarClick ? "pointer" : "default",
                  padding: 0,
                  transition: "transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (onAvatarClick) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.15)";
                    (e.currentTarget as HTMLButtonElement).style.zIndex = "10";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.zIndex = String(4 - i);
                }}
              >
                {member.avatar_url ? (
                  <Image src={member.avatar_url} alt={member.name} fill style={{ objectFit: "cover" }} />
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      background: "var(--bamboo-green)",
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "8px",
                      fontWeight: 700,
                    }}
                  >
                    {member.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")}
                  </span>
                )}
              </button>
            ))}
            {event.totalMembers > 3 && (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "2px solid var(--cream-white)",
                  background: "var(--ivory-paper)",
                  marginLeft: "-8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "8px",
                  fontWeight: 700,
                  color: "var(--deep-forest)",
                  zIndex: 0,
                  flexShrink: 0,
                }}
              >
                +{event.totalMembers - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
