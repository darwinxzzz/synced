"use client";

import Link from "next/link";
import { motion } from "motion/react";

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

interface OnboardingCard {
  memberId: string;
  name: string;
  department: string;
  tenure: string;
  stats: { events: number; attendancePct: number };
  requestStatus: string;
}

interface OnboardingTabProps {
  cards: OnboardingCard[];
  isPending: boolean;
}

export function OnboardingTab({ cards, isPending }: OnboardingTabProps) {
  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      style={{ marginTop: 18, paddingBottom: 24 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span className="bamboo-label">Onboarding</span>
        <span
          style={{
            padding: "4px 12px",
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
          {cards.length} members
        </span>
      </div>

      <div className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: 20, padding: "8px 0", overflow: "hidden" }}>
        {isPending ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{ height: 72, margin: "4px 16px", borderRadius: 14, background: "var(--ivory-paper)", opacity: 0.5 }}
            />
          ))
        ) : cards.length === 0 ? (
          <div style={{ margin: 24, padding: "32px 24px", border: "1px dashed rgba(140,140,140,0.25)", borderRadius: 14, textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)", fontStyle: "italic" }}>
              No members pending onboarding.
            </p>
          </div>
        ) : (
          cards.map((card, index) => (
            <motion.div
              key={card.memberId}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.025 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 20px",
                borderBottom: index < cards.length - 1 ? "1px solid rgba(140,140,140,0.08)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,197,160,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--sage-mist)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 14, color: "var(--deep-forest)",
                  fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
                }}
              >
                {getInitials(card.name)}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: "var(--deep-forest)", lineHeight: 1.2 }}>
                    {card.name}
                  </p>
                  <span style={{ padding: "2px 9px", borderRadius: 999, background: "rgba(74,124,89,0.12)", fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: "var(--bamboo-green)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {card.department}
                  </span>
                </div>
                <p style={{ margin: "3px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "var(--stone-grey)" }}>
                  {card.tenure}
                </p>
              </div>

              <div style={{ display: "flex", gap: 20, flexShrink: 0 }} className="onboarding-stats">
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--deep-forest)" }}>{card.stats.events}</p>
                  <p className="bamboo-label" style={{ margin: "2px 0 0", fontSize: 9, opacity: 0.7 }}>Events</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--deep-forest)" }}>{card.stats.attendancePct}%</p>
                  <p className="bamboo-label" style={{ margin: "2px 0 0", fontSize: 9, opacity: 0.7 }}>Attendance</p>
                </div>
              </div>

              <span
                style={{
                  padding: "4px 11px", borderRadius: 999,
                  border: card.requestStatus === "sent" ? "1px solid rgba(74,124,89,0.45)" : "1px solid rgba(196,163,90,0.55)",
                  color: card.requestStatus === "sent" ? "var(--bamboo-green)" : "var(--accent-gold)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0,
                }}
              >
                {card.requestStatus === "sent" ? "Ready" : "Pending Review"}
              </span>

              <Link
                href={`/admin/testimonials/${card.memberId}`}
                style={{
                  height: 32, padding: "0 16px", borderRadius: 999,
                  border: "1px solid rgba(74,124,89,0.35)", color: "var(--bamboo-green)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
                  textTransform: "uppercase", whiteSpace: "nowrap", flexShrink: 0, transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74,124,89,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                Begin Onboarding
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
