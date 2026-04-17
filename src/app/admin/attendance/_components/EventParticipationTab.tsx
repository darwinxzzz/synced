"use client"

import { useState } from "react"
import { CalendarCheck, Plus } from "lucide-react"
import { api } from "~/trpc/react"
import { AddAttendanceModal } from "./AddAttendanceModal"
import { Pagination } from "./AttendanceHelpers"
import type { AssignableMember } from "~/app/_components/shared/MemberAssignmentSection"

type EventStatusFilter = "not_recorded" | "ended" | "archived"

const filterPills: { value: EventStatusFilter; label: string }[] = [
  { value: "not_recorded", label: "Not Recorded" },
  { value: "ended",        label: "Ended" },
  { value: "archived",     label: "Archived" },
]

export function EventParticipationTab() {
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>("not_recorded")
  const [page, setPage] = useState(1)
  const [addAttendanceOpen, setAddAttendanceOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const { data, refetch, isLoading } = api.attendance.getEventParticipation.useQuery({ page, statusFilter })
  const { data: eventMembers = [] } = api.attendance.getEventMembers.useQuery(
    { eventId: selectedEventId! },
    { enabled: !!selectedEventId },
  )

  const events = data?.events ?? []
  const total = data?.total ?? 0

  const prePopulatedMembers: AssignableMember[] = eventMembers
    .map((em) => {
      const p = (em.profiles as unknown) as { id: string; name: string; avatar_url: string | null; department: string | null } | null
      if (!p) return null
      return { id: p.id, name: p.name, email: "", avatar_url: p.avatar_url, department: p.department, role: "member" }
    })
    .filter(Boolean) as AssignableMember[]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {filterPills.map((pill) => (
            <button
              key={pill.value}
              onClick={() => { setStatusFilter(pill.value); setPage(1) }}
              style={{ height: 36, padding: "0 16px", borderRadius: 20, border: "1.5px solid", borderColor: statusFilter === pill.value ? "var(--bamboo-green)" : "rgba(74,124,89,0.20)", background: statusFilter === pill.value ? "var(--bamboo-green)" : "transparent", color: statusFilter === pill.value ? "#fff" : "var(--stone-grey)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setSelectedEventId(null); setAddAttendanceOpen(true) }}
          style={{ height: 48, padding: "0 20px", borderRadius: 10, border: "none", background: "var(--deep-forest)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
        >
          <Plus size={16} />
          Add Attendance
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-shadow" style={{ height: 72, borderRadius: 12, background: "var(--cream-white)" }} />
            ))
          : events.length === 0
            ? (
              <div className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: 16, padding: 40, textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--stone-grey)" }}>
                No events in this category
              </div>
            )
            : events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => { setSelectedEventId(ev.id); setAddAttendanceOpen(true) }}
                  className="card-shadow"
                  style={{ width: "100%", background: "var(--cream-white)", borderRadius: 12, padding: "14px 20px", border: "1.5px solid transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, textAlign: "left", transition: "border-color 0.15s, background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(74,124,89,0.25)"; e.currentTarget.style.background = "rgba(250,250,247,0.7)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "var(--cream-white)" }}
                >
                  <CalendarCheck size={18} color="var(--bamboo-green)" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>{ev.name}</p>
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
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(61,139,94,0.12)", color: "var(--deadline-green)", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
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
