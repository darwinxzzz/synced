"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

interface NewTaskModalProps {
  open: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

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
  boxSizing: "border-box",
};

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

export function NewTaskModal({ open, eventId, onClose, onSuccess }: NewTaskModalProps) {
  const [task, setTask] = useState("");
  const [department, setDepartment] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const { data: departments = [] } = api.kanban.getDepartments.useQuery(undefined, { enabled: open });
  const { data: members = [] } = api.kanban.getAdminMembers.useQuery(
    { search: memberSearch },
    { enabled: open }
  );

  const createTask = api.kanban.adminCreateTask.useMutation({
    onSuccess: () => {
      toast.success("Task created");
      onSuccess();
      handleClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleClose = () => {
    setTask("");
    setDepartment("");
    setMemberSearch("");
    setSelectedUserId(null);
    setSelectedUserName("");
    setSaving(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!task.trim()) return toast.error("Task name is required");
    if (!department) return toast.error("Department is required");
    if (!selectedUserId) return toast.error("Please assign a member");

    setSaving(true);
    createTask.mutate({ eventId, userId: selectedUserId, task: task.trim(), department });
  };

  useEffect(() => {
    if (!saving) return;
    if (!createTask.isPending) setSaving(false);
  }, [createTask.isPending, saving]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 200,
          background: "rgba(28,58,43,0.45)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 210,
          background: "var(--ivory-paper)",
          borderRadius: "20px",
          padding: "28px",
          width: "min(600px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(28,58,43,0.20)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "20px",
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--deep-forest)",
                margin: 0,
              }}
            >
              New Task
            </h2>
            <p style={{ fontFamily: "'DM Sans'", fontSize: "12px", color: "var(--stone-grey)", margin: "4px 0 0" }}>
              Assign a task to a member for this event
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              background: "rgba(140,140,140,0.10)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--stone-grey)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Task Name *</label>
              <input
                style={inputStyle}
                placeholder="e.g. Design event poster"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
              />
            </div>

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
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Member search */}
            <div>
              <label style={labelStyle}>Assign Member *</label>
              {selectedUserId ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid rgba(74,124,89,0.25)",
                    background: "rgba(74,124,89,0.06)",
                  }}
                >
                  <span style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "var(--charcoal-ink)", flex: 1 }}>
                    {selectedUserName}
                  </span>
                  <button
                    onClick={() => { setSelectedUserId(null); setSelectedUserName(""); }}
                    style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--stone-grey)", padding: 0, display: "flex" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ position: "relative" }}>
                    <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--stone-grey)", pointerEvents: "none" }} />
                    <input
                      style={{ ...inputStyle, paddingLeft: "34px" }}
                      placeholder="Search members…"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
                      onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
                    />
                  </div>
                  {members.length > 0 && (
                    <div
                      style={{
                        marginTop: "4px",
                        borderRadius: "10px",
                        border: "1px solid rgba(140,140,140,0.15)",
                        background: "var(--cream-white)",
                        maxHeight: "160px",
                        overflowY: "auto",
                      }}
                    >
                      {members.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedUserId(m.id); setSelectedUserName(m.name); setMemberSearch(""); }}
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            border: "none",
                            background: "transparent",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            textAlign: "left",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(74,124,89,0.06)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt="" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--sage-mist)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans'", fontSize: "9px", fontWeight: 700, color: "var(--deep-forest)", flexShrink: 0 }}>
                              {m.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", fontWeight: 500, color: "var(--charcoal-ink)", margin: 0 }}>{m.name}</p>
                            {m.department && (
                              <p style={{ fontFamily: "'DM Sans'", fontSize: "11px", color: "var(--stone-grey)", margin: 0 }}>{m.department}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            onClick={() => void handleSubmit()}
            disabled={saving}
            style={{
              flex: 1,
              height: "44px",
              borderRadius: "12px",
              border: "none",
              background: saving ? "var(--sage-mist)" : "var(--deep-forest)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = "var(--bamboo-green)"; }}
            onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = "var(--deep-forest)"; }}
          >
            {saving ? "Creating…" : "Create Task"}
          </button>
          <button
            onClick={handleClose}
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
      </div>
    </>
  );
}
