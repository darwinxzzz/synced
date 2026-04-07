import Link from "next/link"
import { ChevronRight, Megaphone, Code2, Lightbulb, Link2, CalendarDays, FolderOpen } from "lucide-react"
import { DeadlineBadge } from "~/app/_components/shared/DeadlineBadge"

const DEPT_ICONS: Record<string, React.ElementType> = {
  Publicity:           Megaphone,
  Software:            Code2,
  Engineering:         Code2,
  Inspire:             Lightbulb,
  Connectors:          Link2,
  "Monthly Meet-ups":  CalendarDays,
}

const DEPT_COLORS: Record<string, string> = {
  Publicity:           "var(--accent-gold)",
  Software:            "var(--bamboo-green)",
  Engineering:         "var(--bamboo-green)",
  Inspire:             "var(--deadline-amber)",
  Connectors:          "#7C4A9C",
  "Monthly Meet-ups":  "var(--deadline-red)",
}

function daysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

interface PendingMilestoneItemProps {
  taskId:       string
  department:   string
  task:         string
  eventName:    string
  eventDate:    string
  pillarStatus: string
}

export function PendingMilestoneItem({
  taskId,
  department,
  task,
  eventName,
  eventDate,
  pillarStatus,
}: PendingMilestoneItemProps) {
  const Icon      = DEPT_ICONS[department] ?? FolderOpen
  const iconColor = DEPT_COLORS[department] ?? "var(--bamboo-green)"
  const days      = daysUntil(eventDate)

  return (
    <Link
      href={`/member/kanban?taskId=${taskId}`}
      className="flex items-center gap-4 py-4 border-b last:border-b-0 transition-colors group"
      style={{ borderColor: "rgba(45,45,45,0.07)" }}
    >
      {/* dept icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}18` }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>

      {/* task + event */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold truncate"
          style={{ color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif" }}
        >
          {task}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: "var(--stone-grey)" }}>
          {eventName}
          <span
            className="ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "var(--sage-mist)", color: "var(--deep-forest)" }}
          >
            {pillarStatus}
          </span>
        </p>
      </div>

      <DeadlineBadge daysAway={days} />

      <ChevronRight
        size={16}
        className="shrink-0 opacity-30 group-hover:opacity-70 transition-opacity"
        style={{ color: "var(--stone-grey)" }}
      />
    </Link>
  )
}
