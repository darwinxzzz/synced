"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { SlideDrawer } from "~/app/_components/shared/SlideDrawer";
import { DeadlinePicker } from "~/app/_components/shared/DeadlinePicker";
import { ConfirmSaveBar } from "~/app/_components/shared/ConfirmSaveBar";
import type { AdminTask } from "./AdminTaskCard";

interface AdminEditTaskDrawerProps {
  open: boolean;
  task: AdminTask | null;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

type Priority = "low" | "medium" | "high";

const PRIORITY_OPTS: { value: Priority; label: string; activeColor: string }[] = [
  { value: "low",    label: "Low",    activeColor: "#d97706" },
  { value: "medium", label: "Medium", activeColor: "#2563eb" },
  { value: "high",   label: "High",   activeColor: "#dc2626" },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: "var(--bamboo-green)",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "40px",
  padding: "0 12px",
  borderRadius: "10px",
  border: "1px solid rgba(74,124,89,0.20)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--charcoal-ink)",
  outline: "none",
  boxSizing: "border-box" as const,
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "80px",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(74,124,89,0.20)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--charcoal-ink)",
  outline: "none",
  resize: "vertical" as const,
  boxSizing: "border-box" as const,
};

export function AdminEditTaskDrawer({ open, task, eventId, onClose, onSuccess }: AdminEditTaskDrawerProps) {
  const [taskName, setTaskName] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const utils = api.useUtils();
  const { data: departments = [] } = api.kanban.getDepartments.useQuery(undefined, { enabled: open });

  const updateTask = api.kanban.adminUpdateTask.useMutation({
    onSuccess: () => {
      toast.success("Task updated");
      void utils.kanban.getOpenBoard.invalidate({ eventId });
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => setSaving(false),
  });

  // Sync form state when task changes
  useEffect(() => {
    if (task) {
      setTaskName(task.name);
      setDepartment(task.department);
      setDescription(task.description ?? "");
      setOutcome(task.outcome ?? "");
      setPriority(task.priority ?? "medium");
      setDeadline(task.deadline ?? "");
      setConfirming(false);
    }
  }, [task]);

  const handleSave = () => {
    if (!task) return;
    if (!taskName.trim()) return toast.error("Task name is required");
    if (!department) return toast.error("Department is required");
    setSaving(true);
    updateTask.mutate({
      eventMemberId: task.id,
      task: taskName.trim(),
      department,
      description: description.trim() || undefined,
      outcome: outcome.trim() || undefined,
      priority,
      deadline: deadline || undefined,
    });
  };

  const footer = (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => setConfirming(true)}
        disabled={saving}
        style={{
          flex: 1, height: "44px", borderRadius: "12px", border: "none",
          background: saving ? "var(--sage-mist)" : "var(--deep-forest)",
          color: "#fff", fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
          fontWeight: 600, cursor: saving ? "default" : "pointer", transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--bamboo-green)"; }}
        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--deep-forest)"; }}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button
        onClick={onClose}
        style={{
          padding: "0 20px", height: "44px", borderRadius: "12px",
          border: "1px solid rgba(140,140,140,0.25)", background: "transparent",
          color: "var(--stone-grey)", fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px", fontWeight: 600, cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <SlideDrawer open={open} onClose={onClose} title="Edit Task" subtitle="Update task details for this member assignment." footer={footer}>
      {!task ? null : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Task Name */}
          <div>
            <label style={labelStyle}>Task Name *</label>
            <input
              style={inputStyle}
              value={taskName}
              maxLength={80}
              onChange={(e) => setTaskName(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
              placeholder="Task name…"
            />
            <div style={{ textAlign: "right", fontSize: "11px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
              {taskName.length}/80
            </div>
          </div>

          {/* Department */}
          <div>
            <label style={labelStyle}>Department *</label>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
            >
              <option value="">Select department…</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label style={labelStyle}>Deadline (optional)</label>
            <DeadlinePicker
              value={deadline}
              onChange={(iso) => setDeadline(iso)}
              onClear={() => setDeadline("")}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Detailed Description</label>
            <textarea
              style={textareaStyle}
              value={description}
              maxLength={300}
              rows={3}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
              placeholder="Describe the task in detail…"
            />
            <div style={{ textAlign: "right", fontSize: "11px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
              {description.length}/300
            </div>
          </div>

          {/* Outcome */}
          <div>
            <label style={labelStyle}>Aimed Result / Outcome</label>
            <textarea
              style={textareaStyle}
              value={outcome}
              maxLength={300}
              rows={3}
              onChange={(e) => setOutcome(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
              placeholder="What should this task achieve?"
            />
            <div style={{ textAlign: "right", fontSize: "11px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
              {outcome.length}/300
            </div>
          </div>

          {/* Priority */}
          <div>
            <label style={labelStyle}>Priority Level</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {PRIORITY_OPTS.map((opt) => {
                const isActive = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    style={{
                      flex: 1, padding: "10px 8px", borderRadius: "12px",
                      border: `1.5px solid ${isActive ? opt.activeColor : "rgba(140,140,140,0.18)"}`,
                      background: isActive ? `color-mix(in srgb, ${opt.activeColor} 12%, transparent)` : "transparent",
                      color: isActive ? opt.activeColor : "var(--stone-grey)",
                      fontFamily: "'DM Sans', sans-serif", fontSize: "13px",
                      fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Read-only info */}
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(140,140,140,0.06)", border: "1px solid rgba(140,140,140,0.12)" }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "var(--stone-grey)", margin: 0 }}>
              Assigned to: <strong style={{ color: "var(--charcoal-ink)" }}>{task.assigneeName}</strong>
            </p>
          </div>
          {confirming && (
            <ConfirmSaveBar
              loading={saving}
              onConfirm={handleSave}
              onCancel={() => setConfirming(false)}
            />
          )}
        </div>
      )}
    </SlideDrawer>
  );
}
