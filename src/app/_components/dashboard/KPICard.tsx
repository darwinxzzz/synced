interface KPICardProps {
  label:          string
  value:          string | number
  description?:   string
  showProgress?:  boolean
  progressValue?: number   // 0–100
  icon?:          React.ReactNode
  dark?:          boolean
  badge?:         string
  valueTestId?:   string
}

export function KPICard({
  label,
  value,
  description,
  showProgress,
  progressValue = 0,
  icon,
  dark = false,
  badge,
  valueTestId,
}: KPICardProps) {
  const bg   = dark ? "var(--deep-forest)" : "rgba(250,250,247,0.85)"
  const text = dark ? "#ffffff" : "var(--charcoal-ink)"
  const label_color = dark ? "rgba(255,255,255,0.7)" : "var(--stone-grey)"

  return (
    <div
      className="rounded-2xl p-6 card-shadow flex flex-col gap-4 relative"
      style={{
        backgroundColor: bg,
        backdropFilter:  dark ? undefined : "blur(12px)",
        WebkitBackdropFilter: dark ? undefined : "blur(12px)",
      }}
    >
      {/* badge (top-right) */}
      {badge && (
        <span
          data-testid="kpi-badge"
          className="absolute top-4 right-4 text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full"
          style={{ backgroundColor: "var(--bamboo-green)", color: "#ffffff" }}
        >
          {badge}
        </span>
      )}

      {/* top row: label + optional icon */}
      <div className="flex items-center justify-between">
        <p className="bamboo-label" style={{ color: label_color }}>
          {label}
        </p>
        {icon && !dark && (
          <span className="opacity-50">{icon}</span>
        )}
      </div>

      {/* big value */}
      <p
        data-testid={valueTestId}
        className="text-4xl font-semibold leading-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: text,
        }}
      >
        {value}
      </p>

      {/* progress bar */}
      {showProgress && (
        <div
          data-testid="progress-track"
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: dark ? "rgba(255,255,255,0.15)" : "var(--sage-mist)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(Math.max(progressValue, 0), 100)}%`,
              backgroundColor: dark ? "rgba(255,255,255,0.6)" : "var(--bamboo-green)",
            }}
          />
        </div>
      )}

      {/* description */}
      {description && (
        <p
          className="text-xs leading-relaxed"
          style={{ color: dark ? "rgba(255,255,255,0.6)" : "var(--stone-grey)" }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
