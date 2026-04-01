import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

const DRAWER_SHADOW =
  "-12px 0 48px rgba(28,58,43,0.14), -2px 0 8px rgba(28,58,43,0.06)";

interface SlideDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function SlideDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 480,
}: SlideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 40,
          background: "rgba(28,58,43,0.40)",
          backdropFilter: "blur(4px) saturate(0.8)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.2s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: `min(${width}px, 100vw)`,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          background: "var(--cream-white)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: open ? DRAWER_SHADOW : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "24px 24px 20px",
            borderBottom: "1px solid rgba(74,124,89,0.12)",
            flexShrink: 0,
            background: "var(--ivory-paper)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "21px",
                fontWeight: 700,
                color: "var(--deep-forest)",
                lineHeight: 1.25,
              }}
            >
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "var(--stone-grey)",
                  marginTop: "5px",
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
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
              marginLeft: 16,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(192,80,58,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(140,140,140,0.12)")
            }
          >
            <X size={16} color="var(--stone-grey)" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {children}
        </div>

        {/* Sticky footer */}
        {footer && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(74,124,89,0.12)",
              background: "var(--ivory-paper)",
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
