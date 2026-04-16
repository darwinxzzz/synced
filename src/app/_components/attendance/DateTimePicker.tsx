"use client"

import { useState } from "react"
import { Calendar, Clock, RefreshCw } from "lucide-react"

export interface DateTimeValue {
  startDate: string
  startTime: string
  endDate?: string
  endTime?: string
  isRecurring?: boolean
}

interface DateTimePickerProps {
  mode: "event" | "deadline"
  onChange: (value: DateTimeValue) => void
  defaultValue?: Partial<DateTimeValue>
}

const INPUT_BASE: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 10,
  border: "1.5px solid rgba(74,124,89,0.25)",
  background: "var(--ivory-paper)",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: "var(--charcoal-ink)",
  padding: "0 14px 0 40px",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
}

function InputRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="bamboo-label" style={{ marginBottom: 6 }}>
        {label}
      </p>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--bamboo-green)",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          {icon}
        </span>
        {children}
      </div>
    </div>
  )
}

export function DateTimePicker({ mode, onChange, defaultValue = {} }: DateTimePickerProps) {
  const today = new Date().toISOString().split("T")[0] ?? ""

  const [startDate, setStartDate] = useState(defaultValue.startDate ?? today)
  const [startTime, setStartTime] = useState(defaultValue.startTime ?? "09:00")
  const [endDate, setEndDate] = useState(defaultValue.endDate ?? today)
  const [endTime, setEndTime] = useState(defaultValue.endTime ?? "17:00")
  const [isRecurring, setIsRecurring] = useState(defaultValue.isRecurring ?? false)

  function notify(patch: Partial<DateTimeValue>) {
    const next: DateTimeValue = {
      startDate,
      startTime,
      endDate,
      endTime,
      isRecurring,
      ...patch,
    }
    onChange(next)
  }

  if (mode === "deadline") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InputRow icon={<Calendar size={15} />} label="Deadline Date">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); notify({ startDate: e.target.value }) }}
            className="es-input"
            style={INPUT_BASE}
          />
        </InputRow>
        <InputRow icon={<Clock size={15} />} label="Deadline Time">
          <input
            type="time"
            value={startTime}
            onChange={(e) => { setStartTime(e.target.value); notify({ startTime: e.target.value }) }}
            className="es-input"
            style={INPUT_BASE}
          />
        </InputRow>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="grid grid-cols-2 gap-3">
        <InputRow icon={<Calendar size={15} />} label="Start Date">
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); notify({ startDate: e.target.value }) }}
            className="es-input"
            style={INPUT_BASE}
          />
        </InputRow>
        <InputRow icon={<Clock size={15} />} label="Start Time">
          <input
            type="time"
            value={startTime}
            onChange={(e) => { setStartTime(e.target.value); notify({ startTime: e.target.value }) }}
            className="es-input"
            style={INPUT_BASE}
          />
        </InputRow>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <InputRow icon={<Calendar size={15} />} label="End Date">
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => { setEndDate(e.target.value); notify({ endDate: e.target.value }) }}
            className="es-input"
            style={INPUT_BASE}
          />
        </InputRow>
        <InputRow icon={<Clock size={15} />} label="End Time">
          <input
            type="time"
            value={endTime}
            onChange={(e) => { setEndTime(e.target.value); notify({ endTime: e.target.value }) }}
            className="es-input"
            style={INPUT_BASE}
          />
        </InputRow>
      </div>

      {/* Recurring toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(168,197,160,0.10)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <RefreshCw size={15} color="var(--bamboo-green)" />
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--charcoal-ink)",
            }}
          >
            Recurring event
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !isRecurring
            setIsRecurring(next)
            notify({ isRecurring: next })
          }}
          aria-label={isRecurring ? "Disable recurring" : "Enable recurring"}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            border: "none",
            background: isRecurring ? "var(--bamboo-green)" : "rgba(140,140,140,0.25)",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.2s",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 2,
              left: isRecurring ? 22 : 2,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              transition: "left 0.2s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.20)",
            }}
          />
        </button>
      </div>
    </div>
  )
}
