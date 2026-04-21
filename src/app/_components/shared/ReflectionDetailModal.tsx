"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, Leaf, AlertTriangle, FileDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

export interface ReflectionItem {
  id: string;
  status: string;
  current_task: string | null;
  description: string | null;
  impact: string | null;
  challenges: string | null;
  personal_learning: string | null;
  org_learning: string | null;
  submitted_at: string | null;
  created_at: string;
  contributions: { id: string; task: string | null; department: string | null } | null;
}

interface ReflectionDetailModalProps {
  reflection: ReflectionItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  viewerRole?: "member" | "admin" | "lead";
}

function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

const TASK_LIMIT = 5;
const FIELD_LIMIT = 30;

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

const roLabelStyle: React.CSSProperties = { ...labelStyle, color: "var(--stone-grey)" };

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "88px",
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
  minHeight: "44px",
};

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  limit: number;
  error?: string;
  placeholder?: string;
  rows?: number;
}

function WordField({ label, value, onChange, limit, error, placeholder, rows = 3 }: FieldProps) {
  const words = countWords(value);
  const over = words > limit;
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        style={{
          ...textareaStyle,
          borderColor: error ?? over ? "var(--deadline-red)" : "rgba(74,124,89,0.20)",
        }}
        placeholder={placeholder ?? `${limit} words max…`}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(el) => (el.currentTarget.style.borderColor = "var(--bamboo-green)")}
        onBlur={(el) => {
          el.currentTarget.style.borderColor =
            over || error ? "var(--deadline-red)" : "rgba(74,124,89,0.20)";
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
        {error && (
          <p style={{ fontSize: "11px", color: "var(--deadline-red)", fontFamily: "'DM Sans'" }}>
            {error}
          </p>
        )}
        <p
          style={{
            fontSize: "11px",
            fontFamily: "'DM Sans'",
            marginLeft: "auto",
            color: over ? "var(--deadline-red)" : "var(--stone-grey)",
          }}
        >
          {words} / {limit} words
        </p>
      </div>
    </div>
  );
}

function ArchivedCard({
  reflection,
  projectName,
}: {
  reflection: ReflectionItem;
  projectName: string;
}) {
  const sectionLabel: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color: "var(--bamboo-green)",
    marginBottom: "8px",
  };
  const bodyText: React.CSSProperties = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "var(--charcoal-ink)",
    lineHeight: 1.7,
    margin: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Task Overview */}
      <div>
        <p style={sectionLabel}>Task Overview</p>
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "12px",
            background: "rgba(74,124,89,0.04)",
            border: "1px solid rgba(74,124,89,0.14)",
          }}
        >
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              color: "var(--charcoal-ink)",
              margin: "0 0 4px",
            }}
          >
            {reflection.current_task ?? projectName}
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              fontStyle: "italic",
              color: "var(--stone-grey)",
              margin: 0,
            }}
          >
            Project: {projectName}
          </p>
        </div>
      </div>

      {/* Description + Impact */}
      {reflection.description && (
        <div>
          <p style={sectionLabel}>What Took Place</p>
          <p style={bodyText}>{reflection.description}</p>
        </div>
      )}
      {reflection.impact && (
        <div>
          <p style={sectionLabel}>Impact &amp; Value</p>
          <p style={bodyText}>{reflection.impact}</p>
        </div>
      )}

      {/* 2-column: Challenges | Personal Learning */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <p style={{ ...sectionLabel, color: "var(--stone-grey)" }}>
            <AlertTriangle size={12} color="var(--accent-gold, #c9982a)" />
            Challenges Faced
          </p>
          <p style={{ ...bodyText, color: "var(--stone-grey)", fontSize: "13px" }}>
            {reflection.challenges ?? "—"}
          </p>
        </div>
        <div>
          <p style={sectionLabel}>
            <CheckCircle2 size={12} color="var(--bamboo-green)" />
            Personal Learning
          </p>
          <p style={{ ...bodyText, fontSize: "13px" }}>
            {reflection.personal_learning ?? "—"}
          </p>
        </div>
      </div>

      {/* Org Learning */}
      {reflection.org_learning && (
        <div>
          <p style={sectionLabel}>Organisational Learning</p>
          <p style={bodyText}>{reflection.org_learning}</p>
        </div>
      )}
    </div>
  );
}

export function ReflectionDetailModal({
  reflection,
  open,
  onClose,
  onSuccess,
  viewerRole = "member",
}: ReflectionDetailModalProps) {
  const isPending = reflection?.status === "pending";
  const isAdmin = viewerRole === "admin";
  const showArchivedCard = !isPending && !isAdmin;

  const [currentTask, setCurrentTask] = useState("");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [challenges, setChallenges] = useState("");
  const [personalLearning, setPersonalLearning] = useState("");
  const [orgLearning, setOrgLearning] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (reflection) {
      setCurrentTask(reflection.current_task ?? "");
      setDescription(reflection.description ?? "");
      setImpact(reflection.impact ?? "");
      setChallenges(reflection.challenges ?? "");
      setPersonalLearning(reflection.personal_learning ?? "");
      setOrgLearning(reflection.org_learning ?? "");
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reflection?.id]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const submitReflection = api.reflections.submitReflection.useMutation();
  const saveDraft = api.reflections.saveDraft.useMutation();
  const adminSave = api.reflections.adminUpdateReflection.useMutation();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!currentTask.trim()) e.currentTask = "Required";
    else if (countWords(currentTask) > TASK_LIMIT) e.currentTask = `Max ${TASK_LIMIT} words`;
    if (!description.trim()) e.description = "Required";
    else if (countWords(description) > FIELD_LIMIT) e.description = `Max ${FIELD_LIMIT} words`;
    if (!impact.trim()) e.impact = "Required";
    else if (countWords(impact) > FIELD_LIMIT) e.impact = `Max ${FIELD_LIMIT} words`;
    if (!challenges.trim()) e.challenges = "Required";
    else if (countWords(challenges) > FIELD_LIMIT) e.challenges = `Max ${FIELD_LIMIT} words`;
    if (!personalLearning.trim()) e.personalLearning = "Required";
    else if (countWords(personalLearning) > FIELD_LIMIT)
      e.personalLearning = `Max ${FIELD_LIMIT} words`;
    if (!orgLearning.trim()) e.orgLearning = "Required";
    else if (countWords(orgLearning) > FIELD_LIMIT) e.orgLearning = `Max ${FIELD_LIMIT} words`;
    return e;
  };

  const handleSubmit = async () => {
    if (!reflection) return;
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await submitReflection.mutateAsync({
        reflectionId: reflection.id,
        currentTask,
        description,
        impact,
        challenges,
        personalLearning,
        orgLearning,
      });
      toast.success("Reflection captured 🌿");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLater = async () => {
    if (!reflection) {
      onClose();
      return;
    }
    try {
      await saveDraft.mutateAsync({
        reflectionId: reflection.id,
        currentTask: currentTask || undefined,
        description: description || undefined,
        impact: impact || undefined,
        challenges: challenges || undefined,
        personalLearning: personalLearning || undefined,
        orgLearning: orgLearning || undefined,
      });
    } catch {
      // draft save is best-effort
    }
    onClose();
  };

  const handleAdminSave = async () => {
    if (!reflection) return;
    setSubmitting(true);
    try {
      await adminSave.mutateAsync({
        reflectionId: reflection.id,
        currentTask: currentTask || undefined,
        description: description || undefined,
        impact: impact || undefined,
        challenges: challenges || undefined,
        personalLearning: personalLearning || undefined,
        orgLearning: orgLearning || undefined,
      });
      toast.success("Changes saved 🌿");
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditEntry = () => {
    toast.info("Reflection already submitted — contact admin to edit");
  };

  const handleExportPdf = () => {
    window.print();
  };

  if (!open || !reflection) return null;

  const projectName = reflection.contributions?.task ?? "Task";
  const dateLabel = reflection.submitted_at
    ? new Date(reflection.submitted_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : reflection.created_at
    ? new Date(reflection.created_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  const primaryBtn: React.CSSProperties = {
    padding: "12px 28px",
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
    whiteSpace: "nowrap" as const,
  };

  const outlinedBtn: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 18px",
    height: "48px",
    borderRadius: "12px",
    border: "1px solid rgba(74,124,89,0.30)",
    background: "transparent",
    color: "var(--charcoal-ink)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  };

  const outlinedGreenBtn: React.CSSProperties = {
    ...outlinedBtn,
    color: "var(--bamboo-green)",
    borderColor: "var(--bamboo-green)",
  };

  const textLinkBtn: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    color: "var(--bamboo-green)",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
    padding: "4px 8px",
    whiteSpace: "nowrap" as const,
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "rgba(28,58,43,0.45)",
          backdropFilter: "blur(4px) saturate(0.8)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 70,
          width: "min(600px, calc(100vw - 32px))",
          maxHeight: "90dvh",
          background: "var(--cream-white)",
          borderRadius: "20px",
          boxShadow:
            "0 24px 64px rgba(28,58,43,0.20), 0 4px 16px rgba(28,58,43,0.10)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(74,124,89,0.12)",
            background: "var(--ivory-paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isPending ? (
              <Leaf size={18} color="var(--bamboo-green)" />
            ) : (
              <CheckCircle2 size={18} color="var(--bamboo-green)" />
            )}
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--deep-forest)",
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              {isPending ? "Reflection" : "Reflection Complete"}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(140,140,140,0.12)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={16} color="var(--stone-grey)" />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {showArchivedCard ? (
            <ArchivedCard reflection={reflection} projectName={projectName} />
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={roLabelStyle}>Task</label>
                  <div style={roStyle}>{projectName}</div>
                </div>
                <div>
                  <label style={roLabelStyle}>Date</label>
                  <div style={roStyle}>{dateLabel}</div>
                </div>
              </div>
              <WordField
                label="Current Task *"
                value={currentTask}
                onChange={setCurrentTask}
                limit={TASK_LIMIT}
                error={errors.currentTask}
                placeholder="5 words max…"
                rows={2}
              />
              <WordField
                label="What Took Place? *"
                value={description}
                onChange={setDescription}
                limit={FIELD_LIMIT}
                error={errors.description}
                placeholder="Describe what took place…"
              />
              <WordField
                label="Impact on SYAI *"
                value={impact}
                onChange={setImpact}
                limit={FIELD_LIMIT}
                error={errors.impact}
                placeholder="What was the impact?"
              />
              <WordField
                label="Challenges Faced *"
                value={challenges}
                onChange={setChallenges}
                limit={FIELD_LIMIT}
                error={errors.challenges}
                placeholder="What challenges did you face?"
              />
              <WordField
                label="Personal Learning Points *"
                value={personalLearning}
                onChange={setPersonalLearning}
                limit={FIELD_LIMIT}
                error={errors.personalLearning}
                placeholder="What did you personally learn?"
              />
              <WordField
                label="Organisational Learning Points *"
                value={orgLearning}
                onChange={setOrgLearning}
                limit={FIELD_LIMIT}
                error={errors.orgLearning}
                placeholder="What did the organisation learn?"
              />
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(74,124,89,0.12)",
            background: "var(--ivory-paper)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          {/* Member — pending */}
          {isPending && !isAdmin && (
            <>
              <button
                onClick={() => void handleLater()}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "var(--stone-grey)",
                  padding: "4px 8px",
                }}
              >
                Complete Later
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={submitting}
                style={primaryBtn}
                onMouseEnter={(e) => {
                  if (!submitting) e.currentTarget.style.background = "var(--bamboo-green)";
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.currentTarget.style.background = "var(--deep-forest)";
                }}
              >
                {submitting ? "Submitting…" : "Submit Reflection"}
              </button>
            </>
          )}

          {/* Admin — pending */}
          {isPending && isAdmin && (
            <>
              <div />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => void handleAdminSave()}
                  disabled={submitting}
                  style={outlinedGreenBtn}
                >
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={onClose} style={primaryBtn}>
                  Close
                </button>
              </div>
            </>
          )}

          {/* Admin — archived */}
          {!isPending && isAdmin && (
            <>
              <button onClick={handleExportPdf} style={outlinedBtn}>
                <FileDown size={14} />
                Export as PDF
              </button>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => void handleAdminSave()}
                  disabled={submitting}
                  style={outlinedGreenBtn}
                >
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={onClose} style={{ ...primaryBtn, background: "var(--deep-forest)" }}>
                  Close
                </button>
              </div>
            </>
          )}

          {/* Member/lead — archived */}
          {!isPending && !isAdmin && (
            <>
              <button onClick={handleExportPdf} style={outlinedBtn}>
                <FileDown size={14} />
                Export as PDF
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={handleEditEntry} style={textLinkBtn}>
                  Edit Entry
                </button>
                <button
                  onClick={onClose}
                  style={{ ...primaryBtn, background: "var(--deep-forest)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bamboo-green)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--deep-forest)";
                  }}
                >
                  Close Reflection
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
