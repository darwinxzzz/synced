# EventSync — Create Event Modal
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-create-event.png`
- Stitch ID (content): `896ba12079964b458776428250f99184` — "Create New Event"
- Stitch ID (shell):   `69af9520dab947daa0e587ecb1487ab3` — modal shell dimensions

## Component File
`src/components/kanban/CreateEventModal.tsx`

## Trigger
Admin Kanban → "+ Add ▾" dropdown → "Add Event"

---

## Shell
```
Wrapper: BlurModal
Width: ~800px desktop (wide two-column layout — match Stitch 69af9520 for exact radius/shadow)
Height: tall modal, internally scrollable if content overflows
```

## Header
```
Title: "Create New Event" (Playfair Display italic H2)
Close: ✕ button top-right, 44×44px
```

---

## Two-Column Layout

### Left Column (wider)

#### EVENT IDENTITY section
```
Label: "EVENT IDENTITY" — .bamboo-label
Input: Large text input
Placeholder: "Enter a memorable name..."
Required: yes
Class: .es-input
Font: slightly larger than body inputs (emphasise this is the title)
```

#### NARRATIVE & PURPOSE section
```
Label: "NARRATIVE & PURPOSE" — .bamboo-label
Type:  Rich text editor (NOT plain textarea)
Toolbar: Bold · Italic · Bullet List · Quote block
Placeholder: descriptive placeholder text
```

#### TEAM COMPOSITION section
```
Label: "TEAM COMPOSITION" — .bamboo-label
```

**Added Members sub-section** (above the Members list, same visual style):
```
Sub-label: "Added Members"
First row: currently logged-in admin — pre-populated, greyed, CANNOT be removed (no ✕)
Search bar: "Search members..." input to find and add more from Supabase

Each added member row:
  [✕ remove] [Avatar] [Name] [Department] [Task input] [Role picker dropdown]
  ✕ is hidden for the pre-populated admin row
```

**Members sub-section** (below Added Members, same visual card style):
```
Sub-label: "Members"
Full member database list (from Supabase profiles where role = 'member')

IMPORTANT BEHAVIOUR:
  - This list is STATIC — it does NOT change when someone is added to Added Members
  - The same person may appear in BOTH sections simultaneously — this is intentional
  - Clicking a member in this list:
    1. Silently copies them into Added Members section
    2. Members list itself is NOT modified or filtered
    3. ALSO opens MemberProfileDrawer slide-in for their profile detail
       (Stitch 0dbfa90e2d814190b76ee0b92fb4c3cb)
```

---

### Right Column (narrower)

#### SCHEDULE & TIMING section
```
Label: "SCHEDULE & TIMING" — .bamboo-label
Component: DateTimePicker (reused — see 15-shared-components.md)
Fields:
  - Start date + time
  - End date + time
  - "Recurring" toggle (shows recurrence options when enabled)
```

#### Cover Image section
```
Label: "COVER IMAGE" — .bamboo-label
Preview: thumbnail of selected cover photo
Button: "CHANGE COVER" — outlined, small
        Opens file picker or Supabase Storage browser
```

---

## Footer Buttons
```
Left:   "CANCEL" — text link
        On click: confirmation dialog "Discard changes?" before closing
        (Do not close immediately — confirm first)

Centre: "SAVE AS DRAFT"
        Saves event with status = 'draft', closes modal, no Realtime push

Right:  "CREATE EVENT" — bg-[--deep-forest], text-white, 48px
        Validates all required fields first
        On success: event in New pillar, assigned members get Realtime push
```

---

## On Success (CREATE EVENT)
1. Modal closes
2. New event card appears in "New" pillar on Admin Kanban
3. Toast: "Event created 🎋"
4. Assigned members see new task in their Member Kanban via Supabase Realtime

---

## Validation
```
Event name:    required
Schedule:      start time required, end time required
Added Members: at least the logged-in admin (always pre-populated)
```

---

## Mobile (390px)
- Two-column stacks to single column
- Left column content first, right column (schedule + cover) below
- Team Composition: dept–task row stacks vertically (dept above, task below)
- Footer: buttons full-width, stacked vertically
- CANCEL at top, SAVE AS DRAFT and CREATE EVENT stacked below
