# EventSync — Member Kanban Board
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-member-kanban.png`
- Stitch ID: `2903932690693697399` — "Member Kanban – Updated Navigation"

## File to Build
`src/app/(member)/kanban/page.tsx`

---

## Top Bar (below navbar)

### Left side
```
Event Selector Dropdown:
  - Shows all events the logged-in member is assigned to
  - Label: currently selected event name
  - Icon: chevron-down (lucide)
  - Style: pill/button shape, var(--cream-white) bg, .card-shadow
```

### Right side (3 buttons, left to right)
```
1. "Reflections 🔔 [N]" button
   - N = count of pending reflections for this member
   - Badge: red circle with number, disappears when count is 0
   - On click: opens ReflectionDrawer (see 05-reflection-drawer.md)
   - Style: outlined, var(--deep-forest) text

2. "+ Add Contribution" button
   - On click: opens AddContributionModal (see 04-add-contribution-modal.md)
   - Style: bg-[--deep-forest], text-white, rounded-xl

3. "Filter ▾" button
   - On click: opens FilterPanel dropdown
   - Enabled filters: ['date', 'priority']
   - Date: sorts cards within each pillar by deadline asc↑ / desc↓ (toggle on re-press)
   - Priority: filters to show only cards of selected level; "All" resets
   - Style: outlined, var(--stone-grey) text
```

---

## Kanban Board — 4 Pillars

### Pillar Names (left to right)
```
New  |  In Progress  |  In Review  |  Done
```

### Pillar Header
```
Pillar name (DM Sans SemiBold, text-sm uppercase, var(--stone-grey))
Card count badge (number pill, right of label)
```

### Task Card Layout
```
┌─────────────────────────────────────────┐
│ [DEPT BADGE]              [PRIORITY]    │
│ Task name (DM Sans SemiBold, text-sm)   │
│ 📅 Due: [date]  ·  Assigned by: Admin  │
└─────────────────────────────────────────┘
```

**Department Badge:**
- Pill shape, colour-coded per department (use `DepartmentBadge` component)
- Text: dept name, text-xs uppercase
- Valid departments: Software · Inspire · Meet-ups · Publicity · Connectors · Labs

**Priority label (top right):**
- "Low" / "Medium" / "High"
- Colour: deadline-green / deadline-amber / deadline-red

**Date line:**
- Icon: lucide Calendar, 12px
- Colour: var(--stone-grey) normally, var(--deadline-red) when ≤7 days + `.deadline-pulse`

**Card container:**
- `var(--cream-white)` bg, `.card-shadow`, rounded-xl
- Min height: 80px (mobile), padding p-4
- Hover: slight lift (transform translateY(-1px))

---

## Member Drag Rules (STRICT — enforced at DB level by trigger)

Applies to both `member` and `lead` roles — leads have identical kanban restrictions to members.

```
✅ New → In Progress         (allowed)
✅ In Progress → In Review   (allowed — BUT requires contribution + form first)
❌ In Review → Done          (blocked — admin only)
❌ Any backwards drag        (blocked)
❌ Skipping stages           (blocked — e.g. New → In Review directly)
❌ Done pillar               (members/leads cannot drag TO done ever)
```

**Done pillar — display only:**
- Cards in Done are visible to the member (they can see their completed tasks)
- Cards in Done are NOT draggable — no grab handle, cursor: default
- Clicking a Done card opens a read-only view of the contribution (locked — cannot edit)
- Visual indicator: Done cards have a subtle var(--deadline-green) left border

**Blocked drag feedback:**
- Card snaps back to original pillar
- Brief shake animation on card
- Toast: "You can't move this card here"

---

## Member Edit Permissions on Cards

Members can edit their own contribution write-ups from the kanban
**as long as the card has NOT reached Done**.

**Clicking any card in New / In Progress / In Review:**
Opens a slide-in panel or modal showing:
```
Task name (read-only)
Department (read-only)
Due date (read-only)

Editable contribution fields:
  DETAILED DESCRIPTION  — 30 words max, live counter
  AIMED RESULT / OUTCOME — required
  CHANGES MADE          — 30 words max
  CHALLENGES FACED      — 30 words max
  PRIORITY LEVEL        — segmented pill (Low / Medium / High)

Footer:
  "Save" — saves edits, closes panel
  "Cancel" — discards changes, closes panel
```

**RLS backing this:** `members_update_own_contributions_until_done` policy —
DB blocks the update if `event_members.pillar_status = 'done'`.

**Clicking any card in Done:**
Opens the same panel but ALL fields are read-only — no save button.
Shows a lock icon or "Completed" badge to indicate editing is disabled.

---

## ⚠️ Moving to In Review — Required Flow

Before a member can move a card from **In Progress → In Review**, two things must happen:

### Step 1 — Check contribution exists
Before allowing the drag, check if a `contributions` row exists for this member + event:
```typescript
// tRPC call
const hasContribution = await trpc.contributions.checkExists({ eventId, userId })
if (!hasContribution) {
  // Block the drag, show toast:
  toast("Please add a contribution before moving to In Review")
  // Card snaps back
  return
}
```

### Step 2 — Open In Review Form modal
If contribution exists, intercept the drag and open a modal BEFORE confirming the move:

```
Modal title: "Moving to In Review"
Font: Playfair Display italic

Fields (both required):
  Label: "CHANGES MADE" (.bamboo-label)
  Type:  Textarea
  Max:   30 words — live counter "X / 30 words"
  Placeholder: "What did you change or complete?"

  Label: "CHALLENGES FACED" (.bamboo-label)
  Type:  Textarea
  Max:   30 words — live counter "X / 30 words"
  Placeholder: "What difficulties did you encounter?"

Footer:
  Left:  "Cancel" — text link, card snaps back
  Right: "Confirm Move" — bg-[--deep-forest], text-white, 48px
```

### Step 3 — On "Confirm Move" submit
1. Update `contributions` row: save `changes` + `challenges_faced` fields
2. Update `event_members.pillar_status` → `'in_review'`
3. DB trigger auto-creates `reflections` row with `status = 'pending'`
4. Reflection badge count +1 (Supabase Realtime)
5. Toast: "Task moved to In Review 🎋"
6. Modal closes

---

## URL Param Behaviour
When page loads with `?taskId=[id]` in URL:
- Scroll to and visually highlight that specific task card
- Highlight style: var(--bamboo-green) border ring, scale(1.02)
- Remove highlight after 3 seconds

---

## Empty Pillar State
```
Dashed border box (var(--sage-mist) dashed)
Icon: relevant lucide icon (e.g. Inbox for New)
Text: "No tasks here yet"
Color: var(--stone-grey)
```

---

## Supabase Realtime
- Channel: `kanban-[eventId]`
- Subscribe on mount, unsubscribe in useEffect cleanup
- Admin moves are reflected in member view without page refresh
- Reflection badge updates via `reflections-[userId]` channel

---

## Data (tRPC)
```typescript
getMemberKanban: (eventId: string) => {
  tasks: Array<{
    id: string              // event_members.id
    name: string            // event_members.task
    department: string
    priority: 'low' | 'medium' | 'high'
    pillarStatus: 'new' | 'in_progress' | 'in_review' | 'done'
    deadline: Date | null
    assignedBy: string      // admin name
    contributionId: string | null  // for loading editable fields on card click
    isEditable: boolean     // false when pillarStatus = 'done'
  }>
}

checkContributionExists: (input: { eventId: string }) => boolean
// Returns true if a contributions row exists for auth.uid() + eventId

moveTask: (input: {
  eventMemberId: string
  newStatus: 'in_progress' | 'in_review'
  // required when newStatus = 'in_review'
  changes?: string
  challengesFaced?: string
}) => void
// Server validates transition via DB trigger — throws if invalid
// Saves changes + challengesFaced to contributions before updating pillar_status

updateOwnContribution: (input: {
  contributionId: string
  description?: string      // 30 words max
  outcome?: string
  changes?: string          // 30 words max
  challengesFaced?: string  // 30 words max
  priority?: 'low' | 'medium' | 'high'
}) => void
// protectedProcedure — member edits own contribution
// DB RLS blocks if pillar_status = 'done' (members_update_own_contributions_until_done)
// Word limits enforced at DB level
```

---

## Mobile (390px)
- Horizontal snap scroll — one pillar visible at a time
- Pillar width: `min-w-[85vw]` — next pillar peeks at right edge
- `scroll-snap-type: x mandatory` on container, `scroll-snap-align: start` on pillars
- Pill tab bar ABOVE kanban: "New · In Progress · In Review · Done"
  - Tapping a pill scrolls container to that pillar
  - Active pill: var(--bamboo-green) bg, text-white
- Long press (500ms) to initiate drag, visual: card scales 1.05×
- Tap-to-move alternative: tap card → bottom sheet "Move to: [valid pillars only]"
- In Review form modal: full-screen slide-up (BlurModal mobile behaviour)
- Top bar buttons stack: Event selector full-width, then Reflections + Filter row
