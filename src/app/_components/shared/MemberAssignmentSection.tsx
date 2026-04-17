"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Image from "next/image"
import { Search, X } from "lucide-react"

export interface AssignableMember {
  id: string
  name: string
  email: string
  avatar_url: string | null
  department: string | null
  role: string
}

interface MemberAssignmentSectionProps {
  allMembers: AssignableMember[]
  addedMembers: AssignableMember[]
  onAddMember: (member: AssignableMember) => void
  onRemoveMember: (memberId: string) => void
  prePopulatedMemberIds?: string[]
  onMemberClick?: (member: AssignableMember) => void
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("")
}

function MemberAvatar({ member, size = 32 }: { member: AssignableMember; size?: number }) {
  if (member.avatar_url) {
    return (
      <Image
        src={member.avatar_url}
        alt={member.name}
        width={size}
        height={size}
        style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--bamboo-green)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: size * 0.38,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {getInitials(member.name)}
    </div>
  )
}

export function MemberAssignmentSection({
  allMembers,
  addedMembers,
  onAddMember,
  onRemoveMember,
  prePopulatedMemberIds = [],
  onMemberClick,
}: MemberAssignmentSectionProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const addedIds = useMemo(() => new Set(addedMembers.map((m) => m.id)), [addedMembers])

  const filtered = debouncedSearch
    ? allMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          (m.department ?? "").toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : allMembers

  const handleAdd = useCallback(
    (member: AssignableMember) => {
      if (!addedIds.has(member.id)) {
        onAddMember(member)
      }
      if (onMemberClick) onMemberClick(member)
    },
    [addedIds, onAddMember, onMemberClick],
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Added Members */}
      <div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--charcoal-ink)",
            marginBottom: 10,
          }}
        >
          Added Members
        </p>

        {addedMembers.length === 0 ? (
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--stone-grey)",
              padding: "10px 0",
            }}
          >
            No members added yet. Click a member below to add them.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {addedMembers.map((member) => {
              const isPrepopulated = prePopulatedMemberIds.includes(member.id)
              return (
                <div
                  key={member.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: isPrepopulated
                      ? "rgba(140,140,140,0.06)"
                      : "rgba(74,124,89,0.07)",
                  }}
                >
                  {!isPrepopulated && (
                    <button
                      type="button"
                      onClick={() => onRemoveMember(member.id)}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(192,80,58,0.15)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <X size={11} color="var(--deadline-red)" />
                    </button>
                  )}
                  {isPrepopulated && <div style={{ width: 20 }} />}
                  <MemberAvatar member={member} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--charcoal-ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {member.name}
                    </p>
                    {member.department && (
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--stone-grey)" }}>
                        {member.department}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Members list */}
      <div>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--charcoal-ink)",
            marginBottom: 10,
          }}
        >
          Members
        </p>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--stone-grey)",
              pointerEvents: "none",
            }}
          >
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="es-input"
            style={{
              width: "100%",
              height: 40,
              borderRadius: 10,
              border: "1.5px solid rgba(74,124,89,0.20)",
              background: "var(--ivory-paper)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "var(--charcoal-ink)",
              padding: "0 14px 0 36px",
              outline: "none",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            maxHeight: 200,
            overflowY: "auto",
          }}
        >
          {filtered.map((member) => {
            const isAdded = addedIds.has(member.id)
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleAdd(member)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "none",
                  background: isAdded ? "rgba(74,124,89,0.08)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!isAdded) e.currentTarget.style.background = "rgba(74,124,89,0.06)"
                }}
                onMouseLeave={(e) => {
                  if (!isAdded) e.currentTarget.style.background = "transparent"
                }}
              >
                <MemberAvatar member={member} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--charcoal-ink)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {member.name}
                  </p>
                  {member.department && (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "var(--stone-grey)" }}>
                      {member.department}
                    </p>
                  )}
                </div>
                {isAdded && (
                  <span
                    style={{
                      fontSize: 11,
                      fontFamily: "'DM Sans', sans-serif",
                      color: "var(--bamboo-green)",
                      fontWeight: 600,
                    }}
                  >
                    Added
                  </span>
                )}
              </button>
            )
          })}
          {filtered.length === 0 && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: "var(--stone-grey)",
                padding: "8px 0",
                textAlign: "center",
              }}
            >
              No members found
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
