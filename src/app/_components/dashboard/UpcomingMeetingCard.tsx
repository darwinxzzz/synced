import { Calendar, Clock } from "lucide-react"

interface MemberProfile {
  id: string
  name: string | null
  avatar_url: string | null
}

interface EventMember {
  profiles: MemberProfile | null
}

interface UpcomingMeetingCardProps {
  event: {
    id: string
    name: string
    date: string | null
    start_time: string | null
    end_time?: string | null
    event_members?: EventMember[]
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "TBD"
  return new Date(dateStr).toLocaleDateString("en-SG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatTime(timeStr: string | null): string {
  if (!timeStr) return ""
  const [h, m] = timeStr.split(":")
  const hour = parseInt(h ?? "0", 10)
  const ampm = hour >= 12 ? "PM" : "AM"
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function UpcomingMeetingCard({ event }: UpcomingMeetingCardProps) {
  const members = (event.event_members ?? [])
    .map((em) => em.profiles)
    .filter(Boolean) as MemberProfile[]

  const visible = members.slice(0, 5)
  const overflow = members.length - 5

  return (
    <div
      className="rounded-2xl p-5 card-shadow flex flex-col gap-4"
      style={{ backgroundColor: "var(--cream-white)" }}
    >
      <p className="bamboo-label" style={{ color: "var(--stone-grey)" }}>
        Upcoming Meeting
      </p>

      <p
        className="text-lg font-semibold leading-snug"
        style={{ color: "var(--charcoal-ink)", fontFamily: "'Playfair Display', serif" }}
      >
        {event.name}
      </p>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: "var(--bamboo-green)" }} />
          <span className="text-sm" style={{ color: "var(--stone-grey)" }}>
            {formatDate(event.date)}
          </span>
        </div>

        {event.start_time && (
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: "var(--bamboo-green)" }} />
            <span className="text-sm" style={{ color: "var(--stone-grey)" }}>
              {formatTime(event.start_time)}
              {event.end_time ? ` – ${formatTime(event.end_time)}` : ""}
            </span>
          </div>
        )}
      </div>

      {visible.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {visible.map((m) => (
              <div
                key={m.id}
                className="w-7 h-7 rounded-full border-2 overflow-hidden flex items-center justify-center text-[10px] font-semibold shrink-0"
                style={{
                  borderColor: "var(--cream-white)",
                  backgroundColor: "var(--sage-mist)",
                  color: "var(--deep-forest)",
                }}
                title={m.name ?? "Member"}
              >
                {m.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatar_url} alt={m.name ?? "Member"} className="w-full h-full object-cover" />
                ) : (
                  getInitials(m.name)
                )}
              </div>
            ))}
          </div>
          {overflow > 0 && (
            <span className="text-xs ml-1" style={{ color: "var(--stone-grey)" }}>
              +{overflow} more
            </span>
          )}
        </div>
      )}

      {members.length === 0 && (
        <p className="text-xs" style={{ color: "var(--stone-grey)" }}>
          No members assigned yet
        </p>
      )}
    </div>
  )
}
