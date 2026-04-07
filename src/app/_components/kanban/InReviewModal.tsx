"use client";

import { useState } from "react";
import { X } from "lucide-react";

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

interface InReviewModalProps {
  open: boolean;
  onConfirm: (changes: string, challengesFaced: string) => void;
  onCancel: () => void;
}

const WORD_LIMIT = 30;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "var(--bamboo-green)",
  marginBottom: "6px",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "88px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(74,124,89,0.20)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--charcoal-ink)",
  outline: "none",
  resize: "vertical",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

export function InReviewModal({ open, onConfirm, onCancel }: InReviewModalProps) {
  const [changes, setChanges] = useState("");
  const [challenges, setChallenges] = useState("");
  const [errors, setErrors] = useState<{ changes?: string; challenges?: string }>({});

  const changesWords = countWords(changes);
  const challengesWords = countWords(challenges);

  const handleConfirm = () => {
    const errs: typeof errors = {};
    if (!changes.trim()) errs.changes = "Required";
    else if (changesWords > WORD_LIMIT) errs.changes = `Max ${WORD_LIMIT} words`;
    if (!challenges.trim()) errs.challenges = "Required";
    else if (challengesWords > WORD_LIMIT) errs.challenges = `Max ${WORD_LIMIT} words`;

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    onConfirm(changes, challenges);
    setChanges("");
    setChallenges("");
    setErrors({});
  };

  const handleCancel = () => {
    setChanges("");
    setChallenges("");
    setErrors({});
    onCancel();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleCancel}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(28,58,43,0.45)",
          backdropFilter: "blur(4px) saturate(0.8)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 60,
          width: "min(520px, calc(100vw - 32px))",
          background: "var(--cream-white)",
          borderRadius: "20px",
          boxShadow: "0 24px 64px rgba(28,58,43,0.20), 0 4px 16px rgba(28,58,43,0.10)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90dvh",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(74,124,89,0.12)",
            background: "var(--ivory-paper)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--deep-forest)",
                lineHeight: 1.25,
              }}
            >
              Moving to In Review
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "var(--stone-grey)",
                marginTop: "4px",
              }}
            >
              Tell your admin what changed before moving this task.
            </p>
          </div>
          <button
            onClick={handleCancel}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(140,140,140,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginLeft: 12,
            }}
          >
            <X size={16} color="var(--stone-grey)" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Changes Made */}
          <div>
            <label style={labelStyle}>Changes Made *</label>
            <textarea
              style={{
                ...textareaStyle,
                borderColor: errors.changes ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
              }}
              placeholder="What did you change or complete?"
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              onFocus={(el) => (el.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(el) =>
                (el.currentTarget.style.borderColor = errors.changes
                  ? "var(--deadline-red)"
                  : "rgba(74,124,89,0.20)")
              }
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              {errors.changes && (
                <p style={{ fontSize: "12px", color: "var(--deadline-red)", fontFamily: "'DM Sans'" }}>
                  {errors.changes}
                </p>
              )}
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "'DM Sans'",
                  marginLeft: "auto",
                  color: changesWords > WORD_LIMIT ? "var(--deadline-red)" : "var(--stone-grey)",
                }}
              >
                {changesWords} / {WORD_LIMIT} words
              </p>
            </div>
          </div>

          {/* Challenges Faced */}
          <div>
            <label style={labelStyle}>Challenges Faced *</label>
            <textarea
              style={{
                ...textareaStyle,
                borderColor: errors.challenges ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
              }}
              placeholder="What difficulties did you encounter?"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              onFocus={(el) => (el.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(el) =>
                (el.currentTarget.style.borderColor = errors.challenges
                  ? "var(--deadline-red)"
                  : "rgba(74,124,89,0.20)")
              }
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              {errors.challenges && (
                <p style={{ fontSize: "12px", color: "var(--deadline-red)", fontFamily: "'DM Sans'" }}>
                  {errors.challenges}
                </p>
              )}
              <p
                style={{
                  fontSize: "11px",
                  fontFamily: "'DM Sans'",
                  marginLeft: "auto",
                  color: challengesWords > WORD_LIMIT ? "var(--deadline-red)" : "var(--stone-grey)",
                }}
              >
                {challengesWords} / {WORD_LIMIT} words
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(74,124,89,0.12)",
            background: "var(--ivory-paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              color: "var(--stone-grey)",
              padding: "4px 8px",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: "12px 28px",
              height: "48px",
              borderRadius: "12px",
              border: "none",
              background: "var(--deep-forest)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bamboo-green)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--deep-forest)")}
          >
            Confirm Move 🎋
          </button>
        </div>
      </div>
    </>
  );
}
