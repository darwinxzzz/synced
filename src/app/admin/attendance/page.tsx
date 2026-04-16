"use client"

import { useState } from "react"
import { Users, CalendarCheck, TrendingUp, TrendingDown, Plus, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { api } from "~/trpc/react"
import { DepartmentBadge } from "~/app/_components/kanban/DepartmentBadge"
import { MemberProfileDrawer } from "~/app/_components/shared/MemberProfileDrawer"
import { AddMemberModal } from "./_components/AddMemberModal"
import { AddAttendanceModal } from "./_components/AddAttendanceModal"
import type { AssignableMember } from "~/app/_components/shared/MemberAssignmentSection"
import { DEPARTMENTS } from "./_components/constants"

// ─────────────── Shared helpers ──────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 20,
        background: isActive ? "rgba(61,139,94,0.13)" : "rgba(140,140,140,0.12)",
        color: isActive ? "var(--deadline-green)" : "var(--stone-grey)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  )
}

function AttendanceDot({ status }: { status: string }) {
  const color =
    status === "attended" ? "var(--deadline-green)"
    : status === "absent"  ? "var(--deadline-red)"
    : "var(--deadline-amber)"
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 10px",
        borderRadius: 20,
        background: `${color}18`,
        color,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {status}
    </span>
  )
}

function Pagination({
  page,
  total,
  pageSize = 10,
  onPage,
}: {
  page: number
  total: number
  pageSize?: number
  onPage: (p: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = Math.min((page - 1) * pageSize + 1, total)
  const to = Math.min(page * pageSize, total)

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderTop: "1px solid rgba(74,124,89,0.08)",
      }}
    >
      <span
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)" }}
      >
        Showing {total === 0 ? 0 : from}–{to} of {total} entries
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 8,
            border: "1.5px solid rgba(74,124,89,0.18)",
            background: "transparent",
            color: page === 1 ? "var(--stone-grey)" : "var(--charcoal-ink)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: page === 1 ? "not-allowed" : "pointer",
            opacity: page === 1 ? 0.45 : 1,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ChevronLeft size={13} />
          Previous
        </button>
        <span
          style={{
            height: 32,
            minWidth: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            background: "var(--deep-forest)",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            padding: "0 10px",
          }}
        >
          {page}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          style={{
            height: 32,
            padding: "0 12px",
            borderRadius: 8,
            border: "1.5px solid rgba(74,124,89,0.18)",
            background: "transparent",
            color: page >= totalPages ? "var(--stone-grey)" : "var(--charcoal-ink)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            cursor: page >= totalPages ? "not-allowed" : "pointer",
            opacity: page >= totalPages ? 0.45 : 1,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          Next
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ─────────────── KPI Cards ────────────────────────────────────────────────────

function KPICards() {
  const { data, isLoading } = api.attendance.getKPIs.useQuery()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: 16, padding: 20, height: 96 }}>
            <div style={{ width: "60%", height: 14, borderRadius: 6, background: "rgba(140,140,140,0.15)", marginBottom: 10 }} />
            <div style={{ width: "40%", height: 22, borderRadius: 6, background: "rgba(140,140,140,0.10)" }} />
          </div>
        ))}
      </div>
    )
  }

  const cards = [
    {
      icon: <CalendarCheck size={18} />,
      label: "Total Events",
      value: data?.totalEvents ?? 0,
      sub: null,
      color: "var(--bamboo-green)",
    },
    {
      icon: <Users size={18} />,
      label: "Avg Attendance",
      value: `${data?.avgAttendance ?? 0}%`,
      sub: null,
      color: "var(--bamboo-green)",
    },
    {
      icon: <TrendingUp size={18} />,
      label: "Highest Rate",
      value: data?.highestRate ? `${data.highestRate.pct}%` : "—",
      sub: data?.highestRate?.name ?? null,
      color: "var(--deadline-green)",
    },
    {
      icon: <TrendingDown size={18} />,
      label: "Lowest Rate",
      value: data?.lowestRate ? `${data.lowestRate.pct}%` : "—",
      sub: data?.lowestRate?.name ?? null,
      color: "var(--deadline-red)",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="card-shadow"
          style={{ background: "var(--cream-white)", borderRadius: 16, padding: "18px 20px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: card.color }}>{card.icon}</span>
            <p className="bamboo-label">{card.label}</p>
          </div>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              color: card.color,
              lineHeight: 1.1,
            }}
          >
            {card.value}
          </p>
          {card.sub && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                color: "var(--stone-grey)",
                marginTop: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {card.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────── Members Tab ──────────────────────────────────────────────────

function MembersTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [department, setDepartment] = useState("")
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  const { data, refetch, isLoading } = api.attendance.getMembers.useQuery({
    page,
    search: search || undefined,
    department: department || undefined,
  })

  const members = data?.members ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search members…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="es-input"
            style={{
              height: 40,
              borderRadius: 10,
              border: "1.5px solid rgba(74,124,89,0.20)",
              background: "var(--ivory-paper)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--charcoal-ink)",
              padding: "0 14px",
              outline: "none",
              width: 200,
            }}
          />
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
            className="es-input"
            style={{
              height: 40,
              borderRadius: 10,
              border: "1.5px solid rgba(74,124,89,0.20)",
              background: "var(--ivory-paper)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: department ? "var(--charcoal-ink)" : "var(--stone-grey)",
              padding: "0 14px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          onClick={() => setAddMemberOpen(true)}
          style={{
            height: 48,
            padding: "0 20px",
            borderRadius: 10,
            border: "none",
            background: "var(--deep-forest)",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      <div className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid rgba(74,124,89,0.08)" }}>
                {["Member Name", "Department", "Join Date", "Status", "Total Events", "Attendance %"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--stone-grey)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      whiteSpace: "nowrap",
                      background: "var(--ivory-paper)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 14, borderRadius: 6, background: "rgba(140,140,140,0.12)", width: j === 0 ? "80%" : "50%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--stone-grey)" }}>
                    No members found
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMemberId(m.id)}
                    style={{
                      borderBottom: "1px solid rgba(74,124,89,0.06)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                      minHeight: 56,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>
                        {m.name}
                      </p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--stone-grey)", marginTop: 2 }}>
                        {m.email}
                      </p>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {m.department ? <DepartmentBadge department={m.department} /> : <span style={{ color: "var(--stone-grey)", fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", whiteSpace: "nowrap" }}>
                      {m.joined_date ? new Date(m.joined_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={m.status} />
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>
                      {m.total_events}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 700,
                          color: m.attendance_pct >= 75 ? "var(--deadline-green)" : m.attendance_pct >= 50 ? "var(--deadline-amber)" : "var(--deadline-red)",
                        }}
                      >
                        {m.attendance_pct}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} onPage={setPage} />
      </div>

      <AddMemberModal isOpen={addMemberOpen} onClose={() => setAddMemberOpen(false)} onSuccess={() => void refetch()} />
      <MemberProfileDrawer
        isOpen={!!selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
        memberId={selectedMemberId ?? undefined}
      />
    </div>
  )
}

// ─────────────── Event Participation Tab ─────────────────────────────────────

type EventStatusFilter = "not_recorded" | "ended" | "archived"

function EventParticipationTab() {
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("not_recorded")
  const [page, setPage] = useState(1)
  const [addAttendanceOpen, setAddAttendanceOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const { data, refetch, isLoading } = api.attendance.getEventParticipation.useQuery({
    page,
    statusFilter,
  })

  const { data: eventMembers = [] } = api.attendance.getEventMembers.useQuery(
    { eventId: selectedEventId! },
    { enabled: !!selectedEventId },
  )

  const events = data?.events ?? []
  const total = data?.total ?? 0

  const filterPills: { value: EventStatusFilter; label: string }[] = [
    { value: "not_recorded", label: "Not Recorded" },
    { value: "ended",        label: "Ended" },
    { value: "archived",     label: "Archived" },
  ]

  const prePopulatedMembers: AssignableMember[] = eventMembers
    .map((em) => {
      const p = (em.profiles as unknown) as { id: string; name: string; avatar_url: string | null; department: string | null } | null
      if (!p) return null
      return { id: p.id, name: p.name, email: "", avatar_url: p.avatar_url, department: p.department, role: "member" }
    })
    .filter(Boolean) as AssignableMember[]

  return (
    <div>
      {/* Filter pills */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {filterPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => { setStatusFilter(pill.value); setPage(1) }}
              style={{
                height: 36,
                padding: "0 16px",
                borderRadius: 20,
                border: "1.5px solid",
                borderColor: statusFilter === pill.value ? "var(--bamboo-green)" : "rgba(74,124,89,0.20)",
                background: statusFilter === pill.value ? "var(--bamboo-green)" : "transparent",
                color: statusFilter === pill.value ? "#fff" : "var(--stone-grey)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setSelectedEventId(null); setAddAttendanceOpen(true) }}
          style={{
            height: 48,
            padding: "0 20px",
            borderRadius: 10,
            border: "none",
            background: "var(--deep-forest)",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Plus size={16} />
          Add Attendance
        </button>
      </div>

      {/* Event list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-shadow" style={{ height: 72, borderRadius: 12, background: "var(--cream-white)" }} />
            ))
          : events.length === 0
            ? (
              <div
                className="card-shadow"
                style={{
                  background: "var(--cream-white)",
                  borderRadius: 16,
                  padding: 40,
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  color: "var(--stone-grey)",
                }}
              >
                No events in this category
              </div>
            )
            : events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => { setSelectedEventId(ev.id); setAddAttendanceOpen(true) }}
                  className="card-shadow"
                  style={{
                    width: "100%",
                    background: "var(--cream-white)",
                    borderRadius: 12,
                    padding: "14px 20px",
                    border: "1.5px solid transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    textAlign: "left",
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(74,124,89,0.25)"
                    e.currentTarget.style.background = "rgba(250,250,247,0.7)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "transparent"
                    e.currentTarget.style.background = "var(--cream-white)"
                  }}
                >
                  <CalendarCheck size={18} color="var(--bamboo-green)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>
                      {ev.name}
                    </p>
                    {ev.date && (
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--stone-grey)", marginTop: 2 }}>
                        {new Date(ev.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--stone-grey)", whiteSpace: "nowrap" }}>
                    {ev.member_count} member{ev.member_count !== 1 ? "s" : ""}
                  </span>
                  {ev.is_recorded && (
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: "rgba(61,139,94,0.12)",
                        color: "var(--deadline-green)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      Recorded
                    </span>
                  )}
                </button>
              ))}
      </div>

      {total > 10 && <Pagination page={page} total={total} onPage={setPage} />}

      <AddAttendanceModal
        isOpen={addAttendanceOpen}
        onClose={() => { setAddAttendanceOpen(false); setSelectedEventId(null) }}
        onSuccess={() => void refetch()}
        type="event"
        eventId={selectedEventId ?? undefined}
        prePopulatedMembers={selectedEventId ? prePopulatedMembers : []}
      />
    </div>
  )
}

// ─────────────── Weekly Meetings Tab ─────────────────────────────────────────

function WeeklyMeetingsTab() {
  const [page, setPage] = useState(1)
  const [addAttendanceOpen, setAddAttendanceOpen] = useState(false)

  const { data, refetch, isLoading } = api.attendance.getWeeklyMeetings.useQuery({ page })

  const meetings = data?.meetings ?? []
  const total = data?.total ?? 0

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button
          onClick={() => setAddAttendanceOpen(true)}
          style={{
            height: 48,
            padding: "0 20px",
            borderRadius: 10,
            border: "none",
            background: "var(--deep-forest)",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Plus size={16} />
          Add Attendance
        </button>
      </div>

      <div className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid rgba(74,124,89,0.08)" }}>
                {["Member Name", "Department", "Week", "Status", "Date", "Notes"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--stone-grey)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      whiteSpace: "nowrap",
                      background: "var(--ivory-paper)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} style={{ padding: "14px 16px" }}>
                          <div style={{ height: 14, borderRadius: 6, background: "rgba(140,140,140,0.12)", width: j === 0 ? "75%" : "50%" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : meetings.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ padding: 40, textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--stone-grey)" }}>
                        No weekly meeting records yet
                      </td>
                    </tr>
                  )
                  : meetings.map((row) => {
                      const profile = (row.profiles as unknown) as { id: string; name: string; avatar_url: string | null; department: string | null } | null
                      return (
                        <tr
                          key={row.id}
                          style={{ borderBottom: "1px solid rgba(74,124,89,0.06)", minHeight: 56 }}
                        >
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>
                            {profile?.name ?? "—"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            {profile?.department ? <DepartmentBadge department={profile.department} /> : <span style={{ color: "var(--stone-grey)", fontSize: 13 }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--charcoal-ink)", fontWeight: 600 }}>
                            Week {row.meeting_week ?? "—"}
                          </td>
                          <td style={{ padding: "14px 16px" }}>
                            <AttendanceDot status={row.status} />
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", whiteSpace: "nowrap" }}>
                            {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)" }}>
                            {row.notes ?? "—"}
                          </td>
                        </tr>
                      )
                    })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} onPage={setPage} />
      </div>

      <AddAttendanceModal
        isOpen={addAttendanceOpen}
        onClose={() => setAddAttendanceOpen(false)}
        onSuccess={() => void refetch()}
        type="weekly_meeting"
      />
    </div>
  )
}

// ─────────────── Page ─────────────────────────────────────────────────────────

type Tab = "members" | "event_participation" | "weekly_meetings"

const TABS: { value: Tab; label: string }[] = [
  { value: "members",             label: "Members" },
  { value: "event_participation", label: "Event Participation" },
  { value: "weekly_meetings",     label: "Weekly Meetings" },
]

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("members")

  return (
    <div
      style={{
        minHeight: "100%",
        backgroundColor: "var(--ivory-paper)",
        padding: "32px 24px 48px",
        maxWidth: 1280,
        margin: "0 auto",
      }}
      className="lg:px-8"
    >
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 700,
            color: "var(--deep-forest)",
            lineHeight: 1.15,
          }}
        >
          Attendance Registry
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--stone-grey)",
            marginTop: 6,
          }}
        >
          Track member attendance across events and weekly meetings
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ marginBottom: 28 }}>
        <KPICards />
      </div>

      {/* Filter row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="es-input"
            style={{
              height: 40,
              borderRadius: 10,
              border: "1.5px solid rgba(74,124,89,0.20)",
              background: "var(--cream-white)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--stone-grey)",
              padding: "0 12px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Events ▾</option>
          </select>
          <select
            className="es-input"
            style={{
              height: 40,
              borderRadius: 10,
              border: "1.5px solid rgba(74,124,89,0.20)",
              background: "var(--cream-white)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--stone-grey)",
              padding: "0 12px",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All Departments ▾</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          style={{
            height: 40,
            padding: "0 16px",
            borderRadius: 10,
            border: "1.5px solid rgba(74,124,89,0.20)",
            background: "var(--cream-white)",
            color: "var(--bamboo-green)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 7,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,124,89,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cream-white)")}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Tab switcher */}
      <div
        style={{
          display: "flex",
          background: "var(--cream-white)",
          borderRadius: 12,
          padding: 4,
          marginBottom: 24,
          gap: 2,
          width: "fit-content",
          border: "1.5px solid rgba(74,124,89,0.10)",
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 9,
              border: "none",
              background: activeTab === tab.value ? "var(--deep-forest)" : "transparent",
              color: activeTab === tab.value ? "#fff" : "var(--stone-grey)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.18s ease",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "members"             && <MembersTab />}
      {activeTab === "event_participation" && <EventParticipationTab />}
      {activeTab === "weekly_meetings"     && <WeeklyMeetingsTab />}
    </div>
  )
}
