# EventSync — Admin Kanban Open Board
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-open-board.png`
- Stitch ID: `a4bde1aebb384646a011ec5a6a1ddc7b` — "Open Board – Task Detail"

## File to Build
`src/app/(admin)/kanban/[eventId]/page.tsx`

---

## Breadcrumb (top of page, above heading)
```
← BACK TO KANBAN / [EVENT NAME]
Style: text-xs, var(--stone-grey)
"← BACK TO KANBAN" is a link → /admin/kanban
"/ [EVENT NAME]" is static text
```

---

## Page Header
```
H1: [Event Name] — Playfair Display italic
Sub-info (below H1): "[N] Tasks · [X] Departments"
               text-sm, var(--stone-grey)
```

---

## Top-Right Controls
```
"Filter ▾" → FilterPanel with:
  filters={['date', 'name', 'priority', 'department']}
  defaultFilters={{ date: 'asc' }}

  Date (default asc): sorts task cards by deadline within each pillar
  Name:               sorts task cards alphabetically within each pillar
  Priority:           shows only tasks of selected priority level
  Department:         shows only tasks from selected department
                      Departments pulled from Supabase — NOT hardcoded

"+ New Task" → opens NewTaskModal (see 12-new-task-modal.md)
Style: bg-[--deep-forest], text-white, rounded-xl
```

---

## Kanban Board — 4 Pillars
```
New  |  In Progress  |  In Review  |  Done
```

**Admin drag rules:**
- Admin can drag task cards to ANY pillar including Done — no restrictions
- Dragging updates `event_members.pillar_status`
- Admin bypasses the sequential transition trigger (trigger checks role)
- Moving a member's card to Done on their behalf is allowed

---

## Task Card Layout
```
┌──────────────────────────────────────────┐
│ [DEPT BADGE]                             │
│ Task name (DM Sans SemiBold, text-sm)    │
│ [AVATAR] Assignee name  [STATUS DOT]     │
└──────────────────────────────────────────┘
```

**Department Badge:** `DepartmentBadge` component, colour-coded per department.

**Assignee:** avatar circle (32px) + name (text-xs)

**Status dot:**
```
New:         grey dot
In Progress: var(--bamboo-green) dot
In Review:   var(--deadline-amber) dot
Done:        var(--deadline-green) dot
```

**Card:** var(--cream-white) bg, .card-shadow, rounded-xl, p-4, min-height 80px

---

## Admin Edit Permissions on This Page

Admin can edit any member's write-ups from the Open Board at any time:

**Clicking a task card:**
Opens a task detail panel or modal showing:
- Task name, department, assignee, status
- Contribution write-up fields (description, changes, challenges_faced, outcome)
  - Admin can edit ANY of these fields regardless of pillar stage
  - Changes saved immediately on blur or via "Save" button
- If task is In Review: reflection fields shown (read-only preview)
  - Admin can open full ReflectionDetailModal to edit the reflection

**RLS backing this:**
- `admins_update_all_contributions` — admin updates any contribution at any time
- `admins_update_all_reflections` — admin updates any reflection at any time

---

## Supabase Realtime
```
Channel: kanban-[eventId]
Subscribe on mount, unsubscribe in useEffect return

Member moves are visible in admin Open Board without refresh.
Admin moves are visible in member kanban without refresh.
```

---

## Data (tRPC)
```typescript
getOpenBoard: (eventId: string) => {
  event: {
    id: string
    name: string
    taskCount: number
    departmentCount: number
    kanbanStatus: 'new' | 'in_progress' | 'in_review' | 'done'
  }
  tasks: Array<{
    id: string            // event_members.id
    name: string          // event_members.task
    department: string
    assignee: { name: string; avatarUrl: string }
    pillarStatus: 'new' | 'in_progress' | 'in_review' | 'done'
    deadline: Date | null // from events.date
    priority: 'low' | 'medium' | 'high'
    contributionId: string | null  // for linking to edit contribution
    hasReflection: boolean         // true if reflection exists for this task
  }>
}

moveTask: (input: {
  eventMemberId: string
  newStatus: 'new' | 'in_progress' | 'in_review' | 'done'
}) => void
// Admin: no transition restrictions. Uses adminProcedure.
// DB trigger skips enforcement when caller is admin.

updateContribution: (input: {
  contributionId: string
  description?: string
  outcome?: string
  changes?: string
  challengesFaced?: string
  priority?: 'low' | 'medium' | 'high'
}) => void
// Admin can update any contribution at any time — adminProcedure
// Word limits still enforced (30 words per field)

updateReflection: (input: {
  reflectionId: string
  currentTask?: string     // 5 words max
  description?: string     // 30 words max
  impact?: string          // 30 words max
  challenges?: string      // 30 words max
  personalLearning?: string // 30 words max
  orgLearning?: string     // 30 words max
}) => void
// Admin can update any reflection at any time — adminProcedure
// Word limits still enforced at DB level
```

---

## Mobile (390px)
- Breadcrumb wraps if event name is long
- Horizontal snap scroll, one pillar visible at a time
- Pillar width: min-w-[85vw]
- Pill tab bar above: "New · In Progress · In Review · Done"
- "+ New Task" button: full-width on mobile
- Task detail panel: full-screen slide-up (BlurModal mobile behaviour)
