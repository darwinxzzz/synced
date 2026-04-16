"use client"

import { useState } from "react"
import { toast } from "sonner"
import { api } from "~/trpc/react"
import { BlurModal } from "~/app/_components/shared/BlurModal"
import { DEPARTMENTS } from "./constants"

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 10,
  border: "1.5px solid rgba(74,124,89,0.25)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "var(--charcoal-ink)",
  padding: "0 14px",
  outline: "none",
}

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddMemberModal({ isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "member" as "member" | "admin",
    joined_date: new Date().toISOString().split("T")[0] ?? "",
  })

  const addMember = api.attendance.addMember.useMutation({
    onSuccess: () => {
      toast.success("Member invited successfully")
      setForm({ name: "", email: "", department: "", role: "member", joined_date: new Date().toISOString().split("T")[0] ?? "" })
      onSuccess()
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required")
      return
    }
    addMember.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      department: form.department || undefined,
      role: form.role,
      joined_date: form.joined_date || undefined,
    })
  }

  return (
    <BlurModal isOpen={isOpen} onClose={onClose} title="Add Member" width="max-w-lg">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Full Name *">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jane Smith"
            className="es-input"
            style={INPUT_STYLE}
            required
          />
        </Field>

        <Field label="Email Address *">
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jane@example.com"
            className="es-input"
            style={INPUT_STYLE}
            required
          />
        </Field>

        <Field label="Department">
          <select
            value={form.department}
            onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            className="es-input"
            style={{ ...INPUT_STYLE, cursor: "pointer" }}
          >
            <option value="">Select department…</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </Field>

        <Field label="Role">
          <div style={{ display: "flex", gap: 8 }}>
            {(["member", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role: r }))}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: form.role === r ? "var(--bamboo-green)" : "rgba(74,124,89,0.20)",
                  background: form.role === r ? "rgba(74,124,89,0.10)" : "transparent",
                  color: form.role === r ? "var(--bamboo-green)" : "var(--stone-grey)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Join Date">
          <input
            type="date"
            value={form.joined_date}
            onChange={(e) => setForm((f) => ({ ...f, joined_date: e.target.value }))}
            className="es-input"
            style={INPUT_STYLE}
          />
        </Field>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            paddingTop: 8,
            borderTop: "1px solid rgba(74,124,89,0.10)",
            marginTop: 4,
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
            type="submit"
            disabled={addMember.isPending}
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
              cursor: addMember.isPending ? "not-allowed" : "pointer",
              opacity: addMember.isPending ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {addMember.isPending ? "Sending invite…" : "Add Member"}
          </button>
        </div>
      </form>
    </BlurModal>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="bamboo-label" style={{ marginBottom: 6 }}>{label}</p>
      {children}
    </div>
  )
}
