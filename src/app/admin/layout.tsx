"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Kanban, Star, CalendarCheck, Bell, Settings } from "lucide-react"
import Image from "next/image"
import { api } from "~/trpc/react"
import { MemberProfileDrawer } from "~/app/_components/shared/MemberProfileDrawer"

const NAV_LINKS = [
  { href: "/admin/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/kanban",       label: "Kanban",       icon: Kanban },
  { href: "/admin/attendance",   label: "Attendance",   icon: CalendarCheck },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
]

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [profileOpen, setProfileOpen] = useState(false)

  const { data: profile } = api.dashboard.getMyProfile.useQuery()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--ivory-paper)" }}>

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 h-[68px] flex items-center px-6 lg:px-8 border-b"
        style={{
          backgroundColor: "var(--ivory-paper)",
          borderColor:     "rgba(45,45,45,0.08)",
        }}
      >
        {/* Logo */}
        <Link
          href="/admin/dashboard"
          className="text-lg font-semibold shrink-0 flex items-center gap-2"
          style={{ color: "var(--deep-forest)", fontFamily: "'Playfair Display', serif" }}
        >
          Synced
        </Link>

        {/* Admin badge */}
        <span
          className="ml-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
          style={{ backgroundColor: "var(--bamboo-green)", color: "#fff" }}
        >
          Admin
        </span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{
                  color:       active ? "var(--bamboo-green)" : "var(--stone-grey)",
                  fontFamily:  "'DM Sans', sans-serif",
                  fontWeight:  active ? 600 : 500,
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--bamboo-green)" }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right: Bell + Avatar */}
        <div className="ml-auto flex items-center gap-3">
          <button
            aria-label="Notifications"
            style={{
              width:      40,
              height:     40,
              borderRadius: "50%",
              border:     "none",
              background: "transparent",
              cursor:     "pointer",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              color:      "var(--bamboo-green)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.20)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell size={20} />
          </button>

          <button
            aria-label="Settings"
            style={{
              width:      40,
              height:     40,
              borderRadius: "50%",
              border:     "none",
              background: "transparent",
              cursor:     "pointer",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              color:      "var(--bamboo-green)",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.20)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Settings size={20} />
          </button>

          <button
            onClick={() => setProfileOpen(true)}
            aria-label="Open profile"
            style={{
              position:     "relative",
              width:        40,
              height:       40,
              borderRadius: "50%",
              border:       "2px solid var(--sage-mist)",
              background:   profile?.avatar_url ? "transparent" : "var(--bamboo-green)",
              cursor:       "pointer",
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              overflow:     "hidden",
              padding:      0,
              transition:   "border-color 0.2s",
              flexShrink:   0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--sage-mist)")}
          >
            {profile?.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.name ?? ""}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span
                style={{
                  color:      "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize:   13,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {profile ? getInitials(profile.name ?? "") : "…"}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 h-16 flex items-stretch border-t"
        style={{
          backgroundColor: "var(--deep-forest)",
          borderColor:     "rgba(255,255,255,0.08)",
          paddingBottom:   "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative"
              style={{ color: active ? "var(--sage-mist)" : "rgba(245,240,232,0.50)" }}
            >
              {active && (
                <span
                  className="absolute top-1.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: "var(--bamboo-green)" }}
                />
              )}
              <Icon size={22} />
              <span className="text-[10px] font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Admin Profile Drawer */}
      <MemberProfileDrawer
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profile}
      />
    </div>
  )
}
