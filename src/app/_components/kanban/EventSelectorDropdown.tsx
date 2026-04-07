"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, CalendarDays } from "lucide-react";

export interface EventOption {
  id: string;
  name: string;
  date: string | null;
}

interface EventSelectorDropdownProps {
  events: EventOption[];
  selectedId: string | null;
  onChange: (id: string) => void;
}

export function EventSelectorDropdown({ events, selectedId, onChange }: EventSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = events.find((e) => e.id === selectedId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!events.length) {
    return (
      <div
        style={{
          padding: "7px 14px",
          borderRadius: "99px",
          background: "var(--cream-white)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          color: "var(--stone-grey)",
        }}
        className="card-shadow"
      >
        No events
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="card-shadow"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "7px 14px 7px 12px",
          borderRadius: "99px",
          background: "var(--cream-white)",
          border: "none",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--deep-forest)",
          transition: "background 0.15s",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(168,197,160,0.20)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cream-white)")}
      >
        <CalendarDays size={14} color="var(--bamboo-green)" />
        {selected?.name ?? "Select event"}
        <ChevronDown
          size={14}
          color="var(--stone-grey)"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div
          className="card-shadow"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 30,
            background: "var(--cream-white)",
            borderRadius: "14px",
            padding: "6px",
            minWidth: "220px",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          {events.map((evt) => {
            const active = evt.id === selectedId;
            return (
              <button
                key={evt.id}
                onClick={() => { onChange(evt.id); setOpen(false); }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: "10px",
                  border: "none",
                  background: active ? "rgba(74,124,89,0.10)" : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(168,197,160,0.12)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                  }}
                >
                  {evt.name}
                </span>
                {evt.date && (
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "11px",
                      color: "var(--stone-grey)",
                      marginTop: "2px",
                    }}
                  >
                    {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
