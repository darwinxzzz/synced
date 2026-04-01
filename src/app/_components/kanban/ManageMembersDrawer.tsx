import { useState } from "react";
import { X, Search } from "lucide-react";
import { toast } from "sonner";
import { SlideDrawer } from "../shared/SlideDrawer";

export interface EventMember {
  id: string;
  name: string;
  dept: string;
  role: "project_ic" | "member";
}

const ALL_MEMBERS: EventMember[] = [
  { id: "m1", name: "Jie Ying", dept: "Software Technology", role: "member" },
  { id: "m2", name: "Alex Tan", dept: "Connectors", role: "member" },
  { id: "m3", name: "Sarah Kim", dept: "Inspire", role: "member" },
  { id: "m4", name: "Marcus Osei", dept: "Monthly Meet-ups", role: "member" },
  { id: "m5", name: "Priya Nair", dept: "Publicity", role: "member" },
  { id: "m6", name: "Diego Alvarez", dept: "Software Technology", role: "member" },
  { id: "m7", name: "Amara Chen", dept: "Connectors", role: "member" },
  { id: "m8", name: "Keiko Tanaka", dept: "Labs", role: "member" },
  { id: "m9", name: "Noah Williams", dept: "Monthly Meet-ups", role: "member" },
  { id: "m10", name: "Zara Khan", dept: "Publicity", role: "member" },
  { id: "m11", name: "Fatima Al-Hassan", dept: "Inspire", role: "member" },
  { id: "m12", name: "Luca Romano", dept: "Labs", role: "member" },
];

const INITIAL_MEMBERS: EventMember[] = [
  { id: "m1", name: "Jie Ying", dept: "Software Technology", role: "project_ic" },
  { id: "m3", name: "Sarah Kim", dept: "Inspire", role: "member" },
  { id: "m4", name: "Marcus Osei", dept: "Monthly Meet-ups", role: "member" },
  { id: "m7", name: "Amara Chen", dept: "Connectors", role: "member" },
];

interface ManageMembersDrawerProps {
  open: boolean;
  onClose: () => void;
  eventName?: string;
}

const avatarBg = (name: string) => {
  const colors = [
    "var(--bamboo-green)",
    "var(--deadline-amber)",
    "var(--accent-gold)",
    "var(--deadline-green)",
    "#7B68EE",
    "#E88F8F",
  ];
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  return colors[idx];
};

export function ManageMembersDrawer({
  open,
  onClose,
  eventName = "Event",
}: ManageMembersDrawerProps) {
  const [members, setMembers] = useState<EventMember[]>(INITIAL_MEMBERS);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false);

  const available = ALL_MEMBERS.filter(
    (m) =>
      !members.find((em) => em.id === m.id) &&
      m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMember = (m: EventMember) => {
    setMembers((prev) => [...prev, { ...m, role: "member" }]);
    setSearch("");
    setShowList(false);
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateRole = (id: string, role: "project_ic" | "member") => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
  };

  const handleSave = () => {
    toast.success("Member list updated! ✓", {
      duration: 4000,
      style: { background: "var(--cream-white)", color: "var(--bamboo-green)" },
    });
    onClose();
  };

  const roleBadge = (role: EventMember["role"]) => ({
    background:
      role === "project_ic"
        ? "rgba(196,163,90,0.18)"
        : "rgba(168,197,160,0.25)",
    color:
      role === "project_ic" ? "var(--accent-gold)" : "var(--bamboo-green)",
    label: role === "project_ic" ? "Project IC" : "Member",
  });

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="Manage Members"
      subtitle={`Assign roles and manage team for ${eventName}.`}
      footer={
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "11px 20px",
              borderRadius: "12px",
              border: "none",
              background: "var(--bamboo-green)",
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--deep-forest)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--bamboo-green)")
            }
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
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
      {/* Search to add */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <Search
          size={15}
          color="var(--stone-grey)"
          style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
        <input
          style={{
            width: "100%",
            padding: "10px 14px 10px 36px",
            borderRadius: "12px",
            border: "1px solid rgba(74,124,89,0.2)",
            background: "var(--ivory-paper)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: "var(--charcoal-ink)",
            outline: "none",
            boxSizing: "border-box",
          }}
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowList(true);
          }}
          onFocus={() => setShowList(true)}
        />
        {showList && search && available.length > 0 && (
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
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {available.map((m) => (
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
                  (e.currentTarget.style.background = "rgba(168,197,160,0.18)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: avatarBg(m.name),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 500, color: "var(--charcoal-ink)" }}>{m.name}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "var(--stone-grey)" }}>{m.dept}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="bamboo-label" style={{ marginBottom: "12px" }}>
        {members.length} {members.length === 1 ? "member" : "members"} assigned
      </p>

      {/* Members list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {members.map((m) => {
          const badge = roleBadge(m.role);
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "14px",
                background: "var(--ivory-paper)",
                border: "1px solid rgba(74,124,89,0.10)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "rgba(168,197,160,0.12)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.background =
                  "var(--ivory-paper)")
              }
            >
              {/* Avatar */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: avatarBg(m.name),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {m.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: 600, color: "var(--charcoal-ink)" }}>{m.name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "11px", color: "var(--stone-grey)" }}>{m.dept}</p>
              </div>

              {/* Role toggle */}
              <button
                onClick={() =>
                  updateRole(m.id, m.role === "project_ic" ? "member" : "project_ic")
                }
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  border: "none",
                  background: badge.background,
                  color: badge.color,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
                title="Click to toggle role"
              >
                {badge.label}
              </button>

              {/* Remove */}
              <button
                onClick={() => removeMember(m.id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(192,80,58,0.10)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(192,80,58,0.22)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(192,80,58,0.10)")
                }
              >
                <X size={13} color="var(--deadline-red)" />
              </button>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--stone-grey)",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          }}
        >
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🌿</p>
          <p>No members yet. Search above to invite your first member.</p>
        </div>
      )}
    </SlideDrawer>
  );
}
