"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { BlurModal } from "~/app/_components/shared/BlurModal";
import { MemberProfileDrawer, type MemberProfile } from "~/app/_components/shared/MemberProfileDrawer";

type MemberRole = "member" | "lead";

interface MemberOption {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  department: string | null;
}

interface AddedMember {
  id: string;
  name: string;
  department: string;
  role: MemberRole;
  task: string;
  locked: boolean;
  profile: MemberProfile;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1.5px solid rgba(74,124,89,0.20)",
  background: "var(--ivory-paper)",
  color: "var(--charcoal-ink)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  padding: "0 12px",
  outline: "none",
};

function countWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function buildFallbackAvatar(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export function CreateEventModal({ isOpen, onClose, onCreated }: CreateEventModalProps) {
  const [name, setName] = useState("");
  const [narrative, setNarrative] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [addedMembers, setAddedMembers] = useState<AddedMember[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<MemberProfile | null>(null);

  const utils = api.useUtils();
  const { data: adminProfile } = api.dashboard.getMyProfile.useQuery(undefined, { enabled: isOpen });
  const { data: searchedMembers = [] } = api.kanban.getAdminMembers.useQuery(
    { search: memberSearch || undefined },
    { enabled: isOpen }
  );

  const createEvent = api.events.create.useMutation();
  const updateStatus = api.events.updateStatus.useMutation();

  useEffect(() => {
    if (!isOpen || !adminProfile) return;

    setAddedMembers((prev) => {
      if (prev.some((m) => m.id === adminProfile.id)) return prev;
      const adminMember: AddedMember = {
        id: adminProfile.id,
        name: adminProfile.name,
        department: adminProfile.department ?? "Admin",
        role: "lead",
        task: "",
        locked: true,
        profile: {
          id: adminProfile.id,
          name: adminProfile.name,
          email: adminProfile.email,
          avatar_url: adminProfile.avatar_url,
          department: adminProfile.department,
          role: adminProfile.role,
          joined_date: adminProfile.joined_date,
        },
      };
      return [adminMember, ...prev];
    });
  }, [isOpen, adminProfile]);

  const allMembers = useMemo<MemberOption[]>(() => {
    return searchedMembers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatar_url: m.avatar_url,
      department: m.department,
    }));
  }, [searchedMembers]);

  const pending = createEvent.isPending || updateStatus.isPending;

  function resetForm() {
    setName("");
    setNarrative("");
    setMemberSearch("");
    setStartDate("");
    setStartTime("");
    setEndTime("");
    setIsRecurring(false);
    setCoverUrl("");
    setAddedMembers((prev) => prev.filter((m) => m.locked));
  }

  function addMember(member: MemberOption) {
    if (addedMembers.some((m) => m.id === member.id)) {
      setSelectedProfile({
        id: member.id,
        name: member.name,
        email: member.email,
        avatar_url: member.avatar_url,
        department: member.department,
        role: "member",
        joined_date: null,
      });
      return;
    }

    const profile: MemberProfile = {
      id: member.id,
      name: member.name,
      email: member.email,
      avatar_url: member.avatar_url,
      department: member.department,
      role: "member",
      joined_date: null,
    };

    setAddedMembers((prev) => [
      ...prev,
      {
        id: member.id,
        name: member.name,
        department: member.department ?? "General",
        role: "member",
        task: "",
        locked: false,
        profile,
      },
    ]);

    setSelectedProfile(profile);
  }

  function updateMember(id: string, patch: Partial<AddedMember>) {
    setAddedMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMember(id: string) {
    setAddedMembers((prev) => prev.filter((m) => m.id !== id || m.locked));
  }

  async function submit(mode: "draft" | "active") {
    if (!name.trim()) {
      toast.error("Event name is required");
      return;
    }

    if (mode === "active") {
      if (!startDate || !startTime || !endTime) {
        toast.error("Date, start time, and end time are required");
        return;
      }

      if (addedMembers.length === 0) {
        toast.error("At least one member is required");
        return;
      }
    }

    if (countWords(narrative) > 120) {
      toast.error("Narrative is too long. Keep it under 120 words.");
      return;
    }

    try {
      const created = await createEvent.mutateAsync({
        name: name.trim(),
        description: narrative.trim() || undefined,
        date: startDate || undefined,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
        cover_url: coverUrl.trim() || undefined,
        is_recurring: isRecurring,
        member_ids: addedMembers.map((m) => m.id),
      });

      await updateStatus.mutateAsync({ id: created.id, status: mode });
      await utils.kanban.getAdminBirdsEye.invalidate();
      toast.success(mode === "draft" ? "Event saved as draft" : "Event created");
      onCreated();
      resetForm();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create event";
      toast.error(message);
    }
  }

  return (
    <>
      <BlurModal isOpen={isOpen} onClose={onClose} width="max-w-6xl">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              paddingBottom: 14,
              borderBottom: "1px solid rgba(74,124,89,0.12)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(140,140,140,0.12)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={14} color="var(--stone-grey)" />
              </button>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: "var(--deep-forest)",
                  fontSize: "clamp(28px,3.2vw,36px)",
                }}
              >
                Create New Event
              </h2>
            </div>

            <p className="bamboo-label" style={{ margin: 0 }}>
              Draft Status: Unsaved
            </p>
          </div>

          <div className="create-event-grid" style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 20 }}>
            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24 }}>
              <SectionLabel>Event Identity</SectionLabel>
              <input
                className="es-input"
                style={{ ...INPUT_STYLE, height: 46, marginBottom: 16, fontSize: 18, fontStyle: "italic" }}
                placeholder="Enter a memorable name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <SectionLabel>Narrative & Purpose</SectionLabel>
              <div
                style={{
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid rgba(74,124,89,0.14)",
                  borderRadius: 12,
                  overflow: "hidden",
                  marginBottom: 18,
                }}
              >
                <div style={{ display: "flex", gap: 8, padding: "8px 10px", borderBottom: "1px solid rgba(74,124,89,0.10)" }}>
                  {[
                    { label: "B", apply: "**bold**" },
                    { label: "I", apply: "_italic_" },
                    { label: "-", apply: "- bullet" },
                    { label: '"', apply: "> quote" },
                  ].map((tool) => (
                    <button
                      key={tool.label}
                      type="button"
                      onClick={() => setNarrative((v) => `${v}${v ? "\n" : ""}${tool.apply}`)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "var(--charcoal-ink)",
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
                <textarea
                  className="es-input"
                  style={{
                    ...INPUT_STYLE,
                    border: "none",
                    borderRadius: 0,
                    minHeight: 150,
                    resize: "vertical",
                    padding: 12,
                    fontStyle: "italic",
                    background: "transparent",
                  }}
                  placeholder="Describe the spirit of this gathering..."
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                />
              </div>

              <SectionLabel>Team Composition</SectionLabel>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1px solid rgba(74,124,89,0.14)",
                  borderRadius: 999,
                  height: 40,
                  padding: "0 12px",
                  background: "var(--ivory-paper)",
                  marginBottom: 12,
                }}
              >
                <Search size={14} color="var(--stone-grey)" />
                <input
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                />
              </div>

              <p className="bamboo-label" style={{ marginBottom: 8 }}>Added Members</p>
              <AnimatePresence initial={false}>
                {addedMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      borderRadius: 14,
                      border: "1px solid rgba(74,124,89,0.14)",
                      background: "var(--cream-white)",
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div className="added-row" style={{ display: "grid", gridTemplateColumns: "auto 1fr 110px 130px 95px", gap: 10, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => (member.locked ? undefined : removeMember(member.id))}
                        disabled={member.locked}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "none",
                          background: member.locked ? "transparent" : "rgba(192,80,58,0.12)",
                          color: member.locked ? "transparent" : "var(--deadline-red)",
                          cursor: member.locked ? "default" : "pointer",
                        }}
                      >
                        x
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProfile(member.profile)}
                        style={{
                          border: "none",
                          background: "transparent",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--bamboo-green)",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {buildFallbackAvatar(member.name)}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--charcoal-ink)" }}>{member.name}</p>
                          <p style={{ margin: 0, fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "var(--stone-grey)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{member.department}</p>
                        </div>
                      </button>
                      <input
                        className="es-input"
                        style={{ ...INPUT_STYLE, height: 32, fontSize: 12 }}
                        value={member.department}
                        onChange={(e) => updateMember(member.id, { department: e.target.value })}
                        placeholder="Department"
                      />
                      <input
                        className="es-input"
                        style={{ ...INPUT_STYLE, height: 32, fontSize: 12 }}
                        value={member.task}
                        onChange={(e) => updateMember(member.id, { task: e.target.value })}
                        placeholder="Task"
                      />
                      <select
                        className="es-input"
                        style={{ ...INPUT_STYLE, height: 32, fontSize: 12, cursor: "pointer" }}
                        value={member.role}
                        onChange={(e) => updateMember(member.id, { role: e.target.value as MemberRole })}
                      >
                        <option value="member">Member</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <p className="bamboo-label" style={{ margin: "12px 0 8px" }}>Members</p>
              <div style={{ maxHeight: 220, overflowY: "auto", display: "grid", gap: 8 }}>
                {allMembers.map((member) => (
                  <button
                    type="button"
                    key={member.id}
                    onClick={() => addMember(member)}
                    style={{
                      border: "1px solid rgba(74,124,89,0.14)",
                      background: "var(--cream-white)",
                      borderRadius: 12,
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--charcoal-ink)", fontWeight: 600 }}>{member.name}</span>
                    <span className="bamboo-label" style={{ margin: 0 }}>{member.department ?? "General"}</span>
                  </button>
                ))}
              </div>
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, delay: 0.04 }}>
              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid rgba(74,124,89,0.14)",
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <SectionLabel>Temporal Alignment</SectionLabel>
                <p style={{ margin: "0 0 12px", fontFamily: "'Playfair Display', serif", fontSize: 24, fontStyle: "italic", color: "var(--deep-forest)" }}>
                  Schedule & Timing
                </p>
                <div style={{ display: "grid", gap: 10 }}>
                  <input className="es-input" type="date" style={{ ...INPUT_STYLE, height: 42 }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input className="es-input" type="time" style={{ ...INPUT_STYLE, height: 42 }} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    <input className="es-input" type="time" style={{ ...INPUT_STYLE, height: 42 }} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "var(--stone-grey)" }}>
                    Recurring Event
                    <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />
                  </label>
                </div>
              </div>

              <div
                style={{
                  borderRadius: 14,
                  border: "1px solid rgba(74,124,89,0.14)",
                  background:
                    "linear-gradient(180deg, rgba(196,163,90,0.28) 0%, rgba(196,163,90,0.15) 100%)",
                  padding: 16,
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    height: 140,
                    background: coverUrl
                      ? `center / cover no-repeat url('${coverUrl}')`
                      : "linear-gradient(120deg, rgba(28,58,43,0.2), rgba(168,197,160,0.35))",
                    marginBottom: 10,
                  }}
                />
                <button
                  type="button"
                  style={{
                    height: 36,
                    borderRadius: 999,
                    border: "1px solid rgba(28,58,43,0.30)",
                    padding: "0 16px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: "var(--cream-white)",
                    color: "var(--deep-forest)",
                    cursor: "default",
                  }}
                >
                  Change Cover
                </button>
                <input
                  className="es-input"
                  style={{ ...INPUT_STYLE, height: 40, marginTop: 10, background: "rgba(255,255,255,0.8)" }}
                  placeholder="Paste cover image URL..."
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                />
                <p style={{ margin: "8px 0 0", fontFamily: "'Playfair Display', serif", fontSize: 12, fontStyle: "italic", textAlign: "center", color: "var(--stone-grey)" }}>
                  Design is not just what it looks like and feels like.
                </p>
              </div>
            </motion.section>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(74,124,89,0.12)",
              paddingTop: 14,
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "none",
                background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: 12,
                color: "var(--stone-grey)",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                disabled={pending}
                onClick={() => void submit("draft")}
                style={{
                  height: 44,
                  borderRadius: 999,
                  border: "1.5px solid rgba(28,58,43,0.30)",
                  padding: "0 18px",
                  background: "transparent",
                  color: "var(--deep-forest)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: pending ? "not-allowed" : "pointer",
                  opacity: pending ? 0.65 : 1,
                }}
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => void submit("active")}
                style={{
                  height: 44,
                  borderRadius: 999,
                  border: "none",
                  padding: "0 20px",
                  background: "var(--deep-forest)",
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: pending ? "not-allowed" : "pointer",
                  opacity: pending ? 0.65 : 1,
                }}
              >
                Create Event
              </button>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 1080px) {
            .create-event-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 760px) {
            .added-row { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </BlurModal>

      <MemberProfileDrawer isOpen={!!selectedProfile} onClose={() => setSelectedProfile(null)} profile={selectedProfile} />
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="bamboo-label" style={{ margin: "0 0 8px" }}>
      {children}
    </p>
  );
}
