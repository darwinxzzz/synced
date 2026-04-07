# EventSync — Member Dashboard
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-member-dashboard.png`
- Stitch ID: `02d24ce8b5dc471d87062599477759cd` — "Member Dashboard – Updated"

## File to Build
`src/app/(member)/dashboard/page.tsx`

## tRPC Router
`src/server/api/routers/dashboard.ts`

---

## Page Header (top of content area, below navbar)

### Label (small, above H1)
```
Text:  "PERSONAL WORKSPACE"
Class: .bamboo-label (11px DM Sans uppercase, var(--bamboo-green))
```

### H1 (main heading)
```
Text:  "Your Upcoming Contributions"
Font:  Playfair Display, italic
Size:  2.5rem desktop / 36px mobile
Weight: 400 (not bold)
```

### Subtitle
```
Text:  "Focus on the path ahead. Every small action is a brushstroke on the canvas of our shared mission."
Font:  DM Sans
Size:  text-sm
Color: var(--stone-grey)
Max-width: max-w-prose
```

---

## KPI Cards Row
3 cards side by side (desktop) / stacked 1-column (mobile).
All cards: `var(--cream-white)` bg, `.card-shadow`, rounded-2xl.

### Card 1 — Sustained Progress (wider card, left)
```
Badge (top right): "ACTIVE MOMENTUM"
  - Pill shape, var(--bamboo-green) bg, white text, text-xs uppercase
Title: "Sustained Progress" (DM Sans SemiBold)
Body:  "You are [X]% ahead of your quarterly milestone goal."
  - X is dynamic from tRPC
Progress bar: full-width, var(--bamboo-green) fill, rounded, height 6px
```

### Card 2 — Pending Tasks (smaller, centre)
```
Number: large serif (Playfair Display), dynamic count from tRPC
Label:  "PENDING TASKS" — .bamboo-label below the number
```

### Card 3 — Team Syncs (smaller, right, DARK background)
```
Background: var(--deep-forest) — dark card
Number: large serif, text-white, dynamic count from tRPC
Label:  "TEAM SYNCS" — uppercase xs, text-white/70 below number
```

---

## Pending Milestones Section

### Section Header
```
Left:  "Pending Milestones" — Playfair Display italic, ~1.25rem
Right: "VIEW ROADMAP" — text-xs, var(--bamboo-green), text link
```

### Milestone Row (one per pending task)
```
Layout: [Icon] [Text block left] [Badge right]

Icon circle: 40×40px, var(--sage-mist) bg, lucide icon (dept-relevant)

Text block:
  - Task name (DM Sans SemiBold, text-sm)
  - Event name (text-xs, var(--stone-grey))

Badge (right, dynamic):
  - Deadline badge: "2 Days" in var(--deadline-red) when ≤7 days
    Apply .deadline-pulse animation
  - Status text: "Drafting" in var(--stone-grey) when in progress
  - Priority text: "High" when priority is the relevant meta
```

### Click Behaviour
Clicking any milestone row → `/member/kanban?taskId=[id]`
The kanban page must highlight that task when taskId is in the URL.

### Empty State
When no pending tasks:
```
Icon: checkmark or leaf illustration
Text: "All caught up" (DM Sans SemiBold)
Sub:  "No pending milestones right now."
Color: var(--stone-grey)
```

---

## Daily Reflection Card (right sidebar / below on mobile)
```
Card: var(--cream-white) bg, .card-shadow, rounded-2xl
Label (top): "Daily Reflection" — .bamboo-label
Sub-label:   "CURRENT FOCUS" — text-xs uppercase, var(--stone-grey)

Quote block:
  "Nature does not hurry, yet everything is accomplished."
  Font: italic DM Sans, var(--charcoal-ink)
  ← This is a curated daily quote, not user-generated

Tag below quote: "MENTAL CLARITY"
  - Pill: var(--sage-mist) bg, var(--bamboo-green) text, text-xs uppercase

Progress bar: var(--bamboo-green) fill, represents daily reflection streak

CTA Button: "Add Reflection +"
  - Full-width, bg-[--deep-forest], text-white, rounded-xl
  - 48px height
  - On click → opens ReflectionDrawer (see 05-reflection-drawer.md)
```

---

## Upcoming Meeting Card (right column, below Daily Reflection on desktop)
```
Label: "UPCOMING MEETING" — .bamboo-label
Content:
  - Meeting title
  - Date + time
  - Attendee avatar stack (up to 4, then +N overflow)
Empty state:
  Icon: calendar emoji or lucide Calendar icon
  Text: "No active events scheduled."
```

---

## Desktop Layout Grid
```
Left (2/3 width):  Page header + KPI cards + Pending Milestones
Right (1/3 width): Daily Reflection card + Upcoming Meeting card
```

---

## Data (tRPC)
```typescript
// dashboard router — member procedures
getMemberDashboard: () => {
  kpi: {
    pendingTaskCount: number
    completionRate: number      // 0–100
    teamSyncCount: number
    nextDeadline: Date | null
    nextDeadlineLabel: string   // "2 Days" / "Next Week" etc
  }
  pendingMilestones: Array<{
    taskId: string
    taskName: string
    eventName: string
    deadline: Date | null
    status: string
    priority: 'low' | 'medium' | 'high'
  }>
  upcomingMeeting: {
    title: string
    date: Date
    attendees: Array<{ name: string; avatarUrl: string }>
  } | null
}
```

---

## Mobile (390px)
- KPI cards: 1-column stack (Card 1 full-width, Card 2 + Card 3 side by side as 2-col)
- Daily Reflection card: full-width, below Pending Milestones
- Upcoming Meeting card: full-width, below Daily Reflection
- H1: 36px
- Pending Milestones rows: min 56px tap target height
