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
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        border: "1px solid rgba(140,140,140,0.12)",
        transition: "box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(28,58,43,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
    >
      {/* Row 1: deadline badge + menu */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
      <div>
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
              color: "var(--stone-grey)",
              margin: "4px 0 0",
            }}
          >
            {formattedDate}
          </p>
        )}
      </div>

      {/* Row 3: 4-segment global progress bar — no labels */}
      <div
        style={{
          height: "6px",
          borderRadius: "99px",
          overflow: "hidden",
          display: "flex",
          background: "rgba(140,140,140,0.10)",
        }}
      >
        {segWidths.new > 0 && (
          <div style={{ width: `${segWidths.new}%`, background: "var(--stone-grey)", transition: "width 0.4s" }} />
        )}
        {segWidths.in_progress > 0 && (
          <div style={{ width: `${segWidths.in_progress}%`, background: "var(--deadline-amber)", transition: "width 0.4s" }} />
        )}
        {segWidths.in_review > 0 && (
          <div style={{ width: `${segWidths.in_review}%`, background: "var(--bamboo-green)", transition: "width 0.4s" }} />
        )}
        {segWidths.done > 0 && (
          <div style={{ width: `${segWidths.done}%`, background: "var(--deep-forest)", transition: "width 0.4s" }} />
        )}
      </div>

      {/* Row 4: clickable avatar stack + member count */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {event.memberProfiles.length > 0 && (
          <div style={{ display: "flex" }}>
            {event.memberProfiles.slice(0, 4).map((member, i) => (
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
                  marginLeft: i === 0 ? 0 : "-10px",
                  zIndex: 4 - i,
                  flexShrink: 0,
                  background: "var(--sage-mist)",
                  cursor: onAvatarClick ? "pointer" : "default",
                  padding: 0,
                  transition: "transform 0.15s, z-index 0s",
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
          </div>
        )}

        {event.totalMembers > 0 && (
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              color: "var(--stone-grey)",
            }}
          >
            {event.totalMembers} member{event.totalMembers !== 1 ? "s" : ""}
          </span>
        )}

        {event.allInReview && (
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 700,
              color: "var(--bamboo-green)",
              background: "rgba(74,124,89,0.10)",
              padding: "2px 7px",
              borderRadius: "6px",
            }}
          >
            All in Review
          </span>
        )}
      </div>

      {/* Row 5: OPEN BOARD only */}
      <Link
        href={`/admin/kanban/${event.id}`}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "9px 12px",
          borderRadius: "10px",
          border: "none",
          background: "var(--deep-forest)",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "12px",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textDecoration: "none",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bamboo-green)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--deep-forest)")}
      >
        OPEN BOARD →
      </Link>
    </div>
  );
}
