"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Search } from "lucide-react";
import { api } from "~/trpc/react";
import { OnboardingTab } from "./_components/OnboardingTab";
import { TestimonialRequestsTab } from "./_components/TestimonialRequestsTab";

const TABS = [
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
      <p style={{ margin: "10px 0 0", fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 38, lineHeight: 1, color: accent ? "var(--accent-gold)" : "var(--deep-forest)" }}>
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
  const requestCards = useMemo(() => cards.filter((c) => c.hasRequest), [cards]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory-paper)", paddingBottom: 40 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "26px 24px 0" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}
        >
          <div>
            <p className="bamboo-label" style={{ margin: 0 }}>Testimonials</p>
            <h1 style={{ margin: "6px 0 0", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, color: "var(--deep-forest)", fontSize: "clamp(30px,4.2vw,44px)" }}>
              Members
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: "min(320px, 82vw)", height: 40, borderRadius: 999, border: "1px solid rgba(140,140,140,0.20)", background: "rgba(250,250,247,0.8)", display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
              <Search size={14} color="var(--stone-grey)" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members..."
                style={{ border: "none", outline: "none", width: "100%", background: "transparent", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)" }}
              />
            </div>
            <button aria-label="Notifications" style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--stone-grey)" }}>
              <Bell size={16} />
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
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
                style={{ border: "none", background: "transparent", padding: "8px 0 10px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: active ? 700 : 500, textTransform: "uppercase", letterSpacing: "0.08em", color: active ? "var(--bamboo-green)" : "var(--stone-grey)", borderBottom: active ? "2px solid var(--bamboo-green)" : "2px solid transparent" }}
              >
                {item.label}
              </button>
            );
          })}
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.06 }}
          className="testimonial-kpi-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14, marginTop: 18 }}
        >
          <KPI label="Total Members" value={data?.kpi.totalMembers ?? 0} />
          <KPI label="Active Members" value={data?.kpi.activeMembers ?? 0} />
          <KPI label="Testimonial Requests" value={data?.kpi.testimonialRequests ?? 0} accent />
          <KPI label="Pending Requests" value={data?.kpi.pendingRequests ?? 0} accent />
        </motion.div>

        {/* Filters */}
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
              style={{ height: 34, borderRadius: 999, border: "1px solid rgba(74,124,89,0.22)", background: "var(--cream-white)", padding: "0 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}
            >
              <option value="all">All Departments</option>
              {(data?.departments ?? []).filter((d): d is string => Boolean(d)).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="es-input"
              style={{ height: 34, borderRadius: 999, border: "1px solid rgba(74,124,89,0.22)", background: "var(--cream-white)", padding: "0 12px", fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}
            >
              {(data?.statuses ?? ["all", "pending", "generated", "sent"]).map((s) => (
                <option key={s} value={s}>{s === "all" ? "All Statuses" : s}</option>
              ))}
            </select>
          </div>
          <span style={{ padding: "5px 12px", borderRadius: 999, background: "var(--deep-forest)", color: "var(--cream-white)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
            {tab === "onboarding" ? `${cards.length} members` : `${requestCards.length} requests`}
          </span>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {tab === "onboarding"
            ? <OnboardingTab key="onboarding" cards={cards} isPending={isPending} />
            : <TestimonialRequestsTab key="requests" cards={requestCards} isPending={isPending} filterKey={`${department}-${status}-${search}`} />
          }
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 1100px) { .testimonial-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 880px) { .testimonial-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 700px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .testimonial-kpi-grid { grid-template-columns: 1fr !important; }
          .onboarding-stats { display: none !important; }
        }
      `}</style>
    </div>
  );
}
