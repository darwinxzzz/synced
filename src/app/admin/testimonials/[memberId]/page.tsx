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
    onSuccess: async () => {
      toast.success(`Testimonial sent to ${data?.profile.name ?? "member"}`);
      await refetch();
    },
    onError: (error) => toast.error(error.message),
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
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--ivory-paper)", paddingBottom: 48 }}>

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
              zIndex: 50,
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

        {/* Admin endorsement form — below the testimonial card */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: 0.08 }}
          className="card-shadow no-print"
          style={{
            marginTop: 24,
            borderRadius: 20,
            background: "var(--cream-white)",
            padding: 28,
            display: "grid",
            gap: 12,
          }}
        >
          <p className="bamboo-label" style={{ margin: 0 }}>Admin Controls</p>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 700,
              fontStyle: "italic",
              color: "var(--deep-forest)",
              margin: "2px 0 4px",
            }}
          >
            Finalise Endorsement
          </h2>

          <label className="bamboo-label" style={{ margin: 0, color: "var(--stone-grey)" }}>
            Endorsement Quote
          </label>
          <textarea
            value={effectiveQuote}
            onChange={(e) => setEndorsementQuote(e.target.value)}
            placeholder="Add an endorsement quote…"
            style={{
              width: "100%",
              minHeight: 130,
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
              value={endorsementName !== "" ? endorsementName : (data?.endorsement?.adminName ?? adminProfile?.name ?? "")}
              onChange={(e) => setEndorsementName(e.target.value)}
              placeholder="Signer name"
              style={{
                height: 40,
                borderRadius: 10,
                border: "1px solid rgba(74,124,89,0.25)",
                background: "var(--ivory-paper)",
                color: "var(--charcoal-ink)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                padding: "0 12px",
                outline: "none",
              }}
            />
            <input
              value={endorsementTitle !== "" ? endorsementTitle : (data?.endorsement?.adminTitle ?? adminProfile?.department ?? "Admin")}
              onChange={(e) => setEndorsementTitle(e.target.value)}
              placeholder="Signer title"
              style={{
                height: 40,
                borderRadius: 10,
                border: "1px solid rgba(74,124,89,0.25)",
                background: "var(--ivory-paper)",
                color: "var(--charcoal-ink)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                padding: "0 12px",
                outline: "none",
              }}
            />
          </div>

          <button
            type="button"
            disabled={finalise.isPending || !effectiveQuote.trim() || isPending}
            onClick={() => {
              void finalise.mutate({
                memberId,
                endorsementQuote: effectiveQuote.trim(),
                endorsementName: (
                  endorsementName !== "" ? endorsementName : (data?.endorsement?.adminName ?? adminProfile?.name ?? "")
                ).trim(),
                endorsementTitle: (
                  endorsementTitle !== "" ? endorsementTitle : (data?.endorsement?.adminTitle ?? adminProfile?.department ?? "Admin")
                ).trim(),
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
              opacity: finalise.isPending || !effectiveQuote.trim() ? 0.55 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {data?.endorsement?.finalisedAt ? "Re-send" : "Finalise & Send"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
