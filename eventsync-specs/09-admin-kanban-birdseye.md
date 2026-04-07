# EventSync — Admin Kanban (Bird's Eye View)
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-admin-kanban.png`
- Stitch ID: `3b3bc94614314044bc989098f13d2fa1` — "Admin Kanban – Reference Matched"

## File to Build
`src/app/(admin)/kanban/page.tsx`

---

## Page Header
```
Label: "EXCO VIEW · N ACTIVE EVENTS" — .bamboo-label (N is dynamic)
H1:    "Kanban Board"
       Font: Playfair Display italic
```

---

## Top-Right Controls

### Filter Button
```
"Filter ▾" → opens FilterPanel component
Enabled filters: ['name', 'date', 'department']

Name (A-Z / Z-A): sorts ALL event cards alphabetically by event name
                  across ALL pillars simultaneously. Toggle on re-press.
Date (↑/↓):       sorts ALL event cards by date across ALL pillars
                  simultaneously. Toggle on re-press.
Department:       filters to show only events tagged with that dept.
                  Departments: Software · Inspire · Meet-ups · Publicity · Connectors · Labs
                  Pulled from Supabase — NOT hardcoded. "All" pill resets.

All active sorts/filters apply simultaneously.
```

### Add Button (dropdown)
```
"+ Add ▾" — dropdown button (wide enough for text + chevron)
Options:
  "Add Event"        → opens CreateEventModal (see 10-create-event-modal.md)
  "Add Contribution" → opens AddContributionModal (see 04-add-contribution-modal.md)
                       Admin uses this to add a contribution on behalf of a member
                       Admin selects which member the contribution belongs to

Style: bg-[--deep-forest], text-white, rounded-xl
```

---

## Kanban Board — 4 Pillars
```
New  |  In Progress  |  In Review  |  Done
```

**⚠️ Important:** The pillar position of each EVENT card is driven by `events.kanban_status` —
NOT `events.status`. These are two separate columns:
- `events.status` = operational state (draft / active / archived)
- `events.kanban_status` = which pillar on this board (new / in_progress / in_review / done)

**Admin drag rules:** Admin can drag event cards to ANY pillar including Done. No restrictions.
Dragging updates `events.kanban_status` only — never touches `events.status`.

---

## Event Card Layout
```
┌──────────────────────────────────────────────────────────┐
│ [DEADLINE TAG]    Event Name (SemiBold)         [⋯ menu] │
│ Date · Initiative type (text-xs, muted)                   │
│                                                           │
│ GLOBAL PROGRESS:                                          │
│ [NEW▓▓] [IN PROG▓▓] [IN REVIEW▓▓] [DONE▓▓]             │
│ (segmented progress bar, 4 coloured sections)             │
│                                                           │
│ [Avatar] [Avatar] [Avatar] +N    [OPEN BOARD →]  [Manage Members] │
└──────────────────────────────────────────────────────────┘
```

### Deadline Tag (top left of card)
Uses `DeadlineBadge` component — driven by `events.date`:
- `URGENT` → var(--deadline-red) bg, white text, .deadline-pulse — ≤7 days to event date
- `IN VIEW` → var(--deadline-amber) bg, white text — 8–14 days
- `NEW` → var(--deadline-green) bg, white text — 15+ days
- `IN REVIEW` → var(--deadline-amber) bg — ONLY shown when ALL assigned
  members have moved their `event_members.pillar_status` to `in_review`

### Global Progress Bar
```
4-segment horizontal bar showing proportion of event_members tasks per pillar:
[NEW: grey] [IN PROGRESS: bamboo-green/40%] [IN REVIEW: bamboo-green/70%] [DONE: bamboo-green]
Rounded ends, full-width of card, height 6px
Calculated from event_members WHERE event_id = this event
```

### Avatar Stack
Up to 4 member avatars overlapping, then "+N" overflow pill.

### Action Buttons (bottom row)
```
"OPEN BOARD →"   → /admin/kanban/[eventId] (Open Board page)
"Manage Members" → opens ManageMembersDrawer (Figma Make component)
Both: text-xs, outlined or text style
```

### ⋯ Menu (per card, top-right)
```
Edit    → opens CreateEventModal prefilled with event data
Archive → sets events.status = 'archived' (confirm if active tasks exist)
Delete  → confirmation dialog → hard delete
```

---

## Empty Pillar State
```
Dashed border, var(--sage-mist)
Icon: relevant lucide icon
Text: "No events here"
Color: var(--stone-grey)
```

---

## Supabase Realtime
- Member `event_members.pillar_status` moves update the Global Progress Bar in real-time
- `IN REVIEW` deadline tag updates automatically when ALL members reach in_review
- Channel: `kanban-[eventId]` per event

---

## Data (tRPC)
```typescript
getAdminKanban: () => {
  events: Array<{
    id: string
    name: string
    date: Date
    kanbanStatus: 'new' | 'in_progress' | 'in_review' | 'done'  // ← events.kanban_status
    operationalStatus: 'draft' | 'active' | 'archived'           // ← events.status
    deadline: Date
    department: string
    globalProgress: {
      new: number         // count of event_members with pillar_status = 'new'
      inProgress: number
      inReview: number
      done: number
    }
    memberAvatars: string[]
    totalMembers: number
    allInReview: boolean  // true when ALL event_members.pillar_status = 'in_review'
  }>
}

moveEvent: (input: {
  eventId: string
  kanbanStatus: 'new' | 'in_progress' | 'in_review' | 'done'
}) => void
// Updates events.kanban_status only — admin only, no restrictions
// Uses adminProcedure — throws FORBIDDEN for members
```

---

## Mobile (390px)
- Horizontal snap scroll, one pillar at a time
- Pillar width: min-w-[85vw]
- Pill tab bar above: "New · In Progress · In Review · Done"
- Event cards full-width within pillar
- Global progress bar stays visible on card
- "OPEN BOARD →" and "Manage Members" stack vertically if needed
