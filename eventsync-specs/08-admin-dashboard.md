# EventSync — Admin Dashboard
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-admin-dashboard.png`
- Stitch ID: `c2e6611c854944139f6f70b25ff990e2` — "Admin Dashboard"

## File to Build
`src/app/(admin)/dashboard/page.tsx`

---

## Page Header
```
Label: "EXCO DASHBOARD" — .bamboo-label
H1:    "Current Event Progress"
       Font: Playfair Display italic
```

---

## KPI Cards Row (4 cards, desktop grid)
```
Desktop: 4 columns
Tablet:  2×2 grid
Mobile:  1-column stack

All cards: var(--cream-white) bg, .card-shadow, rounded-2xl
```

### Card 1 — Active Events
```
Large number: count of events where status != 'archived'
Label: "ACTIVE EVENTS" — .bamboo-label
```

### Card 2 — Total Members
```
Large number: count of profiles where role = 'member'
Label: "TOTAL MEMBERS" — .bamboo-label
```

### Card 3 — Completion Rate
```
Large number: "X%"
Font: Playfair Display (large)
Color: var(--bamboo-green)
Progress bar below: var(--bamboo-green) fill
Label: "COMPLETION RATE" — .bamboo-label
```

### Card 4 — Tasks Due (URGENT)
```
Large number: count of tasks with deadline ≤7 days
Font: Playfair Display (large)
Color: var(--deadline-red)
Pulsing dot: small circle, var(--deadline-red), apply .deadline-pulse class
Label: "TASKS DUE" — .bamboo-label, var(--deadline-red) colour
```

---

## Two-Column Layout (below KPI cards)
```
Left (2/3):  Ongoing Initiatives (event cards)
Right (1/3): Pending Submissions
```

---

## Ongoing Initiatives (left column)

### Section Header
```
Text: "Ongoing Initiatives"
Font: Playfair Display italic, ~1.25rem
```

### Event Card
```
┌─────────────────────────────────────────────────────┐
│ [COVER PHOTO — next/image, aspect-video, rounded-t] │
│ [DEADLINE BADGE — top right corner of photo]         │
├─────────────────────────────────────────────────────┤
│ Event Name (DM Sans SemiBold)                       │
│ Short description (text-xs, var(--stone-grey))      │
│                                                     │
│ Progress bar (var(--bamboo-green), full width)      │
│                                                     │
│ [Avatar stack] +N         [→ chevron / arrow]       │
└─────────────────────────────────────────────────────┘
```

**Deadline Badge (overlaid on photo, top-right):**
- Uses `DeadlineBadge` component
- URGENT (deadline-red) ≤7 days + .deadline-pulse
- IN VIEW (deadline-amber) 8–14 days
- NEW (deadline-green) 15+ days

**Avatar stack:** Up to 4 member avatars, then "+N" overflow pill

**Click behaviour:** Clicking any event card → `/admin/kanban/[eventId]`

### ❌ No "Add Event" on this page
Events are added from Admin Kanban only.

---

## Pending Submissions (right column)

### Section Header
```
Text: "Pending Submissions"
Font: Playfair Display italic, ~1.25rem
Sub:  "Tasks awaiting review from sub-committees"
      text-xs, var(--stone-grey)
```

### Submission Item
```
┌────────────────────────────────────────┐
│ [DEPT BADGE]  Task Name                │
│               Event Name · Due: [time] │
│                         [AVATAR ICON]  │
└────────────────────────────────────────┘
```

Sorted by urgency (most overdue first).

**"ADD NEW TASK" link:**
- Below the item or in the header area
- Links to the relevant event's Open Board: `/admin/kanban/[eventId]`

---

## Data (tRPC)
```typescript
getAdminDashboard: () => {
  kpi: {
    activeEvents: number
    totalMembers: number
    completionRate: number
    tasksDueSoon: number   // ≤7 days
  }
  ongoingInitiatives: Array<{
    id: string
    name: string
    description: string
    coverUrl: string | null
    deadline: Date
    progress: number       // 0–100
    memberAvatars: string[] // up to 4, then overflow count
    totalMembers: number
  }>
  pendingSubmissions: Array<{
    taskId: string
    eventId: string
    taskName: string
    eventName: string
    department: string
    dueAt: Date
    assigneeAvatarUrl: string | null
  }>
}
```

---

## Mobile (390px)
- KPI cards: 1-column stack
- Two-column layout collapses: Ongoing Initiatives full-width, Pending Submissions below
- Event cards: full-width
- Cover photo aspect ratio maintained
