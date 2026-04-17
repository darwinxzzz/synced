"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { api } from "~/trpc/react"
import { DepartmentBadge } from "~/app/_components/kanban/DepartmentBadge"
import { MemberProfileDrawer } from "~/app/_components/shared/MemberProfileDrawer"
import { AddMemberModal } from "./AddMemberModal"
import { Pagination, StatusBadge } from "./AttendanceHelpers"
import { DEPARTMENTS } from "./constants"

export function MembersTab() {
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search members…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="es-input"
            style={{ height: 40, borderRadius: 10, border: "1.5px solid rgba(74,124,89,0.20)", background: "var(--ivory-paper)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", padding: "0 14px", outline: "none", width: 200 }}
          />
          <select
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1) }}
            className="es-input"
            style={{ height: 40, borderRadius: 10, border: "1.5px solid rgba(74,124,89,0.20)", background: "var(--ivory-paper)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: department ? "var(--charcoal-ink)" : "var(--stone-grey)", padding: "0 14px", outline: "none", cursor: "pointer" }}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          onClick={() => setAddMemberOpen(true)}
          style={{ height: 48, padding: "0 20px", borderRadius: 10, border: "none", background: "var(--deep-forest)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "opacity 0.15s" }}
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
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--stone-grey)", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap", background: "var(--ivory-paper)" }}>
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
                    style={{ borderBottom: "1px solid rgba(74,124,89,0.06)", cursor: "pointer", transition: "background 0.12s", minHeight: 56 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>{m.name}</p>
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--stone-grey)", marginTop: 2 }}>{m.email}</p>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      {m.department ? <DepartmentBadge department={m.department} /> : <span style={{ color: "var(--stone-grey)", fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", whiteSpace: "nowrap" }}>
                      {m.joined_date ? new Date(m.joined_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}><StatusBadge status={m.status} /></td>
                    <td style={{ padding: "14px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "var(--charcoal-ink)" }}>{m.total_events}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: m.attendance_pct >= 75 ? "var(--deadline-green)" : m.attendance_pct >= 50 ? "var(--deadline-amber)" : "var(--deadline-red)" }}>
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
      <MemberProfileDrawer isOpen={!!selectedMemberId} onClose={() => setSelectedMemberId(null)} memberId={selectedMemberId ?? undefined} />
    </div>
  )
}
