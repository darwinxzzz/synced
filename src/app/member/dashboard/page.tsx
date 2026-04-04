"use client"

import { CheckSquare, TrendingUp, Clock } from "lucide-react"
import { api } from "~/trpc/react"
import { KPICard } from "~/app/_components/dashboard/KPICard"
import { PendingMilestoneItem } from "~/app/_components/dashboard/PendingMilestoneItem"
import { UpcomingMeetingCard } from "~/app/_components/dashboard/UpcomingMeetingCard"

function deadlineColor(daysAway: number | undefined): string {
  if (daysAway === undefined) return "var(--charcoal-ink)"
  if (daysAway <= 7)  return "var(--deadline-red)"
  if (daysAway <= 14) return "var(--deadline-amber)"
  return "var(--deadline-green)"
}

// ─── Skeleton placeholders ──────────────────────────────────────────────────
function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-6 card-shadow h-36 animate-pulse"
          style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
        />
      ))}
    </div>
  )
}

function MilestonesSkeleton() {
  return (
    <div className="flex flex-col">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-16 rounded-lg animate-pulse my-1"
          style={{ backgroundColor: "rgba(168,197,160,0.15)" }}
        />
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function MemberDashboard() {
  const kpisQuery       = api.dashboard.getMemberKPIs.useQuery()
  const milestonesQuery = api.dashboard.getPendingMilestones.useQuery()
  const meetingQuery    = api.dashboard.getUpcomingMeeting.useQuery()

  const kpis       = kpisQuery.data
  const milestones = milestonesQuery.data ?? []
  const meeting    = meetingQuery.data

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--ivory-paper)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <p className="bamboo-label" style={{ color: "var(--bamboo-green)" }}>
            MEMBER DASHBOARD
          </p>
          <h1
            className="text-3xl sm:text-4xl leading-tight"
            style={{ color: "var(--charcoal-ink)", fontFamily: "'Playfair Display', serif" }}
          >
            Personal Workspace
          </h1>
          <p
            className="text-sm max-w-xl leading-relaxed italic"
            style={{ color: "var(--stone-grey)" }}
          >
            Focus on the path ahead. Every small action is a brushstroke on the canvas of our shared mission.
          </p>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        {kpisQuery.isPending ? (
          <KPISkeleton />
        ) : kpisQuery.isError ? (
          <p className="text-sm" style={{ color: "var(--deadline-red)" }}>
            Could not load KPIs. Please refresh.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPICard
              label="REMAINING TASKS"
              value={kpis?.remainingTasks ?? 0}
              description="tasks pending across all active events"
              icon={<CheckSquare size={20} style={{ color: "var(--bamboo-green)" }} />}
            />
            <KPICard
              label="COMPLETION RATE"
              value={`${kpis?.completionRate ?? 0}%`}
              description="ahead of your quarterly milestone goal"
              showProgress
              progressValue={kpis?.completionRate ?? 0}
              accentColor="var(--bamboo-green)"
              icon={<TrendingUp size={20} style={{ color: "var(--bamboo-green)" }} />}
            />
            <KPICard
              label="NEXT DEADLINE"
              value={
                kpis?.nextDeadline
                  ? `${kpis.nextDeadline.days_away}d`
                  : "—"
              }
              description={kpis?.nextDeadline?.event_name ?? "No upcoming deadlines"}
              accentColor={deadlineColor(kpis?.nextDeadline?.days_away)}
              icon={<Clock size={20} style={{ color: deadlineColor(kpis?.nextDeadline?.days_away) }} />}
            />
          </div>
        )}

        {/* ── Body: Milestones + Meeting ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3 — Pending Milestones ─────────────────────────────── */}
          <div
            className="lg:col-span-2 rounded-2xl p-6 card-shadow"
            style={{
              backgroundColor: "rgba(250,250,247,0.85)",
              backdropFilter:  "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--charcoal-ink)", fontFamily: "'Playfair Display', serif" }}
              >
                Your Upcoming Contributions
              </h2>
              {milestones.length > 0 && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--sage-mist)",
                    color: "var(--deep-forest)",
                  }}
                >
                  {milestones.length} pending
                </span>
              )}
            </div>
            <p className="text-xs mb-5" style={{ color: "var(--stone-grey)" }}>
              Click any task to open it in your Kanban board.
            </p>

            {milestonesQuery.isPending ? (
              <MilestonesSkeleton />
            ) : milestonesQuery.isError ? (
              <p className="text-sm py-4" style={{ color: "var(--deadline-red)" }}>
                Could not load milestones.
              </p>
            ) : milestones.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-2xl mb-2">🎋</p>
                <p className="text-sm font-medium" style={{ color: "var(--charcoal-ink)" }}>
                  All caught up
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--stone-grey)" }}>
                  No pending milestones right now.
                </p>
              </div>
            ) : (
              <div>
                {milestones.map((m, i) => (
                  <PendingMilestoneItem
                    key={`${m.event_id}-${i}`}
                    department={m.department}
                    task={m.task}
                    eventName={m.event_name}
                    eventId={m.event_id}
                    eventDate={m.event_date}
                    pillarStatus={m.pillar_status}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right 1/3 — Upcoming Meeting ──────────────────────────────── */}
          <div className="lg:col-span-1">
            {meetingQuery.isPending ? (
              <div
                className="rounded-2xl p-6 card-shadow h-52 animate-pulse"
                style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
              />
            ) : meeting ? (
              <UpcomingMeetingCard event={meeting} />
            ) : (
              <div
                className="rounded-2xl p-6 card-shadow"
                style={{
                  backgroundColor: "rgba(250,250,247,0.85)",
                  backdropFilter:  "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <p className="bamboo-label mb-3" style={{ color: "var(--stone-grey)" }}>
                  UPCOMING MEETING
                </p>
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">📅</p>
                  <p className="text-sm" style={{ color: "var(--stone-grey)" }}>
                    No active events scheduled.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
