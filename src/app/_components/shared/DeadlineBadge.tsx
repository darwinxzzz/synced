interface DeadlineBadgeProps {
  daysAway: number
}

export function DeadlineBadge({ daysAway }: DeadlineBadgeProps) {
  const color =
    daysAway <= 7
      ? "var(--deadline-red)"
      : daysAway <= 14
        ? "var(--deadline-amber)"
        : "var(--deadline-green)"

  const label =
    daysAway <= 0
      ? "Overdue"
      : daysAway === 1
        ? "1 Day"
        : `${daysAway} Days`

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  )
}
