"use client";

import { useRef, useEffect, useCallback } from "react";

const ITEM_H = 36;
const VISIBLE = 6;
const CONTAINER_H = ITEM_H * VISIBLE;
const PAD = (CONTAINER_H - ITEM_H) / 2;

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "10", "20", "30", "40", "50"];

function ScrollWheel({
  items,
  value,
  onChange,
  label,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const byCode = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    byCode.current = true;
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    const t = setTimeout(() => { byCode.current = false; }, 400);
    return () => clearTimeout(t);
  }, [value, items]);

  const handleScroll = useCallback(() => {
    if (byCode.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      const next = items[clamped];
      if (next && next !== value) onChange(next);
    }, 80);
  }, [items, value, onChange]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "9px",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--stone-grey)",
        }}
      >
        {label}
      </span>
      <div style={{ position: "relative", width: "56px" }}>
        {/* Selected highlight */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: `${PAD}px`,
            left: 0,
            right: 0,
            height: `${ITEM_H}px`,
            borderRadius: "8px",
            background: "rgba(74,124,89,0.10)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        <div
          ref={ref}
          onScroll={handleScroll}
          style={{
            height: `${CONTAINER_H}px`,
            overflowY: "scroll",
            scrollSnapType: "y mandatory",
            paddingTop: `${PAD}px`,
            paddingBottom: `${PAD}px`,
            scrollbarWidth: "none",
            position: "relative",
          }}
        >
          {items.map((item) => {
            const isSelected = item === value;
            return (
              <div
                key={item}
                onClick={() => onChange(item)}
                style={{
                  height: `${ITEM_H}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  scrollSnapAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: isSelected ? "17px" : "14px",
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? "var(--deep-forest)" : "var(--stone-grey)",
                  cursor: "pointer",
                  transition: "font-size 0.15s, color 0.15s, font-weight 0.15s",
                  userSelect: "none",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {item}
              </div>
            );
          })}
        </div>
        {/* Top fade */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: `${PAD}px`,
            background: "linear-gradient(to bottom, var(--ivory-paper) 30%, transparent)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
        {/* Bottom fade */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: `${PAD}px`,
            background: "linear-gradient(to top, var(--ivory-paper) 30%, transparent)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </div>
    </div>
  );
}

interface DeadlinePickerProps {
  value: string;
  onChange: (iso: string) => void;
  onClear: () => void;
}

function snapMinute(m: number): string {
  return String(Math.round(m / 10) * 10 % 60).padStart(2, "0");
}

export function DeadlinePicker({ value, onChange, onClear }: DeadlinePickerProps) {
  const pad = (n: number) => String(n).padStart(2, "0");

  let dateStr = "";
  let hourStr = "09";
  let minStr = "00";

  if (value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      hourStr = pad(d.getHours());
      minStr = snapMinute(d.getMinutes());
    }
  }

  const emit = (date: string, hour: string, min: string) => {
    if (!date) return;
    onChange(new Date(`${date}T${hour}:${min}:00`).toISOString());
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Date row */}
      <input
        type="date"
        value={dateStr}
        onChange={(e) => emit(e.target.value, hourStr, minStr)}
        style={{
          width: "100%",
          height: "40px",
          padding: "0 12px",
          borderRadius: "10px",
          border: "1px solid rgba(74,124,89,0.20)",
          background: "var(--ivory-paper)",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          color: dateStr ? "var(--charcoal-ink)" : "var(--stone-grey)",
          outline: "none",
          boxSizing: "border-box",
          cursor: "pointer",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--bamboo-green)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(74,124,89,0.20)")}
      />

      {/* Time wheels — only show once a date is chosen */}
      {dateStr && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            borderRadius: "12px",
            border: "1px solid rgba(74,124,89,0.15)",
            background: "var(--ivory-paper)",
            padding: "10px 16px",
            justifyContent: "center",
          }}
        >
          <ScrollWheel
            items={HOURS}
            value={hourStr}
            label="Hour"
            onChange={(h) => emit(dateStr, h, minStr)}
          />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--stone-grey)",
              margin: "0 8px",
              paddingTop: "20px",
            }}
          >
            :
          </span>
          <ScrollWheel
            items={MINUTES}
            value={minStr}
            label="Min"
            onChange={(m) => emit(dateStr, hourStr, m)}
          />
        </div>
      )}

      {/* Clear link */}
      {value && (
        <button
          type="button"
          onClick={onClear}
          style={{
            background: "none",
            border: "none",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "11px",
            color: "var(--stone-grey)",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            textAlign: "left",
          }}
        >
          Clear deadline
        </button>
      )}
    </div>
  );
}
