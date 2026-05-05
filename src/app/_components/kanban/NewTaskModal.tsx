"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/app/_components/ui/dialog";
import { Input } from "~/app/_components/ui/input";
import { Textarea } from "~/app/_components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/_components/ui/select";

interface NewTaskModalProps {
  open: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function wordCount(str: string): number {
  return str.trim() === "" ? 0 : str.trim().split(/\s+/).length;
}

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

const PRIORITY_CONFIG = {
  low: {
    label: "Low",
    active: {
      background: "#d97706",
      color: "#fff",
      border: "1px solid #d97706",
    },
    inactive: {
      background: "transparent",
      color: "#d97706",
      border: "1px solid #d97706",
    },
  },
  medium: {
    label: "Medium",
    active: {
      background: "#2563eb",
      color: "#fff",
      border: "1px solid #2563eb",
    },
    inactive: {
      background: "transparent",
      color: "#2563eb",
      border: "1px solid #2563eb",
    },
  },
  high: {
    label: "High",
    active: {
      background: "#dc2626",
      color: "#fff",
      border: "1px solid #dc2626",
    },
    inactive: {
      background: "transparent",
      color: "#dc2626",
      border: "1px solid #dc2626",
    },
  },
} as const;

export function NewTaskModal({ open, eventId, onClose, onSuccess }: NewTaskModalProps) {
  const [task, setTask] = useState("");
  const [department, setDepartment] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [outcome, setOutcome] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");
  const [memberOpen, setMemberOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const utils = api.useUtils();

  const { data: departments = [] } = api.kanban.getDepartments.useQuery(undefined, {
    enabled: open,
  });

  const { data: members = [] } = api.kanban.getAdminMembers.useQuery(
    { search: memberSearch },
    { enabled: open },
  );

  const createTask = api.kanban.adminCreateTask.useMutation({
    onSuccess: () => {
      toast.success("Task created");
      onSuccess();
      handleClose();
    },
    onError: (err) => toast.error(err.message),
    onSettled: () => {
      void utils.kanban.getOpenBoard.invalidate({ eventId });
    },
  });

  const handleClose = () => {
    setTask("");
    setDepartment("");
    setDeadline("");
    setDescription("");
    setOutcome("");
    setPriority("medium");
    setMemberSearch("");
    setSelectedUserId(null);
    setSelectedUserName("");
    setMemberOpen(false);
    setSaving(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!task.trim()) return toast.error("Task name is required");
    if (!department) return toast.error("Department is required");
    if (!selectedUserId) return toast.error("Please assign a member");

    setSaving(true);
    createTask.mutate({
      eventId,
      userId: selectedUserId,
      task: task.trim(),
      department,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      description: description.trim() || undefined,
      outcome: outcome.trim() || undefined,
      priority,
    });
  };

  const handleSelectMember = (id: string, name: string) => {
    setSelectedUserId(id);
    setSelectedUserName(name);
    setMemberSearch("");
    setMemberOpen(false);
  };

  const handleClearMember = () => {
    setSelectedUserId(null);
    setSelectedUserName("");
    setMemberOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent
        style={{
          background: "var(--ivory-paper)",
          borderRadius: "20px",
          padding: "28px",
          width: "min(600px, calc(100vw - 32px))",
          maxWidth: "600px",
          maxHeight: "calc(100vh - 48px)",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(28,58,43,0.20)",
          border: "1px solid rgba(74,124,89,0.12)",
        }}
      >
        <DialogHeader style={{ marginBottom: "20px" }}>
          <DialogTitle
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              fontWeight: 700,
              fontStyle: "italic",
              color: "var(--deep-forest)",
            }}
          >
            New Task
          </DialogTitle>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "12px",
              color: "var(--stone-grey)",
              margin: "4px 0 0",
            }}
          >
            Assign a task to a member for this event
          </p>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* 1. Task Name */}
          <div>
            <label style={labelStyle}>Task Name *</label>
            <Input
              placeholder="e.g. Design event poster"
              value={task}
              maxLength={80}
              onChange={(e) => setTask(e.target.value)}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "var(--charcoal-ink)",
                background: "var(--ivory-paper)",
                border: "1px solid rgba(74,124,89,0.20)",
                borderRadius: "10px",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: "11px",
                color: "var(--stone-grey)",
                marginTop: "4px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {task.length}/80
            </div>
          </div>

          {/* 2. Department */}
          <div>
            <label style={labelStyle}>Department *</label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: department ? "var(--charcoal-ink)" : "var(--stone-grey)",
                  background: "var(--ivory-paper)",
                  border: "1px solid rgba(74,124,89,0.20)",
                  borderRadius: "10px",
                  height: "40px",
                }}
              >
                <SelectValue placeholder="Select department…" />
              </SelectTrigger>
              <SelectContent
                style={{
                  background: "var(--ivory-paper)",
                  border: "1px solid rgba(74,124,89,0.15)",
                  borderRadius: "10px",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {departments.map((d) => (
                  <SelectItem
                    key={d}
                    value={d}
                    style={{ fontSize: "14px", color: "var(--charcoal-ink)" }}
                  >
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Deadline */}
          <div>
            <label style={labelStyle}>Deadline (optional)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                padding: "0 12px",
                borderRadius: "10px",
                border: "1px solid rgba(74,124,89,0.20)",
                background: "var(--ivory-paper)",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: deadline ? "var(--charcoal-ink)" : "var(--stone-grey)",
                outline: "none",
                boxSizing: "border-box" as const,
                cursor: "pointer",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
            />
            <p style={{ fontSize: "11px", color: "var(--stone-grey)", fontFamily: "'DM Sans'", marginTop: "4px" }}>
              Set a target deadline for this task
            </p>
          </div>

          {/* 4. Detailed Description */}
          <div>
            <label style={labelStyle}>Detailed Description</label>
            <Textarea
              placeholder="Describe the task in detail…"
              value={description}
              maxLength={300}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "var(--charcoal-ink)",
                background: "var(--ivory-paper)",
                border: "1px solid rgba(74,124,89,0.20)",
                borderRadius: "10px",
                resize: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "var(--stone-grey)",
                marginTop: "4px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span>{wordCount(description)} words</span>
              <span>{description.length}/300</span>
            </div>
          </div>

          {/* 5. Aimed Result / Outcome */}
          <div>
            <label style={labelStyle}>Aimed Result / Outcome</label>
            <Textarea
              placeholder="What should be achieved by completing this task?"
              value={outcome}
              maxLength={300}
              onChange={(e) => setOutcome(e.target.value)}
              rows={3}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "var(--charcoal-ink)",
                background: "var(--ivory-paper)",
                border: "1px solid rgba(74,124,89,0.20)",
                borderRadius: "10px",
                resize: "none",
              }}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: "11px",
                color: "var(--stone-grey)",
                marginTop: "4px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {outcome.length}/300
            </div>
          </div>

          {/* 6. Assign Member */}
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
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "var(--charcoal-ink)",
                    flex: 1,
                  }}
                >
                  {selectedUserName}
                </span>
                <button
                  onClick={handleClearMember}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--stone-grey)",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label="Clear selected member"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                {/* Trigger button */}
                <button
                  onClick={() => setMemberOpen((prev) => !prev)}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border: memberOpen
                      ? "1px solid var(--bamboo-green)"
                      : "1px solid rgba(74,124,89,0.20)",
                    background: "var(--ivory-paper)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: "var(--stone-grey)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                    boxSizing: "border-box",
                  }}
                >
                  <span>Select member…</span>
                  <ChevronDown
                    size={14}
                    style={{
                      color: "var(--stone-grey)",
                      transform: memberOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {/* Dropdown */}
                {memberOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      borderRadius: "10px",
                      border: "1px solid rgba(140,140,140,0.15)",
                      background: "var(--ivory-paper)",
                      boxShadow: "0 8px 24px rgba(28,58,43,0.12)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Search input inside dropdown */}
                    <div style={{ padding: "8px" }}>
                      <Input
                        autoFocus
                        placeholder="Search members…"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px",
                          color: "var(--charcoal-ink)",
                          background: "var(--ivory-paper)",
                          border: "1px solid rgba(74,124,89,0.20)",
                          borderRadius: "8px",
                          height: "34px",
                        }}
                      />
                    </div>

                    {/* Member list */}
                    <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                      {members.length === 0 ? (
                        <div
                          style={{
                            padding: "12px",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            color: "var(--stone-grey)",
                            textAlign: "center",
                          }}
                        >
                          No members found
                        </div>
                      ) : (
                        members.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectMember(m.id, m.name)}
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
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "rgba(74,124,89,0.06)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            {m.avatar_url ? (
                              <div
                                style={{
                                  position: "relative",
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                }}
                              >
                                <Image
                                  src={m.avatar_url}
                                  alt=""
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            ) : (
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "50%",
                                  background: "var(--sage-mist)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  color: "var(--deep-forest)",
                                  flexShrink: 0,
                                }}
                              >
                                {m.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p
                                style={{
                                  fontFamily: "'DM Sans', sans-serif",
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: "var(--charcoal-ink)",
                                  margin: 0,
                                }}
                              >
                                {m.name}
                              </p>
                              {m.department && (
                                <p
                                  style={{
                                    fontFamily: "'DM Sans', sans-serif",
                                    fontSize: "11px",
                                    color: "var(--stone-grey)",
                                    margin: 0,
                                  }}
                                >
                                  {m.department}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 7. Priority Level */}
          <div>
            <label style={labelStyle}>Priority Level</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["low", "medium", "high"] as const).map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = priority === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    style={{
                      flex: 1,
                      height: "36px",
                      borderRadius: "8px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      ...(isActive ? cfg.active : cfg.inactive),
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            onClick={handleSubmit}
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
            onMouseEnter={(e) => {
              if (!saving) e.currentTarget.style.background = "var(--bamboo-green)";
            }}
            onMouseLeave={(e) => {
              if (!saving) e.currentTarget.style.background = "var(--deep-forest)";
            }}
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
      </DialogContent>
    </Dialog>
  );
}
