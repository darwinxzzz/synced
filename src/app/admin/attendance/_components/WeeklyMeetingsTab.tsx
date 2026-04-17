"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { api } from "~/trpc/react"
import { DepartmentBadge } from "~/app/_components/kanban/DepartmentBadge"
import { AddAttendanceModal } from "./AddAttendanceModal"
import { AttendanceDot, Pagination } from "./AttendanceHelpers"

export function WeeklyMeetingsTab() {
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
          style={{ height: 48, padding: "0 20px", borderRadius: 10, border: "none", background: "var(--deep-forest)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}
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
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--stone-grey)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", background: "var(--ivory-paper)" }}>
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
                        <tr key={row.id} style={{ borderBottom: "1px solid rgba(74,124,89,0.06)", minHeight: 56 }}>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>{profile?.name ?? "—"}</td>
                          <td style={{ padding: "14px 16px" }}>
                            {profile?.department ? <DepartmentBadge department={profile.department} /> : <span style={{ color: "var(--stone-grey)", fontSize: 13 }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--charcoal-ink)", fontWeight: 600 }}>Week {row.meeting_week ?? "—"}</td>
                          <td style={{ padding: "14px 16px" }}><AttendanceDot status={row.status} /></td>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", whiteSpace: "nowrap" }}>
                            {new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)" }}>{row.notes ?? "—"}</td>
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
