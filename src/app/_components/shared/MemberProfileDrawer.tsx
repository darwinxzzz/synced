"use client"

import { useRouter } from "next/navigation"
import { Mail, Building2, CalendarDays, LogOut } from "lucide-react"
import { SlideDrawer } from "./SlideDrawer"
import { createClient } from "~/lib/supabase/client"

export interface MemberProfile {
  id: string
  name: string
  email: string
  department: string | null
  role: string
  avatar_url: string | null
  joined_date: string | null
}

interface MemberProfileDrawerProps {
  isOpen: boolean
  onClose: () => void
  profile: MemberProfile | null | undefined
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

export function MemberProfileDrawer({
  isOpen,
  onClose,
  profile,
}: MemberProfileDrawerProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (!profile) return null

  const initials = getInitials(profile.name)

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      title="My Profile"
      width={400}
      footer={
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: "none",
            background: "var(--deep-forest)",
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <LogOut size={16} />
          Logout
        </button>
      }
    >
      {/* ── Avatar + name ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.name}
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              border: "3px solid var(--sage-mist)",
            }}
          />
        ) : (
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "var(--bamboo-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 700,
              border: "3px solid var(--sage-mist)",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}

        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--charcoal-ink)",
            marginTop: 14,
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          {profile.name}
        </h3>

        {/* Role pill */}
        <span
          style={{
            display: "inline-block",
            padding: "3px 12px",
            borderRadius: 20,
            background: "var(--sage-mist)",
            color: "var(--bamboo-green)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {profile.role}
        </span>
      </div>

      {/* ── Info rows ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoRow icon={<Mail size={15} />} label="Email" value={profile.email} />
        <InfoRow
          icon={<Building2 size={15} />}
          label="Department"
          value={profile.department ?? "—"}
        />
        <InfoRow
          icon={<CalendarDays size={15} />}
          label="Member Since"
          value={formatDate(profile.joined_date)}
        />
      </div>
    </SlideDrawer>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 10,
        background: "rgba(168,197,160,0.10)",
      }}
    >
      <span style={{ color: "var(--bamboo-green)", marginTop: 2, flexShrink: 0 }}>
        {icon}
      </span>
      <div>
        <p
          className="bamboo-label"
          style={{ marginBottom: 2 }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--charcoal-ink)",
            lineHeight: 1.4,
          }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
