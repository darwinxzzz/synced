import Link from "next/link"
import Image from "next/image"
import { Megaphone, Code2, Lightbulb, Link2, CalendarDays, FolderOpen } from "lucide-react"

const DEPT_ICONS: Record<string, React.ElementType> = {
  Publicity:    Megaphone,
  Software:     Code2,
  Inspire:      Lightbulb,
  Connectors:   Link2,
  "Meet-ups":   CalendarDays,
  Labs:         Code2,
}

const DEPT_COLORS: Record<string, string> = {
  Publicity:    "var(--accent-gold)",
  Software:     "var(--bamboo-green)",
  Inspire:      "var(--deadline-amber)",
  Connectors:   "#7C4A9C",
  "Meet-ups":   "var(--deadline-red)",
  Labs:         "var(--bamboo-green)",
}

function formatDue(date: Date): string {
  const days = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days < 0)  return `${Math.abs(days)}d overdue`
  if (days === 0) return "Due today"
  if (days === 1) return "Due tomorrow"
  return `Due in ${days}d`
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

interface PendingSubmissionItemProps {
  taskId:            string
  eventId:           string
  taskName:          string
  eventName:         string
  memberName:        string
  department:        string
  dueAt:             Date
  assigneeAvatarUrl: string | null
}

export function PendingSubmissionItem({
  eventId,
  taskName,
  eventName,
  memberName,
  department,
  dueAt,
  assigneeAvatarUrl,
}: PendingSubmissionItemProps) {
  const Icon      = DEPT_ICONS[department] ?? FolderOpen
  const iconColor = DEPT_COLORS[department] ?? "var(--bamboo-green)"

  return (
    <Link
      href={`/admin/kanban/${eventId}`}
      className="flex items-center gap-3 py-3.5 border-b last:border-b-0 group transition-colors"
      style={{ borderColor: "rgba(45,45,45,0.07)" }}
    >
      {/* Dept icon badge */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}18` }}
      >
        <Icon size={16} style={{ color: iconColor }} />
      </div>

      {/* Task + event info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate leading-snug"
          style={{ color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {taskName}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--stone-grey)" }}>
          {eventName}
          <span className="mx-1">·</span>
          <span
            style={{
              color: dueAt < new Date() ? "var(--deadline-red)" : "var(--stone-grey)",
              fontWeight: dueAt < new Date() ? 600 : 400,
            }}
          >
            {formatDue(dueAt)}
          </span>
        </p>
      </div>

      {/* Assignee avatar */}
      <div
        className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center border"
        style={{
          borderColor:     "var(--sage-mist)",
          backgroundColor: assigneeAvatarUrl ? "transparent" : "var(--bamboo-green)",
        }}
      >
        {assigneeAvatarUrl ? (
          <Image
            src={assigneeAvatarUrl}
            alt={memberName}
            width={28}
            height={28}
            className="object-cover w-full h-full"
          />
        ) : (
          <span
            style={{
              color:       "#fff",
              fontSize:    10,
              fontWeight:  700,
              fontFamily:  "'DM Sans', sans-serif",
              lineHeight:  1,
            }}
          >
            {getInitials(memberName)}
          </span>
        )}
      </div>
    </Link>
  )
}
