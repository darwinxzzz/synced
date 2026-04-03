"use client";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Search, Menu, X, ChevronDown } from "lucide-react";
import { useRole } from "../context/RoleContext";
import { CARD_SHADOW } from "./constants";

const ADMIN_LINKS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Kanban", path: "/kanban" },
  { label: "Attendance", path: "/attendance" },
];

const MEMBER_LINKS = [{ label: "My Kanban", path: "/member/kanban" }];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { role, setRole } = useRole();
  const isLanding = pathname === "/";

  const navLinks = role === "admin" ? ADMIN_LINKS : MEMBER_LINKS;

  useEffect(() => {
    setMenuOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-nav-avatar]")) setAvatarOpen(false);
      if (!target.closest("[data-nav-menu]")) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRoleSwitch = () => {
    const next = role === "admin" ? "member" : "admin";
    setRole(next);
    router.push(next === "admin" ? "/dashboard" : "/member/kanban");
    setAvatarOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex justify-center animate-nav-drop"
      style={{ paddingTop: "12px", paddingLeft: "12px", paddingRight: "12px" }}
    >
      <div
        className="w-full max-w-7xl rounded-2xl backdrop-blur-md border flex flex-col"
        style={{
          background: isLanding ? "#ffffff" : "rgba(245,240,232,0.72)",
          borderColor: isLanding ? "rgba(74,124,89,0.12)" : "rgba(74,124,89,0.16)",
          ...CARD_SHADOW,
        }}
      >
        {/* ── LANDING PAGE: simplified bar ── */}
        {isLanding ? (
          <div className="flex items-center h-[68px] px-6 gap-8">
            {/* Logo + Name — left */}
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
                    position: "relative",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--bamboo-green)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--charcoal-ink)")
                  }
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--deep-forest)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--bamboo-green)")
                }
              >
                Request Demo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── INNER PAGES: full nav bar ── */}
            <div className="flex items-center h-[68px] px-6 relative">
              {/* Left — nav links */}
              <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => {
                  const active = pathname === link.path;
                  return (
                    <button
                      key={link.path}
                      onClick={() => router.push(link.path)}
                      className="transition-all duration-300 relative"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "15px",
                        color: active ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                        fontWeight: active ? 600 : 400,
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px 0",
                      }}
                    >
                      {link.label}
                      {active && (
                        <span
                          className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                          style={{ background: "var(--bamboo-green)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Center — logo */}
              <div
                className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 select-none cursor-pointer"
                onClick={() => router.push("/")}
              >
                <span style={{ fontSize: "22px", lineHeight: 1 }}>🎋</span>
                <span
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "var(--deep-forest)",
                  }}
                >
                  Event Sync
                </span>
              </div>

              {/* Right — icons + role badge + avatar */}
              <div className="ml-auto flex items-center gap-3">
                {/* Role indicator */}
                <span
                  className="hidden md:inline-flex items-center"
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background:
                      role === "admin"
                        ? "rgba(196,163,90,0.15)"
                        : "rgba(168,197,160,0.20)",
                    color:
                      role === "admin" ? "var(--accent-gold)" : "var(--bamboo-green)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {role === "admin" ? "Exco" : "Member"}
                </span>

                {/* Search */}
                <button
                  className="hidden md:flex w-9 h-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{ background: "rgba(168,197,160,0.18)" }}
                >
                  <Search size={16} color="var(--bamboo-green)" />
                </button>

                {/* Bell */}
                <button
                  className="hidden md:flex relative w-9 h-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{ background: "rgba(168,197,160,0.18)" }}
                >
                  <Bell size={16} color="var(--charcoal-ink)" />
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white"
                    style={{ background: "var(--deadline-red)", fontWeight: 600 }}
                  >
                    3
                  </span>
                </button>

                {/* Avatar dropdown */}
                <div className="relative" data-nav-avatar>
                  <button
                    onClick={() => setAvatarOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: "rgba(168,197,160,0.25)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ background: "var(--bamboo-green)", fontWeight: 600 }}
                    >
                      {role === "admin" ? "JT" : "JY"}
                    </div>
                    <span
                      className="hidden md:block text-sm"
                      style={{ color: "var(--charcoal-ink)", fontWeight: 500 }}
                    >
                      {role === "admin" ? "Jamie T." : "Jie Ying"}
                    </span>
                    <ChevronDown
                      size={14}
                      color="var(--stone-grey)"
                      style={{
                        transition: "transform 0.2s",
                        transform: avatarOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {avatarOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-2xl py-2 overflow-hidden"
                      style={{ background: "var(--cream-white)", ...CARD_SHADOW }}
                    >
                      <div
                        style={{
                          padding: "10px 14px 12px",
                          borderBottom: "1px solid rgba(74,124,89,0.10)",
                          marginBottom: "4px",
                        }}
                      >
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "var(--charcoal-ink)" }}>
                          {role === "admin" ? "Jamie Tan" : "Jie Ying"}
                        </p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "var(--stone-grey)" }}>
                          {role === "admin" ? "Admin (Exco)" : "Member — Software Technology"}
                        </p>
                      </div>

                      {["My Profile", "Settings"].map((item) => (
                        <button
                          key={item}
                          className="w-full text-left px-4 py-2.5 transition-all duration-150 text-sm"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--charcoal-ink)", background: "transparent", border: "none", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.20)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {item}
                        </button>
                      ))}

                      <button
                        onClick={handleRoleSwitch}
                        className="w-full text-left px-4 py-2.5 transition-all duration-150 text-sm"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--accent-gold)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(196,163,90,0.12)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        Switch to {role === "admin" ? "Member" : "Admin"} View
                      </button>

                      <div style={{ borderTop: "1px solid rgba(74,124,89,0.10)", marginTop: "4px" }}>
                        <button
                          onClick={() => router.push("/")}
                          className="w-full text-left px-4 py-2.5 transition-all duration-150 text-sm"
                          style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--clay-red)", background: "transparent", border: "none", cursor: "pointer" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(192,80,58,0.08)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hamburger */}
                <button
                  data-nav-menu
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  className="md:hidden w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(168,197,160,0.18)" }}
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  {menuOpen ? (
                    <X size={18} color="var(--charcoal-ink)" />
                  ) : (
                    <Menu size={18} color="var(--charcoal-ink)" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
              <div
                className="px-6 pb-4 flex flex-col gap-1 border-t"
                style={{ borderColor: "rgba(74,124,89,0.12)" }}
              >
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => router.push(link.path)}
                    className="text-left py-3 px-2 rounded-xl transition-all duration-150"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "15px",
                      color: pathname === link.path ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                      fontWeight: pathname === link.path ? 600 : 400,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={handleRoleSwitch}
                  style={{
                    textAlign: "left",
                    padding: "10px 8px",
                    borderRadius: "12px",
                    background: "rgba(196,163,90,0.10)",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--accent-gold)",
                    marginTop: "4px",
                  }}
                >
                  ⇄ Switch to {role === "admin" ? "Member" : "Admin"} View
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}