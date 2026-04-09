"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { SlideDrawer } from "../shared/SlideDrawer";

type Priority = "low" | "medium" | "high";

const PRIORITY_OPTS: { value: Priority; label: string; color: string; activeBg: string }[] = [
  { value: "low",    label: "Low",    color: "var(--deadline-green)", activeBg: "rgba(61,139,94,0.12)"  },
  { value: "medium", label: "Medium", color: "var(--deadline-amber)", activeBg: "rgba(212,145,74,0.12)" },
  { value: "high",   label: "High",   color: "var(--deadline-red)",   activeBg: "rgba(192,80,58,0.12)"  },
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
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(74,124,89,0.20)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--charcoal-ink)",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

interface AddContributionDrawerProps {
  open: boolean;
  onClose: () => void;
  eventId: string | null;
  onSuccess?: () => void;
}

export function AddContributionDrawer({
  open,
  onClose,
  eventId,
  onSuccess,
}: AddContributionDrawerProps) {
  const [department, setDepartment] = useState("");
  const [deptOpen, setDeptOpen] = useState(false);
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [priority, setPriority] = useState<Priority | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: departments = [] } = api.kanban.getDepartments.useQuery(undefined, {
    enabled: open,
  });

  const createContribution = api.contributions.create.useMutation();

  const descWords = countWords(description);
  const WORD_LIMIT = 30;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!department) e.department = "Department is required";
    if (!task.trim()) e.task = "Task name is required";
    if (descWords > WORD_LIMIT) e.description = `Max ${WORD_LIMIT} words`;
    if (!outcome.trim()) e.outcome = "Outcome is required";
    if (!priority) e.priority = "Priority is required";
    return e;
  };

  const handleClose = () => {
    setDepartment("");
    setTask("");
    setDescription("");
    setOutcome("");
    setPriority(null);
    setErrors({});
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await createContribution.mutateAsync({
        department,
        task,
        description: description.trim() || undefined,
        outcome,
        priority: priority!,
        event_id: eventId ?? undefined,
      });
      toast.success("Contribution added 🎋");
      onSuccess?.();
      handleClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLater = () => {
    handleClose();
  };

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Add My Contribution"
      subtitle="Log your individual contribution to the team."
      footer={
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={handleLater}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              color: "var(--stone-grey)",
              padding: "4px 8px",
              flexShrink: 0,
            }}
          >
            Complete Later
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting}
            style={{
              flex: 1,
              height: "48px",
              borderRadius: "12px",
              border: "none",
              background: submitting ? "var(--sage-mist)" : "var(--deep-forest)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = "var(--bamboo-green)"; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = "var(--deep-forest)"; }}
          >
            {submitting ? "Submitting…" : "Submit Contribution"}
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Department + Task row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "10px",
            alignItems: "start",
          }}
          className="contribution-header-row"
        >
          {/* Department dropdown */}
          <div style={{ position: "relative" }}>
            <label style={labelStyle}>Department *</label>
            <button
              type="button"
              onClick={() => setDeptOpen((v) => !v)}
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                color: department ? "var(--charcoal-ink)" : "var(--stone-grey)",
                borderColor: errors.department ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
              }}
            >
              {department || "Department ▾"}
              <ChevronDown
                size={14}
                color="var(--stone-grey)"
                style={{ transform: deptOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}
              />
            </button>
            {errors.department && (
              <p style={{ fontSize: "11px", color: "var(--deadline-red)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
                {errors.department}
              </p>
            )}
            {deptOpen && (
              <div
                className="card-shadow"
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  background: "var(--cream-white)",
                  borderRadius: "12px",
                  padding: "6px",
                }}
              >
                {departments.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => { setDepartment(d); setDeptOpen(false); setErrors((e) => ({ ...e, department: "" })); }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "none",
                      background: department === d ? "rgba(74,124,89,0.10)" : "transparent",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      color: department === d ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                      fontWeight: department === d ? 600 : 400,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (department !== d) e.currentTarget.style.background = "rgba(168,197,160,0.12)"; }}
                    onMouseLeave={(e) => { if (department !== d) e.currentTarget.style.background = "transparent"; }}
                  >
                    {d}
                  </button>
                ))}
                {departments.length === 0 && (
                  <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", color: "var(--stone-grey)", padding: "8px 12px" }}>
                    No departments found
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Hyphen connector — hidden on mobile */}
          <div
            className="hidden sm:flex"
            style={{ alignItems: "center", paddingTop: "28px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", fontSize: "16px" }}
          >
            —
          </div>

          {/* Task name */}
          <div>
            <label style={labelStyle}>Task Name *</label>
            <input
              style={{
                ...inputStyle,
                borderColor: errors.task ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
              }}
              placeholder="e.g. Social Media Slides"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = errors.task ? "var(--deadline-red)" : "rgba(74,124,89,0.20)")}
            />
            {errors.task && (
              <p style={{ fontSize: "11px", color: "var(--deadline-red)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
                {errors.task}
              </p>
            )}
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label style={labelStyle}>Detailed Description</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "88px",
              resize: "vertical",
              borderColor: errors.description ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
            }}
            placeholder="30 words max…"
            value={description}
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = errors.description ? "var(--deadline-red)" : "rgba(74,124,89,0.20)")}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {errors.description && (
              <p style={{ fontSize: "11px", color: "var(--deadline-red)", fontFamily: "'DM Sans'" }}>{errors.description}</p>
            )}
            <p
              style={{
                fontSize: "11px",
                fontFamily: "'DM Sans'",
                marginLeft: "auto",
                color: descWords > WORD_LIMIT ? "var(--deadline-red)" : "var(--stone-grey)",
              }}
            >
              {descWords} / {WORD_LIMIT} words
            </p>
          </div>
        </div>

        {/* Aimed Result / Outcome */}
        <div>
          <label style={labelStyle}>Aimed Result / Outcome *</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "88px",
              resize: "vertical",
              borderColor: errors.outcome ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
            }}
            placeholder="Describe the intended result…"
            value={outcome}
            rows={3}
            onChange={(e) => setOutcome(e.target.value)}
            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = errors.outcome ? "var(--deadline-red)" : "rgba(74,124,89,0.20)")}
          />
          {errors.outcome && (
            <p style={{ fontSize: "11px", color: "var(--deadline-red)", fontFamily: "'DM Sans'", marginTop: "4px" }}>{errors.outcome}</p>
          )}
        </div>

        {/* Priority Level */}
        <div>
          <label style={labelStyle}>Priority Level *</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {PRIORITY_OPTS.map((opt) => {
              const active = priority === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setPriority(opt.value); setErrors((e) => ({ ...e, priority: "" })); }}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    borderRadius: "12px",
                    border: `1.5px solid ${active ? opt.color : "rgba(140,140,140,0.18)"}`,
                    background: active ? opt.activeBg : "transparent",
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
          {errors.priority && (
            <p style={{ fontSize: "11px", color: "var(--deadline-red)", fontFamily: "'DM Sans'", marginTop: "6px" }}>{errors.priority}</p>
          )}
        </div>
      </div>
    </SlideDrawer>
  );
}
