"use client";

interface Endorsement {
  quote: string;
  adminName: string;
  adminTitle: string;
}

interface EndorsementBlockProps {
  endorsement: Endorsement | null | undefined;
}

export function EndorsementBlock({ endorsement }: EndorsementBlockProps) {
  if (endorsement) {
    return (
      <div style={{ background: "rgba(74,124,89,0.05)", borderLeft: "3px solid var(--bamboo-green)", borderRadius: "0 12px 12px 0", padding: "28px 32px" }}>
        <span className="bamboo-label" style={{ marginBottom: "16px", display: "block" }}>
          Executive Endorsement
        </span>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontStyle: "italic", color: "var(--charcoal-ink)", lineHeight: 1.8, marginBottom: "20px" }}>
          &ldquo;{endorsement.quote}&rdquo;
        </p>
        <div style={{ height: "1px", background: "rgba(74,124,89,0.15)", marginBottom: "16px" }} />
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", fontWeight: 600, color: "var(--deep-forest)" }}>
          {endorsement.adminName}
        </p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--stone-grey)", marginTop: "2px" }}>
          {endorsement.adminTitle}
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: "rgba(140,140,140,0.04)", border: "1px dashed rgba(140,140,140,0.20)", borderRadius: "12px", padding: "28px", textAlign: "center" }}>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)", fontStyle: "italic" }}>
        Executive endorsement will appear here once an admin finalises your testimonial.
      </p>
    </div>
  );
}
