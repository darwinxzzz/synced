"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { api } from "~/trpc/react"
import { BlurModal } from "~/app/_components/shared/BlurModal"
import { DateTimePicker } from "~/app/_components/attendance/DateTimePicker"
import { MemberAssignmentSection, type AssignableMember } from "~/app/_components/shared/MemberAssignmentSection"

type AttendanceType = "event" | "weekly_meeting"
type AttendanceStatus = "attended" | "absent" | "excused"

interface AddAttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  type: AttendanceType
  /** Pre-set event ID (for event detail panel flow) */
  eventId?: string
  /** Pre-populated members (for event detail panel) */
  prePopulatedMembers?: AssignableMember[]
}

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: "attended", label: "Attended", color: "var(--deadline-green)" },
  { value: "absent",   label: "Absent",   color: "var(--deadline-red)" },
  { value: "excused",  label: "Excused",  color: "var(--deadline-amber)" },
]

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function AddAttendanceModal({
  isOpen,
  onClose,
  onSuccess,
  type,
  eventId,
  prePopulatedMembers = [],
}: AddAttendanceModalProps) {
  const today = new Date().toISOString().split("T")[0] ?? ""

  const [date, setDate] = useState(today)
  const [addedMembers, setAddedMembers] = useState<AssignableMember[]>([...prePopulatedMembers])
  const [memberStatuses, setMemberStatuses] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(prePopulatedMembers.map((m) => [m.id, "attended" as AttendanceStatus])),
  )

  // Reset state when modal opens for a new event
  useEffect(() => {
    if (!isOpen) return
    setAddedMembers([...prePopulatedMembers])
    setMemberStatuses(
      Object.fromEntries(prePopulatedMembers.map((m) => [m.id, "attended" as AttendanceStatus])),
    )
    setDate(new Date().toISOString().split("T")[0] ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const { data: allMembers = [] } = api.attendance.getAllActiveMembers.useQuery()

  const recordAttendance = api.attendance.recordAttendance.useMutation({
    onSuccess: () => {
      toast.success("Attendance recorded")
      onSuccess()
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const weekNumber = getISOWeek(new Date(date))

  function handleAddMember(member: AssignableMember) {
    setAddedMembers((prev) => {
      if (prev.some((m) => m.id === member.id)) return prev
      return [...prev, member]
    })
    setMemberStatuses((prev) => ({ ...prev, [member.id]: "attended" }))
  }

  function handleRemoveMember(memberId: string) {
    setAddedMembers((prev) => prev.filter((m) => m.id !== memberId))
    setMemberStatuses((prev) => {
      const next = { ...prev }
      delete next[memberId]
      return next
    })
  }

  function handleSubmit() {
    if (addedMembers.length === 0) {
      toast.error("Add at least one member")
      return
    }

    const records = addedMembers.map((m) => ({
      user_id: m.id,
      event_id: type === "event" ? eventId : undefined,
      meeting_week: type === "weekly_meeting" ? weekNumber : undefined,
      type,
      status: memberStatuses[m.id] ?? "attended",
      date,
    }))

    recordAttendance.mutate({ records })
  }

  const modalTitle = type === "event" ? "Add Attendance — Event" : "Add Attendance — Weekly Meeting"

  return (
    <BlurModal isOpen={isOpen} onClose={onClose} title={modalTitle} width="max-w-xl">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Date */}
        <DateTimePicker
          mode="deadline"
          defaultValue={{ startDate: today, startTime: "09:00" }}
          onChange={(v) => setDate(v.startDate)}
        />

        {/* Week number (weekly meeting only) */}
        {type === "weekly_meeting" && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(168,197,160,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <p className="bamboo-label">ISO Week</p>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "var(--deep-forest)",
              }}
            >
              Week {weekNumber}
            </span>
          </div>
        )}

        {/* Member assignment */}
        <MemberAssignmentSection
          allMembers={allMembers}
          addedMembers={addedMembers}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          prePopulatedMemberIds={prePopulatedMembers.map((m) => m.id)}
        />

        {/* Per-member status selectors */}
        {addedMembers.length > 0 && (
          <div>
            <p className="bamboo-label" style={{ marginBottom: 10 }}>
              Attendance Status
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {addedMembers.map((member) => {
                const current = memberStatuses[member.id] ?? "attended"
                return (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "rgba(168,197,160,0.07)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--charcoal-ink)",
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {member.name}
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            setMemberStatuses((prev) => ({ ...prev, [member.id]: opt.value }))
                          }
                          style={{
                            height: 28,
                            padding: "0 10px",
                            borderRadius: 6,
                            border: "1.5px solid",
                            borderColor: current === opt.value ? opt.color : "rgba(140,140,140,0.20)",
                            background: current === opt.value ? `${opt.color}18` : "transparent",
                            color: current === opt.value ? opt.color : "var(--stone-grey)",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 11,
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            paddingTop: 8,
            borderTop: "1px solid rgba(74,124,89,0.10)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: 48,
              borderRadius: 10,
              border: "1.5px solid rgba(74,124,89,0.20)",
              background: "transparent",
              color: "var(--stone-grey)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={recordAttendance.isPending || addedMembers.length === 0}
            style={{
              flex: 2,
              height: 48,
              borderRadius: 10,
              border: "none",
              background: "var(--deep-forest)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: recordAttendance.isPending ? "not-allowed" : "pointer",
              opacity: recordAttendance.isPending || addedMembers.length === 0 ? 0.6 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {recordAttendance.isPending ? "Saving…" : "Submit Attendance"}
          </button>
        </div>
      </div>
    </BlurModal>
  )
}
