"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { SlideDrawer } from "~/app/_components/shared/SlideDrawer";
import { ConfirmSaveBar } from "~/app/_components/shared/ConfirmSaveBar";
import type { KanbanTask } from "./KanbanCard";

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

const WORD_LIMIT = 30;

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

const readonlyLabelStyle: React.CSSProperties = {
  ...labelStyle,
  color: "var(--stone-grey)",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "80px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(74,124,89,0.20)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--charcoal-ink)",
  outline: "none",
  resize: "vertical",
  transition: "border-color 0.2s",
  boxSizing: "border-box" as const,
};

const roStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: "12px",
  background: "rgba(140,140,140,0.06)",
  border: "1px solid rgba(140,140,140,0.14)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--stone-grey)",
};

interface TaskDetailDrawerProps {
  open: boolean;
  task: KanbanTask | null;
  onClose: () => void;
  onSave?: (data: {
    contributionId: string;
    description: string;
    outcome: string;
    changes: string;
    challengesFaced: string;
    priority: "low" | "medium" | "high";
  }) => Promise<void>;
}

type Priority = "low" | "medium" | "high";

const PRIORITY_OPTS: { value: Priority; label: string; color: string }[] = [
  { value: "low",    label: "Low",    color: "var(--deadline-green)" },
  { value: "medium", label: "Medium", color: "var(--deadline-amber)" },
  { value: "high",   label: "High",   color: "var(--deadline-red)" },
];

export function TaskDetailDrawer({ open, task, onClose, onSave }: TaskDetailDrawerProps) {
  const isLocked = !task?.isEditable;

  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [changes, setChanges] = useState("");
  const [challenges, setChallenges] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Sync form when task changes
  useEffect(() => {
    if (task) {
      setDescription(task.description ?? "");
      setOutcome(task.outcome ?? "");
      setChanges(task.changes ?? "");
      setChallenges(task.challengesFaced ?? "");
      setPriority(task.priority);
      setConfirming(false);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task?.contributionId || !onSave) return;
    setSaving(true);
    try {
      await onSave({
        contributionId: task.contributionId,
        description,
        outcome,
        changes,
        challengesFaced: challenges,
        priority,
      });
      toast.success("Contribution saved 🎋");
      onClose();
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canSave = Boolean(onSave && task?.contributionId);

  const footer = !canSave ? null : (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        onClick={() => setConfirming(true)}
        disabled={saving}
        style={{
          flex: 1,
          height: "44px",
          borderRadius: "12px",
          border: "none",
          background: saving ? "var(--sage-mist)" : "var(--bamboo-green)",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          cursor: saving ? "default" : "pointer",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--deep-forest)"; }}
        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--bamboo-green)"; }}
      >
        {saving ? "Saving…" : "Save"}
      </button>
      <button
        onClick={onClose}
        style={{
          padding: "0 20px",
          height: "44px",
          borderRadius: "12px",
          border: "1px solid rgba(140,140,140,0.25)",
          background: "transparent",
          color: "var(--stone-grey)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title={task?.name ?? "Task Detail"}
      subtitle={isLocked ? "Review contribution details below." : "Edit your contribution details below."}
      footer={footer ?? undefined}
    >
      {!task ? null : (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Lock banner */}
          {isLocked && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                background: "rgba(61,139,94,0.10)",
                border: "1px solid rgba(61,139,94,0.20)",
              }}
            >
              <Lock size={14} color="var(--deadline-green)" />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--deadline-green)", fontWeight: 600 }}>
                Completed — read-only
              </span>
            </div>
          )}

          {/* Read-only fields */}
          <div>
            <label style={readonlyLabelStyle}>Task</label>
            <div style={roStyle}>{task.name || "—"}</div>
          </div>
          <div>
            <label style={readonlyLabelStyle}>Department</label>
            <div style={roStyle}>{task.department || "—"}</div>
          </div>
          {task.deadline && (
            <div>
              <label style={readonlyLabelStyle}>Due Date</label>
              <div style={roStyle}>
                {task.deadline.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          )}

          {/* Editable / locked fields */}
          <div>
            <label style={labelStyle}>Detailed Description</label>
            <>
              <textarea
                style={textareaStyle}
                placeholder="30 words max…"
                value={description}
                rows={3}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
              />
              <p style={{ fontSize: "11px", color: countWords(description) > WORD_LIMIT ? "var(--deadline-red)" : "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px", textAlign: "right" }}>
                {countWords(description)} / {WORD_LIMIT} words
              </p>
            </>
          </div>

          <div>
            <label style={labelStyle}>Aimed Result / Outcome *</label>
            <textarea
              style={textareaStyle}
              placeholder="Describe the intended result…"
              value={outcome}
              rows={3}
              onChange={(e) => setOutcome(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
            />
          </div>

          {task.pillarStatus !== "new" && (
            <>
              <div>
                <label style={labelStyle}>Changes Made</label>
                <>
                  <textarea
                    style={textareaStyle}
                    placeholder="30 words max…"
                    value={changes}
                    rows={3}
                    onChange={(e) => setChanges(e.target.value)}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
                  />
                  <p style={{ fontSize: "11px", color: countWords(changes) > WORD_LIMIT ? "var(--deadline-red)" : "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px", textAlign: "right" }}>
                    {countWords(changes)} / {WORD_LIMIT} words
                  </p>
                </>
              </div>

              <div>
                <label style={labelStyle}>Challenges Faced</label>
                <>
                  <textarea
                    style={textareaStyle}
                    placeholder="30 words max…"
                    value={challenges}
                    rows={3}
                    onChange={(e) => setChallenges(e.target.value)}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
                  />
                  <p style={{ fontSize: "11px", color: countWords(challenges) > WORD_LIMIT ? "var(--deadline-red)" : "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px", textAlign: "right" }}>
                    {countWords(challenges)} / {WORD_LIMIT} words
                  </p>
                </>
              </div>
            </>
          )}

          {/* Priority */}
          <div>
            <label style={labelStyle}>Priority Level</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {PRIORITY_OPTS.map((opt) => {
                const active = priority === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setPriority(opt.value)}
                    style={{
                      flex: 1,
                      padding: "10px 8px",
                      borderRadius: "12px",
                      border: `1.5px solid ${active ? opt.color : "rgba(140,140,140,0.18)"}`,
                      background: active ? `color-mix(in srgb, ${opt.color} 12%, transparent)` : "transparent",
                      color: active ? opt.color : "var(--stone-grey)",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          {confirming && canSave && (
            <ConfirmSaveBar
              loading={saving}
              onConfirm={() => {
                void handleSave();
              }}
              onCancel={() => setConfirming(false)}
            />
          )}
        </div>
      )}
    </SlideDrawer>
  );
}
