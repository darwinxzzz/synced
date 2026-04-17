"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { KPICards } from "./_components/KPICards"
import { MembersTab } from "./_components/MembersTab"
import { EventParticipationTab } from "./_components/EventParticipationTab"
import { WeeklyMeetingsTab } from "./_components/WeeklyMeetingsTab"
import { DEPARTMENTS } from "./_components/constants"

type Tab = "members" | "event_participation" | "weekly_meetings"

const TABS: { value: Tab; label: string }[] = [
  { value: "members",             label: "Members" },
  { value: "event_participation", label: "Event Participation" },
  { value: "weekly_meetings",     label: "Weekly Meetings" },
]

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("members")

  return (
    <div style={{ minHeight: "100%", backgroundColor: "var(--ivory-paper)", padding: "32px 24px 48px", maxWidth: 1280, margin: "0 auto" }} className="lg:px-8">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "var(--deep-forest)", lineHeight: 1.15 }}>
          Attendance Registry
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--stone-grey)", marginTop: 6 }}>
          Track member attendance across events and weekly meetings
        </p>
      </div>

      <div style={{ marginBottom: 28 }}>
        <KPICards />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select className="es-input" style={{ height: 40, borderRadius: 10, border: "1.5px solid rgba(74,124,89,0.20)", background: "var(--cream-white)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)", padding: "0 12px", outline: "none", cursor: "pointer" }}>
            <option value="">All Events ▾</option>
          </select>
          <select className="es-input" style={{ height: 40, borderRadius: 10, border: "1.5px solid rgba(74,124,89,0.20)", background: "var(--cream-white)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)", padding: "0 12px", outline: "none", cursor: "pointer" }}>
            <option value="">All Departments ▾</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          style={{ height: 40, padding: "0 16px", borderRadius: 10, border: "1.5px solid rgba(74,124,89,0.20)", background: "var(--cream-white)", color: "var(--bamboo-green)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, transition: "background 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,124,89,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cream-white)")}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      <div style={{ display: "flex", background: "var(--cream-white)", borderRadius: 12, padding: 4, marginBottom: 24, gap: 2, width: "fit-content", border: "1.5px solid rgba(74,124,89,0.10)" }}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            style={{ height: 40, padding: "0 18px", borderRadius: 9, border: "none", background: activeTab === tab.value ? "var(--deep-forest)" : "transparent", color: activeTab === tab.value ? "#fff" : "var(--stone-grey)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.18s ease", whiteSpace: "nowrap" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "members"             && <MembersTab />}
      {activeTab === "event_participation" && <EventParticipationTab />}
      {activeTab === "weekly_meetings"     && <WeeklyMeetingsTab />}
    </div>
  )
}
