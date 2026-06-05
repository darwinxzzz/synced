"use client";

import { Check, X } from "lucide-react";

interface ConfirmSaveBarProps {
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmSaveBar({ onConfirm, onCancel, loading = false }: ConfirmSaveBarProps) {
  return (
    <div
      style={{
        marginTop: "12px",
        borderRadius: "12px",
        border: "1px solid rgba(217, 119, 6, 0.28)",
        background:
          "linear-gradient(135deg, rgba(255,247,237,0.95) 0%, rgba(254,243,199,0.88) 100%)",
        boxShadow: "0 6px 18px rgba(120,53,15,0.10)",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          color: "#92400e",
          flex: 1,
          lineHeight: 1.4,
        }}
      >
        Note that old changes are discarded. Are you sure?
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          aria-label="Confirm save"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            border: "1px solid rgba(21,128,61,0.35)",
            background: loading ? "rgba(74,124,89,0.40)" : "rgba(34,197,94,0.20)",
            color: "#166534",
            cursor: loading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={15} />
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          aria-label="Cancel save"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "9px",
            border: "1px solid rgba(185,28,28,0.28)",
            background: "rgba(254,226,226,0.9)",
            color: "#b91c1c",
            cursor: loading ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
