"use client";

import { useState } from "react";
import { Archive, Leaf } from "lucide-react";
import { api } from "~/trpc/react";
import { SlideDrawer } from "../shared/SlideDrawer";
import { ReflectionDetailModal, type ReflectionItem } from "../shared/ReflectionDetailModal";

interface ReflectionDrawerProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "pending" | "archived";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;
  if (diffDays >= 1) return `${Math.floor(diffDays)}d ago`;
  if (diffHours >= 1) return `${Math.floor(diffHours)}h ago`;
  return "Just now";
}

export function ReflectionDrawer({ open, onClose }: ReflectionDrawerProps) {
  const [tab, setTab] = useState<Tab>("pending");
  const [detailReflection, setDetailReflection] = useState<ReflectionItem | null>(null);

  const { data: reflections = [], refetch } = api.reflections.getMyReflections.useQuery(
    undefined,
    { enabled: open }
  );

  const pending = reflections.filter((r) => r.status === "pending");
  const archived = reflections.filter((r) => r.status === "archived");
  const items = tab === "pending" ? pending : archived;

  const handleSuccess = () => {
    void refetch();
  };

  return (
    <>
      <SlideDrawer
        open={open}
        onClose={onClose}
        title="Inner Council"
        subtitle="Your reflections from completed tasks."
        width={520}
      >
        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "20px",
            background: "rgba(140,140,140,0.08)",
            borderRadius: "10px",
            padding: "4px",
          }}
        >
          {(["pending", "archived"] as Tab[]).map((t) => {
            const active = tab === t;
            const count = t === "pending" ? pending.length : archived.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: active ? "var(--deep-forest)" : "transparent",
                  color: active ? "#fff" : "var(--stone-grey)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                {t === "pending" ? "Pending" : "Archived"}
                {count > 0 && (
                  <span
                    style={{
                      background: active ? "rgba(255,255,255,0.20)" : "rgba(140,140,140,0.15)",
                      borderRadius: "99px",
                      padding: "1px 7px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Item list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "48px 24px",
                border: "2px dashed var(--sage-mist)",
                borderRadius: "14px",
              }}
            >
              {tab === "pending" ? (
                <>
                  <Leaf size={24} color="var(--stone-grey)" />
                  <p style={{ fontFamily: "'DM Sans'", fontSize: "14px", fontWeight: 600, color: "var(--charcoal-ink)" }}>
                    No pending reflections
                  </p>
                  <p style={{ fontFamily: "'DM Sans'", fontSize: "13px", color: "var(--stone-grey)" }}>
                    You&apos;re all caught up 🌿
                  </p>
                </>
              ) : (
                <>
                  <Archive size={24} color="var(--stone-grey)" />
                  <p style={{ fontFamily: "'DM Sans'", fontSize: "14px", fontWeight: 600, color: "var(--charcoal-ink)" }}>
                    No archived reflections yet
                  </p>
                </>
              )}
            </div>
          ) : (
            items.map((item) => {
              const taskName = item.contributions?.task ?? "Task";
              const snippet = item.description ?? taskName;

              return (
                <button
                  key={item.id}
                  onClick={() => setDetailReflection(item)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    border: "1px solid rgba(74,124,89,0.12)",
                    background: "var(--cream-white)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                  className="card-shadow"
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(74,124,89,0.25)"; e.currentTarget.style.background = "rgba(168,197,160,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(74,124,89,0.12)"; e.currentTarget.style.background = "var(--cream-white)"; }}
                >
                  {/* Row 1: task name + time */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--charcoal-ink)",
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginRight: "8px",
                      }}
                    >
                      {taskName}
                    </span>
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "11px",
                        color: "var(--stone-grey)",
                        flexShrink: 0,
                      }}
                    >
                      {timeAgo(item.created_at)}
                    </span>
                  </div>

                  {/* Row 2: snippet */}
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      color: "var(--stone-grey)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: tab === "pending" ? "10px" : "0",
                    }}
                  >
                    {snippet}
                  </p>

                  {/* Row 3: REFLECT NOW (pending only) */}
                  {tab === "pending" && (
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <span
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "11px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--bamboo-green)",
                        }}
                      >
                        ↪ Reflect Now
                      </span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </SlideDrawer>

      <ReflectionDetailModal
        reflection={detailReflection}
        open={!!detailReflection}
        onClose={() => setDetailReflection(null)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
