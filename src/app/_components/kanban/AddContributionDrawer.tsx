import { useState, useRef } from "react";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { SlideDrawer } from "../shared/SlideDrawer";

type Priority = "low" | "medium" | "high";

const PRIORITY_CONFIG: Record<
  Priority,
  { icon: string; label: string; bg: string; color: string; border: string }
> = {
  low: {
    icon: "🌱",
    label: "Low",
    bg: "rgba(168,197,160,0.18)",
    color: "var(--bamboo-green)",
    border: "rgba(74,124,89,0.25)",
  },
  medium: {
    icon: "🎋",
    label: "Medium",
    bg: "rgba(74,124,89,0.15)",
    color: "var(--bamboo-green)",
    border: "rgba(74,124,89,0.40)",
  },
  high: {
    icon: "🔥",
    label: "High",
    bg: "rgba(212,145,74,0.15)",
    color: "var(--deadline-amber)",
    border: "rgba(212,145,74,0.40)",
  },
};

const labelStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "12px",
  fontWeight: 600 as const,
  color: "var(--stone-grey)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  display: "block" as const,
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(74,124,89,0.2)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "var(--charcoal-ink)",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

interface AddContributionDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: {
    task: string;
    description: string;
    outcome: string;
    priority: Priority;
    file: File | null;
  }) => void;
}

export function AddContributionDrawer({
  open,
  onClose,
  onSubmit,
}: AddContributionDrawerProps) {
  const [form, setForm] = useState({
    task: "",
    description: "",
    outcome: "",
    priority: "medium" as Priority,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.task.trim()) e.task = "Task name is required";
    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.length > 400)
      e.description = "Max 400 characters";
    if (!form.outcome.trim()) e.outcome = "Outcome is required";
    else if (form.outcome.length > 300) e.outcome = "Max 300 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSubmit?.({ ...form, file });
    setSubmitted(true);
    setTimeout(() => {
      toast.success("Your contribution has been logged! ✓", {
        duration: 4000,
        style: {
          background: "var(--cream-white)",
          color: "var(--leaf-green)",
        },
      });
      handleClose();
    }, 400);
  };

  const handleClose = () => {
    setForm({ task: "", description: "", outcome: "", priority: "medium" });
    setErrors({});
    setFile(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Add My Contribution"
      subtitle="Log your individual contribution to the team. Your admin will review and update your task status."
      footer={
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSubmit}
            disabled={submitted}
            style={{
              flex: 1,
              padding: "11px 20px",
              borderRadius: "12px",
              border: "none",
              background: submitted ? "var(--sage-mist)" : "var(--bamboo-green)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: submitted ? "default" : "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!submitted)
                e.currentTarget.style.background = "var(--deep-forest)";
            }}
            onMouseLeave={(e) => {
              if (!submitted)
                e.currentTarget.style.background = "var(--bamboo-green)";
            }}
          >
            {submitted ? "Submitting…" : "Submit Contribution"}
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: "11px 20px",
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
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Task */}
        <div>
          <label style={labelStyle}>Task *</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.task
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)",
            }}
            placeholder="e.g. Software Technology — Feature"
            value={form.task}
            onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--bamboo-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.task
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)")
            }
          />
          {errors.task && (
            <p style={{ fontSize: "12px", color: "var(--deadline-red)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
              {errors.task}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description *</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "100px",
              resize: "vertical",
              borderColor: errors.description
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)",
            }}
            placeholder="Describe what you did and how you contributed…"
            value={form.description}
            maxLength={400}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--bamboo-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.description
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)")
            }
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {errors.description && (
              <p style={{ fontSize: "12px", color: "var(--deadline-red)", fontFamily: "'DM Sans'" }}>{errors.description}</p>
            )}
            <p style={{ fontSize: "11px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", marginLeft: "auto" }}>{form.description.length}/400</p>
          </div>
        </div>

        {/* Outcome */}
        <div>
          <label style={labelStyle}>Outcome *</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "80px",
              resize: "vertical",
              borderColor: errors.outcome
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)",
            }}
            placeholder="What was the result or impact of your contribution?"
            value={form.outcome}
            maxLength={300}
            onChange={(e) =>
              setForm((f) => ({ ...f, outcome: e.target.value }))
            }
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--bamboo-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.outcome
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)")
            }
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
            {errors.outcome && (
              <p style={{ fontSize: "12px", color: "var(--deadline-red)", fontFamily: "'DM Sans'" }}>{errors.outcome}</p>
            )}
            <p style={{ fontSize: "11px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", marginLeft: "auto" }}>{form.outcome.length}/300</p>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label style={labelStyle}>Priority Level *</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["low", "medium", "high"] as Priority[]).map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const active = form.priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  style={{
                    flex: 1,
                    padding: "10px 8px",
                    borderRadius: "12px",
                    border: `1.5px solid ${active ? cfg.border : "rgba(140,140,140,0.18)"}`,
                    background: active ? cfg.bg : "transparent",
                    color: active ? cfg.color : "var(--stone-grey)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <span>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Attachment */}
        <div>
          <label style={labelStyle}>Attachment (Optional)</label>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 10 * 1024 * 1024) {
                  toast.error("File must be under 10MB");
                  return;
                }
                setFile(f);
              }
            }}
          />
          {file ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 14px",
                borderRadius: "12px",
                background: "rgba(74,124,89,0.08)",
                border: "1px solid rgba(74,124,89,0.18)",
              }}
            >
              <Paperclip size={15} color="var(--bamboo-green)" />
              <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--charcoal-ink)" }}>
                {file.name}
              </span>
              <button
                onClick={() => setFile(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", display: "flex" }}
              >
                <X size={14} color="var(--stone-grey)" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                border: "2px dashed rgba(74,124,89,0.25)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(168,197,160,0.10)";
                e.currentTarget.style.borderColor = "rgba(74,124,89,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "rgba(74,124,89,0.25)";
              }}
            >
              <Paperclip size={18} color="var(--sage-mist)" />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--stone-grey)" }}>
                PDF, PNG, JPG, DOCX — max 10MB
              </p>
            </button>
          )}
        </div>
      </div>
    </SlideDrawer>
  );
}
