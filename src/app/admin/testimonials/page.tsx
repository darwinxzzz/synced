"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Search } from "lucide-react";
import { api } from "~/trpc/react";

const TABS = [
  { key: "directory", label: "Directory" },
  { key: "testimonial_requests", label: "Testimonial Requests" },
  { key: "onboarding", label: "Onboarding" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function KPI({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <motion.div
      layout
      className="card-shadow"
      style={{
        background: "var(--cream-white)",
        borderRadius: 22,
        padding: "18px 20px",
        border: accent ? "2px solid rgba(196,163,90,0.55)" : "1px solid rgba(140,140,140,0.10)",
      }}
    >
      <p className="bamboo-label" style={{ margin: 0, opacity: 0.75 }}>{label}</p>
      <p
        style={{
          margin: "10px 0 0",
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1,
          color: accent ? "var(--accent-gold)" : "var(--deep-forest)",
        }}
      >
        {value}
      </p>
    </motion.div>
  );
}

export default function AdminTestimonialsPage() {
  const [tab, setTab] = useState<TabKey>("testimonial_requests");
  const [department, setDepartment] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isPending } = api.testimonials.getAdminTestimonialsOverview.useQuery({
    department: department === "all" ? undefined : department,
    status,
    search,
  });

  const cards = useMemo(() => data?.cards ?? [], [data?.cards]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory-paper)", paddingBottom: 40 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "26px 24px 0" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}
        >
          <div>
            <p className="bamboo-label" style={{ margin: 0 }}>Testimonials</p>
            <h1
              style={{
                margin: "6px 0 0",
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontWeight: 700,
                color: "var(--deep-forest)",
                fontSize: "clamp(30px,4.2vw,44px)",
              }}
            >
              Members
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: "min(320px, 82vw)",
                height: 40,
                borderRadius: 999,
                border: "1px solid rgba(140,140,140,0.20)",
                background: "rgba(250,250,247,0.8)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "0 12px",
              }}
            >
              <Search size={14} color="var(--stone-grey)" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members..."
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  background: "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "var(--charcoal-ink)",
                }}
              />
            </div>
            <button
              aria-label="Notifications"
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: "none",
                background: "transparent",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--stone-grey)",
              }}
            >
              <Bell size={16} />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.03 }}
          style={{ marginTop: 16, display: "inline-flex", borderBottom: "1px solid rgba(74,124,89,0.20)", gap: 20 }}
        >
          {TABS.map((item) => {
            const active = item.key === tab;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "8px 0 10px",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: active ? "var(--bamboo-green)" : "var(--stone-grey)",
                  borderBottom: active ? "2px solid var(--bamboo-green)" : "2px solid transparent",
                }}
              >
                {item.label}
              </button>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.06 }}
          className="testimonial-kpi-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginTop: 18 }}
        >
          <KPI label="Total Members" value={data?.kpi.totalMembers ?? 0} />
          <KPI label="Active Members" value={data?.kpi.activeMembers ?? 0} />
          <KPI label="Departments" value={data?.kpi.departments ?? 0} />
          <KPI label="Pending Requests" value={data?.kpi.pendingRequests ?? 0} accent />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: 16 }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="es-input"
              style={{
                height: 34,
                borderRadius: 999,
                border: "1px solid rgba(74,124,89,0.22)",
                background: "var(--cream-white)",
                padding: "0 12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
              }}
            >
              <option value="all">All Departments</option>
              {(data?.departments ?? []).filter((dept): dept is string => Boolean(dept)).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="es-input"
              style={{
                height: 34,
                borderRadius: 999,
                border: "1px solid rgba(74,124,89,0.22)",
                background: "var(--cream-white)",
                padding: "0 12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12,
              }}
            >
              {(data?.statuses ?? ["all", "pending", "generated", "sent"]).map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption === "all" ? "All Statuses" : statusOption}
                </option>
              ))}
            </select>
          </div>

          <span
            style={{
              padding: "5px 12px",
              borderRadius: 999,
              background: "var(--deep-forest)",
              color: "var(--cream-white)",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {cards.length} requests found
          </span>
        </motion.div>

        {tab !== "testimonial_requests" ? (
          <div
            className="card-shadow"
            style={{
              marginTop: 20,
              borderRadius: 18,
              background: "var(--cream-white)",
              border: "1px solid rgba(140,140,140,0.10)",
              padding: 24,
            }}
          >
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", color: "var(--stone-grey)", fontSize: 13 }}>
              {tab === "directory"
                ? "Directory mode can be layered on top of this same dataset."
                : "Onboarding testimonial queue can be layered on top of this same dataset."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${department}-${status}-${search}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="testimonial-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginTop: 18, paddingBottom: 24 }}
            >
              {isPending
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="card-shadow"
                      style={{ borderRadius: 20, minHeight: 300, background: "var(--cream-white)", opacity: 0.5 }}
                    />
                  ))
                : cards.map((card, index) => (
                    <motion.article
                      key={card.memberId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="card-shadow"
                      style={{
                        borderRadius: 20,
                        background: "var(--cream-white)",
                        border: "1px solid rgba(140,140,140,0.10)",
                        padding: 18,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            background: "var(--sage-mist)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            color: "var(--deep-forest)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {card.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() ?? "")
                            .join("")}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 22, color: "var(--deep-forest)", fontWeight: 700, lineHeight: 1.05 }}>
                            {card.name}
                          </p>
                          <p className="bamboo-label" style={{ margin: "4px 0 0", fontSize: 10 }}>
                            {card.department}
                          </p>
                        </div>
                      </div>

                      <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--stone-grey)" }}>{card.tenure}</p>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 6 }}>
                        <StatPill label="Events" value={card.stats.events} />
                        <StatPill label="Hours" value={card.stats.hours} />
                        <StatPill label="Attendance" value={`${card.stats.attendancePct}%`} />
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontFamily: "'Playfair Display', serif",
                          fontStyle: "italic",
                          color: "var(--stone-grey)",
                          fontSize: 15,
                          lineHeight: 1.55,
                          minHeight: 100,
                        }}
                      >
                        &quot;{card.quoteSnippet.slice(0, 160)}{card.quoteSnippet.length > 160 ? "..." : ""}&quot;
                      </p>

                      <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
                        <Link
                          href={`/admin/testimonials/${card.memberId}`}
                          style={{
                            height: 40,
                            borderRadius: 999,
                            background: "var(--accent-gold)",
                            color: "var(--deep-forest)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textDecoration: "none",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                          }}
                        >
                          Generate Testimonial
                        </Link>

                        <Link
                          href={`/admin/testimonials/${card.memberId}?view=profile`}
                          style={{
                            height: 38,
                            borderRadius: 999,
                            border: "1px solid rgba(74,124,89,0.25)",
                            color: "var(--stone-grey)",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textDecoration: "none",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          View Profile
                        </Link>
                      </div>
                    </motion.article>
                  ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .testimonial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 880px) {
          .testimonial-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
        @media (max-width: 700px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .testimonial-kpi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        borderRadius: 999,
        border: "1px solid rgba(140,140,140,0.14)",
        background: "rgba(245,240,232,0.8)",
        padding: "6px 8px",
        textAlign: "center",
      }}
    >
      <p className="bamboo-label" style={{ margin: 0, fontSize: 8, opacity: 0.7 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", fontWeight: 700 }}>{value}</p>
    </div>
  );
}
