"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { BirdsEyeEventCard, type BirdsEyeEvent } from "~/app/_components/admin/BirdsEyeEventCard";

type KanbanStatus = "new" | "in_progress" | "in_review" | "done";

const PILLARS: KanbanStatus[] = ["new", "in_progress", "in_review", "done"];

const PILLAR_CONFIG: Record<KanbanStatus, { label: string; dotColor: string }> = {
  new:         { label: "New",         dotColor: "var(--stone-grey)" },
  in_progress: { label: "In Progress", dotColor: "var(--deadline-amber)" },
  in_review:   { label: "In Review",   dotColor: "var(--bamboo-green)" },
  done:        { label: "Done",        dotColor: "var(--deep-forest)" },
};

export default function AdminKanbanPage() {
  const [mobilePillar, setMobilePillar] = useState<KanbanStatus>("new");
  const [dragOverPillar, setDragOverPillar] = useState<KanbanStatus | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: events = [], refetch } = api.kanban.getAdminBirdsEye.useQuery();

  const moveEvent = api.kanban.moveEvent.useMutation({
    onSuccess: () => void refetch(),
    onError: (err) => toast.error(err.message),
  });

  const activeCount = events.filter((e) => e.status === "active").length;

  const eventsByPillar: Record<KanbanStatus, BirdsEyeEvent[]> = {
    new: [], in_progress: [], in_review: [], done: [],
  };
  for (const ev of events) {
    eventsByPillar[ev.kanbanStatus].push(ev);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStatus: KanbanStatus) => {
      e.preventDefault();
      setDragOverPillar(null);
      const eventId = e.dataTransfer.getData("eventId");
      if (!eventId) return;
      moveEvent.mutate({ eventId, kanbanStatus: targetStatus });
    },
    [moveEvent]
  );

  const scrollToPillar = (status: KanbanStatus) => {
    setMobilePillar(status);
    const idx = PILLARS.indexOf(status);
    if (scrollRef.current) {
      const w = scrollRef.current.scrollWidth / PILLARS.length;
      scrollRef.current.scrollTo({ left: idx * w, behavior: "smooth" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--ivory-paper)", paddingBottom: "40px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <div style={{ paddingTop: "32px", paddingBottom: "24px" }}>
          {/* EXCO label */}
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--bamboo-green)",
              margin: "0 0 8px",
            }}
          >
            EXCO VIEW · {activeCount} ACTIVE EVENT{activeCount !== 1 ? "S" : ""}
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 700,
                color: "var(--deep-forest)",
                margin: 0,
              }}
            >
              Kanban Board
            </h1>

            <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
              <Link
                href="/admin/members"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(28,58,43,0.20)",
                  background: "transparent",
                  color: "var(--deep-forest)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,58,43,0.06)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Users size={14} />
                Manage Members
              </Link>

              <Link
                href="/admin/events/new"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--deep-forest)",
                  color: "#fff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bamboo-green)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--deep-forest)")}
              >
                <Plus size={14} />
                Add Event
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile pillar tab bar */}
        <div
          className="md:hidden"
          style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            paddingBottom: "12px",
            scrollbarWidth: "none",
          }}
        >
          {PILLARS.map((p) => {
            const cfg = PILLAR_CONFIG[p];
            return (
              <button
                key={p}
                onClick={() => scrollToPillar(p)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "99px",
                  border: "none",
                  background: mobilePillar === p ? "var(--deep-forest)" : "rgba(140,140,140,0.10)",
                  color: mobilePillar === p ? "#fff" : "var(--stone-grey)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: mobilePillar === p ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: mobilePillar === p ? "#fff" : cfg.dotColor,
                    flexShrink: 0,
                  }}
                />
                {cfg.label}
                <span
                  style={{
                    background: mobilePillar === p ? "rgba(255,255,255,0.20)" : "rgba(140,140,140,0.15)",
                    borderRadius: "99px",
                    padding: "1px 6px",
                    fontSize: "10px",
                  }}
                >
                  {String(eventsByPillar[p].length).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        {/* Kanban columns */}
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            paddingBottom: "16px",
          }}
        >
          {PILLARS.map((pillar) => {
            const cfg = PILLAR_CONFIG[pillar];
            const colEvents = eventsByPillar[pillar];
            const isOver = dragOverPillar === pillar;

            return (
              <div
                key={pillar}
                style={{
                  minWidth: "clamp(280px, 85vw, 320px)",
                  scrollSnapAlign: "start",
                  flex: "1 0 auto",
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                    paddingBottom: "10px",
                    borderBottom: "1px solid rgba(140,140,140,0.12)",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: cfg.dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.10em",
                      textTransform: "uppercase",
                      color: "var(--stone-grey)",
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--cream-white)",
                      background: "var(--stone-grey)",
                      borderRadius: "99px",
                      padding: "1px 7px",
                      minWidth: "20px",
                      textAlign: "center",
                    }}
                  >
                    {String(colEvents.length).padStart(2, "0")}
                  </span>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOverPillar(pillar); }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverPillar(null);
                    }
                  }}
                  onDrop={(e) => handleDrop(e, pillar)}
                  className={isOver ? "kanban-drop-active" : ""}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    borderRadius: "12px",
                    padding: isOver ? "8px" : "0",
                    transition: "padding 0.15s ease",
                    minHeight: "120px",
                  }}
                >
                  {colEvents.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "2px dashed var(--sage-mist)",
                        borderRadius: "12px",
                        padding: "32px 16px",
                        minHeight: "120px",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: "var(--stone-grey)",
                          textAlign: "center",
                        }}
                      >
                        No events here
                      </p>
                    </div>
                  ) : (
                    colEvents.map((ev) => (
                      <div
                        key={ev.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("eventId", ev.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                      >
                        <BirdsEyeEventCard event={ev} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
