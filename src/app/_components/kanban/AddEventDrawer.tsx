import { useState } from "react";
import { Plus, X, Users } from "lucide-react";
import { toast } from "sonner";
import { SlideDrawer } from "../shared/SlideDrawer";

const DEPARTMENTS = [
  "Inspire",
  "Monthly Meet-ups",
  "Publicity",
  "Software Technology",
  "Connectors",
  "Labs",
];

const ALL_MEMBERS = [
  { id: "m1", name: "Jie Ying", dept: "Software Technology" },
  { id: "m2", name: "Alex Tan", dept: "Connectors" },
  { id: "m3", name: "Sarah Kim", dept: "Inspire" },
  { id: "m4", name: "Marcus Osei", dept: "Monthly Meet-ups" },
  { id: "m5", name: "Priya Nair", dept: "Publicity" },
  { id: "m6", name: "Diego Alvarez", dept: "Software Technology" },
  { id: "m7", name: "Amara Chen", dept: "Connectors" },
  { id: "m8", name: "Keiko Tanaka", dept: "Labs" },
  { id: "m9", name: "Noah Williams", dept: "Monthly Meet-ups" },
  { id: "m10", name: "Zara Khan", dept: "Publicity" },
  { id: "m11", name: "Fatima Al-Hassan", dept: "Inspire" },
  { id: "m12", name: "Luca Romano", dept: "Labs" },
];

interface SelectedMember {
  id: string;
  name: string;
  dept: string;
  task: string;
  role: "project_ic" | "member";
}

interface AddEventDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave?: (event: {
    name: string;
    description: string;
    date: string;
    members: SelectedMember[];
  }) => void;
}

const labelStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "12px",
  fontWeight: 600,
  color: "var(--stone-grey)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  display: "block",
  marginBottom: "8px",
};

const inputStyle = {
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
  boxSizing: "border-box" as const,
};

const today = new Date().toISOString().split("T")[0] ?? "";

export function AddEventDrawer({ open, onClose, onSave }: AddEventDrawerProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    date: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedMembers, setSelectedMembers] = useState<SelectedMember[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMemberList, setShowMemberList] = useState(false);

  const filteredMembers = ALL_MEMBERS.filter(
    (m) =>
      !selectedMembers.find((s) => s.id === m.id) &&
      m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const addMember = (m: (typeof ALL_MEMBERS)[0]) => {
    setSelectedMembers((prev) => [
      ...prev,
      { id: m.id, name: m.name, dept: m.dept, task: "", role: "member" },
    ]);
    setMemberSearch("");
    setShowMemberList(false);
  };

  const removeMember = (id: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMember = (
    id: string,
    field: keyof SelectedMember,
    value: string
  ) => {
    setSelectedMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Event name is required";
    if (form.name.length > 80) e.name = "Max 80 characters";
    if (!form.date) e.date = "Event date is required";
    else if (form.date < today) e.date = "Must be a future date";
    if (selectedMembers.length === 0) e.members = "Add at least one member";
    return e;
  };

  const handleCreate = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    onSave?.({ ...form, members: selectedMembers });
    toast.success("Event created successfully! 🎋", {
      duration: 4000,
      style: { background: "var(--cream-white)", color: "var(--bamboo-green)" },
    });
    handleClose();
  };

  const handleClose = () => {
    setForm({ name: "", description: "", date: "" });
    setErrors({});
    setSelectedMembers([]);
    setMemberSearch("");
    onClose();
  };

  const btnBase = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    borderRadius: "12px",
    padding: "11px 20px",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
  };

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Add New Event"
      subtitle="Create a new event and assign team members with their tasks."
      footer={
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleCreate}
            style={{
              ...btnBase,
              flex: 1,
              background: "var(--bamboo-green)",
              color: "#fff",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--deep-forest)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--bamboo-green)")
            }
          >
            Create Event
          </button>
          <button
            onClick={handleClose}
            style={{
              ...btnBase,
              background: "transparent",
              color: "var(--stone-grey)",
              border: "1px solid rgba(140,140,140,0.25)",
            }}
          >
            Cancel
          </button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Event Name */}
        <div>
          <label style={labelStyle}>Event Name *</label>
          <input
            style={{
              ...inputStyle,
              borderColor: errors.name
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)",
            }}
            placeholder="e.g. Annual Gala Night 2026"
            value={form.name}
            maxLength={80}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--bamboo-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.name
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)")
            }
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "4px",
            }}
          >
            {errors.name && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--deadline-red)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {errors.name}
              </p>
            )}
            <span
              style={{
                fontSize: "11px",
                color: "var(--stone-grey)",
                fontFamily: "'DM Sans', sans-serif",
                marginLeft: "auto",
              }}
            >
              {form.name.length}/80
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{
              ...inputStyle,
              minHeight: "96px",
              resize: "vertical",
            }}
            placeholder="Describe the event goals, context, or key deliverables…"
            value={form.description}
            maxLength={500}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--bamboo-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "rgba(74,124,89,0.2)")
            }
          />
          <p
            style={{
              fontSize: "11px",
              color: "var(--stone-grey)",
              textAlign: "right",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: "4px",
            }}
          >
            {form.description.length}/500
          </p>
        </div>

        {/* Event Date */}
        <div>
          <label style={labelStyle}>Event Date *</label>
          <input
            type="date"
            style={{
              ...inputStyle,
              borderColor: errors.date
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)",
            }}
            min={today}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--bamboo-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = errors.date
                ? "var(--deadline-red)"
                : "rgba(74,124,89,0.2)")
            }
          />
          {errors.date && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--deadline-red)",
                fontFamily: "'DM Sans', sans-serif",
                marginTop: "4px",
              }}
            >
              {errors.date}
            </p>
          )}
        </div>

        {/* Members */}
        <div>
          <label style={labelStyle}>
            <Users size={12} style={{ display: "inline", marginRight: "4px" }} />
            Members *
          </label>
          <div style={{ position: "relative" }}>
            <input
              style={{
                ...inputStyle,
                borderColor: errors.members
                  ? "var(--deadline-red)"
                  : "rgba(74,124,89,0.2)",
              }}
              placeholder="Search by name…"
              value={memberSearch}
              onChange={(e) => {
                setMemberSearch(e.target.value);
                setShowMemberList(true);
              }}
              onFocus={() => setShowMemberList(true)}
            />
            {showMemberList && memberSearch && filteredMembers.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  background: "var(--cream-white)",
                  borderRadius: "12px",
                  border: "1px solid rgba(74,124,89,0.15)",
                  boxShadow: "0 8px 24px rgba(28,58,43,0.12)",
                  marginTop: "4px",
                  maxHeight: "180px",
                  overflowY: "auto",
                }}
              >
                {filteredMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addMember(m)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(168,197,160,0.18)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--bamboo-green)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: "10px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "var(--charcoal-ink)",
                        }}
                      >
                        {m.name}
                      </p>
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "11px",
                          color: "var(--stone-grey)",
                        }}
                      >
                        {m.dept}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.members && (
            <p
              style={{
                fontSize: "12px",
                color: "var(--deadline-red)",
                fontFamily: "'DM Sans', sans-serif",
                marginTop: "4px",
              }}
            >
              {errors.members}
            </p>
          )}

          {/* Selected members */}
          {selectedMembers.length > 0 && (
            <div
              style={{
                marginTop: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {selectedMembers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "12px",
                    borderRadius: "12px",
                    background: "rgba(168,197,160,0.12)",
                    border: "1px solid rgba(74,124,89,0.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "var(--bamboo-green)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 700,
                        }}
                      >
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--charcoal-ink)",
                        }}
                      >
                        {m.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeMember(m.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={14} color="var(--stone-grey)" />
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                    <select
                      value={m.dept}
                      onChange={(e) =>
                        updateMember(m.id, "dept", e.target.value)
                      }
                      style={{
                        ...inputStyle,
                        padding: "7px 10px",
                        fontSize: "12px",
                      }}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <select
                      value={m.role}
                      onChange={(e) =>
                        updateMember(
                          m.id,
                          "role",
                          e.target.value as "project_ic" | "member"
                        )
                      }
                      style={{
                        ...inputStyle,
                        padding: "7px 10px",
                        fontSize: "12px",
                      }}
                    >
                      <option value="member">Member</option>
                      <option value="project_ic">Project IC</option>
                    </select>
                  </div>
                  <input
                    style={{
                      ...inputStyle,
                      marginTop: "8px",
                      padding: "7px 10px",
                      fontSize: "12px",
                    }}
                    placeholder={`Task (e.g. ${m.dept} — Slides)`}
                    value={m.task}
                    onChange={(e) => updateMember(m.id, "task", e.target.value)}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "var(--bamboo-green)")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor =
                        "rgba(74,124,89,0.2)")
                    }
                  />
                </div>
              ))}
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "12px",
                  border: "2px dashed rgba(74,124,89,0.3)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "var(--bamboo-green)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(168,197,160,0.12)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => setShowMemberList(true)}
              >
                <Plus size={14} />
                Add another member
              </button>
            </div>
          )}
        </div>
      </div>
    </SlideDrawer>
  );
}
