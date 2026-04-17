"use client";

import Link from "next/link";
import { motion } from "motion/react";

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ borderRadius: 999, border: "1px solid rgba(140,140,140,0.14)", background: "rgba(245,240,232,0.8)", padding: "6px 8px", textAlign: "center" }}>
      <p className="bamboo-label" style={{ margin: 0, fontSize: 8, opacity: 0.7 }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", fontWeight: 700 }}>{value}</p>
    </div>
  );
}

interface RequestCard {
  memberId: string;
  name: string;
  department: string;
  tenure: string;
  stats: { events: number; contributions: number; attendancePct: number };
  quoteSnippet: string;
  requestStatus: string;
}

interface TestimonialRequestsTabProps {
  cards: RequestCard[];
  isPending: boolean;
  filterKey: string;
}

export function TestimonialRequestsTab({ cards, isPending, filterKey }: TestimonialRequestsTabProps) {
  return (
    <motion.div
      key={`requests-${filterKey}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="testimonial-grid"
      style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginTop: 18, paddingBottom: 24 }}
    >
      {isPending
        ? Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="card-shadow" style={{ borderRadius: 20, minHeight: 300, background: "var(--cream-white)", opacity: 0.5 }} />
          ))
        : cards.length === 0
        ? (
            <div style={{ gridColumn: "1 / -1", padding: "48px 24px", border: "1px dashed rgba(140,140,140,0.25)", borderRadius: 14, textAlign: "center" }}>
              <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)", fontStyle: "italic" }}>
                No testimonial requests found.
              </p>
            </div>
          )
        : cards.map((card, index) => (
            <motion.article
              key={card.memberId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="card-shadow"
              style={{ borderRadius: 20, background: "var(--cream-white)", border: "1px solid rgba(140,140,140,0.10)", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--sage-mist)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--deep-forest)", fontFamily: "'DM Sans', sans-serif" }}>
                  {getInitials(card.name)}
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
                <StatPill label="Contributions" value={card.stats.contributions} />
                <StatPill label="Attendance" value={`${card.stats.attendancePct}%`} />
              </div>

              <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "var(--stone-grey)", fontSize: 15, lineHeight: 1.55, minHeight: 100 }}>
                &quot;{card.quoteSnippet.slice(0, 160)}{card.quoteSnippet.length > 160 ? "..." : ""}&quot;
              </p>

              <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
                <Link
                  href={`/admin/testimonials/${card.memberId}`}
                  style={{ height: 40, borderRadius: 999, background: "var(--accent-gold)", color: "var(--deep-forest)", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}
                >
                  Generate Testimonial
                </Link>
                <Link
                  href={`/admin/testimonials/${card.memberId}?view=profile`}
                  style={{ height: 38, borderRadius: 999, border: "1px solid rgba(74,124,89,0.25)", color: "var(--stone-grey)", display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}
                >
                  View Profile
                </Link>
              </div>
            </motion.article>
          ))}
    </motion.div>
  );
}
