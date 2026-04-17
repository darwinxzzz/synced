"use client"

import { CalendarCheck, TrendingDown, TrendingUp, Users } from "lucide-react"
import { api } from "~/trpc/react"

export function KPICards() {
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
    { icon: <CalendarCheck size={18} />, label: "Total Events",   value: data?.totalEvents ?? 0,                           sub: null,                          color: "var(--bamboo-green)"   },
    { icon: <Users size={18} />,         label: "Avg Attendance", value: `${data?.avgAttendance ?? 0}%`,                   sub: null,                          color: "var(--bamboo-green)"   },
    { icon: <TrendingUp size={18} />,    label: "Highest Rate",   value: data?.highestRate ? `${data.highestRate.pct}%` : "—", sub: data?.highestRate?.name ?? null, color: "var(--deadline-green)" },
    { icon: <TrendingDown size={18} />,  label: "Lowest Rate",    value: data?.lowestRate  ? `${data.lowestRate.pct}%`  : "—", sub: data?.lowestRate?.name  ?? null, color: "var(--deadline-red)"   },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: 16, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ color: card.color }}>{card.icon}</span>
            <p className="bamboo-label">{card.label}</p>
          </div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: card.color, lineHeight: 1.1 }}>
            {card.value}
          </p>
          {card.sub && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--stone-grey)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {card.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
