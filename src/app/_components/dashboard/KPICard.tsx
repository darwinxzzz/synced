interface KPICardProps {
  label:          string
  value:          string | number
  description?:   string
  showProgress?:  boolean
  progressValue?: number   // 0–100
  accentColor?:   string
  icon?:          React.ReactNode
}

export function KPICard({
  label,
  value,
  description,
  showProgress,
  progressValue = 0,
  accentColor,
  icon,
}: KPICardProps) {
  return (
    <div
      className="rounded-2xl p-6 card-shadow flex flex-col gap-4"
      style={{
        backgroundColor: "rgba(250,250,247,0.85)",
        backdropFilter:  "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* top row: label + optional icon */}
      <div className="flex items-center justify-between">
        <p className="bamboo-label" style={{ color: "var(--stone-grey)" }}>
          {label}
        </p>
        {icon && (
          <span className="opacity-50">{icon}</span>
        )}
      </div>

      {/* big value */}
      <p
        className="text-4xl font-semibold leading-none"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: accentColor ?? "var(--charcoal-ink)",
        }}
      >
        {value}
      </p>

      {/* progress bar */}
      {showProgress && (
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--sage-mist)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(Math.max(progressValue, 0), 100)}%`,
              backgroundColor: "var(--bamboo-green)",
            }}
          />
        </div>
      )}

      {/* description */}
      {description && (
        <p className="text-xs leading-relaxed" style={{ color: "var(--stone-grey)" }}>
          {description}
        </p>
      )}
    </div>
  )
}
