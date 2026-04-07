"use client"

import { useState } from "react"
import { api } from "~/trpc/react"
import { KPICard } from "~/app/_components/dashboard/KPICard"
import { PendingMilestoneItem } from "~/app/_components/dashboard/PendingMilestoneItem"
import { UpcomingMeetingCard } from "~/app/_components/dashboard/UpcomingMeetingCard"
import { DailyReflectionCard } from "~/app/_components/dashboard/DailyReflectionCard"

// ─── Skeleton placeholders ──────────────────────────────────────────────────
function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        className="col-span-2 rounded-2xl p-6 card-shadow h-36 animate-pulse"
        style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
      />
      {[2, 3].map((i) => (
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
  const [reflectionOpen, setReflectionOpen] = useState(false)

  const kpisQuery       = api.dashboard.getMemberKPIs.useQuery()
  const milestonesQuery = api.dashboard.getPendingMilestones.useQuery()
  const meetingQuery    = api.dashboard.getUpcomingMeeting.useQuery()
  const streakQuery     = api.dashboard.getReflectionStreak.useQuery()

  const kpis          = kpisQuery.data
  const milestones    = milestonesQuery.data ?? []
  const meeting       = meetingQuery.data
  const streakPercent = streakQuery.data?.streakPercent ?? 0

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--ivory-paper)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="space-y-2 mb-8">
          <p className="bamboo-label">PERSONAL WORKSPACE</p>
          <h1
            className="text-4xl leading-tight italic"
            style={{
              color: "var(--charcoal-ink)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Your Upcoming Contributions
          </h1>
          <p
            className="text-sm max-w-prose leading-relaxed"
            style={{ color: "var(--stone-grey)" }}
          >
            Focus on the path ahead. Every small action is a brushstroke on the canvas of our shared mission.
          </p>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          {kpisQuery.isPending ? (
            <KPISkeleton />
          ) : kpisQuery.isError ? (
            <p className="text-sm" style={{ color: "var(--deadline-red)" }}>
              Could not load KPIs. Please refresh.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 — Sustained Progress (spans 2 cols: full-width mobile, half desktop) */}
              <div className="col-span-2">
                <KPICard
                  label="SUSTAINED PROGRESS"
                  value={`${kpis?.completionRate ?? 0}%`}
                  description={`You are ${kpis?.completionRate ?? 0}% ahead of your quarterly milestone goal.`}
                  showProgress
                  progressValue={kpis?.completionRate ?? 0}
                  badge="ACTIVE MOMENTUM"
                />
              </div>

              {/* Card 2 — Pending Tasks */}
              <KPICard
                label="PENDING TASKS"
                value={kpis?.remainingTasks ?? 0}
                valueTestId="kpi-pending-tasks-value"
              />

              {/* Card 3 — Team Syncs (dark) */}
              <KPICard
                label="TEAM SYNCS"
                value={kpis?.teamSyncCount ?? 0}
                dark
                valueTestId="kpi-team-syncs-value"
              />
            </div>
          )}
        </div>

        {/* ── Body: Milestones (left 2/3) + Right Column (1/3) ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3 — Pending Milestones */}
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
                className="text-lg"
                style={{
                  color: "var(--charcoal-ink)",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                }}
              >
                Pending Milestones
              </h2>
              <a
                href="/member/kanban"
                className="text-xs font-semibold uppercase tracking-wide"
                style={{ color: "var(--bamboo-green)" }}
              >
                VIEW ROADMAP
              </a>
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
                <p className="text-sm font-semibold" style={{ color: "var(--charcoal-ink)" }}>
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
                    key={`${m.task_id}-${i}`}
                    taskId={m.task_id}
                    department={m.department}
                    task={m.task}
                    eventName={m.event_name}
                    eventDate={m.event_date}
                    pillarStatus={m.pillar_status}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right 1/3 — Daily Reflection + Upcoming Meeting */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* Daily Reflection */}
            <DailyReflectionCard
              onOpenReflection={() => setReflectionOpen(true)}
              streakPercent={streakPercent}
            />

            {/* Upcoming Meeting */}
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

      {/* reflectionOpen state wires to ReflectionDrawer — to be implemented in spec 05 */}
      {reflectionOpen && null}
    </div>
  )
}
