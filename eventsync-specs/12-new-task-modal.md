# EventSync — New Task Modal
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
Same two-column layout as Create Event Modal — header changed to "New Task"
- Reference: `screenshots/stitch-create-event.png` (same layout, different header)
- Stitch shell: `69af9520dab947daa0e587ecb1487ab3`

## Component File
`src/components/kanban/NewTaskModal.tsx`

## Trigger
Admin Kanban Open Board → "+ New Task" button

---

## Shell
```
Wrapper: BlurModal
Width: ~800px desktop (same two-column layout as CreateEventModal)
```

## Header
```
Title: "New Task" (Playfair Display italic H2)  ← NOT "Create New Event"
Close: ✕ button top-right, 44×44px
```

---

## Key Difference from CreateEventModal
The task is automatically scoped to the `eventId` from the current Open Board URL.
**No event picker is shown** — the event is already known from context.

---

## Two-Column Layout

### Left Column

#### TASK IDENTITY section
```
Label: "TASK IDENTITY" — .bamboo-label
Input: task name text input (required)
Placeholder: "Enter task name..."
Class: .es-input
```

#### DESCRIPTION OF TASK section
```
Label: "DESCRIPTION OF TASK" — .bamboo-label
Type:  Textarea (plain, no rich text needed here)
Class: .es-input
Shown BEFORE Team Composition (order matters)
```

#### TEAM COMPOSITION section (MemberAssignmentSection)
```
Label: "TEAM COMPOSITION" — .bamboo-label

Added Members sub-section:
  - Starts EMPTY (admin is NOT pre-populated — differs from CreateEventModal)
  - Search bar to find and add members from Supabase
  - Each added member row: [✕] [Avatar] [Name] [Department] [Task] [Role]

Members sub-section:
  - Full database list (same static behaviour as CreateEventModal)
  - Clicking member: silently copies to Added Members, list unchanged
```

### Right Column

#### DEADLINE section
```
Label: "DEADLINE" — .bamboo-label
Component: DateTimePicker in deadline mode
  - Shows single date + time (NOT start/end pair)
  - Label on picker: "Deadline"
```

#### PRIORITY LEVEL section
```
Label: "PRIORITY LEVEL" — .bamboo-label
Type: Segmented pill — Low · Medium · High
Style: sliding indicator (same as AddContributionModal)
```

---

## Footer Buttons
```
Left:  "CANCEL" — text link, closes without confirmation
Right: "CREATE TASK" — bg-[--deep-forest], text-white, 48px
       Validates required fields, then submits
```

---

## On Submit
1. Task created, scoped to current `eventId`
2. Task card appears in "New" pillar of this Open Board
3. Assigned members see it in their Member Kanban via Supabase Realtime
4. Toast: "Task created"
5. Modal closes

---

## Mobile (390px)
- Two columns stack to single column
- Left column first, right (deadline + priority) below
- Dept–Task row stacks vertically
- Buttons full-width, stacked
