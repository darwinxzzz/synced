"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { ReflectionDetailModal, type ReflectionItem } from "~/app/_components/shared/ReflectionDetailModal";

interface MemberTestimonialViewProps {
  memberId: string;
  headerOverride?: string;
  viewerRole?: "member" | "admin";
  onGenerate?: () => void;
}

function MetricCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      className="card-shadow"
      style={{
        background: "var(--cream-white)",
        borderRadius: "16px",
        padding: "20px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "32px",
          fontWeight: 700,
          color: "var(--deep-forest)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span className="bamboo-label">{label}</span>
    </div>
  );
}

function getPerformanceRating(pct: number): { label: string; tier: string } {
  if (pct >= 90) return { label: "Outstanding", tier: "Highest Tier" };
  if (pct >= 75) return { label: "Very Good", tier: "Upper Higher Tier" };
  if (pct >= 50) return { label: "Satisfactory", tier: "Second Lowest Tier" };
  return { label: "Unsatisfactory", tier: "Lowest Tier" };
}

function formatMonthYear(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function MemberTestimonialView({
  memberId,
  headerOverride,
  viewerRole = "member",
  onGenerate,
}: MemberTestimonialViewProps) {
  const [openReflection, setOpenReflection] = useState<ReflectionItem | null>(null);

  const { data, isLoading, refetch } = api.testimonials.getMemberTestimonial.useQuery(
    { memberId },
    { retry: false }
  );

  const requestMutation = api.testimonials.requestTestimonial.useMutation({
    onSuccess: () => {
      toast.success("Testimonial requested ✨");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--stone-grey)", fontSize: "14px" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--stone-grey)", fontSize: "14px" }}>
          Member not found.
        </p>
      </div>
    );
  }

  const { profile, metrics, contributionHistory, endorsement, hasRequestedTestimonial, requestStatus } = data;

  const performance = getPerformanceRating(metrics.weeklyAttendancePct);
  const startDate = formatMonthYear(profile.joinedDate);
  const endDate = formatMonthYear(new Date().toISOString());

  return (
    <>
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }} className="no-print">
        <span className="bamboo-label">Official Document</span>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--deep-forest)",
            margin: "8px 0 12px",
            lineHeight: 1.2,
          }}
        >
          {headerOverride ?? "Request Testimonial"}
        </h1>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: "var(--stone-grey)",
            maxWidth: "480px",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          This document represents a verified record of contributions, attendance, and impact
          within the SYAI community.
        </p>
      </div>

      {/* Main Card */}
      <div
        id="testimonial-card"
        className="card-shadow"
        style={{
          background: "var(--cream-white)",
          borderRadius: "24px",
          padding: "clamp(24px, 4vw, 48px)",
          display: "flex",
          flexDirection: "column",
          gap: "40px",
        }}
      >
        {/* Member Profile Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "16px",
            paddingBottom: "32px",
            borderBottom: "1px solid rgba(74,124,89,0.12)",
          }}
        >
          {/* Left: member info */}
          <div>
            <span className="bamboo-label" style={{ display: "block", marginBottom: "8px" }}>
              Member Profile
            </span>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--deep-forest)",
                marginBottom: "4px",
                lineHeight: 1.2,
              }}
            >
              {profile.name}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "var(--stone-grey)",
                marginBottom: "4px",
              }}
            >
              Volunteered from {startDate} – {endDate}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", marginBottom: "8px" }}>
              {profile.email}
            </p>
            {profile.department && (
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  background: "rgba(168,197,160,0.25)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--bamboo-green)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {profile.department}
              </span>
            )}
          </div>

          {/* Right: download button + performance rating */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              className="no-print"
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                height: "34px",
                padding: "0 14px",
                borderRadius: "8px",
                border: "1px solid rgba(74,124,89,0.30)",
                background: "transparent",
                color: "var(--bamboo-green)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "12px",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                <path d="M8 1v9M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              Download PDF
            </button>

            <div style={{ textAlign: "right" }}>
              <span className="bamboo-label" style={{ display: "block", marginBottom: "6px" }}>
                Issue Date
              </span>
              <p
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "var(--deep-forest)",
                  lineHeight: 1.25,
                  margin: 0,
                }}
              >
                Volunteering Performance:
                <br />
                {performance.label}
              </p>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "var(--stone-grey)",
                  marginTop: "4px",
                }}
              >
                {performance.tier}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div>
          <span className="bamboo-label" style={{ marginBottom: "16px", display: "block" }}>
            Performance Metrics
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "12px",
            }}
            className="metrics-grid"
          >
            <MetricCard value={metrics.eventsContributed} label="Events Contributed" />
            <MetricCard value={`${metrics.weeklyAttendancePct}%`} label="Weekly Attendance" />
            <MetricCard value={metrics.projectLeads} label="Project Leads" />
            <MetricCard value={metrics.collaborations} label="Collaborations" />
            <MetricCard value={metrics.totalContributions} label="Contributions" />
          </div>
        </div>

        {/* Contribution History Timeline */}
        {contributionHistory.length > 0 && (
          <div>
            <span className="bamboo-label" style={{ marginBottom: "20px", display: "block" }}>
              Contribution History
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {contributionHistory.map((entry, idx) => {
                const dateStr = entry.date
                  ? new Date(entry.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";
                const isLast = idx === contributionHistory.length - 1;
                const hasReflection = !!entry.reflection;

                return (
                  <div key={entry.id} style={{ display: "flex", gap: "0", alignItems: "stretch" }}>
                    {/* Left: date */}
                    <div
                      style={{
                        width: "100px",
                        flexShrink: 0,
                        paddingTop: "4px",
                        paddingRight: "16px",
                        textAlign: "right",
                      }}
                    >
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "var(--stone-grey)" }}>
                        {dateStr}
                      </span>
                    </div>

                    {/* Centre: timeline line + dot */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
                      <div
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "50%",
                          background: "var(--bamboo-green)",
                          flexShrink: 0,
                          marginTop: "4px",
                        }}
                      />
                      {!isLast && (
                        <div
                          style={{
                            width: "2px",
                            flex: 1,
                            background: "var(--bamboo-green)",
                            opacity: 0.25,
                            minHeight: "24px",
                          }}
                        />
                      )}
                    </div>

                    {/* Right: content */}
                    <div
                      style={{
                        flex: 1,
                        paddingLeft: "16px",
                        paddingBottom: isLast ? "0" : "24px",
                        paddingTop: "2px",
                      }}
                    >
                      <button
                        onClick={() => {
                          if (hasReflection) setOpenReflection(entry.reflection);
                        }}
                        aria-label={hasReflection ? `View reflection for ${entry.title}` : entry.title}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "0",
                          textAlign: "left",
                          cursor: hasReflection ? "pointer" : "default",
                          width: "100%",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            fontWeight: 600,
                            color: hasReflection ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                            marginBottom: "2px",
                            textDecoration: hasReflection ? "underline" : "none",
                            textDecorationColor: "rgba(74,124,89,0.4)",
                          }}
                        >
                          {entry.title}
                          {hasReflection && (
                            <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: 400, color: "var(--stone-grey)" }}>
                              (view reflection)
                            </span>
                          )}
                        </p>
                        {entry.description && (
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", lineHeight: 1.5 }}>
                            {entry.description}
                          </p>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Executive Endorsement Block */}
        {endorsement ? (
          <div
            style={{
              background: "rgba(74,124,89,0.05)",
              borderLeft: "3px solid var(--bamboo-green)",
              borderRadius: "0 12px 12px 0",
              padding: "24px 28px",
            }}
          >
            <span className="bamboo-label" style={{ marginBottom: "12px", display: "block" }}>
              Executive Endorsement
            </span>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                fontStyle: "italic",
                color: "var(--charcoal-ink)",
                lineHeight: 1.7,
                marginBottom: "16px",
              }}
            >
              &ldquo;{endorsement.quote}&rdquo;
            </p>
            <div
              style={{
                height: "1px",
                background: "rgba(74,124,89,0.15)",
                marginBottom: "14px",
              }}
            />
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--deep-forest)",
              }}
            >
              {endorsement.adminName}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--stone-grey)" }}>
              {endorsement.adminTitle}
            </p>
          </div>
        ) : viewerRole === "admin" ? (
          <div
            style={{
              background: "rgba(74,124,89,0.04)",
              borderLeft: "3px solid rgba(74,124,89,0.30)",
              borderRadius: "0 12px 12px 0",
              padding: "24px 28px",
            }}
          >
            <span className="bamboo-label" style={{ marginBottom: "10px", display: "block" }}>
              Executive Endorsement
            </span>
            <p
              style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "15px",
                color: "var(--charcoal-ink)",
                lineHeight: 1.7,
                marginBottom: "18px",
              }}
            >
              &ldquo;{profile.name} has demonstrated an exceptional commitment to the SYAI community through consistent contributions, strong leadership, and measurable impact across initiatives...&rdquo;
            </p>
            <button
              type="button"
              onClick={onGenerate}
              style={{
                height: "40px",
                padding: "0 24px",
                border: "none",
                borderRadius: "999px",
                background: "var(--accent-gold)",
                color: "var(--charcoal-ink)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              Generate Testimonial
            </button>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(140,140,140,0.04)",
              border: "1px dashed rgba(140,140,140,0.20)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", fontStyle: "italic" }}>
              Executive endorsement will appear here once an admin finalises your testimonial.
            </p>
          </div>
        )}

        {/* Request Testimonial Button — member only, before request */}
        {viewerRole === "member" && !hasRequestedTestimonial && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending}
              style={{
                height: "48px",
                padding: "0 36px",
                borderRadius: "12px",
                border: "none",
                background: requestMutation.isPending ? "var(--sage-mist)" : "var(--accent-gold)",
                color: "var(--charcoal-ink)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                fontWeight: 600,
                cursor: requestMutation.isPending ? "default" : "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => { if (!requestMutation.isPending) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {requestMutation.isPending ? "Requesting…" : "✨ Request Testimonial"}
            </button>
          </div>
        )}

        {/* Already requested state */}
        {viewerRole === "member" && hasRequestedTestimonial && requestStatus !== "sent" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                height: "48px",
                padding: "0 36px",
                borderRadius: "12px",
                background: "rgba(140,140,140,0.10)",
                display: "flex",
                alignItems: "center",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                color: "var(--stone-grey)",
              }}
            >
              Requested ✓
            </div>
          </div>
        )}
      </div>

      {/* Reflection Modal */}
      <ReflectionDetailModal
        reflection={openReflection}
        open={!!openReflection}
        onClose={() => setOpenReflection(null)}
        onSuccess={() => void refetch()}
      />

      <style>{`
        @media (max-width: 900px) {
          .metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media print {
          body * { visibility: hidden; }
          #testimonial-card,
          #testimonial-card * { visibility: visible; }
          #testimonial-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}
