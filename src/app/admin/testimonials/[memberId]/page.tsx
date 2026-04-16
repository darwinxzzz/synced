"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { MemberTestimonialView } from "~/app/_components/testimonials/MemberTestimonialView";

export default function AdminTestimonialDetailPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;

  const { data: adminProfile } = api.dashboard.getMyProfile.useQuery();
  const { data, refetch, isPending } = api.testimonials.getMemberTestimonial.useQuery({ memberId }, { enabled: !!memberId });

  const [endorsementQuote, setEndorsementQuote] = useState("");
  const [endorsementName, setEndorsementName] = useState("");
  const [endorsementTitle, setEndorsementTitle] = useState("");

  const finalise = api.testimonials.finaliseTestimonial.useMutation({
    onSuccess: async () => {
      toast.success(`Testimonial sent to ${data?.profile.name ?? "member"}`);
      await refetch();
    },
    onError: (error) => toast.error(error.message),
  });

  const seedQuote = useMemo(() => {
    if (!data) return "";
    const topContributions = data.contributionHistory.slice(0, 3).map((item) => item.title).filter(Boolean);
    if (topContributions.length === 0) {
      return `${data.profile.name} has consistently demonstrated strong contribution and reliability across community initiatives.`;
    }
    return `${data.profile.name} has shown clear ownership and impact through ${topContributions.join(", ")}. Their consistency, collaboration, and delivery have materially strengthened the team.`;
  }, [data]);

  const effectiveQuote = endorsementQuote ?? data?.endorsement?.quote ?? "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory-paper)", paddingBottom: 32 }}>
      <div className="admin-testimonial-detail-grid" style={{ maxWidth: 1320, margin: "0 auto", padding: "26px 24px 0", display: "grid", gridTemplateColumns: "1.65fr 0.9fr", gap: 18 }}>
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{ minWidth: 0 }}
        >
          <MemberTestimonialView
            memberId={memberId}
            headerOverride={`${data?.profile.name ?? "Member"} Details`}
            viewerRole="admin"
          />
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.04 }}
          className="card-shadow"
          style={{
            position: "sticky",
            top: 90,
            alignSelf: "start",
            borderRadius: 20,
            background: "var(--deep-forest)",
            color: "var(--cream-white)",
            padding: 18,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="bamboo-label" style={{ margin: 0, color: "var(--sage-mist)" }}>Generate Testimonial</p>
          <h2
            style={{
              margin: "8px 0 8px",
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 700,
              fontStyle: "italic",
              color: "var(--cream-white)",
            }}
          >
            Executive Endorsement
          </h2>

          <p style={{ margin: "0 0 12px", fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "rgba(245,240,232,0.82)", fontSize: 14, lineHeight: 1.5 }}>
            {seedQuote.slice(0, 170)}{seedQuote.length > 170 ? "..." : ""}
          </p>

          <button
            type="button"
            onClick={() => {
              setEndorsementQuote(seedQuote);
              setEndorsementName((prev) => prev ?? adminProfile?.name ?? "");
              setEndorsementTitle((prev) => prev ?? adminProfile?.department ?? "Admin");
              toast.success("Draft endorsement generated");
            }}
            style={{
              width: "100%",
              height: 44,
              border: "none",
              borderRadius: 999,
              background: "var(--accent-gold)",
              color: "var(--charcoal-ink)",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Generate Testimonial
          </button>

          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            <label className="bamboo-label" style={{ color: "rgba(245,240,232,0.85)", margin: 0 }}>
              Endorsement Quote
            </label>
            <textarea
              value={effectiveQuote}
              onChange={(event) => setEndorsementQuote(event.target.value)}
              placeholder="Add an endorsement quote..."
              style={{
                width: "100%",
                minHeight: 170,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(245,240,232,0.08)",
                color: "var(--cream-white)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                lineHeight: 1.5,
                padding: 10,
                outline: "none",
                resize: "vertical",
              }}
            />

            <input
              value={endorsementName ?? data?.endorsement?.adminName ?? adminProfile?.name ?? ""}
              onChange={(event) => setEndorsementName(event.target.value)}
              placeholder="Signer name"
              style={{
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(245,240,232,0.08)",
                color: "var(--cream-white)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                padding: "0 10px",
                outline: "none",
              }}
            />

            <input
              value={endorsementTitle ?? data?.endorsement?.adminTitle ?? adminProfile?.department ?? "Admin"}
              onChange={(event) => setEndorsementTitle(event.target.value)}
              placeholder="Signer title"
              style={{
                height: 38,
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.20)",
                background: "rgba(245,240,232,0.08)",
                color: "var(--cream-white)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                padding: "0 10px",
                outline: "none",
              }}
            />

            <button
              type="button"
              disabled={finalise.isPending || !effectiveQuote.trim() || isPending}
              onClick={() => {
                void finalise.mutate({
                  memberId,
                  endorsementQuote: effectiveQuote.trim(),
                  endorsementName: (endorsementName ?? data?.endorsement?.adminName ?? adminProfile?.name ?? "").trim(),
                  endorsementTitle: (endorsementTitle ?? data?.endorsement?.adminTitle ?? adminProfile?.department ?? "Admin").trim(),
                });
              }}
              style={{
                marginTop: 4,
                width: "100%",
                height: 46,
                border: "none",
                borderRadius: 10,
                background: "var(--bamboo-green)",
                color: "white",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: 12,
                cursor: finalise.isPending ? "not-allowed" : "pointer",
                opacity: finalise.isPending ? 0.65 : 1,
              }}
            >
              {data?.endorsement?.finalisedAt ? "Re-send" : "Finalise & Send"}
            </button>
          </div>
        </motion.aside>
      </div>

      <style>{`
        @media (max-width: 1040px) {
          .admin-testimonial-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
