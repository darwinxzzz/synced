"use client";

interface Endorsement {
  quote: string;
  adminName: string;
  adminTitle: string;
}

interface EndorsementBlockProps {
  endorsement: Endorsement | null | undefined;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function EndorsementBlock({ endorsement }: EndorsementBlockProps) {
  if (endorsement) {
    return (
      <div style={{ background: "rgba(74,124,89,0.04)", borderRadius: "16px", padding: "32px 36px" }}>
        <span className="bamboo-label" style={{ marginBottom: "20px", display: "block" }}>
          Executive Endorsement
        </span>

        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "17px",
            fontStyle: "italic",
            fontWeight: 400,
            color: "var(--charcoal-ink)",
            lineHeight: 1.85,
            marginBottom: "28px",
            marginTop: 0,
          }}
        >
          &ldquo;{endorsement.quote}&rdquo;
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* Initials circle — represents signer signature */}
          <div
            style={{
              width: "48px",
              height: "48px",
              flexShrink: 0,
              borderRadius: "50%",
              background: "rgba(74,124,89,0.10)",
              border: "1px solid rgba(74,124,89,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
              color: "var(--bamboo-green)",
              letterSpacing: "0.04em",
            }}
          >
            {getInitials(endorsement.adminName)}
          </div>

          <div>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--deep-forest)",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {endorsement.adminName}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--bamboo-green)",
                margin: "4px 0 0",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {endorsement.adminTitle}
            </p>
          </div>
        </div>
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
