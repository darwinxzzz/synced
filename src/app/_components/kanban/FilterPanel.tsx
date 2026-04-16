"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

export type DateSort = "asc" | "desc" | null;
export type NameSort = "asc" | "desc" | null;
export type PriorityFilter = "low" | "medium" | "high" | null;

export interface KanbanFilters {
  dateSort: DateSort;
  priorityFilter: PriorityFilter;
  nameSort?: NameSort;
  departmentFilter?: string | null;
}

interface FilterPanelProps {
  filters: KanbanFilters;
  onChange: (f: KanbanFilters) => void;
  showDate?: boolean;
  showName?: boolean;
  showPriority?: boolean;
  departments?: string[];
}

export function FilterPanel({
  filters,
  onChange,
  showDate = true,
  showName = false,
  showPriority = true,
  departments,
}: FilterPanelProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActive =
    filters.dateSort !== null ||
    filters.priorityFilter !== null ||
    !!filters.nameSort ||
    !!filters.departmentFilter;

  const toggleDate = () => {
    const next: DateSort =
      filters.dateSort === null ? "asc" : filters.dateSort === "asc" ? "desc" : null;
    onChange({ ...filters, dateSort: next });
  };

  const toggleName = () => {
    const next: NameSort =
      !filters.nameSort ? "asc" : filters.nameSort === "asc" ? "desc" : null;
    onChange({ ...filters, nameSort: next });
  };

  const setPriority = (p: PriorityFilter) => {
    onChange({ ...filters, priorityFilter: filters.priorityFilter === p ? null : p });
  };

  const setDepartment = (dept: string) => {
    onChange({ ...filters, departmentFilter: filters.departmentFilter === dept ? null : dept });
  };

  const reset = () =>
    onChange({ dateSort: null, priorityFilter: null, nameSort: null, departmentFilter: null });

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 14px",
          borderRadius: "99px",
          background: hasActive ? "rgba(74,124,89,0.10)" : "transparent",
          border: `1px solid ${hasActive ? "var(--bamboo-green)" : "rgba(140,140,140,0.25)"}`,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 500,
          color: hasActive ? "var(--bamboo-green)" : "var(--stone-grey)",
          transition: "all 0.2s",
        }}
      >
        <SlidersHorizontal size={13} />
        Filter
        <ChevronDown
          size={13}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
        />
      </button>

      {open && (
        <div
          className="card-shadow"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 30,
            background: "var(--cream-white)",
            borderRadius: "14px",
            padding: "16px",
            minWidth: "200px",
          }}
        >
          {/* Name sort */}
          {showName && (
            <>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--stone-grey)",
                  marginBottom: "8px",
                }}
              >
                Sort by Name
              </p>
              <button
                onClick={toggleName}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(140,140,140,0.18)",
                  background: filters.nameSort ? "rgba(74,124,89,0.08)" : "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: filters.nameSort ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                  fontWeight: filters.nameSort ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                Name
                <span style={{ fontSize: "12px" }}>
                  {filters.nameSort === "asc" ? "A → Z" : filters.nameSort === "desc" ? "Z → A" : "—"}
                </span>
              </button>
            </>
          )}

          {/* Date sort */}
          {showDate && (
            <>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--stone-grey)",
                  marginBottom: "8px",
                }}
              >
                Sort by Date
              </p>
              <button
                onClick={toggleDate}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "10px",
                  border: "1px solid rgba(140,140,140,0.18)",
                  background: filters.dateSort ? "rgba(74,124,89,0.08)" : "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: filters.dateSort ? "var(--bamboo-green)" : "var(--charcoal-ink)",
                  fontWeight: filters.dateSort ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: departments?.length ? "14px" : showPriority ? "14px" : "0",
                }}
              >
                Deadline
                <span style={{ fontSize: "12px" }}>
                  {filters.dateSort === "asc" ? "↑ Ascending" : filters.dateSort === "desc" ? "↓ Descending" : "—"}
                </span>
              </button>
            </>
          )}

          {/* Department filter */}
          {!!departments?.length && (
            <>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--stone-grey)",
                  marginBottom: "8px",
                }}
              >
                Department
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: showPriority ? "14px" : "0" }}>
                {departments.map((dept) => {
                  const active = filters.departmentFilter === dept;
                  return (
                    <button
                      key={dept}
                      onClick={() => setDepartment(dept)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "99px",
                        border: `1px solid ${active ? "var(--bamboo-green)" : "rgba(140,140,140,0.18)"}`,
                        background: active ? "rgba(74,124,89,0.10)" : "transparent",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        fontWeight: active ? 600 : 400,
                        color: active ? "var(--bamboo-green)" : "var(--stone-grey)",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Priority filter */}
          {showPriority && (
            <>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--stone-grey)",
                  marginBottom: "8px",
                }}
              >
                Filter by Priority
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                {(["low", "medium", "high"] as const).map((p) => {
                  const active = filters.priorityFilter === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "99px",
                        border: `1px solid ${active ? "var(--bamboo-green)" : "rgba(140,140,140,0.18)"}`,
                        background: active ? "rgba(74,124,89,0.10)" : "transparent",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        fontWeight: active ? 600 : 400,
                        color: active ? "var(--bamboo-green)" : "var(--stone-grey)",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {hasActive && (
            <button
              onClick={reset}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "10px",
                border: "none",
                background: "transparent",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: "var(--deadline-red)",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
