import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { DeadlineBadge } from "~/app/_components/shared/DeadlineBadge"

interface AdminEventCardProps {
  id:            string
  name:          string
  description:   string
  coverUrl:      string | null
  deadline:      Date | null
  progress:      number
  memberAvatars: string[]
  totalMembers:  number
}

function daysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function AdminEventCard({
  id,
  name,
  description,
  coverUrl,
  deadline,
  progress,
  memberAvatars,
  totalMembers,
}: AdminEventCardProps) {
  const daysAway = deadline ? daysUntil(deadline) : null
  const overflow = Math.max(totalMembers - memberAvatars.length, 0)

  return (
    <Link
      href={`/admin/kanban/${id}`}
      className="group rounded-2xl overflow-hidden card-shadow flex flex-col transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
    >
      {/* Cover photo */}
      <div className="relative w-full aspect-video bg-neutral-100 overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: "var(--sage-mist)" }} />
        )}

        {/* Deadline badge — top-right overlay */}
        {daysAway !== null && (
          <div className="absolute top-3 right-3">
            <DeadlineBadge daysAway={daysAway} />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3
            className="text-sm font-semibold leading-snug truncate"
            style={{ color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif" }}
          >
            {name}
          </h3>
          {description && (
            <p
              className="text-xs mt-0.5 line-clamp-2 leading-relaxed"
              style={{ color: "var(--stone-grey)" }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--sage-mist)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width:           `${Math.min(Math.max(progress, 0), 100)}%`,
              backgroundColor: "var(--bamboo-green)",
            }}
          />
        </div>

        {/* Footer: avatar stack + chevron */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Avatar stack */}
            <div className="flex -space-x-2">
              {memberAvatars.map((url, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full overflow-hidden border-2 shrink-0"
                  style={{ borderColor: "var(--ivory-paper)" }}
                >
                  <Image
                    src={url}
                    alt=""
                    width={28}
                    height={28}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </div>

            {/* Overflow pill */}
            {overflow > 0 && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "var(--sage-mist)",
                  color:           "var(--deep-forest)",
                }}
              >
                +{overflow}
              </span>
            )}
          </div>

          <ChevronRight
            size={16}
            className="shrink-0 opacity-30 group-hover:opacity-70 transition-opacity"
            style={{ color: "var(--stone-grey)" }}
          />
        </div>
      </div>
    </Link>
  )
}
