interface DailyReflectionCardProps {
  onOpenReflection: () => void
  streakPercent?: number   // 0–100, defaults to 60
}

const DAILY_QUOTE =
  "Nature does not hurry, yet everything is accomplished."

export function DailyReflectionCard({
  onOpenReflection,
  streakPercent = 60,
}: DailyReflectionCardProps) {
  return (
    <div
      className="rounded-2xl p-5 card-shadow flex flex-col gap-4"
      style={{ backgroundColor: "var(--cream-white)" }}
    >
      {/* header */}
      <div>
        <p className="bamboo-label" style={{ color: "var(--bamboo-green)" }}>
          Daily Reflection
        </p>
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mt-1"
          style={{ color: "var(--stone-grey)" }}
        >
          CURRENT FOCUS
        </p>
      </div>

      {/* quote */}
      <blockquote
        className="text-sm italic leading-relaxed"
        style={{ color: "var(--charcoal-ink)", fontFamily: "'DM Sans', sans-serif" }}
      >
        &ldquo;{DAILY_QUOTE}&rdquo;
      </blockquote>

      {/* tag */}
      <span
        className="self-start text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full"
        style={{ backgroundColor: "var(--sage-mist)", color: "var(--bamboo-green)" }}
      >
        MENTAL CLARITY
      </span>

      {/* streak progress */}
      <div
        data-testid="streak-track"
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--sage-mist)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(Math.max(streakPercent, 0), 100)}%`,
            backgroundColor: "var(--bamboo-green)",
          }}
        />
      </div>

      {/* CTA */}
      <button
        onClick={onOpenReflection}
        className="w-full rounded-xl text-sm font-semibold"
        style={{
          height: "48px",
          backgroundColor: "var(--deep-forest)",
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Add Reflection +
      </button>
    </div>
  )
}
