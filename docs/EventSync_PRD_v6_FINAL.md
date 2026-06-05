# 🎋 Event Sync — Product Requirements Document v6.0 (FINAL)
### T3 Stack · Supabase · Member-First Build Order
### Visual Theme: Arashiyama Bamboo Grove, Kyoto

---

# ══════════════════════════════════════════════════════════════
# BLOCK 0 — CLAUDE CODE CONTEXT  ← READ THIS ENTIRE BLOCK FIRST
# ══════════════════════════════════════════════════════════════

## 0A — Project Paths
```
T3 project root:    [YOUR ABSOLUTE PATH — e.g. C:/Users/you/event-sync]
Figma Make root:    [YOUR ABSOLUTE PATH — e.g. C:/Users/you/figma-make-eventsync]
globals.css:        src/app/globals.css
tailwind config:    tailwind.config.ts
env file:           .env  ← NOT .env.local
Stitch project ID:  1652286571189648563
```

---

## 0B — Stitch Screen Directory
> ⚠️ Stitch IDs are full hash strings — NOT sequential numbers.
> Always confirm a screen's NAME matches what you expect before building from it.
> The screen NAME is always the source of truth. IDs may still shift ±1 position
> in the Stitch panel — read the name aloud and cross-check before use.

| Stitch ID | Screen Name (source of truth) | Maps to T3 file |
|-----------|-------------------------------|-----------------|
| `3ef10a2ba7f044bc8484e13d9abbdbfb` | Login Page – Event Sync | `src/app/(auth)/login/page.tsx` |
| `02d24ce8b5dc471d87062599477759cd` | Member Dashboard – Updated | `src/app/(member)/dashboard/page.tsx` |
| `2903932690693697399` | Member Kanban – Updated Navigation | `src/app/(member)/kanban/page.tsx` |
| `c2e6611c854944139f6f70b25ff990e2` | Admin Dashboard | `src/app/(admin)/dashboard/page.tsx` |
| `3b3bc94614314044bc989098f13d2fa1` | Admin Kanban – Reference Matched | `src/app/(admin)/kanban/page.tsx` |
| `0c50ecd175f54d29b62a2cb949807a3e` | Attendance Dashboard – with Add Member Button | `src/app/(admin)/attendance/page.tsx` |
| `0dbfa90e2d814190b76ee0b92fb4c3cb` | Member Profile Slide-In | Component: `MemberProfileDrawer` |
| `896ba12079964b458776428250f99184` | Create New Event (form content reference) | Component: `CreateEventModal` |
| `f9f1135b2a4d45cd88a9c085eeee8dc7` | Add Contribution (questions reference) | Component: `AddContributionModal` |
| `a4bde1aebb384646a011ec5a6a1ddc7b` | Open Board – Task Detail | `src/app/(admin)/kanban/[eventId]/page.tsx` |
| `39c82fd8d712492da0514146989cf4b1` | Reflection Drawer – Inner Council (content design) | Component: `ReflectionDrawer` |
| `14367f7696f54c6ba8aded7cf39d5594` | Reflection Detail Card | Component: `ReflectionDetailModal` |
| `69af9520dab947daa0e587ecb1487ab3` | **Modal shell / popup component — design language only.** Use its border-radius, shadow, blur overlay, and internal padding as the container for ALL popups and modals. NOT a full page. | `BlurModal` shared component |
| `4729d29dd8ac4ea49ee2a41bd3be1a0d` | Member Testimonial Profile Page | `src/app/(member)/testimonials/page.tsx` |
| `cbdd22bda9934deabad466716145b4de` | Admin Testimonials Tab | `src/app/(admin)/testimonials/page.tsx` |

> **Shell clarification — Stitch `69af9520dab947daa0e587ecb1487ab3`:**
> This defines the modal design language — shell shape, shadow depth, blur overlay,
> and internal padding. Every popup in this app uses this shell as its container.
> When the PRD says "shell from / resize to Stitch `69af9520…`", it means:
> use this screen's width, height, corner radius, and overlay treatment exactly.

---

## 0C — Standardised Target Dimensions

```
┌─────────────┬──────────────┬───────────────────────────────────────────┐
│ Breakpoint  │ Width target │ Key layout rules                          │
├─────────────┼──────────────┼───────────────────────────────────────────┤
│ Mobile      │ 390px        │ Single column, bottom nav bar, full-screen │
│             │              │ modals, stacked cards, 44px tap targets    │
├─────────────┼──────────────┼───────────────────────────────────────────┤
│ Tablet      │ 768px        │ 2-column grids, slide-in drawers 480px,   │
│             │              │ top navbar visible, kanban h-scroll        │
├─────────────┼──────────────┼───────────────────────────────────────────┤
│ Desktop     │ 1440px       │ max-w-7xl (1280px), px-6 lg:px-8,        │
│             │              │ full multi-column layouts                  │
└─────────────┴──────────────┴───────────────────────────────────────────┘

Page background: var(--ivory-paper)  = #F5F0E8  — NEVER use pure white
Card surface:    var(--cream-white)  = #FAFAF7
Shadow:          .card-shadow class ONLY — never shadow-lg or shadow-xl
Layout:          No left sidebar on any page at any breakpoint
```

### Mobile-Specific Layout Rules (390px)

**Navbar → Bottom Tab Bar on mobile:**
```
Member:  [ Dashboard ] [ Kanban 🔔 ] [ Testimonials ]
Admin:   [ Dashboard ] [ Kanban ] [ Attendance ] [ Testimonials ]
Position: fixed bottom-0, h-16, bg-[--deep-forest], text-ivory
Active tab: Bamboo Green dot indicator above icon
Icons: lucide-react, 24px, centred above label (10px DM Sans)
Safe area: pb-safe (iOS home bar clearance)
```

**Top navbar on mobile:**
```
Height: 56px (reduced from 68px desktop)
Left: "🎋 Event Sync" logo only
Right: 🔔 bell (with badge) + avatar circle
No nav links (moved to bottom tab bar)
```

**Cards → single column stack:**
```
KPI cards:    1-column stack (was 4-col desktop)
Event cards:  full-width (was multi-col)
Kanban:       horizontal snap scroll, min-w-[85vw] per pillar, one visible at a time
Testimonial request cards: 1-column (was 3-col)
```

**Modals on mobile:**
```
BlurModal:    100vw × 100dvh (full screen)
              slides up from bottom: translateY(100%) → translateY(0), 350ms ease-out
              rounded-t-3xl top corners only
              dismiss: swipe down or ✕ button
Drawers:      100vw full-screen (was 480px slide-in)
              same slide-up behaviour as modal
```

**Forms on mobile:**
```
All inputs: full-width, min-height 48px
Department—Task row: stacks vertically (dept above, task below)
Priority pills: full-width segmented control
Date picker: native mobile date input with custom styling overlay
Submit button: full-width, height 52px
```

**Tables on mobile:**
```
Horizontal scroll, sticky first column (Member Name)
Pagination: Previous / Page N / Next only
```

**Kanban drag on mobile:**
```
Long press (500ms) to initiate drag
Visual: card scales 1.05×, haptic feedback if supported
Alternative: tap card → bottom sheet "Move to..." with valid next pillars only
```

---

## 0D — Design Token Quick Reference
All defined in `src/app/globals.css`. Use variable names, not raw hex.

```css
--deep-forest:    #1C3A2B   /* navbars, dark buttons, primary */
--bamboo-green:   #4A7C59   /* active states, CTAs, progress */
--sage-mist:      #A8C5A0   /* badges, tags, hover bg */
--ivory-paper:    #F5F0E8   /* PAGE BACKGROUND — always this */
--cream-white:    #FAFAF7   /* CARD SURFACE — always this */
--charcoal-ink:   #2D2D2D   /* primary text */
--stone-grey:     #8C8C8C   /* muted text, metadata */
--accent-gold:    #C4A35A   /* testimonial CTA, star ratings */
--deadline-red:   #C0503A   /* ≤7 days, urgent, absent */
--deadline-amber: #D4914A   /* 8–14 days, excused, at risk */
--deadline-green: #3D8B5E   /* 15+ days, attended, success */
```

**Utility classes (globals.css) — always use these:**
```
.card-shadow        → layered refined shadow — ALL cards use this
.bamboo-label       → 11px uppercase Bamboo Green label
.reveal / .visible  → scroll-triggered fade+scale (JS adds .visible)
.animate-blur-in    → heading blur-in on scroll
.es-input           → input with bamboo-green focus ring
.kanban-drop-active → dashed green drop zone for drag-and-drop
.deadline-pulse     → scale pulse for urgent deadline badges
```

---

## 0E — Component Reuse Rules
> Reduce duplication. Build once, reuse everywhere.

| Component | Built for | Also used in |
|-----------|-----------|-------------|
| `BlurModal` | Wrapper for ALL popups | Every modal in the app |
| `FilterPanel` | Shared filter dropdown — see 0E-1 | Member Kanban · Admin Kanban · Admin Open Board |
| `AddContributionModal` | Member Kanban | Admin Kanban "Add" dropdown |
| `ReflectionDrawer` | Member Kanban reflection button | — |
| `ReflectionDetailModal` | Reflection pending/archived items | Member Testimonials history · Admin member profile history · Admin Testimonials event press |
| `MemberAssignmentSection` | Create Event (Added Members + Members) | New Task · Attendance event · Attendance weekly |
| `DateTimePicker` | Create Event | New Task (deadline mode) · Attendance event · Attendance weekly |
| `DepartmentBadge` | Member table | Kanban cards · Attendance table |
| `DeadlineBadge` | Admin Kanban event cards | Admin Dashboard event cards |
| `KanbanPillar` | Member Kanban | Admin Kanban bird's eye · Admin Open Board |
| `KanbanCard` | Member Kanban | Admin Open Board (`isDraggable` prop) |
| `MemberTestimonialView` | Member Testimonials page | Admin member profile (`headerOverride` prop) |
| `MemberProfileDrawer` | Attendance Members tab row click | Create Event Members section click |

---

### 0E-1 — FilterPanel Shared Component
**File:** `src/components/shared/FilterPanel.tsx`

A single generic filter dropdown inherited and configured by every kanban and list page.
Each consuming page passes only the filter options it needs — no per-page filter logic duplication.

**Props interface:**
```typescript
interface FilterPanelProps {
  filters: FilterOption[]
  onFilterChange: (active: ActiveFilters) => void
  defaultFilters?: ActiveFilters
  className?: string
}

type FilterOption = 'date' | 'priority' | 'department' | 'name'

interface ActiveFilters {
  date?:       'asc' | 'desc' | null
  priority?:   'low' | 'medium' | 'high' | null
  department?: string | null          // pulled from Supabase at runtime
  name?:       'asc' | 'desc' | null
}
```

**UI:** Single `Filter ▾` button → dropdown panel listing only the enabled options.
Sort options (date, name): show ↑/↓ toggle; pressing again reverses direction.
Selection options (priority, department): show pill list; selecting again deselects ("All").

**Usage per page:**

| Page | Enabled filters | Default |
|------|-----------------|---------|
| Member Kanban | `['date', 'priority']` | none active |
| Admin Kanban bird's eye | `['name', 'date', 'department']` | none active |
| Admin Open Board | `['date', 'name', 'priority', 'department']` | `{ date: 'asc' }` |

---

## 0F — Code Sources

### Source 1 — Figma Make (UI Components Only)
**URL:** `https://www.figma.com/make/X23nbw1QqDOMVDxHDBYIO6`

✅ **REUSE these files** (copy into T3, fix imports only):
- `components/ui/*` → `src/components/ui/` (skip files that already exist)
- `components/AddContributionDrawer.tsx` → `src/components/kanban/`
- `components/AddEventDrawer.tsx` → `src/components/kanban/`
- `components/ManageMembersDrawer.tsx` → `src/components/kanban/`
- `components/SlideDrawer.tsx` → `src/components/shared/`

❌ **DELETE — incompatible with Next.js:**
- `context/RoleContext.tsx` → replaced by Supabase Auth
- `routes.ts` → replaced by Next.js file routing
- `App.tsx` → Figma Make entry point only
- `components/figma/ImageWithFallback.tsx` → use `next/image`

**Migration find-and-replace (apply to every copied file):**
```
useNavigate()             → useRouter()       from 'next/navigation'
navigate('/path')         → router.push('/path')
<Link to="/path">         → <Link href="/path">  from 'next/link'
<ImageWithFallback src={} → <Image src={} alt={} from 'next/image'
import from 'react-router'→ delete import
```

### Source 2 — Google Stitch (Primary Visual Reference)
Use Stitch screens for layout, component structure, and spacing.
Override all colours with design tokens from globals.css.
Ignore all background whites → use `var(--ivory-paper)`.

---

## 0G — Build Order (Member first, then Admin — ALWAYS)
```
1.  ✅  Landing page              DONE (Figma Make — do not touch)
2.  ⏭   Login page                (Stitch 3ef10a2ba7f044bc8484e13d9abbdbfb)
3.  ⏭   Member Dashboard          (Stitch 02d24ce8b5dc471d87062599477759cd)
4.  ⏭   Member Kanban             (Stitch 2903932690693697399)
5.  ⏭   Member Reflections        (Stitch 39c82fd8d712492da0514146989cf4b1 content + 69af9520dab947daa0e587ecb1487ab3 shell)
6.  ⏭   Member Testimonials       (Stitch 4729d29dd8ac4ea49ee2a41bd3be1a0d)
7.  ⏭   Admin Dashboard           (Stitch c2e6611c854944139f6f70b25ff990e2)
8.  ⏭   Admin Kanban bird's eye   (Stitch 3b3bc94614314044bc989098f13d2fa1)
9.  ⏭   Admin Kanban open board   (Stitch a4bde1aebb384646a011ec5a6a1ddc7b)
10. ⏭   Create Event modal        (Stitch 896ba12079964b458776428250f99184 content + 69af9520dab947daa0e587ecb1487ab3 shell)
11. ⏭   Add Contribution modal    (Stitch f9f1135b2a4d45cd88a9c085eeee8dc7 questions + 69af9520dab947daa0e587ecb1487ab3 shell — reused from member)
12. ⏭   Attendance                (Stitch 0c50ecd175f54d29b62a2cb949807a3e + updated tabs)
13. ⏭   Admin Testimonials        (Stitch cbdd22bda9934deabad466716145b4de + links to Stitch 4729d29dd8ac4ea49ee2a41bd3be1a0d)
```

**Prompt template per build step:**
```
Follow BLOCK 0 of the PRD (EventSync_PRD_v6_FINAL.md).
Build step #[N]: [Page name]
Visual reference: Stitch ID [full hash] "[Screen name exactly]" — confirm name before building.
Interaction spec: PRD Section [X]
Apply all colours from globals.css — ignore Stitch background colours.
Do not install new packages without asking.
Reuse existing components from Block 0E. Always build Member before Admin.
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 0H — MOBILE BEHAVIOUR REFERENCE
# ══════════════════════════════════════════════════════════════

> Every screen must work at 390px. Build mobile alongside desktop — not as an afterthought.
> Tailwind prefixes: default = mobile, `md:` = tablet (768px+), `lg:` = desktop (1024px+).

## Navigation

| Screen | Desktop | Mobile |
|--------|---------|--------|
| Top navbar | Full nav links + logo + icons | Logo + bell + avatar only |
| Page navigation | Links in top navbar | Fixed bottom tab bar |
| Active indicator | Underline or bold text | Green dot above icon |

## Grid Collapse Rules

| Component | Desktop | Tablet (md) | Mobile |
|-----------|---------|-------------|--------|
| KPI cards | 4 columns | 2×2 grid | 1 column stack |
| Ongoing event cards | 2 columns scroll | 2 columns | 1 column |
| Testimonial request cards | 3 columns | 2 columns | 1 column |
| Contribution history | 2-column timeline | 2-column | 1 column (date above content) |
| Performance metric cards | 5 columns row | 3+2 wrap | 2+3 wrap |
| Attendance / Member tables | Full columns | Scroll | Scroll, sticky name col |

## Kanban on Mobile
```
Layout:       Horizontal snap scroll — one pillar visible at a time
Pillar width: min-w-[85vw] so next pillar peeks at edge
Scroll snap:  scroll-snap-type-x mandatory, scroll-snap-align start
Pill tab bar: above kanban — tapping pill scrolls to that pillar
Drag method:  Long press (500ms) → drag, OR tap card → bottom sheet:
              "Move to: [valid next steps for this role only]"
```

## Modal & Drawer Behaviour on Mobile
```
All BlurModal instances:
  - Full screen (100vw × 100dvh), slides UP from bottom (350ms ease-out)
  - Top corners: rounded-t-3xl · Dismiss: swipe down or ✕
  - Internally scrollable (momentum scroll)
  - Footer buttons: sticky, full-width stacked if 2

All MemberProfileDrawer / SlideDrawer:
  - Same full-screen slide-up behaviour on mobile
  - Fixed header with title + ✕, scrollable content
```

## Touch-Friendly Sizing
```
Tap targets:  min 44×44px · Inputs: min 48px · Primary buttons: min 48px
Table rows:   min 56px · Kanban cards: min 80px
Bottom tab:   64px + safe-area-inset-bottom
```

## Typography on Mobile
```
H1: 56px → 36px · H2: 40px → 28px · H3: 28px → 22px
Body / labels / badges: unchanged
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 1 — TECH STACK
# ══════════════════════════════════════════════════════════════

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 App Router | Server Components by default |
| Language | TypeScript strict | No `any` types |
| API | tRPC v11 | Type-safe end-to-end, no REST |
| Styling | Tailwind CSS v3 | Token classes from globals.css |
| Auth | Supabase Auth | Role in `user_metadata.role` |
| Database | Supabase Postgres | RLS on all tables |
| Real-time | Supabase Realtime | Live kanban updates |
| Storage | Supabase Storage | Contribution attachments |
| UI Base | shadcn/ui | From Figma Make `components/ui/` |
| Deployment | Vercel | Edge-compatible |

**Environment file:** `.env` (not `.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   ← server only, never NEXT_PUBLIC_
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 2 — FOLDER STRUCTURE
# ══════════════════════════════════════════════════════════════

```
event-sync/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── layout.tsx               ← Marketing navbar + footer, no auth
│   │   │   └── page.tsx                 ← ✅ Landing page (DONE — do not touch)
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/page.tsx           ← Stitch 3ef10a2ba7f044bc8484e13d9abbdbfb
│   │   │
│   │   ├── (member)/
│   │   │   ├── layout.tsx               ← Member navbar: Dashboard | Kanban | Testimonials
│   │   │   ├── dashboard/page.tsx       ← Stitch 02d24ce8b5dc471d87062599477759cd
│   │   │   ├── kanban/page.tsx          ← Stitch 2903932690693697399
│   │   │   └── testimonials/page.tsx    ← Stitch 4729d29dd8ac4ea49ee2a41bd3be1a0d
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx               ← Admin navbar: Dashboard | Kanban | Attendance | Testimonials
│   │   │   ├── dashboard/page.tsx       ← Stitch c2e6611c854944139f6f70b25ff990e2
│   │   │   ├── kanban/
│   │   │   │   ├── page.tsx             ← Bird's eye — Stitch 3b3bc94614314044bc989098f13d2fa1
│   │   │   │   └── [eventId]/page.tsx   ← Open board — Stitch a4bde1aebb384646a011ec5a6a1ddc7b
│   │   │   ├── attendance/page.tsx      ← Stitch 0c50ecd175f54d29b62a2cb949807a3e
│   │   │   └── testimonials/
│   │   │       ├── page.tsx             ← Stitch cbdd22bda9934deabad466716145b4de
│   │   │       └── [memberId]/page.tsx  ← MemberTestimonialView + Generate sidebar
│   │   │
│   │   ├── api/trpc/[trpc]/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx                   ← Root layout: fonts, providers, toasts
│   │
│   ├── components/
│   │   ├── ui/                          ← shadcn (from Figma Make, copy as-is)
│   │   │
│   │   ├── shared/
│   │   │   ├── AppNavbar.tsx            ← Role-aware top navbar
│   │   │   ├── BlurModal.tsx            ← Stitch 69af9520… shell — ALL modals use this
│   │   │   ├── FilterPanel.tsx          ← ⭐ Generic filter (see 0E-1), used everywhere
│   │   │   ├── DeadlineBadge.tsx        ← Urgent / In View / New pill
│   │   │   ├── DepartmentBadge.tsx      ← Colour-coded dept pills
│   │   │   ├── ProgressRing.tsx         ← SVG animated ring
│   │   │   ├── SlideDrawer.tsx          ← From Figma Make (fix imports)
│   │   │   └── ToastProvider.tsx
│   │   │
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx          ← 4-column DnD board
│   │   │   ├── KanbanPillar.tsx         ← Single column (member + admin)
│   │   │   ├── KanbanCard.tsx           ← Card (isDraggable prop for role control)
│   │   │   ├── AddContributionModal.tsx ← Stitch f9f1135b… questions + 69af9520… shell
│   │   │   ├── CreateEventModal.tsx     ← Stitch 896ba120… content + 69af9520… shell
│   │   │   ├── NewTaskModal.tsx         ← Same layout as CreateEventModal, header "New Task"
│   │   │   └── MemberAssignmentSection.tsx ← Added Members + Members UI (reusable)
│   │   │
│   │   ├── reflections/
│   │   │   ├── ReflectionDrawer.tsx     ← Stitch 39c82fd8… content inside 69af9520… shell
│   │   │   └── ReflectionDetailModal.tsx← Stitch 14367f76… inside 69af9520… shell
│   │   │
│   │   ├── testimonials/
│   │   │   ├── MemberTestimonialView.tsx← Stitch 4729d29d… (headerOverride prop for admin)
│   │   │   ├── AdminTestimonialCard.tsx ← Stitch cbdd22… request card
│   │   │   └── EndorsementBlock.tsx     ← Executive endorsement + inline-editable quote
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── OngoingEventCard.tsx
│   │   │   └── PendingSubmissionItem.tsx
│   │   │
│   │   └── attendance/
│   │       ├── AttendanceTable.tsx
│   │       ├── MemberProfileDrawer.tsx  ← Stitch 0dbfa90e… slide-in
│   │       └── DateTimePicker.tsx       ← Reused: Create Event + New Task + Attendance
│   │
│   ├── server/api/routers/
│   │   ├── events.ts · members.ts · contributions.ts
│   │   ├── attendance.ts · reflections.ts · testimonials.ts · dashboard.ts
│   │
│   ├── trpc/ · lib/supabase/ · types/index.ts
│
├── supabase/migrations/ · seed.sql
├── middleware.ts · tailwind.config.ts · .env
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 3 — SHARED PAGES
# ══════════════════════════════════════════════════════════════

## 3A — Login Page
**Route:** `/login`
**Visual:** Stitch `3ef10a2ba7f044bc8484e13d9abbdbfb` — "Login Page – Event Sync"

Split layout — left: bamboo grove full-height photo · right: centred login card.
Fields: Email · Password · "Sign In" · "Sign in with Google" OAuth · "New? Create an account"

**On success:**
```
role === 'admin'  → /admin/dashboard
role === 'member' → /member/dashboard
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 4 — MEMBER VIEWS  ← BUILD THESE FIRST, ALWAYS
# ══════════════════════════════════════════════════════════════

> **Member navbar (top, no sidebar):** Dashboard · Kanban · Testimonials
> Kanban nav item shows reflection badge count (red circle). Mobile: bottom tab bar.

---

## 4A — Member Dashboard
**Route:** `/member/dashboard`
**Visual:** Stitch `02d24ce8b5dc471d87062599477759cd` — "Member Dashboard – Updated"

**3 KPI cards:** Remaining Tasks · Completion Rate (% + progress bar) · Next Deadline (deadline colour)

**Pending Milestones list:**
Each row: dept icon · task name · event name · deadline badge · chevron
Clicking → `/member/kanban?taskId=[id]` with that task highlighted

**Upcoming Meeting card (right):** Next meeting details + attendee avatars

---

## 4B — Member Kanban Board
**Route:** `/member/kanban`
**Visual:** Stitch `2903932690693697399` — "Member Kanban – Updated Navigation"

**Top navbar links:** Dashboard · Kanban · Testimonials

**Top right buttons:**
- `Reflections 🔔 [N]` → opens `ReflectionDrawer` (see 4C)
- `+ Add Contribution` → opens `AddContributionModal` (see 4B-1)
- `Filter ▾` → `FilterPanel` with `filters={['date', 'priority']}`

**FilterPanel behaviour:**
- **Date:** sorts cards within each pillar by deadline, asc ↑ / desc ↓ (toggle on re-press)
- **Priority:** shows only cards of selected level; "All" resets

**Event selector dropdown** — member picks which event to view

**4 pillars:** New · In Progress · In Review · Done

**Member drag rules:**
- ✅ New → In Progress (sequential only, no skipping)
- ✅ In Progress → In Review
- ❌ Cannot drag to Done (admin-only)
- ❌ Cannot drag backwards
- Moving to In Review: reflection badge +1 · toast "Task moved to In Review 🎋"

**Task card:**
```
[DEPT BADGE]                          [PRIORITY: Low / Medium / High]
Task name (DM Sans SemiBold)
📅 Due: date  ·  Assigned by: Admin
```

---

### 4B-1 — Add Contribution Modal
**Trigger:** `+ Add Contribution` on Member Kanban
**Visual (questions):** Stitch `f9f1135b2a4d45cd88a9c085eeee8dc7` — copy only the form fields
**Visual (shell):** Stitch `69af9520dab947daa0e587ecb1487ab3` — exact dimensions, radius, shadow, blur
**Component:** `AddContributionModal` — reused by Admin Kanban "Add Contribution" (zero duplication)

**Header:** "Add Contribution" (Playfair Display H2)

**Department Header row:**
```
[ Department ▾         ] — [ Task name input                    ]
  dropdown (left box)   hyphen connector   text input (right box)
  Shadow hint: "e.g. Publicity"            Shadow hint: "e.g. Social Media Slides"
```
Desktop: side-by-side. Mobile: stacked vertically (dept above, task below).
Departments pulled from Supabase — not hardcoded.

| Field | Type | Rules |
|-------|------|-------|
| Department | Dropdown | All existing departments from Supabase |
| Task | Text input | Hyphen connector to dept · shadow hint |
| Detailed Description | Textarea | Max 30 words · live word counter |
| Aimed Result / Outcome | Textarea | Required |
| Priority Level | Segmented pill | Low · Medium · High · sliding indicator |

> ⚠️ No attachment / file upload section — removed entirely.

**Bottom:** "Complete Later" text link (saves draft) · "Submit Contribution" dark button (validates required)

**On success:** modal closes · card in member's New pillar · toast fires

---

## 4C — Reflections
**Trigger:** `Reflections 🔔 [N]` on Member Kanban
**Content design:** Stitch `39c82fd8d712492da0514146989cf4b1` — "Reflection Drawer – Inner Council"
**Container dimensions:** Stitch `69af9520dab947daa0e587ecb1487ab3` — resize drawer content into this shell
**Component:** `ReflectionDrawer` inside `BlurModal`

**Tab switcher (sliding pill):** `PENDING (N)` · `ARCHIVED`

### PENDING tab
Each item: task name (bold) · time ago (e.g. "2D AGO") · 1-line snippet · `↪ REFLECT NOW`
Pressing any item → `ReflectionDetailModal` in **pending/editable mode** (see 4C-1)

### ARCHIVED tab
Same card style. Pressing any item → `ReflectionDetailModal` in **read-only/archived mode** (see 4C-1)

---

### 4C-1 — Reflection Detail Modal
**Content:** Stitch `14367f7696f54c6ba8aded7cf39d5594` — "Reflection Detail Card"
**Shell:** Stitch `69af9520dab947daa0e587ecb1487ab3` dimensions
**Component:** `ReflectionDetailModal` — `mode: 'pending' | 'archived'`

**Pending mode (editable):**

| Field | Label | Limit |
|-------|-------|-------|
| Task | CURRENT TASK | **5 words max** — live counter enforced |
| Description | WHAT TOOK PLACE? | **30 words max** |
| Impact | IMPACT ON SYAI | **30 words max** |
| Challenges | CHALLENGES FACED | **30 words max** |
| Personal Learning | PERSONAL LEARNING POINTS | **30 words max** |
| Org Learning | ORGANISATIONAL LEARNING POINTS | **30 words max** |

Task name + Date Completed: pre-filled, read-only (greyed).
Bottom: "Complete Later" (saves draft) · "Submit Reflection" (validates all fields)

**On submit:** Pending → Archived · badge -1 · toast "Reflection captured 🌿"

**Archived mode (read-only):**
All 6 fields shown populated, no inputs.
Bottom: `Export as PDF` · `Edit Entry` (reopens in editable mode) · `Close`

---

## 4D — Member Testimonials
**Route:** `/member/testimonials`
**Visual:** Stitch `4729d29dd8ac4ea49ee2a41bd3be1a0d` — "Member Testimonial Profile Page"
**Component:** `MemberTestimonialView` (also reused by Admin — see 5E)

> ⚠️ No left sidebar. Full width. All data dynamic — no hardcoded values.

**Layout (document-style, centred, cream-white card):**

**Header:** "OFFICIAL DOCUMENT" (bamboo-label) · "Request Testimonial" (H1 Playfair) · description

**Member profile row:** Left: name, email · Right: issue date, auto-generated ref number

**Performance Metrics (5 cards, wraps on mobile):**
Events Contributed · Weekly Attendance % · Project Leads · Collaborations · Total Hours

**Contribution History timeline:**
Left: date + hours · bamboo-green vertical line with node dots · Right: title + description
Each entry clickable → `ReflectionDetailModal` archived/read-only (Stitch `14367f7696f54c6ba8aded7cf39d5594`)
Same component from 4C-1 — zero duplication.

**Executive Endorsement block (bottom):** Italic quote · signature · name + title

**Request Testimonial button (gold):** "✨ Request Testimonial" — visible only if no testimonial yet.
On click: request sent · button → "Requested ✓" (disabled) · member appears in Admin queue.

---

# ══════════════════════════════════════════════════════════════
# BLOCK 5 — ADMIN VIEWS  ← BUILD AFTER ALL MEMBER VIEWS
# ══════════════════════════════════════════════════════════════

> **Admin navbar (top, no sidebar):** Dashboard · Kanban · Attendance · Testimonials
> Mobile: bottom tab bar with the same 4 items.

---

## 5A — Admin Dashboard
**Route:** `/admin/dashboard`
**Visual:** Stitch `c2e6611c854944139f6f70b25ff990e2` — "Admin Dashboard"

**Page label:** "EXCO DASHBOARD" (bamboo-label)
**Heading:** "Current Event Progress" (Playfair Display italic)

**4 KPI cards:** Active Events · Total Members · Completion Rate · Tasks Due (deadline-red + `.deadline-pulse` dot)

**Ongoing Initiatives (left):**
Event cards: cover photo · deadline badge · event name · description · progress bar · avatar stack · chevron
**Clicking any event card → `/admin/kanban/[eventId]`** (Open Board, Stitch `a4bde1aebb384646a011ec5a6a1ddc7b`)
❌ No "Add Event" on dashboard — events added from Kanban only.

**Pending Submissions (right, renamed from "Pending Syncs"):**
Late subcomm submissions from their kanban. Each item: dept label · task name · due time · assignee avatar.
`ADD NEW TASK` links to the relevant event's Open Board (`/admin/kanban/[eventId]`).

---

## 5B — Admin Kanban Board (Bird's Eye)
**Route:** `/admin/kanban`
**Visual:** Stitch `3b3bc94614314044bc989098f13d2fa1` — "Admin Kanban – Reference Matched"

**Heading:** "Kanban Board" · sub-label "EXCO VIEW · N ACTIVE EVENTS"

**Top-right controls:**

### FilterPanel (Admin Kanban)
`Filter ▾` → `FilterPanel` with `filters={['name', 'date', 'department']}`
- **Name (A-Z / Z-A):** sorts all event cards alphabetically by **event name** across ALL pillars simultaneously
- **Date (↑/↓):** sorts all event cards by event date across ALL pillars simultaneously
- **Department:** filters to show only events tagged with the selected department; "All" resets
All active sorts/filters apply simultaneously.

### Add button
`+ Add ▾` — dropdown button (wide enough for label + chevron):
- `Add Event` → opens `CreateEventModal` (see 5B-1)
- `Add Contribution` → opens `AddContributionModal` (reused from 4B-1)

**4 pillars:** New · In Progress · In Review · Done

**Event card:**
```
[DEADLINE TAG]         Event Name          [⋯]
Date · Initiative type

GLOBAL PROGRESS: [NEW▓] [PROG▓] [REVW▓] [DONE▓]

[Avatar stack] +N    [OPEN BOARD →]    [Manage Members]
```

**Deadline tags:**
- `URGENT` → deadline-red (≤7 days)
- `IN VIEW` → deadline-amber (8–14 days)
- `NEW` → deadline-green (15+ days)
- `IN REVIEW` → deadline-amber — **only when ALL assigned members have moved tasks to In Review**

**Per-card `Manage Members`** → `ManageMembersDrawer` (Figma Make, reused)
**Per-card `⋯` menu:** Edit · Archive · Delete (delete needs confirmation dialog)
**Per-card `OPEN BOARD →`** → `/admin/kanban/[eventId]`
**Admin drag:** any pillar including Done, no restrictions.

---

### 5B-1 — Create Event Modal
**Trigger:** "Add Event" from `+ Add ▾`
**Content:** Stitch `896ba12079964b458776428250f99184` — "Create New Event"
**Shell:** Stitch `69af9520dab947daa0e587ecb1487ab3` — exact dimensions, radius, shadow, blur
**Component:** `CreateEventModal`

**Left column:**
- EVENT IDENTITY: large text input "Enter a memorable name..." (required)
- NARRATIVE & PURPOSE: rich text editor (Bold · Italic · List · Quote toolbar)
- **TEAM COMPOSITION** heading:
  - **Added Members** sub-section *(above Members; visually identical style to Members section)*:
    - First entry: currently logged-in admin — pre-populated, greyed, cannot be removed
    - Search bar to find members from Supabase `profiles`
    - Each added member row: `[✕]` remove · avatar · name · dept · task · role picker
  - **Members** sub-section (as in Stitch `896ba12079964b458776428250f99184`):
    - Full member database list — **this list is a static reference and does not change** when someone is added to Added Members. The same person may appear in both sections simultaneously; this is intentional.
    - Clicking a member: silently copies them into Added Members. The Members list itself is not modified.
    - Clicking a member also opens `MemberProfileDrawer` (Stitch `0dbfa90e2d814190b76ee0b92fb4c3cb`) for their profile detail.

**Right column:**
- SCHEDULE & TIMING: `DateTimePicker` · Start Time · End Time · Recurring toggle
- Cover image: preview thumbnail + "CHANGE COVER" button

**Footer:** `CANCEL` (confirmation before discarding) · `SAVE AS DRAFT` · `CREATE EVENT`

**On success:** modal closes · event card in New pillar · toast "Event created 🎋" · assigned members see tasks in their kanban via Supabase Realtime.

---

## 5C — Admin Kanban Open Board
**Route:** `/admin/kanban/[eventId]`
**Visual:** Stitch `a4bde1aebb384646a011ec5a6a1ddc7b` — "Open Board – Task Detail"

**Breadcrumb:** `← BACK TO KANBAN / [EVENT NAME]`
**Heading:** Event name · task count · dept count
**Top-right:** `Filter ▾` · `+ New Task`

**FilterPanel (Open Board):** `filters={['date', 'name', 'priority', 'department']}` · `defaultFilters={{ date: 'asc' }}`
- **Date (default active, asc):** sorts task cards by deadline within each pillar
- **Name:** sorts task cards alphabetically by task name within each pillar
- **Priority:** shows only selected priority level
- **Department:** shows only tasks from selected department

Reuses `KanbanBoard` + `KanbanPillar` + `KanbanCard`.
Task cards: dept badge · task name · assignee avatar + name · status dot
Admin drags to any pillar. Real-time via Supabase Realtime (`kanban-[eventId]`).

---

### 5C-1 — New Task Modal
**Trigger:** `+ New Task` on Open Board
**Visual:** Same two-column layout as `CreateEventModal` — header renamed **"New Task"**
**Component:** `NewTaskModal` — shares layout structure, not a copy-paste

Task is automatically scoped to the `eventId` from the current Open Board URL. No event picker shown.

**Left column:**
- TASK IDENTITY: task name input (required)
- DESCRIPTION OF TASK: textarea (first question, shown before Team Composition)
- **TEAM COMPOSITION** (`MemberAssignmentSection`):
  - Added Members — **starts empty** (admin is NOT pre-populated here)
  - Members — full database list. Clicking a member: silently copies to Added Members. Members list unchanged.

**Right column:**
- DEADLINE: `DateTimePicker` in deadline mode — label "Deadline", shows date + time (not start/end pair)
- PRIORITY LEVEL: segmented pill — Low · Medium · High

**On submit:** task in Open Board New pillar · assigned members see it in their Member Kanban via Supabase Realtime · toast "Task created"

---

## 5D — Attendance Registry
**Route:** `/admin/attendance`
**Visual:** Stitch `0c50ecd175f54d29b62a2cb949807a3e` — "Attendance Dashboard – with Add Member Button"

**Admin navbar:** Dashboard · Kanban · **Attendance** · Testimonials

**Heading:** "Attendance Registry"

**3-tab switcher (sliding pill):**
`Members` (LEFT, default) · `Event Participation` (CENTRE) · `Weekly Meetings` (RIGHT)
Content refreshes without page reload on toggle.

**4 KPI cards (always visible):** Total Events · Avg Attendance % · Highest Rate (event) · Lowest Rate (event)

**Filter row:** Event selector · Date Range · Department · Export Report (CSV)

---

### Members tab (default)
Full member database table. Columns: Member Name · Department · Join Date · Status · Total Events · Attendance %

**"Add Member" button:**
Opens `BlurModal` (Stitch `69af9520dab947daa0e587ecb1487ab3` shell) — form to **add a brand new member to the system** (creates a new `profiles` row in Supabase).
Form template: Stitch `0dbfa90e2d814190b76ee0b92fb4c3cb` layout, adapted with these fields:
- Name (required) · Email (required)
- Department — dropdown showing existing departments from Supabase
- Role: Member / Admin
- Join Date — date picker
- Avatar upload (optional)

Bottom: `Cancel` · `Add Member` (validates required fields, writes to Supabase)

**Clicking any member row** → opens `MemberProfileDrawer` slide-in (Stitch `0dbfa90e2d814190b76ee0b92fb4c3cb`) showing member profile, attendance history, event participation.

---

### Event Participation tab (centre)
**Default view:** Events where attendance has **not yet been recorded**.

**Status filter pills** (above list):
`Not Recorded` (default) · `Ended` · `Archived`
- **Not Recorded:** events whose `end_date` has passed AND have no `attendance` rows for that `event_id`
- **Ended:** events that have ended regardless of attendance status
- **Archived:** events manually archived by admin

**List format:** Each event as a **long horizontal card** (same visual style as member name row in Members tab).
Card shows: Event name · Date · Member count · Submission status tag

**Clicking an event card:**
→ Opens detail panel. Shell: Stitch `14367f7696f54c6ba8aded7cf39d5594`
→ Highlights `MemberAssignmentSection` layout (Added Members / Members)
→ Each member has status selector: `Attended` / `Absent` / `Excused`
→ Submit records attendance, removes event from "Not Recorded" list

**"Add Attendance" button:**
Opens `BlurModal` (Stitch `69af9520…` shell) with:
- `DateTimePicker` (reused)
- `MemberAssignmentSection` (reused: Added Members + search + Members)
- Status selector per member: Attended / Absent / Excused

**Table (after submission):**
Columns: Member Name · Department · Event Name · Status · Date · Notes
Badges: ● Attended (deadline-green) · ● Absent (deadline-red) · ● Excused (deadline-amber)

---

### Weekly Meetings tab (right)
Same structure as Event Participation.

**"Add Attendance" button** opens `BlurModal` (Stitch `69af9520…` shell) with:
- `DateTimePicker` — meeting date + time
- `MemberAssignmentSection` — select who attended
- Status per member: Attended / Absent / Excused
- Week number: auto-calculated from selected date (ISO week, shown read-only)

**Table:** Member Name · Department · Week · Status · Date · Notes

---

## 5E — Admin Testimonials
**Route:** `/admin/testimonials`
**Visual:** Stitch `cbdd22bda9934deabad466716145b4de` — "Admin Testimonials Tab"

**Admin navbar:** Dashboard · Kanban · Attendance · **Testimonials**

> ⚠️ No left sidebar — full width, consistent with all other pages.

**Sub-tabs:** `DIRECTORY` · `TESTIMONIAL REQUESTS` · `ONBOARDING`

**KPI row:** Total Members · Active Members · Departments · Pending Requests (accent-gold)
**Filter row:** All Departments · All Statuses

**Request Cards (3-col desktop, 1-col mobile):**
Avatar · Name · Department · Tenure · stats (events / hours / attendance %) · quote snippet

Buttons per card:
- `GENERATE TESTIMONIAL` (accent-gold) → `/admin/testimonials/[memberId]`
- `VIEW PROFILE` (text link) → opens `MemberTestimonialView` with `headerOverride="[Member Name] Details"` prop (same component as member page, zero duplication)

---

### 5E-1 — Generate Testimonial Page
**Route:** `/admin/testimonials/[memberId]`
**Visual:** `MemberTestimonialView` (Stitch `4729d29dd8ac4ea49ee2a41bd3be1a0d`) + additions:
- `headerOverride="[Member Name] Details"` prop — page header reads "[Name] Details"
- **Generate Testimonial sidebar card** (Deep Forest bg, right column):
  - Quote snippet from member's contributions
  - `✨ Generate Testimonial` gold button

**Contribution history entries** → clickable → `ReflectionDetailModal` archived/read-only (Stitch `14367f7696f54c6ba8aded7cf39d5594`) — same component, zero duplication.

**Pressing a specific event** on this page → popup from Stitch `14367f7696f54c6ba8aded7cf39d5594` (read-only).

**Executive Endorsement (`EndorsementBlock`):**
- Inline editable quote · admin signature + name + title pre-filled from Supabase `profiles`
- `Finalise & Send` → sets `testimonials.finalised_at` · pushes to member's `/member/testimonials`

---

# ══════════════════════════════════════════════════════════════
# BLOCK 6 — SUPABASE DATA MODEL
# ══════════════════════════════════════════════════════════════

```sql
profiles          (id, name, email, avatar_url, role, department, joined_date, status)
events            (id, name, description, date, start_time, end_time, cover_url,
                   created_by, status, is_recurring)
event_members     (event_id, user_id, department, task, role, pillar_status)
contributions     (id, user_id, event_id, department, task, description, outcome,
                   priority, submitted_at)
reflections       (id, user_id, contribution_id, current_task, description, impact,
                   challenges, personal_learning, org_learning,
                   status [pending|archived], submitted_at)
attendance        (id, user_id, event_id, meeting_week, type [event|weekly_meeting],
                   status [attended|absent|excused], notes, date)
testimonial_requests (id, user_id, requested_at, status [pending|generated|sent])
testimonials      (id, user_id, generated_by, content_json, endorsement_quote,
                   endorsement_name, endorsement_title, generated_at, finalised_at)
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 7 — MIDDLEWARE & ROLE ROUTING
# ══════════════════════════════════════════════════════════════

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const role = user.user_metadata?.role
  const path = request.nextUrl.pathname

  if (path.startsWith('/admin') && role !== 'admin')
    return NextResponse.redirect(new URL('/member/dashboard', request.url))

  if (path.startsWith('/member') && role === 'admin')
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))

  return NextResponse.next()
}
export const config = { matcher: ['/admin/:path*', '/member/:path*'] }
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 8 — COMPLETE QA CHECKLIST
# ══════════════════════════════════════════════════════════════

> ✅ Done · 🔄 In Progress · ⏭ Not Started · ❌ Blocked

### A — Code Migration
- [ ] All `useNavigate` → `useRouter` from `next/navigation`
- [ ] All react-router `<Link to>` → next/link `<Link href>`
- [ ] `context/RoleContext.tsx` deleted · `routes.ts` deleted · `App.tsx` deleted
- [ ] `ImageWithFallback` → `next/image` everywhere
- [ ] `components/ui/*` copied, existing files not overwritten
- [ ] All drawer components copied and imports fixed
- [ ] `globals.css` complete · `tailwind.config.ts` has bamboo tokens
- [ ] `.env` has all three Supabase keys · `SUPABASE_SERVICE_ROLE_KEY` not in `NEXT_PUBLIC_`

### B — Landing Page (✅ Done — do not touch)

### C — Login Page
- [ ] Stitch `3ef10a2ba7f044bc8484e13d9abbdbfb` "Login Page – Event Sync" confirmed
- [ ] Split layout: bamboo photo left, form card right
- [ ] Email + Password · Google OAuth · "Create an account" link
- [ ] Invalid credentials: inline error · Loading spinner on submit
- [ ] Admin → `/admin/dashboard` · Member → `/member/dashboard`

### D — Member Navbar
- [ ] 3 nav items: Dashboard · Kanban · Testimonials · no sidebar
- [ ] Reflection badge on Kanban when pending > 0, disappears at 0
- [ ] Mobile: bottom tab bar, badge on Kanban tab

### E — Member Dashboard
- [ ] Stitch `02d24ce8b5dc471d87062599477759cd` "Member Dashboard – Updated" confirmed
- [ ] 3 KPI cards · deadline colour correct · milestones show only this member's tasks
- [ ] Clicking milestone → `/member/kanban?taskId=[id]` with task highlighted
- [ ] Upcoming meeting card · empty state when no tasks

### F — Member Kanban
- [ ] Stitch `2903932690693697399` "Member Kanban – Updated Navigation" confirmed
- [ ] Event selector · 4 pillars · correct drag rules (New→InProgress→InReview only)
- [ ] ❌ Cannot drag to Done · ❌ Cannot drag backwards · ❌ Cannot skip stages
- [ ] Moving to In Review: badge +1, toast fires
- [ ] Reflections button → ReflectionDrawer · Add Contribution → AddContributionModal
- [ ] `Filter ▾` → FilterPanel (date asc/desc, priority select)
- [ ] Drag animation · `.kanban-drop-active` drop zone · Supabase Realtime
- [ ] Mobile: snap scroll · pill tab bar · long-press drag · tap-to-move bottom sheet

### G — Add Contribution Modal
- [ ] Questions: Stitch `f9f1135b2a4d45cd88a9c085eeee8dc7` · Shell: Stitch `69af9520dab947daa0e587ecb1487ab3`
- [ ] Dept dropdown from Supabase · Task input with hyphen connector · shadow hints
- [ ] Description 30-word max (live counter) · Outcome required · Priority sliding pill
- [ ] No attachment section · "Complete Later" saves draft · Submit validates inline
- [ ] On success: card in New pillar · toast · same component in Admin Kanban ✅

### H — Reflection Drawer
- [ ] Content: Stitch `39c82fd8d712492da0514146989cf4b1` · Shell: Stitch `69af9520dab947daa0e587ecb1487ab3`
- [ ] PENDING / ARCHIVED sliding tab · "REFLECT NOW" → pending modal · Archived item → read-only modal
- [ ] Closes via ✕, overlay, Escape

### I — Reflection Detail Modal
- [ ] Content: Stitch `14367f7696f54c6ba8aded7cf39d5594` · Shell: Stitch `69af9520dab947daa0e587ecb1487ab3`
- [ ] Pending: Task 5-word limit, 5 fields 30-word limit, all with live counters
- [ ] Task + Date pre-filled read-only · "Complete Later" saves · Submit validates
- [ ] On submit: → archived, badge -1, toast "Reflection captured 🌿"
- [ ] Archived: all read-only · Export PDF · Edit Entry (reopens editable) · Close
- [ ] Reused in: Reflection Drawer ✅ · Member Testimonials ✅ · Admin member profile ✅ · Admin Testimonials event press ✅

### J — Member Testimonials
- [ ] Stitch `4729d29dd8ac4ea49ee2a41bd3be1a0d` · No sidebar · All data dynamic
- [ ] 5 performance metric cards · Contribution history timeline
- [ ] Each timeline entry → ReflectionDetailModal (archived/read-only) ✅
- [ ] "✨ Request Testimonial" → "Requested ✓" after click · member in admin queue

### K — Admin Navbar
- [ ] 4 items: Dashboard · Kanban · Attendance · Testimonials · no sidebar
- [ ] Mobile: bottom tab bar with 4 items

### L — Admin Dashboard
- [ ] Stitch `c2e6611c854944139f6f70b25ff990e2` "Admin Dashboard"
- [ ] 4 KPI cards · Tasks Due: deadline-red + `.deadline-pulse` dot
- [ ] Event cards with deadline badges · clicking → `/admin/kanban/[eventId]` ✅
- [ ] ❌ No Add Event on this page · Pending Submissions (renamed) sorted by urgency

### M — Admin Kanban (Bird's Eye)
- [ ] Stitch `3b3bc94614314044bc989098f13d2fa1` "Admin Kanban – Reference Matched"
- [ ] Deadline tags URGENT / IN VIEW / NEW / IN REVIEW (IN REVIEW only when ALL members → In Review)
- [ ] Global progress bar · avatar stack +N overflow
- [ ] `OPEN BOARD →` ✅ · per-card `Manage Members` ✅ · per-card `⋯` (Edit/Archive/Delete+confirm)
- [ ] `Filter ▾` → FilterPanel (name A-Z/Z-A by event name, date asc/desc, department)
- [ ] All filter sorts apply simultaneously across all pillars
- [ ] `+ Add ▾` dropdown: "Add Event" → CreateEventModal · "Add Contribution" → AddContributionModal ✅
- [ ] Admin drags to any pillar including Done

### N — Create Event Modal
- [ ] Content: Stitch `896ba12079964b458776428250f99184` · Shell: Stitch `69af9520dab947daa0e587ecb1487ab3`
- [ ] Event name required · Rich text editor functional · DateTimePicker with recurring toggle
- [ ] Added Members: logged-in admin pre-populated (can't remove) · search bar
- [ ] Added Members and Members sections: **identical visual style**
- [ ] Clicking member in Members list: silently adds to Added Members, Members list does NOT change
- [ ] Clicking member also opens MemberProfileDrawer (Stitch `0dbfa90e2d814190b76ee0b92fb4c3cb`)
- [ ] SAVE AS DRAFT · CREATE EVENT validates all · CANCEL has confirmation
- [ ] On success: event in New pillar · toast · Realtime push to members ✅

### O — Admin Open Board
- [ ] Stitch `a4bde1aebb384646a011ec5a6a1ddc7b` "Open Board – Task Detail"
- [ ] Breadcrumb · `Filter ▾` → FilterPanel (date default asc, name, priority, department) · `+ New Task`
- [ ] Task cards: dept badge · name · assignee · status dot · admin drags any pillar
- [ ] Realtime: member moves visible without refresh ✅

### O-1 — New Task Modal
- [ ] Same layout as CreateEventModal · header "New Task"
- [ ] Auto-scoped to current `eventId` · no event picker
- [ ] Left: task name · description (first) · MemberAssignmentSection (Added Members starts empty)
- [ ] Clicking member in Members: silently adds to Added Members, Members list unchanged
- [ ] Right: DateTimePicker deadline mode · Priority segmented pill
- [ ] On submit: task in New pillar · Realtime push to assigned members' kanban ✅

### P — Attendance Registry
- [ ] Stitch `0c50ecd175f54d29b62a2cb949807a3e` · 3-tab switcher (Members/Event Participation/Weekly)
- [ ] 4 KPI cards always visible · Filter row + Export CSV
- [ ] **Members tab:**
  - [ ] Member table with all columns
  - [ ] "Add Member" → BlurModal (`69af9520…` shell) with new member form (name, email, dept dropdown from Supabase, role, join date, avatar)
  - [ ] Clicking member row → MemberProfileDrawer (Stitch `0dbfa90e2d814190b76ee0b92fb4c3cb`) ✅
- [ ] **Event Participation tab:**
  - [ ] Default: "Not Recorded" (ended events with no attendance rows)
  - [ ] Status pills: Not Recorded · Ended · Archived
  - [ ] Horizontal card list · clicking card → detail panel (Stitch `14367f7696f54c6ba8aded7cf39d5594` shell) with MemberAssignmentSection + status selectors
  - [ ] "Add Attendance" → BlurModal with DateTimePicker + MemberAssignmentSection + status
  - [ ] Table: Member Name · Dept · Event Name · Status · Date · Notes · status badges
- [ ] **Weekly Meetings tab:**
  - [ ] "Add Attendance" → same BlurModal · week auto-calculated from date
  - [ ] Table: Member Name · Dept · Week · Status · Date · Notes
- [ ] Pagination: "Showing X–Y of Z" + PREVIOUS / NEXT

### Q — Admin Testimonials
- [ ] Stitch `cbdd22bda9934deabad466716145b4de` · No sidebar · 3 sub-tabs
- [ ] `GENERATE TESTIMONIAL` → `/admin/testimonials/[memberId]`
- [ ] `VIEW PROFILE` → MemberTestimonialView with `headerOverride="[Name] Details"` ✅ (`headerOverride?: string` prop implemented)
- [ ] Contribution entries → ReflectionDetailModal (archived/read-only) ✅ reused
- [ ] Pressing event on member profile → ReflectionDetailModal popup ✅
- [ ] Generate sidebar card · editable endorsement · admin name/title from Supabase
- [ ] `Finalise & Send` → sets `finalised_at` · pushes to member's testimonials page ✅

### R — Auth & Role Security
- [ ] Unauthenticated → `/login` · Member on `/admin/*` → `/member/dashboard`
- [ ] Admin on `/member/*` → allowed · tRPC `adminProcedure` throws FORBIDDEN for members
- [ ] RLS on all tables · members read/write own rows only · admins read all
- [ ] Logout clears session → `/login`

### S — Accessibility
- [ ] Status colours always have text labels · 2px Bamboo Green focus ring on all interactives
- [ ] Modals trap focus + return on close · All fields have `<label>` · Icon buttons have `aria-label`
- [ ] DnD has keyboard alternative · Toasts use `aria-live="polite"` · Tables have `<th scope="col">`
- [ ] `@media (prefers-reduced-motion: reduce)` disables animations · Min 44×44px tap targets

### T — Responsive & Performance
- [ ] All pages tested at 390px, 768px, 1440px — no horizontal overflow
- [ ] `next/image` everywhere · IntersectionObserver disconnects after animation
- [ ] Supabase Realtime channels unsubscribed on unmount · Search debounced 300ms
- [ ] Tables paginated server-side

### U — Real-Time Behaviour
- [ ] Member kanban ↔ admin moves visible both ways without refresh
- [ ] IN REVIEW tag updates when ALL members → In Review
- [ ] Reflection badge increments on In Review move
- [ ] New Task pushed to assigned members via Realtime ✅
- [ ] Admin testimonials: new requests appear without refresh
- [ ] Channels: `kanban-[eventId]`, `reflections-[userId]` · cleaned up in `useEffect` return

### V — Component Reuse Verification
- [ ] `FilterPanel`: Member Kanban ✅ · Admin Kanban ✅ · Admin Open Board ✅
- [ ] `AddContributionModal`: Member Kanban ✅ · Admin "Add" dropdown ✅
- [ ] `ReflectionDetailModal`: Reflection Drawer pending ✅ · archived ✅ · Member Testimonials ✅ · Admin member profile ✅ · Admin Testimonials event press ✅
- [ ] `MemberAssignmentSection`: Create Event ✅ · New Task ✅ · Attendance event ✅ · Attendance weekly ✅
- [ ] `DateTimePicker`: Create Event ✅ · New Task (deadline mode) ✅ · Attendance event ✅ · Attendance weekly ✅
- [ ] `BlurModal`: Add Contribution ✅ · Reflection Drawer ✅ · Reflection Detail ✅ · Create Event ✅ · New Task ✅ · Add Attendance ✅ · Add Member (Attendance) ✅
- [ ] `MemberTestimonialView`: Member Testimonials ✅ · Admin member profile (headerOverride) ✅
- [ ] `KanbanBoard` + `KanbanPillar` + `KanbanCard`: Member Kanban ✅ · Admin Open Board ✅
- [ ] `MemberProfileDrawer`: Attendance Members row ✅ · Create Event Members click ✅

### W — Mobile Responsiveness (390px)
- [ ] Member bottom bar: Dashboard · Kanban 🔔 · Testimonials · badge on Kanban
- [ ] Admin bottom bar: Dashboard · Kanban · Attendance · Testimonials
- [ ] Active tab: Bamboo Green dot · bottom bar: pb-safe · top navbar: logo + bell + avatar only
- [ ] KPI cards 1-col · request cards 1-col · timeline 1-col · no horizontal overflow
- [ ] Kanban: snap scroll, 85vw pillars, pill tab bar, long-press drag, tap-to-move bottom sheet
- [ ] All BlurModal: full-screen, slide up, rounded-t-3xl, swipe-down dismiss, momentum scroll, sticky footer
- [ ] All inputs ≥48px · buttons ≥48px · table rows ≥56px · kanban cards ≥80px
- [ ] Dept—Task row stacks vertically · priority pill full-width · submit buttons full-width
- [ ] Tables: horizontal scroll, Name column sticky left · Pagination: Prev / Page N / Next
- [ ] H1 36px · H2 28px · H3 22px on mobile

---

*T3 + Supabase · Member-First · Stitch ID-Based References*
*No left sidebar on any page · 1440px desktop standard · Ivory Paper backgrounds always*
*v6.0 FINAL — All Stitch IDs confirmed · FilterPanel shared component added*
