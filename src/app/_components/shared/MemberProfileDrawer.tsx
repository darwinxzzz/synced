"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Mail, Building2, CalendarDays, LogOut, CalendarCheck } from "lucide-react"
import { SlideDrawer } from "./SlideDrawer"
import { createClient } from "~/lib/supabase/client"
import { api } from "~/trpc/react"

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
  // Self-profile mode: pass profile directly
  profile?: MemberProfile | null
  // Member-view mode: pass memberId to fetch profile + history
  memberId?: string
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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

// ── Member-view drawer (fetches data by memberId) ─────────────────────────────
function MemberViewContent({ memberId }: { memberId: string }) {
  const { data, isLoading } = api.attendance.getMemberProfile.useQuery({ memberId })

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[80, 60, 40, 40].map((w, i) => (
          <div
            key={i}
            style={{
              height: 14,
              width: `${w}%`,
              borderRadius: 6,
              background: "rgba(140,140,140,0.15)",
            }}
          />
        ))}
      </div>
    )
  }

  if (!data) return null

  const { profile, history } = data
  const initials = getInitials(profile.name)

  return (
    <>
      {/* Avatar + name */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.name}
            width={80}
            height={80}
            style={{ borderRadius: "50%", objectFit: "cover", border: "3px solid var(--sage-mist)" }}
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

      {/* Info rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <InfoRow icon={<Mail size={15} />} label="Email" value={profile.email} />
        <InfoRow icon={<Building2 size={15} />} label="Department" value={profile.department ?? "—"} />
        <InfoRow icon={<CalendarDays size={15} />} label="Member Since" value={formatDate(profile.joined_date)} />
      </div>

      {/* Attendance history */}
      {history.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <CalendarCheck size={14} color="var(--bamboo-green)" />
            <p className="bamboo-label">Attendance History</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((row) => {
              const statusColor =
                row.status === "attended"
                  ? "var(--deadline-green)"
                  : row.status === "absent"
                    ? "var(--deadline-red)"
                    : "var(--deadline-amber)"
              const eventName =
                row.type === "weekly_meeting"
                  ? `Week ${row.meeting_week ?? "?"}`
                  : (row.events as { name?: string } | null)?.name ?? "Event"

              return (
                <div
                  key={row.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "rgba(168,197,160,0.07)",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--charcoal-ink)",
                      }}
                    >
                      {eventName}
                    </p>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 11,
                        color: "var(--stone-grey)",
                        marginTop: 2,
                      }}
                    >
                      {new Date(row.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: `${statusColor}18`,
                      color: statusColor,
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {row.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

// ── Self-profile content (original behavior) ──────────────────────────────────
function SelfProfileContent({ profile }: { profile: MemberProfile }) {
  const initials = getInitials(profile.name)
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.name}
            width={80}
            height={80}
            style={{ borderRadius: "50%", objectFit: "cover", border: "3px solid var(--sage-mist)" }}
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
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoRow icon={<Mail size={15} />} label="Email" value={profile.email} />
        <InfoRow icon={<Building2 size={15} />} label="Department" value={profile.department ?? "—"} />
        <InfoRow icon={<CalendarDays size={15} />} label="Member Since" value={formatDate(profile.joined_date)} />
      </div>
    </>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────
export function MemberProfileDrawer({ isOpen, onClose, profile, memberId }: MemberProfileDrawerProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  const isMemberView = !!memberId

  const drawerTitle = isMemberView ? "Member Profile" : "My Profile"
  const drawerFooter = isMemberView ? undefined : (
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
  )

  if (!isMemberView && !profile) return null

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      title={drawerTitle}
      width={400}
      footer={drawerFooter}
    >
      {isMemberView && memberId ? (
        <MemberViewContent memberId={memberId} />
      ) : (
        profile && <SelfProfileContent profile={profile} />
      )}
    </SlideDrawer>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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
      <span style={{ color: "var(--bamboo-green)", marginTop: 2, flexShrink: 0 }}>{icon}</span>
      <div>
        <p className="bamboo-label" style={{ marginBottom: 2 }}>{label}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "var(--charcoal-ink)", lineHeight: 1.4 }}>
          {value}
        </p>
      </div>
    </div>
  )
}
