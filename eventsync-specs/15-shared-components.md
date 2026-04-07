# EventSync — Shared Components
> Read 00-design-system.md first. Feed this file when building any shared component.

## Rule: Build once, reuse everywhere. Never duplicate.

---

## BlurModal
**File:** `src/components/shared/BlurModal.tsx`
**Shell Reference:** Stitch `69af9520dab947daa0e587ecb1487ab3`

Every popup/modal/drawer in this app uses BlurModal as its container.

```typescript
interface BlurModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  width?: string   // e.g. "max-w-2xl" — default varies per use case
}
```

**Visual spec:**
```
Overlay:       full-screen backdrop, dark + blur (backdrop-blur-sm, bg-black/40)
Container:     var(--cream-white) bg, .card-shadow
Border-radius: rounded-2xl
Padding:       p-6 desktop / p-4 mobile
Animation:     fade in overlay + scale up container (150ms ease-out)
Dismiss:       clicking overlay calls onClose
               Escape key calls onClose
               Focus trapped inside modal while open
               Returns focus to trigger element on close
```

**Mobile override (390px):**
```
Width:   100vw
Height:  100dvh
Radius:  rounded-t-3xl (top only, bottom = 0)
Position: fixed bottom-0 (slides up from bottom)
Animation: translateY(100%) → translateY(0), 350ms ease-out
Dismiss: swipe down gesture OR ✕ button
Scroll:  internally scrollable with momentum (-webkit-overflow-scrolling: touch)
Footer:  sticky bottom-0, full-width buttons, stacked if 2
```

---

## FilterPanel
**File:** `src/components/shared/FilterPanel.tsx`

One generic filter dropdown used by every kanban and list page.

```typescript
interface FilterPanelProps {
  filters: FilterOption[]           // which filters to show
  onFilterChange: (active: ActiveFilters) => void
  defaultFilters?: ActiveFilters
  className?: string
}

type FilterOption = 'date' | 'priority' | 'department' | 'name'

interface ActiveFilters {
  date?:       'asc' | 'desc' | null
  priority?:   'low' | 'medium' | 'high' | null
  department?: string | null     // pulled from Supabase at runtime
  name?:       'asc' | 'desc' | null
}
```

**UI Behaviour:**
```
Trigger: "Filter ▾" button (outlined, var(--stone-grey) text)
Dropdown: appears below button, var(--cream-white) bg, .card-shadow, rounded-xl

Sort options (date, name):
  Shows ↑ / ↓ toggle arrows
  Pressing again reverses direction (asc → desc → null → asc)

Select options (priority, department):
  Shows pill list of options
  Selecting again deselects ("All" resets)
  Department list: pulled from Supabase at runtime — NOT hardcoded

Active filters: small indicator dot on "Filter ▾" button when any filter is active
```

**Usage per page:**
| Page | `filters` prop | `defaultFilters` |
|------|---------------|-----------------|
| Member Kanban | `['date', 'priority']` | none |
| Admin Kanban Bird's Eye | `['name', 'date', 'department']` | none |
| Admin Open Board | `['date', 'name', 'priority', 'department']` | `{ date: 'asc' }` |

---

## MemberAssignmentSection
**File:** `src/components/shared/MemberAssignmentSection.tsx`

Reusable "Added Members + Members list" pattern.

```typescript
interface MemberAssignmentSectionProps {
  addedMembers: Member[]
  onAddMember: (member: Member) => void
  onRemoveMember: (memberId: string) => void
  prePopulatedMemberIds?: string[]  // these rows are greyed and cannot be removed
  onMemberClick?: (member: Member) => void  // optional: also open MemberProfileDrawer
}
```

**Added Members sub-section:**
```
Sub-label: "Added Members" (DM Sans SemiBold text-sm)
Search bar: "Search members..." — filters Supabase profiles in real-time (debounced 300ms)
Member row: [✕] [Avatar 32px] [Name] [Department] [Task input] [Role picker]
  - ✕ hidden for pre-populated members
  - Pre-populated rows: greyed background, no remove button
```

**Members sub-section:**
```
Sub-label: "Members" (DM Sans SemiBold text-sm)
Content: full profiles list from Supabase (paginated or scrollable)
Member row: [Avatar 32px] [Name] [Department]
On click:
  1. Silently copies member to Added Members above
  2. Members list does NOT change (static reference list)
  3. If onMemberClick prop provided: also opens MemberProfileDrawer
```

**Used in:**
- CreateEventModal (Added Members pre-populated with logged-in admin)
- NewTaskModal (Added Members starts empty)
- Attendance → Add Attendance modal
- Attendance → Event detail panel

---

## DateTimePicker
**File:** `src/components/attendance/DateTimePicker.tsx`

```typescript
interface DateTimePickerProps {
  mode: 'event' | 'deadline'
  onChange: (value: DateTimeValue) => void
  defaultValue?: DateTimeValue
}

// event mode: shows Start Date + Start Time + End Date + End Time + Recurring toggle
// deadline mode: shows single Date + Time fields, label = "Deadline"
```

**Visual:**
```
Date input: calendar icon left, custom styling over native date input
Time input: clock icon left
Recurring toggle: switch component, shows recurrence options when on
Class: .es-input on all inputs
```

**Used in:**
- CreateEventModal → `mode="event"`
- NewTaskModal → `mode="deadline"`
- Attendance Add Attendance modal → `mode="event"`

---

## DeadlineBadge
**File:** `src/components/shared/DeadlineBadge.tsx`

```typescript
interface DeadlineBadgeProps {
  deadline: Date
  overrideLabel?: 'IN_REVIEW'  // shows IN REVIEW tag regardless of date
}
```

**Logic:**
```
≤7 days:  "URGENT"    — var(--deadline-red) bg, white text, .deadline-pulse class
8–14 days: "IN VIEW"  — var(--deadline-amber) bg, white text
15+ days:  "NEW"      — var(--deadline-green) bg, white text
overrideLabel="IN_REVIEW": "IN REVIEW" — var(--deadline-amber) bg, white text
                            (only when ALL members have moved tasks to In Review)
```

**Used in:** Admin Kanban event cards · Admin Dashboard event cards

---

## DepartmentBadge
**File:** `src/components/shared/DepartmentBadge.tsx`

```typescript
interface DepartmentBadgeProps {
  department: string
}
```

Colour-coded pill. Colour assigned deterministically from department name
(use a hash or fixed map so the same dept always gets the same colour).

**Used in:** Member table · Kanban task cards · Attendance table

---

## MemberProfileDrawer
**File:** `src/components/attendance/MemberProfileDrawer.tsx`
**Stitch ID:** `0dbfa90e2d814190b76ee0b92fb4c3cb`

```typescript
interface MemberProfileDrawerProps {
  memberId: string
  isOpen: boolean
  onClose: () => void
}
```

Slide-in drawer (from right on desktop, slide-up on mobile) showing:
- Member avatar, name, email, department, join date, role
- Attendance history (events + weekly meetings)
- Event participation list

**Used in:**
- Attendance → Members tab row click
- CreateEventModal → clicking member in Members list

---

## AppNavbar
**File:** `src/components/shared/AppNavbar.tsx`

Role-aware. Reads `user_metadata.role` from Supabase session.

**Member navbar (desktop):**
```
Left:  "🎋 Event Sync" logo
Links: Dashboard · Kanban [badge] · Testimonials
Right: 🔔 bell icon · avatar circle
Height: 68px
Background: var(--cream-white) or transparent over ivory-paper
```

**Admin navbar (desktop):**
```
Left:  "🎋 Event Sync" logo
Links: Dashboard · Kanban · Attendance · Testimonials
Right: 🔔 bell icon · avatar circle
```

**Reflection badge on Kanban link:**
- Red circle with pending reflection count
- Disappears when count = 0
- Updates via Supabase Realtime (`reflections-[userId]` channel)

**Mobile:**
- Top bar: logo + bell + avatar only (56px height)
- Nav links moved to bottom tab bar (see 00-design-system.md)

---

## KanbanBoard + KanbanPillar + KanbanCard
**Files:**
```
src/components/kanban/KanbanBoard.tsx
src/components/kanban/KanbanPillar.tsx
src/components/kanban/KanbanCard.tsx
```

```typescript
// KanbanBoard
interface KanbanBoardProps {
  pillars: Pillar[]
  onCardMove: (cardId: string, fromPillar: string, toPillar: string) => void
  allowedMoves: MoveRule[]   // enforced client-side + server-side
}

// KanbanCard
interface KanbanCardProps {
  card: CardData
  isDraggable: boolean   // false for member on Done pillar
  onDragStart?: () => void
}
```

**DnD library:** use `@hello-pangea/dnd` (maintained fork of react-beautiful-dnd).
Drop zone animation: `.kanban-drop-active` class on active pillar.

---

## MemberTestimonialView
**File:** `src/components/testimonials/MemberTestimonialView.tsx`
*(Full spec in 07-member-testimonials.md)*

```typescript
interface MemberTestimonialViewProps {
  memberId: string
  headerOverride?: string
}
```

**Used in:**
- `/member/testimonials` — no headerOverride
- `/admin/testimonials/[memberId]` — headerOverride = "[Name] Details"
- Admin "VIEW PROFILE" button — headerOverride = "[Name] Details"

---

## ToastProvider
**File:** `src/components/shared/ToastProvider.tsx`

```
aria-live="polite" on toast container
Standard toasts used across the app:
  "Task moved to In Review 🎋"
  "Contribution added 🎋"
  "Reflection captured 🌿"
  "Event created 🎋"
  "Task created"
  "Testimonial sent to [name] 🌿"
Duration: 3 seconds auto-dismiss
Position: bottom-right desktop / top-centre mobile
```
