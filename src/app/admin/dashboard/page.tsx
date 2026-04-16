"use client"

import Link from "next/link"
import { api } from "~/trpc/react"
import { KPICard } from "~/app/_components/dashboard/KPICard"
import { AdminEventCard } from "~/app/_components/admin/AdminEventCard"
import { PendingSubmissionItem } from "~/app/_components/admin/PendingSubmissionItem"

// ─── Skeletons ───────────────────────────────────────────────────────────────

function KPISkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-6 card-shadow h-36 animate-pulse"
          style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
        />
      ))}
    </div>
  )
}

function InitiativesSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="rounded-2xl h-64 animate-pulse card-shadow"
          style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
        />
      ))}
    </div>
  )
}

function SubmissionsSkeleton() {
  return (
    <div className="flex flex-col">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-14 rounded-lg animate-pulse my-1"
          style={{ backgroundColor: "rgba(168,197,160,0.15)" }}
        />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data, isPending, isError } = api.dashboard.getAdminDashboard.useQuery()

  const kpi         = data?.kpi
  const initiatives = data?.ongoingInitiatives ?? []
  const submissions = data?.pendingSubmissions ?? []

  // Group submissions by eventId to get one "ADD NEW TASK" link per event
  const firstEventId = submissions[0]?.eventId ?? null

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--ivory-paper)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="space-y-1 mb-8">
          <p className="bamboo-label">EXCO DASHBOARD</p>
          <h1
            className="text-4xl leading-tight italic"
            style={{
              color:      "var(--charcoal-ink)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Current Event Progress
          </h1>
        </div>

        {/* ── KPI Row ─────────────────────────────────────────────────────── */}
        <div className="mb-8">
          {isPending ? (
            <KPISkeleton />
          ) : isError ? (
            <p className="text-sm" style={{ color: "var(--deadline-red)" }}>
              Could not load dashboard data. Please refresh.
            </p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1 — Active Events */}
              <KPICard
                label="ACTIVE EVENTS"
                value={kpi?.activeEvents ?? 0}
              />

              {/* Card 2 — Total Members */}
              <KPICard
                label="TOTAL MEMBERS"
                value={kpi?.totalMembers ?? 0}
              />

              {/* Card 3 — Completion Rate */}
              <KPICard
                label="COMPLETION RATE"
                value={`${kpi?.completionRate ?? 0}%`}
                showProgress
                progressValue={kpi?.completionRate ?? 0}
              />

              {/* Card 4 — Tasks Due (URGENT) — custom to show pulsing dot */}
              <div
                className="rounded-2xl p-6 card-shadow flex flex-col gap-3 relative"
                style={{
                  backgroundColor:     "rgba(250,250,247,0.85)",
                  backdropFilter:      "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <p className="bamboo-label" style={{ color: "var(--deadline-red)" }}>
                  TASKS DUE
                </p>
                <div className="flex items-center gap-3">
                  <p
                    className="text-4xl font-semibold leading-none"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color:      "var(--deadline-red)",
                    }}
                  >
                    {kpi?.tasksDueSoon ?? 0}
                  </p>
                  <span
                    className="w-2.5 h-2.5 rounded-full deadline-pulse"
                    style={{ backgroundColor: "var(--deadline-red)" }}
                  />
                </div>
                <p className="text-xs" style={{ color: "var(--stone-grey)" }}>
                  Tasks due within 7 days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Two-column body ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2/3 — Ongoing Initiatives */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg italic"
                style={{
                  color:      "var(--charcoal-ink)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Ongoing Initiatives
              </h2>
              {!isPending && (
                <span className="text-xs font-semibold uppercase" style={{ color: "var(--stone-grey)" }}>
                  {initiatives.length} active
                </span>
              )}
            </div>

            {isPending ? (
              <InitiativesSkeleton />
            ) : initiatives.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center card-shadow"
                style={{ backgroundColor: "rgba(250,250,247,0.85)" }}
              >
                <p className="text-2xl mb-2">🎋</p>
                <p className="text-sm font-semibold" style={{ color: "var(--charcoal-ink)" }}>
                  No active initiatives
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--stone-grey)" }}>
                  Create an event from the Kanban board to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {initiatives.map((ev) => (
                  <AdminEventCard key={ev.id} {...ev} />
                ))}
              </div>
            )}
          </div>

          {/* Right 1/3 — Pending Submissions */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-5 card-shadow"
              style={{
                backgroundColor:     "rgba(250,250,247,0.85)",
                backdropFilter:      "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <h2
                className="text-lg italic mb-0.5"
                style={{
                  color:      "var(--charcoal-ink)",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                Pending Submissions
              </h2>
              <p className="text-xs mb-4" style={{ color: "var(--stone-grey)" }}>
                Tasks awaiting review from sub-committees
              </p>

              {isPending ? (
                <SubmissionsSkeleton />
              ) : submissions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm font-semibold" style={{ color: "var(--charcoal-ink)" }}>
                    All caught up
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--stone-grey)" }}>
                    No pending submissions right now.
                  </p>
                </div>
              ) : (
                <div>
                  {submissions.map((s, i) => (
                    <PendingSubmissionItem key={`${s.taskId}-${i}`} {...s} />
                  ))}
                </div>
              )}

              {/* ADD NEW TASK link */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(45,45,45,0.07)" }}>
                <Link
                  href={firstEventId ? `/admin/kanban/${firstEventId}` : "/admin/kanban"}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide transition-colors"
                  style={{
                    backgroundColor: "var(--sage-mist)",
                    color:           "var(--deep-forest)",
                  }}
                >
                  + ADD NEW TASK
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
