"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { MemberTestimonialView } from "~/app/_components/testimonials/MemberTestimonialView";

export default function AdminTestimonialDetailPage() {
  const params = useParams<{ memberId: string }>();
  const memberId = params.memberId;

  const { data: adminProfile } = api.dashboard.getMyProfile.useQuery();
  const { data, refetch, isPending } = api.testimonials.getMemberTestimonial.useQuery(
    { memberId },
    { enabled: !!memberId }
  );

  const [endorsementQuote, setEndorsementQuote] = useState("");
  const [endorsementName, setEndorsementName] = useState("");
  const [endorsementTitle, setEndorsementTitle] = useState("");
  const [stickyVisible, setStickyVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setStickyVisible(!(entry?.isIntersecting ?? true)),
      { threshold: 0 }
    );
    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const finalise = api.testimonials.finaliseTestimonial.useMutation({
    onSuccess: () => {
      toast.success(`Testimonial sent to ${data?.profile.name ?? "member"}`);
    },
    onError: (error) => toast.error(error.message),
    onSettled: () => {
      void refetch();
    },
  });

  const seedQuote = useMemo(() => {
    if (!data) return "";
    const topContributions = data.contributionHistory
      .slice(0, 3)
      .map((item) => item.title)
      .filter(Boolean);
    if (topContributions.length === 0) {
      return `${data.profile.name} has consistently demonstrated strong contribution and reliability across community initiatives.`;
    }
    return `${data.profile.name} has shown clear ownership and impact through ${topContributions.join(", ")}. Their consistency, collaboration, and delivery have materially strengthened the team.`;
  }, [data]);

  const effectiveQuote = endorsementQuote !== "" ? endorsementQuote : (data?.endorsement?.quote ?? "");

  const handleGenerate = () => {
    setEndorsementQuote(seedQuote);
    setEndorsementName((prev) => prev !== "" ? prev : (adminProfile?.name ?? ""));
    setEndorsementTitle((prev) => prev !== "" ? prev : (adminProfile?.department ?? "Admin"));
    toast.success("Draft endorsement generated");
    setSheetOpen(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory-paper)", paddingBottom: 100 }}>

      {/* Sticky name bar — appears when scrolling past the page title */}
      <AnimatePresence>
        {stickyVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="no-print"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              background: "var(--cream-white)",
              borderBottom: "1px solid rgba(74,124,89,0.12)",
              padding: "10px 24px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="bamboo-label" style={{ margin: 0 }}>Testimonial</span>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "18px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--deep-forest)",
              }}
            >
              {data?.profile.name ?? "Member"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "26px 24px 0" }}>

        {/* Sentinel: when this scrolls out of view the sticky bar appears */}
        <div ref={sentinelRef} style={{ height: 1, marginBottom: -1 }} />

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <MemberTestimonialView
            memberId={memberId}
            headerOverride={`${data?.profile.name ?? "Member"} Details`}
            viewerRole="admin"
            onGenerate={handleGenerate}
          />
        </motion.section>

      </div>

      {/* Sticky footer action bar — matches Stitch design */}
      <div
        className="no-print"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "var(--cream-white)",
          borderTop: "1px solid rgba(74,124,89,0.12)",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Download PDF */}
        <button
          type="button"
          onClick={() => window.print()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "var(--stone-grey)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: "0 4px",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v9M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Download PDF
        </button>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Request Revision */}
          <button
            type="button"
            onClick={() => toast.info("Revision request noted")}
            style={{
              height: "44px",
              padding: "0 20px",
              borderRadius: "10px",
              border: "1px solid rgba(74,124,89,0.30)",
              background: "transparent",
              color: "var(--charcoal-ink)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Request Revision
          </button>

          {/* Finalise & Share → opens bottom sheet */}
          <button
            type="button"
            onClick={() => {
              setEndorsementQuote((prev) => prev !== "" ? prev : (data?.endorsement?.quote ?? ""));
              setEndorsementName((prev) => prev !== "" ? prev : (data?.endorsement?.adminName ?? adminProfile?.name ?? ""));
              setEndorsementTitle((prev) => prev !== "" ? prev : (data?.endorsement?.adminTitle ?? adminProfile?.department ?? "Admin"));
              setSheetOpen(true);
            }}
            style={{
              height: "44px",
              padding: "0 24px",
              borderRadius: "10px",
              border: "none",
              background: "var(--deep-forest)",
              color: "white",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {data?.endorsement?.finalisedAt ? "Re-send" : "Finalise & Share"}
          </button>
        </div>
      </div>

      {/* Bottom sheet — endorsement form */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="no-print"
              onClick={() => setSheetOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 45,
                background: "rgba(0,0,0,0.28)",
              }}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              ref={formRef}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className="no-print"
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: "var(--cream-white)",
                borderRadius: "20px 20px 0 0",
                padding: "28px 32px 40px",
                display: "grid",
                gap: 14,
                maxWidth: 860,
                margin: "0 auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p className="bamboo-label" style={{ margin: 0 }}>Finalise Endorsement</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--stone-grey)", fontSize: 20, lineHeight: 1, padding: "0 4px" }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEndorsementQuote(seedQuote);
                  setEndorsementName((prev) => prev !== "" ? prev : (adminProfile?.name ?? ""));
                  setEndorsementTitle((prev) => prev !== "" ? prev : (adminProfile?.department ?? "Admin"));
                  toast.success("Draft endorsement generated");
                }}
                style={{
                  alignSelf: "start",
                  height: "30px",
                  padding: "0 14px",
                  borderRadius: "8px",
                  border: "1px solid rgba(74,124,89,0.28)",
                  background: "transparent",
                  color: "var(--bamboo-green)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                ✦ Generate AI Draft
              </button>

              <textarea
                value={effectiveQuote}
                onChange={(e) => setEndorsementQuote(e.target.value)}
                placeholder="Add an endorsement quote…"
                style={{
                  width: "100%",
                  minHeight: 110,
                  borderRadius: 12,
                  border: "1px solid rgba(74,124,89,0.25)",
                  background: "var(--ivory-paper)",
                  color: "var(--charcoal-ink)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  lineHeight: 1.5,
                  padding: 12,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input
                  value={endorsementName}
                  onChange={(e) => setEndorsementName(e.target.value)}
                  placeholder="Signer name"
                  style={{ height: 40, borderRadius: 10, border: "1px solid rgba(74,124,89,0.25)", background: "var(--ivory-paper)", color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "0 12px", outline: "none" }}
                />
                <input
                  value={endorsementTitle}
                  onChange={(e) => setEndorsementTitle(e.target.value)}
                  placeholder="Signer title / role"
                  style={{ height: 40, borderRadius: 10, border: "1px solid rgba(74,124,89,0.25)", background: "var(--ivory-paper)", color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, padding: "0 12px", outline: "none" }}
                />
              </div>

              <button
                type="button"
                disabled={finalise.isPending || !effectiveQuote.trim() || isPending}
                onClick={() => {
                  void finalise.mutate({
                    memberId,
                    endorsementQuote: effectiveQuote.trim(),
                    endorsementName: (endorsementName !== "" ? endorsementName : (adminProfile?.name ?? "")).trim(),
                    endorsementTitle: (endorsementTitle !== "" ? endorsementTitle : (adminProfile?.department ?? "Admin")).trim(),
                  });
                  setSheetOpen(false);
                }}
                style={{
                  width: "100%",
                  height: 46,
                  border: "none",
                  borderRadius: 10,
                  background: "var(--deep-forest)",
                  color: "white",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: 12,
                  cursor: finalise.isPending ? "not-allowed" : "pointer",
                  opacity: finalise.isPending || !effectiveQuote.trim() ? 0.5 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {data?.endorsement?.finalisedAt ? "Re-send Endorsement" : "Confirm & Send"}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
