"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Kanban, Star } from "lucide-react"

const NAV_LINKS = [
  { href: "/member/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/member/kanban",       label: "Kanban",       icon: Kanban },
  { href: "/member/testimonials", label: "Testimonials", icon: Star },
]

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--ivory-paper)" }}>

      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 h-[68px] flex items-center px-6 lg:px-8 border-b"
        style={{
          backgroundColor: "var(--ivory-paper)",
          borderColor: "rgba(45,45,45,0.08)",
        }}
      >
        {/* Logo */}
        <Link
          href="/member/dashboard"
          className="text-lg font-semibold shrink-0 flex items-center gap-2"
          style={{ color: "var(--deep-forest)", fontFamily: "'Playfair Display', serif" }}
        >
          🎋 Event Sync
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-10">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="px-4 py-2 text-sm font-medium transition-colors relative"
                style={{
                  color: active ? "var(--bamboo-green)" : "var(--stone-grey)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: active ? 600 : 500,
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

        <div className="ml-auto" />
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
          borderColor: "rgba(255,255,255,0.08)",
          paddingBottom: "env(safe-area-inset-bottom)",
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
    </div>
  )
}
