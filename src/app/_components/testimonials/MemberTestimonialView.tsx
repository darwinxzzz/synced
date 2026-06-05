"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { ReflectionDetailModal, type ReflectionItem } from "~/app/_components/shared/ReflectionDetailModal";
import { ConfirmSaveBar } from "~/app/_components/shared/ConfirmSaveBar";
import { ContributionTimeline } from "./ContributionTimeline";
import { EndorsementBlock } from "./EndorsementBlock";

interface MemberTestimonialViewProps {
  memberId: string;
  headerOverride?: string;
  viewerRole?: "member" | "admin";
  onGenerate?: () => void;
}

function MetricCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: "16px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", fontWeight: 700, color: "var(--deep-forest)", lineHeight: 1 }}>
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
  onGenerate: _onGenerate,
}: MemberTestimonialViewProps) {
  const [openReflection, setOpenReflection] = useState<ReflectionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingSave, setConfirmingSave] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  const utils = api.useUtils();
  const { data, isLoading, refetch } = api.testimonials.getMemberTestimonial.useQuery(
    { memberId },
    { retry: false }
  );

  const requestMutation = api.testimonials.requestTestimonial.useMutation({
    onMutate: async () => {
      await utils.testimonials.getMemberTestimonial.cancel({ memberId });
      const prev = utils.testimonials.getMemberTestimonial.getData({ memberId });
      utils.testimonials.getMemberTestimonial.setData({ memberId }, (old) => {
        if (!old) return old;
        return { ...old, hasRequestedTestimonial: true };
      });
      return { prev };
    },
    onSuccess: () => {
      toast.success("Testimonial requested ✨");
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) {
        utils.testimonials.getMemberTestimonial.setData({ memberId }, ctx.prev);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      void utils.testimonials.getMemberTestimonial.invalidate({ memberId });
    },
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--stone-grey)", fontSize: "14px" }}>Loading…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "40vh" }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--stone-grey)", fontSize: "14px" }}>Member not found.</p>
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
    setConfirmingSave(false);
  };

  const handleEditSave = () => {
    toast.success("Details updated");
    setIsEditing(false);
    setConfirmingSave(false);
  };

  return (
    <>
      {/* Page Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }} className="no-print">
        <span className="bamboo-label">Official Document</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, fontStyle: "italic", color: "var(--deep-forest)", margin: "10px 0 14px", lineHeight: 1.2 }}>
          {headerOverride ?? "Request Testimonial"}
        </h1>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "var(--stone-grey)", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
          This document represents a verified record of contributions, attendance, and impact within the SYAI community.
        </p>
      </div>
    
      {!isEditing && (
        <div
          className="no-print"
          style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}
        >
          <button
            type="button"
            onClick={handleEditStart}
            style={{ display: "flex", alignItems: "center", gap: "6px", height: "34px", padding: "0 14px", borderRadius: "8px", border: "1px solid rgba(74,124,89,0.30)", background: "transparent", color: "var(--bamboo-green)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em" }}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H3v-2L11.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit
          </button>
        </div>
      )}
      {/* Main Card */}
      <div id="testimonial-card" className="card-shadow" style={{ background: "var(--cream-white)", borderRadius: "24px", padding: "clamp(28px, 4vw, 52px)", display: "flex", flexDirection: "column", gap: "56px" }}>
        {/* Profile Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px", paddingBottom: "40px", borderBottom: "1px solid rgba(74,124,89,0.12)" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="bamboo-label" style={{ display: "block", marginBottom: "14px" }}>Member Profile</span>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" }}>
              {isEditing ? (
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700, color: "var(--deep-forest)", border: "1px solid rgba(74,124,89,0.30)", borderRadius: "8px", padding: "4px 10px", background: "var(--ivory-paper)", outline: "none", width: "220px" }}
                />
              ) : (
                <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "var(--deep-forest)", lineHeight: 1.2, margin: 0 }}>
                  {displayName}
                </p>
              )}

              {isEditing ? (
                <input
                  value={editDepartment}
                  onChange={(e) => setEditDepartment(e.target.value)}
                  placeholder="Department"
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, border: "1px solid rgba(74,124,89,0.30)", borderRadius: "20px", padding: "4px 12px", background: "var(--ivory-paper)", color: "var(--bamboo-green)", outline: "none", width: "140px", letterSpacing: "0.06em" }}
                />
              ) : (
                displayDepartment && (
                  <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: "20px", background: "rgba(168,197,160,0.25)", fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 600, color: "var(--bamboo-green)", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {displayDepartment}
                  </span>
                )
              )}
            </div>

            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", margin: 0, lineHeight: 1.6 }}>
              Volunteered from {startDate} – {endDate}
            </p>

            {isEditing && (
              <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexDirection: "column", maxWidth: "360px" }} className="no-print">
                <button type="button" onClick={() => setConfirmingSave(true)} style={{ height: "32px", padding: "0 18px", borderRadius: "8px", border: "none", background: "var(--bamboo-green)", color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  Save
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setConfirmingSave(false); }} style={{ height: "32px", padding: "0 18px", borderRadius: "8px", border: "1px solid rgba(74,124,89,0.25)", background: "transparent", color: "var(--stone-grey)", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "12px", cursor: "pointer" }}>
                  Cancel
                </button>
                {confirmingSave && (
                  <ConfirmSaveBar
                    onConfirm={handleEditSave}
                    onCancel={() => setConfirmingSave(false)}
                  />
                )}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "14px" }}>
            
            <div style={{ textAlign: "right" }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "22px", fontWeight: 700, color: "var(--deep-forest)", lineHeight: 1.25, margin: 0 }}>
                Volunteering Performance:<br />{performance.label}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--stone-grey)", marginTop: "6px" }}>
                {performance.tier}
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div>
          <span className="bamboo-label" style={{ marginBottom: "24px", display: "block" }}>Performance Metrics</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }} className="metrics-grid">
            <MetricCard value={metrics.eventsContributed} label="Events Contributed" />
            <MetricCard value={`${metrics.weeklyAttendancePct}%`} label="Weekly Attendance" />
            <MetricCard value={metrics.projectLeads} label="Events Leads" />
            <MetricCard value={metrics.collaborations} label="Collaborations" />
            <MetricCard value={metrics.totalContributions} label="Contributions" />
          </div>
        </div>

        {/* Contribution History */}
        <ContributionTimeline entries={contributionHistory} onSelectReflection={setOpenReflection} />

        {/* Endorsement */}
        <EndorsementBlock endorsement={endorsement} />

        {/* Request button — member only */}
        {viewerRole === "member" && !hasRequestedTestimonial && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending}
              style={{ height: "48px", padding: "0 36px", borderRadius: "12px", border: "none", background: requestMutation.isPending ? "var(--sage-mist)" : "var(--accent-gold)", color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, cursor: requestMutation.isPending ? "default" : "pointer", transition: "opacity 0.2s" }}
              onMouseEnter={(e) => { if (!requestMutation.isPending) e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
            >
              {requestMutation.isPending ? "Requesting…" : "✨ Request Testimonial"}
            </button>
          </div>
        )}

        {viewerRole === "member" && hasRequestedTestimonial && requestStatus !== "sent" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ height: "48px", padding: "0 36px", borderRadius: "12px", background: "rgba(140,140,140,0.10)", display: "flex", alignItems: "center", fontFamily: "'DM Sans', sans-serif", fontSize: "15px", color: "var(--stone-grey)" }}>
              Requested ✓
            </div>
          </div>
        )}
      </div>

      <ReflectionDetailModal
        reflection={openReflection}
        open={!!openReflection}
        onClose={() => setOpenReflection(null)}
        onSuccess={() => void refetch()}
        viewerRole={viewerRole === "admin" ? "admin" : "member"}
      />

      <style>{`
        @media (max-width: 900px) { .metrics-grid { grid-template-columns: repeat(3, 1fr) !important; } }
        @media (max-width: 540px) { .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media print {
          body * { visibility: hidden; }
          #testimonial-card, #testimonial-card * { visibility: visible; }
          #testimonial-card { position: absolute; left: 0; top: 0; width: 100%; border-radius: 0 !important; box-shadow: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </>
  );
}
