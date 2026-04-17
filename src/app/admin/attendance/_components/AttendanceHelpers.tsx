"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export function StatusBadge({ status }: { status: string }) {
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

export function AttendanceDot({ status }: { status: string }) {
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

export function Pagination({
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderTop: "1px solid rgba(74,124,89,0.08)" }}>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)" }}>
        Showing {total === 0 ? 0 : from}–{to} of {total} entries
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          style={{ height: 32, padding: "0 12px", borderRadius: 8, border: "1.5px solid rgba(74,124,89,0.18)", background: "transparent", color: page === 1 ? "var(--stone-grey)" : "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", gap: 4 }}
        >
          <ChevronLeft size={13} />
          Previous
        </button>
        <span style={{ height: 32, minWidth: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "var(--deep-forest)", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, padding: "0 10px" }}>
          {page}
        </span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          style={{ height: 32, padding: "0 12px", borderRadius: 8, border: "1.5px solid rgba(74,124,89,0.18)", background: "transparent", color: page >= totalPages ? "var(--stone-grey)" : "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, cursor: page >= totalPages ? "not-allowed" : "pointer", opacity: page >= totalPages ? 0.45 : 1, display: "flex", alignItems: "center", gap: 4 }}
        >
          Next
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}
