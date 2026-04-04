"use client";
import { useRouter } from "next/navigation";
import { CARD_SHADOW } from "./constants";

export function Navbar() {
  const router = useRouter();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-center animate-nav-drop"
      style={{ paddingTop: "12px", paddingLeft: "12px", paddingRight: "12px" }}
    >
      <div
        className="w-full max-w-7xl rounded-2xl backdrop-blur-md border flex flex-col"
        style={{
          background: "#ffffff",
          borderColor: "rgba(74,124,89,0.12)",
          ...CARD_SHADOW,
        }}
      >
        <div className="flex items-center h-[68px] px-6 gap-8">
          {/* Logo */}
          <div
            className="flex items-center gap-2 select-none cursor-pointer flex-shrink-0"
            onClick={() => router.push("/")}
          >
            <span style={{ fontSize: "28px", lineHeight: 1 }}>🎋</span>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "19px",
                fontWeight: 700,
                color: "var(--deep-forest)",
                whiteSpace: "nowrap",
              }}
            >
              Event Sync
            </span>
          </div>

          {/* Center nav links */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: "32px" }}>
            {[
              { label: "Home", id: "hero" },
              { label: "Testimonials", id: "testimonials" },
              { label: "Contact Us", id: "contact" },
            ].map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  const el = document.getElementById(link.id);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--charcoal-ink)",
                  padding: "2px 0",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--bamboo-green)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--charcoal-ink)")}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right — Login + Request Demo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "1.5px solid rgba(74,124,89,0.35)",
                background: "transparent",
                color: "var(--bamboo-green)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.22s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(74,124,89,0.08)";
                e.currentTarget.style.borderColor = "var(--bamboo-green)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(74,124,89,0.35)";
              }}
            >
              Login
            </button>
            <button
              onClick={() => router.push("/login")}
              style={{
                padding: "8px 20px",
                borderRadius: "999px",
                border: "none",
                background: "var(--bamboo-green)",
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.22s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--deep-forest)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bamboo-green)")}
            >
              Request Demo
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
