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
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

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

  const displayName = isEditing ? editName : profile.name;
  const displayDepartment = isEditing ? editDepartment : (profile.department ?? "");

  const handleEditStart = () => {
    setEditName(profile.name);
    setEditDepartment(profile.department ?? "");
    setIsEditing(true);
  };

  const handleEditSave = () => {
    toast.success("Details updated");
    setIsEditing(false);
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }} className="no-print">
        <span className="bamboo-label">Official Document</span>
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: "var(--deep-forest)",
            margin: "10px 0 14px",
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
            lineHeight: 1.7,
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
          padding: "clamp(28px, 4vw, 52px)",
          display: "flex",
          flexDirection: "column",
          gap: "56px",
        }}
      >
        {/* ── Step 1 & 2: Profile Row — name+tags inline, Edit button top-right ── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "20px",
            paddingBottom: "40px",
            borderBottom: "1px solid rgba(74,124,89,0.12)",
          }}
        >
          {/* Left: member info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="bamboo-label" style={{ display: "block", marginBottom: "14px" }}>
              Member Profile
            </span>

            {/* Name + department tags in one horizontal flex row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "8px",
              }}
            >
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "var(--deep-forest)",
                    border: "1px solid rgba(74,124,89,0.30)",
                    borderRadius: "8px",
                    padding: "4px 10px",
                    background: "var(--ivory-paper)",
                    outline: "none",
                    width: "220px",
                  }}
                />
              ) : (
                <p
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--deep-forest)",
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {displayName}
                </p>
              )}

              {/* Department tags — only flow horizontally, no vertical stacking */}
              {isEditing ? (
                <input
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="Department"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    border: "1px solid rgba(74,124,89,0.30)",
                    borderRadius: "20px",
                    padding: "4px 12px",
                    background: "var(--ivory-paper)",
                    color: "var(--bamboo-green)",
                    outline: "none",
                    width: "140px",
                    letterSpacing: "0.06em",
                  }}
                />
              ) : (
                displayDepartment && (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      background: "rgba(168,197,160,0.25)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--bamboo-green)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayDepartment}
                  </span>
                )
              )}
            </div>

            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "var(--stone-grey)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Volunteered from {startDate} – {endDate}
            </p>

            {/* Save / Cancel shown below date when in edit mode */}
            {isEditing && (
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }} className="no-print">
                <button
                  type="button"
                  onClick={handleEditSave}
                  style={{
                    height: "32px",
                    padding: "0 18px",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--bamboo-green)",
                    color: "white",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    height: "32px",
                    padding: "0 18px",
                    borderRadius: "8px",
                    border: "1px solid rgba(74,124,89,0.25)",
                    background: "transparent",
                    color: "var(--stone-grey)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Right: Edit button (where Download PDF was) + performance rating */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "14px",
            }}
          >
            {/* ── Step 2: Edit button with pencil icon ── */}
            {!isEditing && (
              <button
                type="button"
                className="no-print"
                onClick={handleEditStart}
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
                  <path
                    d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Edit
              </button>
            )}

            <div style={{ textAlign: "right" }}>
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
                  marginTop: "6px",
                }}
              >
                {performance.tier}
              </p>
            </div>
          </div>
        </div>

        {/* ── Step 4 & 5: Performance Metrics — more breathing room, last card = Hours Volunteered ── */}
        <div>
          <span className="bamboo-label" style={{ marginBottom: "24px", display: "block" }}>
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
            <MetricCard value={metrics.projectLeads} label="Events Leads" />
            <MetricCard value={metrics.collaborations} label="Collaborations" />
            <MetricCard value={metrics.totalContributions} label="Contributions" />
          </div>
        </div>

        {/* Contribution History Timeline */}
        {contributionHistory.length > 0 && (
          <div>
            <span className="bamboo-label" style={{ marginBottom: "28px", display: "block" }}>
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
                        paddingBottom: isLast ? "0" : "28px",
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
                            marginBottom: "4px",
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
                          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", lineHeight: 1.6 }}>
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
              padding: "28px 32px",
            }}
          >
            <span className="bamboo-label" style={{ marginBottom: "16px", display: "block" }}>
              Executive Endorsement
            </span>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                fontStyle: "italic",
                color: "var(--charcoal-ink)",
                lineHeight: 1.8,
                marginBottom: "20px",
              }}
            >
              &ldquo;{endorsement.quote}&rdquo;
            </p>
            <div
              style={{
                height: "1px",
                background: "rgba(74,124,89,0.15)",
                marginBottom: "16px",
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
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--stone-grey)", marginTop: "2px" }}>
              {endorsement.adminTitle}
            </p>
          </div>
        ) : (
          <div
            style={{
              background: "rgba(140,140,140,0.04)",
              border: "1px dashed rgba(140,140,140,0.20)",
              borderRadius: "12px",
              padding: "28px",
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
