"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface BlurModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  width?: string
}

export function BlurModal({ isOpen, onClose, children, title, width = "max-w-2xl" }: BlurModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleEsc)
    document.body.style.overflow = "hidden"
    // Trap focus
    panelRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(28,58,43,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
      />

      {/* Panel — desktop */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`blur-modal-panel relative w-full ${width} max-h-[90dvh] flex flex-col card-shadow`}
        style={{
          background: "var(--cream-white)",
          borderRadius: 20,
          outline: "none",
          animation: "blur-modal-in 0.15s ease-out",
          overflow: "hidden",
          // Mobile: full screen slide-up
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px 16px",
              borderBottom: "1px solid rgba(74,124,89,0.10)",
              background: "var(--ivory-paper)",
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--deep-forest)",
                lineHeight: 1.25,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
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
                transition: "background 0.15s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(192,80,58,0.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(140,140,140,0.12)")}
            >
              <X size={15} color="var(--stone-grey)" />
            </button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            padding: "24px",
          }}
        >
          {!title && (
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "none",
                background: "rgba(140,140,140,0.12)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
              }}
            >
              <X size={15} color="var(--stone-grey)" />
            </button>
          )}
          {children}
        </div>
      </div>

      <style>{`
        @keyframes blur-modal-in {
          from { opacity: 0; transform: scale(0.96) translateY(4px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        @media (max-width: 640px) {
          .blur-modal-panel {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-width: 100vw !important;
            width: 100vw !important;
            max-height: 92dvh !important;
            border-radius: 24px 24px 0 0 !important;
            animation: blur-modal-slide-up 0.35s ease-out !important;
          }
          @keyframes blur-modal-slide-up {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  )
}
