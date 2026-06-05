# 🎋 Event Sync — Product Requirements Document v5.0 (FINAL)
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
> ⚠️ Stitch screen numbers can shift by ±1. Always read the screen NAME
> to confirm before using it. The name is the source of truth.

| # | Screen Name (source of truth) | Maps to T3 file |
|---|-------------------------------|-----------------|
| 1 | Admin Dashboard | `src/app/(admin)/dashboard/page.tsx` |
| 8 | Member Kanban – Standardized Nav | `src/app/(member)/kanban/page.tsx` |
| 9 | Admin Kanban – Reference Matched | `src/app/(admin)/kanban/page.tsx` |
| 10 | Attendance Dashboard – with Add Member Button | `src/app/(admin)/attendance/page.tsx` |
| 12 | Member Profile – Elias Thorne | `src/app/(admin)/testimonials/[memberId]/page.tsx` |
| 14 | Create New Event (form content reference) | Component: `CreateEventModal` |
| 15 | Add Contribution (UI reference) | Component: `AddContributionModal` |
| 16 | Open Board – Task Detail | `src/app/(admin)/kanban/[eventId]/page.tsx` |
| 17 | Reflection Drawer – Inner Council | Component: `ReflectionDrawer` |
| 18 | Reflection Detail Card | Component: `ReflectionDetailModal` |
| 19 | **Modal shell design language only** — NOT a full page. Use its border-radius, shadow, blur overlay, and internal padding as the container for ALL popups and modals across the app. | `BlurModal` shared component |
| 20 | Member Testimonial Profile Page | `src/app/(member)/testimonials/page.tsx` |
| cbdd22… | Admin Testimonials Tab | `src/app/(admin)/testimonials/page.tsx` |

> **Stitch #19 clarification:** This is the component design system for modals —
> the shell shape, shadow depth, blur overlay, and padding. Every popup in this
> app (reflections, contributions, create event, etc.) uses this shell. It is
> not itself a page to be built.

---

## 0C — Standardised Target Dimensions
Stitch exports at varying HiDPI widths (2560px–2720px). These are NOT
different layouts — they are the same 1440px design captured at different
device pixel ratios. Always build to ALL three breakpoints below:

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
Kanban:       horizontal scroll between pillars (snap scroll)
              each pillar: min-w-[280px], shown 1 at a time
Testimonial request cards: 1-column (was 3-col)
```

**Modals on mobile:**
```
BlurModal:    100vw × 100dvh (full screen)
              slides up from bottom: translateY(100%) → translateY(0)
              rounded-t-3xl top corners only
              dismiss: swipe down or ✕ button
Drawers:      100vw full-screen (was 480px slide-in from right)
              same slide-up behaviour as modal
```

**Forms on mobile:**
```
All inputs: full-width, min-height 48px (comfortable touch)
Department—Task row: stacks vertically on mobile (dept above, task below)
Priority pills: full-width segmented control
Date picker: native mobile date input with custom styling overlay
Submit button: full-width, height 52px
```

**Tables on mobile:**
```
Attendance table: horizontal scroll, sticky first column (Member Name)
Member table: horizontal scroll, sticky first column
Pagination: simplified — Previous / Page N / Next (no page number list)
```

**Kanban drag on mobile:**
```
Long press (500ms) to initiate drag on touch devices
Visual: card scales up 1.05×, haptic feedback if supported
Drag: follow finger position
Drop: release over target pillar area
Alternative: tap card → bottom sheet appears with "Move to..." options
             listing the permitted pillars for that role
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
| `BlurModal` | Wrapper for all popups | Every modal in the app |
| `AddContributionModal` | Member Kanban | Admin Kanban (dropdown) |
| `ReflectionDrawer` | Member Kanban reflection button | — |
| `ReflectionDetailModal` | Reflection archived/pending items | — |
| `MemberAssignmentSection` | Create Event | Manage Members, Weekly Meeting Attendance, Event Participation Attendance |
| `DateTimePicker` | Create Event | Weekly Meeting Attendance, Event Participation Attendance |
| `DepartmentBadge` | Member table | Kanban cards, Attendance table |
| `DeadlineBadge` | Admin Kanban event cards | Admin Dashboard event cards |
| `KanbanPillar` | Member Kanban | Admin Kanban, Open Board |
| `KanbanCard` | Member Kanban | Admin Open Board (different props) |

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

## 0G — Build Order (Member first, then Admin)
```
1.  ✅  Landing page              DONE
2.  ⏭   Login page                (shared, auth/login)
3.  ⏭   Member Dashboard          (Stitch #5 — "Member Dashboard Updated")
4.  ⏭   Member Kanban             (Stitch #8 — "Member Kanban Standardized Nav")
5.  ⏭   Member Reflections        (Stitch #17, #18, #19 shell)
6.  ⏭   Member Testimonials       (Stitch #20)
7.  ⏭   Admin Dashboard           (Stitch #1)
8.  ⏭   Admin Kanban bird's eye   (Stitch #9)
9.  ⏭   Admin Kanban open board   (Stitch #16)
10. ⏭   Create Event modal        (Stitch #14 content + #19 shell)
11. ⏭   Add Contribution modal    (Stitch #15 UI + #19 shell — reused from member)
12. ⏭   Attendance                (Stitch #10 + new toggles)
13. ⏭   Admin Testimonials        (Stitch cbdd22… + links to Stitch #20)
```

**Prompt template per build step:**
```
Follow BLOCK 0 of the PRD (EventSync_PRD_v5_FINAL.md).
Build step #[N]: [Page name]
Visual reference: Stitch #[N] "[Screen name exactly]" — confirm the name matches before building.
Interaction spec: PRD Section [X]
Apply all colours from globals.css — ignore any background colours in Stitch.
Do not install new packages without asking.
Reuse existing components from the component reuse table in Block 0E.
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 0H — MOBILE BEHAVIOUR REFERENCE
# ══════════════════════════════════════════════════════════════

> Every screen must work at 390px. Build mobile layout alongside desktop —
> not as an afterthought. Use Tailwind responsive prefixes: default = mobile,
> `md:` = tablet (768px+), `lg:` = desktop (1024px+).

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
| Attendance table | Full columns visible | Scroll | Scroll, sticky name col |
| Member table | Full columns visible | Scroll | Scroll, sticky name col |

## Kanban on Mobile

```
Layout:       Horizontal snap scroll — one pillar visible at a time
Pillar width: min-w-[85vw] so next pillar peeks (hints at scroll)
Scroll snap:  scroll-snap-type-x mandatory, scroll-snap-align start
Pill tab bar: above kanban — [ New ] [ In Progress ] [ In Review ] [ Done ]
              tapping pill scrolls to that pillar
Drag method:  Long press (500ms) → drag, OR tap card → bottom sheet:
              "Move to: In Progress / In Review" (only valid next steps)
```

## Modal & Drawer Behaviour on Mobile

```
All BlurModal instances:
  - Full screen (100vw × 100dvh)
  - Slide UP from bottom: translateY(100%) → translateY(0), 350ms ease-out
  - Top corners rounded: rounded-t-3xl
  - Dismiss: swipe down gesture OR ✕ button (top-right)
  - Content: scrollable internally with momentum scroll (-webkit-overflow-scrolling: touch)
  - Footer buttons: sticky at bottom, full-width stacked if 2 buttons

All SlideDrawer instances:
  - Same full-screen behaviour as modal on mobile
  - Header: fixed at top with title + ✕
  - Content: scrollable
```

## Touch-Friendly Sizing

```
All tap targets:     minimum 44×44px (Apple HIG standard)
Input heights:       minimum 48px
Button heights:      minimum 48px (primary), 44px (secondary)
Row heights (table): minimum 56px
Kanban card:         minimum 80px tall
Bottom tab bar:      64px height + safe-area-inset-bottom padding
```

## Typography Adjustments on Mobile

```
H1:  56px desktop → 36px mobile
H2:  40px desktop → 28px mobile
H3:  28px desktop → 22px mobile
Body: unchanged (16px)
Bamboo label: unchanged (11px uppercase)
```

## Performance on Mobile

```
Images:       All use next/image with sizes prop for responsive loading
              e.g. sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
Animations:   Reduce on mobile — blur-in and scroll-reveal still run,
              but testimonial auto-scroll is PAUSED on mobile (too distracting)
Kanban real-time: Supabase Realtime active on mobile (same as desktop)
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
| Styling | Tailwind CSS v3 | Use token classes from globals.css |
| Auth | Supabase Auth | Role stored in `user_metadata.role` |
| Database | Supabase Postgres | RLS enforced on all tables |
| Real-time | Supabase Realtime | Live kanban updates |
| Storage | Supabase Storage | Contribution attachments |
| UI Base | shadcn/ui | Copied from Figma Make `components/ui/` |
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
│   │   │   └── page.tsx                 ← ✅ Landing page (DONE)
│   │   │
│   │   ├── (auth)/
│   │   │   └── login/page.tsx           ← Shared login for both roles
│   │   │
│   │   ├── (member)/
│   │   │   ├── layout.tsx               ← Member navbar: Dashboard | Kanban | Testimonials
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── kanban/page.tsx
│   │   │   └── testimonials/page.tsx
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx               ← Admin navbar: Dashboard | Kanban | Attendance | Testimonials
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── kanban/
│   │   │   │   ├── page.tsx             ← Bird's eye view
│   │   │   │   └── [eventId]/page.tsx   ← Open board task detail
│   │   │   ├── attendance/page.tsx
│   │   │   └── testimonials/
│   │   │       ├── page.tsx             ← Testimonial requests list
│   │   │       └── [memberId]/page.tsx  ← Member profile + generate
│   │   │
│   │   ├── api/trpc/[trpc]/route.ts
│   │   ├── globals.css                  ← All tokens, animations, utility classes
│   │   └── layout.tsx                   ← Root layout: fonts, providers, toasts
│   │
│   ├── components/
│   │   ├── ui/                          ← shadcn (from Figma Make, copy as-is)
│   │   │
│   │   ├── shared/                      ← Used by both roles
│   │   │   ├── AppNavbar.tsx            ← Role-aware top navbar
│   │   │   ├── BlurModal.tsx            ← Stitch #19 shell — ALL modals use this
│   │   │   ├── DeadlineBadge.tsx        ← Urgent / Due Soon / On Track pill
│   │   │   ├── DepartmentBadge.tsx      ← 6 colour-coded department pills
│   │   │   ├── ProgressRing.tsx         ← SVG animated ring
│   │   │   ├── SlideDrawer.tsx          ← From Figma Make (fix imports)
│   │   │   └── ToastProvider.tsx
│   │   │
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx          ← 4-column DnD board
│   │   │   ├── KanbanPillar.tsx         ← Single column (reused member + admin)
│   │   │   ├── KanbanCard.tsx           ← Task card (isDraggable prop for role control)
│   │   │   ├── AddContributionModal.tsx ← Stitch #15 UI + #19 shell (member + admin)
│   │   │   ├── CreateEventModal.tsx     ← Stitch #14 content + #19 shell (admin only)
│   │   │   └── MemberAssignmentSection.tsx ← Reusable: Create Event, Attendance
│   │   │
│   │   ├── reflections/
│   │   │   ├── ReflectionDrawer.tsx     ← Stitch #17 — Inner Council side panel
│   │   │   └── ReflectionDetailModal.tsx← Stitch #18 — detail view (pending + archived)
│   │   │
│   │   ├── testimonials/
│   │   │   ├── MemberTestimonialView.tsx← Stitch #20 (member page)
│   │   │   ├── AdminTestimonialCard.tsx ← Stitch cbdd22… request card
│   │   │   └── EndorsementBlock.tsx     ← Executive endorsement + signature
│   │   │
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx
│   │   │   ├── OngoingEventCard.tsx     ← Admin dashboard event card
│   │   │   └── PendingSubmissionItem.tsx
│   │   │
│   │   └── attendance/
│   │       ├── AttendanceTable.tsx
│   │       └── DateTimePicker.tsx       ← Reused: Create Event + Attendance
│   │
│   ├── server/api/
│   │   ├── root.ts
│   │   └── routers/
│   │       ├── events.ts
│   │       ├── members.ts
│   │       ├── contributions.ts
│   │       ├── attendance.ts
│   │       ├── reflections.ts
│   │       ├── testimonials.ts
│   │       └── dashboard.ts
│   │
│   ├── trpc/
│   │   ├── server.ts
│   │   └── react.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── constants.ts                 ← Image URLs, dept colours, shared data
│   │
│   └── types/index.ts
│
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── middleware.ts                         ← Auth + role routing guard
├── tailwind.config.ts
└── .env
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 3 — SHARED PAGES
# ══════════════════════════════════════════════════════════════

## 3A — Login Page
**Route:** `/login` · **Visual:** Stitch #4 "Login Page – Event Sync"

Split layout — left: bamboo grove full-height photo, right: centred login card.

**Form fields:** Email · Password · "Sign In" button · "Sign in with Google" OAuth · "New? Create an account" link

**Auth routing on success:**
```
role === 'admin'  → /admin/dashboard
role === 'member' → /member/dashboard
```

---

# ══════════════════════════════════════════════════════════════
# BLOCK 4 — MEMBER VIEWS
# ══════════════════════════════════════════════════════════════

> **Member navbar (top, no sidebar):** Dashboard · Kanban · Testimonials
> The Kanban nav item shows a reflection badge count (red circle, number)
> that increments when tasks move to In Review.

---

## 4A — Member Dashboard
**Route:** `/member/dashboard` · **Visual:** Stitch #5 "Member Dashboard (Updated)"

**3 KPI cards (top row):**
- Remaining Tasks — large number
- Completion Rate — percentage with progress bar
- Next Deadline — date in Deep Forest, event name below, deadline colour applied

**Pending Milestones list:**
Each row: dept icon · task name · event name · deadline badge · chevron
Clicking a row → `/member/kanban` with that task highlighted

**Upcoming Meeting card (right):**
Next scheduled meeting details + attendee avatars

---

## 4B — Member Kanban Board
**Route:** `/member/kanban` · **Visual:** Stitch #8 "Member Kanban – Standardized Nav"

**Top right buttons:**
- `Reflections 🔔 [N]` pill → opens ReflectionDrawer (see 4C)
- `+ Add Contribution` → opens AddContributionModal (see 4B-1)

**Event selector dropdown** — member picks which event to view

**4 pillars:** New · In Progress · In Review · Done

**Member drag rules:**
- ✅ New → In Progress → In Review (sequential only, no skipping)
- ❌ Cannot drag to Done (admin-only pillar destination)
- ❌ Cannot drag backwards
- On move to In Review: reflection badge +1 on navbar, toast fires

**Task card (member view):**
```
[DEPT BADGE]
Task name (DM Sans SemiBold)
📅 Due: date  ·  Assigned by: Admin
```

---

### 4B-1 — Add Contribution Modal
**Trigger:** `+ Add Contribution` button · **Visual:** Stitch #15 UI inside Stitch #19 shell
**Component:** `AddContributionModal` (reused by admin kanban dropdown)

**Header:** "Add Contribution" (Playfair Display H2) inside BlurModal shell

**Form fields (in order):**

| Field | Type | Rules |
|-------|------|-------|
| Department | Dropdown (left box) | All 6 departments |
| Task | Text input (right box) | Connects to dept with hyphen · shadowed hint text shows format |
| Detailed Description | Textarea | Max 30 words · live word counter |
| Aimed Result / Outcome | Textarea | Required |
| Priority Level | Segmented pill | Low / Medium / High · sliding indicator |

> ⚠️ Remove the attachment/file upload section entirely.

**Department—Task row layout:**
```
[ Department ▾ ] — [ Task input          ]
   dropdown left       text right, hyphen joins them
   shadow hint: "e.g. Publicity"    "e.g. Slides"
```

**Bottom:** "Complete Later" text link (left) · "Submit Contribution" dark button (right)

---

## 4C — Reflections
**Trigger:** `Reflections 🔔` button in member kanban navbar
**Visual:** Stitch #17 "Reflection Drawer – Inner Council" — resized to Stitch #19 shell dimensions

**Component:** `ReflectionDrawer` opens inside BlurModal shell

**Tab switcher:** `PENDING (N)` · `ARCHIVED`

---

### PENDING tab
Lists unprocessed reflection items. Each item shows:
- Task name (bold) · time since completed (e.g. "2D AGO")
- 1-line snippet · `↪ REFLECT NOW` link

**Pressing any PENDING item → opens ReflectionDetailModal (see 4C-1)**

---

### ARCHIVED tab
Lists completed reflections. Each item shows same card style.
**Pressing any ARCHIVED item → opens ReflectionDetailModal in read-only view (see 4C-1)**

---

### 4C-1 — Reflection Detail Modal
**Visual:** Stitch #18 "Reflection Detail Card" · inside Stitch #19 shell
**Component:** `ReflectionDetailModal` (mode prop: `'pending'` | `'archived'`)

**Pending mode (editable form):**

| Field | Label | Limit |
|-------|-------|-------|
| Task | CURRENT TASK | 5 words max |
| Description | WHAT TOOK PLACE? | 30 words max |
| Impact | IMPACT ON SYAI | 30 words max |
| Challenges | CHALLENGES FACED | 30 words max |
| Personal Learning | PERSONAL LEARNING POINTS | 30 words max |
| Org Learning | ORGANISATIONAL LEARNING POINTS | 30 words max |

Task + Date Completed pre-filled and read-only.
Bottom: "Complete Later" · "Submit Reflection" button

**On submit:** item moves to Archived · badge decrements · toast "Reflection captured 🌿"

**Archived mode (read-only):**
Same Stitch #18 layout — shows all fields populated, no edit inputs.
Bottom actions: `Export as PDF` · `Edit Entry` (reopens in pending/editable mode) · `Close`

---

## 4D — Member Testimonials
**Route:** `/member/testimonials` · **Visual:** Stitch #20 "Member Testimonial Profile Page"

> ⚠️ Remove the left navigation sidebar entirely. Page fills full width.
> All data is dynamic — no hardcoded names or values.

**Layout (document-style, centred, white surface card):**

**Header:**
"OFFICIAL DOCUMENT" (bamboo-label) · "Request Testimonial" (H1 Playfair)
Sub: evaluation description

**Member profile row (2 column):**
Left: name, email · Right: issue date, ref number

**Performance Metrics (5 cards):**
Events Contributed · Weekly Attendance % · Project Leads · Collaborations · Total Hours

**Contribution History timeline:**
Left: date + hours · vertical bamboo-green line with node dots · Right: title + description
Each entry is **clickable** → opens `ReflectionDetailModal` in archived/read-only mode (Stitch #18)
This reuses the same component from 4C-1.

**Executive Endorsement block (bottom):**
Italic quote · handwritten signature · printed name + title

**Request Testimonial button:**
Visible only if no testimonial generated yet.
Gold button: "✨ Request Testimonial"
On click: request sent, button state → "Requested ✓", member appears in Admin Testimonials tab.

---

# ══════════════════════════════════════════════════════════════
# BLOCK 5 — ADMIN VIEWS
# ══════════════════════════════════════════════════════════════

> **Admin navbar (top, no sidebar):** Dashboard · Kanban · Attendance · Testimonials

---

## 5A — Admin Dashboard
**Route:** `/admin/dashboard` · **Visual:** Stitch #1 "Admin Dashboard"

**Page label:** "EXCO DASHBOARD" (bamboo-label)
**Page heading:** "Current Event Progress" (Playfair Display italic)

**4 KPI cards:**
- Active Events · Total Members · Completion Rate · Tasks Due (red number + pulsing dot)

**Ongoing Initiatives (left):**
Event cards with: cover photo · deadline badge (Urgent/Planning/On Track) · event name · description · progress bar · member avatar stack · chevron
**Clicking event card → `/admin/kanban/[eventId]` (Open Board)**
❌ No "Add Event" button on dashboard — adding events is done from Kanban only.

**Pending Submissions (right, renamed from "Pending Syncs"):**
Tasks submitted late by subcomm members from their kanban board.
Each item: dept label · task name · due time · assignee
`ADD NEW TASK` button links to relevant kanban board.

---

## 5B — Admin Kanban Board (Bird's Eye)
**Route:** `/admin/kanban` · **Visual:** Stitch #9 "Admin Kanban – Reference Matched"

**Page heading:** "Kanban Board"
**Sub-label:** "EXCO VIEW · N ACTIVE EVENTS"

**Top-right controls:**
- `Filter ▾` button — dropdown with Date option only. When Date is selected, all event cards sort ascending or descending across all pillars by date. (Replaces Manage Members button at page level)
- `+ Add Event [▾]` — split button:
  - Main area: opens CreateEventModal (5B-1)
  - Small chevron `▾` on right: dropdown showing `Add Event` · `Add Contribution`
  - `Add Contribution` reuses `AddContributionModal` from member (4B-1)
  - Increase button length to accommodate the split chevron area

**4 pillars:** New · In Progress · In Review · Done

**Event card per pillar:**
```
[DEADLINE TAG]         Event Name          [⋯]
Date · Initiative type

GLOBAL PROGRESS: [NEW▓] [PROG▓] [REVW▓] [DONE▓]

[Avatar stack] +N    [OPEN BOARD →]    [Manage Members]
```

**Deadline tags (based on event date):**
- URGENT → deadline red (≤7 days)
- IN VIEW → deadline amber (8–14 days)  
- NEW → deadline green (15+ days)
- IN REVIEW → deadline amber, triggered ONLY when ALL assigned members have moved their tasks to In Review

**Per-card Manage Members button** → opens `ManageMembersDrawer` (from Figma Make, reuse)

**Admin drag rules:** Can drag event cards to any pillar including Done.

---

### 5B-1 — Create Event Modal
**Trigger:** Main area of `+ Add Event` button
**Visual:** Stitch #14 form content · inside Stitch #19 shell
**Component:** `CreateEventModal`

**BlurModal shell** (Stitch #19 dimensions and design language)

**Left column:**
- EVENT IDENTITY: large text input "Enter a memorable name..."
- NARRATIVE & PURPOSE: rich text editor (B · I · List · Quote toolbar)
- TEAM COMPOSITION heading
  - **Added Members** sub-section (new):
    - First entry is always the **currently logged-in admin** (pre-populated, cannot be removed)
    - Search bar to find and add more members
    - Each added member row: `[✕ remove]` · avatar · name · dept · task · role
  - **Existing Members** sub-section (as seen in Stitch #14):
    - Lists all other members not yet added, can click to add

**Right column:**
- SCHEDULE & TIMING: Date picker (`DateTimePicker` component) · Start Time · End Time · Recurring toggle
- Cover image: preview thumbnail + "CHANGE COVER" button

**Footer:** `CANCEL` · `SAVE AS DRAFT` · `CREATE EVENT`

---

## 5C — Admin Kanban Open Board
**Route:** `/admin/kanban/[eventId]` · **Visual:** Stitch #16 "Open Board – Task Detail"

**Breadcrumb:** `← BACK TO KANBAN / [EVENT NAME]`
**Page heading:** Event name · task count · dept count
**Top-right:** `Filter` · `+ New Task`

Reuses `KanbanBoard` + `KanbanPillar` + `KanbanCard` components.
Task cards: dept badge · task name · assignee avatar + name · status dot
Admin can drag to any pillar including Done.
Real-time: member card moves visible instantly via Supabase Realtime.

---

## 5D — Attendance Registry
**Route:** `/admin/attendance` · **Visual:** Stitch #10 "Attendance Dashboard – with Add Member Button"

**Adjusted admin navbar** to include Attendance (Dashboard · Kanban · **Attendance** · Testimonials)

**Page heading:** "Attendance Registry"

**3-tab switcher (pill segmented, add Members as first tab):**
`Members` · `Event Participation` · `Weekly Meetings`

**KPI stats row (4 cards, always visible):**
Total Events · Avg Attendance % · Highest Rate (event name) · Lowest Rate (event name)

**Filter row:** Event selector · Date Range · Department · Export Report button

---

### Members tab
Full member database table (same columns as PRD member table).
Reuses `AttendanceTable` with member data source.

---

### Event Participation tab
**Adjusted "Add Member" button → renamed "Add Attendance"**
Clicking "Add Attendance" → opens BlurModal (Stitch #19 shell) containing:
- `DateTimePicker` component (reused from Create Event)
- `MemberAssignmentSection` component (reused from Create Event: Added Members + search)
- Status selector per member: Attended / Absent / Excused

Table columns: Member Name · Department · Event Name · Status · Date · Notes
Status badges: ● Attended (green) · ● Absent (red) · ● Excused (amber)

---

### Weekly Meetings tab
Same structure as Event Participation tab.
"Add Attendance" button opens same modal with:
- `DateTimePicker` (reused) — for the meeting date + time
- `MemberAssignmentSection` (reused) — select who attended
- Week number auto-calculated from selected date

Table columns: Member Name · Department · Week · Status · Date · Notes

---

## 5E — Admin Testimonials
**Route:** `/admin/testimonials` · **Visual:** Stitch `cbdd22bda9934deabad466716145b4de`

**Adjusted admin navbar** to include Testimonials (Dashboard · Kanban · Attendance · **Testimonials**)
**No left sidebar** — full width layout consistent with all other pages.

**Sub-tabs:** `DIRECTORY` · `TESTIMONIAL REQUESTS` · `ONBOARDING`

**KPI row:** Total Members · Active Members · Departments · Pending Requests (gold)
**Filter row:** All Departments · All Statuses

**Testimonial Request Cards (3-column grid):**
Avatar · Name · Department · tenure · 3 stats (events/hours/attendance) · quote snippet
`GENERATE TESTIMONIAL` gold button · `VIEW PROFILE` link

**VIEW PROFILE → links to Stitch #20** (reuses `MemberTestimonialView` component from `/member/testimonials`)
This is the same component — no duplication.

**Generate Testimonial flow:**
- Navigates to `/admin/testimonials/[memberId]`
- Reuses Stitch #20 layout (MemberTestimonialView)
- Adds **Generate Testimonial sidebar card** (right column, dark Deep Forest bg):
  - Quote snippet · `✨ Generate Testimonial` gold button
- Clicking contribution history entries → `ReflectionDetailModal` (Stitch #18, archived/read-only)
  - Same component from 4C-1 — no duplication
- Bottom of generated doc: **Executive Endorsement block** (EndorsementBlock component)
  - Inline editable quote · admin signature pre-filled from their profile
  - `Finalise & Send` → pushes testimonial to member's `/member/testimonials` page

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

---

### A — Code Migration
- [ ] All `useNavigate` → `useRouter` from `next/navigation`
- [ ] All react-router `<Link to>` → next/link `<Link href>`
- [ ] `context/RoleContext.tsx` deleted
- [ ] `routes.ts` deleted
- [ ] `App.tsx` deleted
- [ ] `ImageWithFallback` replaced with `next/image` everywhere
- [ ] `components/ui/*` copied, existing files not overwritten
- [ ] All drawer components copied and imports fixed
- [ ] `globals.css` has all token variables, animations, and utility classes
- [ ] `tailwind.config.ts` has bamboo colour tokens as named utilities
- [ ] `.env` has all three Supabase keys (not `.env.local`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT in any `NEXT_PUBLIC_` variable

---

### B — Landing Page (✅ Done — do not rebuild)
- [ ] Confirmed complete and not modified during other build steps

---

### C — Login Page
- [ ] Split layout: bamboo photo left, form card right
- [ ] Email + Password fields with `.es-input` class
- [ ] Google OAuth button present
- [ ] Invalid credentials: inline error (not toast only)
- [ ] Admin login → `/admin/dashboard`
- [ ] Member login → `/member/dashboard`
- [ ] Loading spinner on submit button while authenticating

---

### D — Member Navbar
- [ ] Top navbar only — no left sidebar
- [ ] 3 nav items: Dashboard · Kanban · Testimonials
- [ ] Reflection badge count shows on Kanban item when pending > 0
- [ ] Badge disappears when count reaches 0
- [ ] Active nav item visually distinct (Bamboo Green underline or bold)

---

### E — Member Dashboard
- [ ] 3 KPI cards render (Remaining Tasks, Completion %, Next Deadline)
- [ ] Deadline card uses correct colour (red/amber/green)
- [ ] Pending milestones list shows THIS member's tasks only
- [ ] Clicking milestone → member kanban with task highlighted
- [ ] Upcoming meeting card shows next meeting details
- [ ] Empty state shown when no tasks assigned

---

### F — Member Kanban
- [ ] Event selector dropdown changes displayed tasks
- [ ] 4 pillars visible, correct header colours
- [ ] Member can drag New → In Progress ✅
- [ ] Member can drag In Progress → In Review ✅
- [ ] Member CANNOT drag to Done ❌
- [ ] Member CANNOT drag backwards ❌
- [ ] Sequential-only dragging enforced (cannot skip from New → In Review)
- [ ] Moving to In Review: reflection badge +1, toast fires
- [ ] `Reflections 🔔 [N]` button opens ReflectionDrawer
- [ ] `+ Add Contribution` opens AddContributionModal
- [ ] Drag animation: lift, opacity, slight rotate
- [ ] Drop zone: dashed border + Sage Mist bg
- [ ] Real-time: admin card moves visible to member (Supabase Realtime)
- [ ] Empty pillar shows placeholder text

---

### G — Add Contribution Modal
- [ ] BlurModal shell matches Stitch #19 design language
- [ ] Background blurred behind modal
- [ ] Close via ✕, overlay click, or Escape key
- [ ] Department dropdown has all 6 options
- [ ] Task input connected with hyphen to dept visually
- [ ] Shadow hint text shows in both dept and task boxes
- [ ] Description: 30 word max with live counter
- [ ] Outcome textarea: required
- [ ] Priority: 3 options (Low/Medium/High) with sliding pill indicator
- [ ] No attachment section (removed)
- [ ] "Complete Later" saves as draft
- [ ] Submit validates all required fields, inline errors shown
- [ ] On success: modal closes, card appears in member's New pillar, toast fires
- [ ] Admin kanban dropdown "Add Contribution" uses this same component ✅

---

### H — Reflection Drawer
- [ ] Opens inside BlurModal shell (Stitch #19 dimensions)
- [ ] Content from Stitch #17 Inner Council design
- [ ] PENDING / ARCHIVED tab switcher works (sliding pill indicator)
- [ ] Pending tab: lists unprocessed items with task name, time ago, snippet
- [ ] "REFLECT NOW" link opens ReflectionDetailModal in editable mode
- [ ] Archived tab: lists completed reflections
- [ ] Archived item click opens ReflectionDetailModal in read-only mode
- [ ] "BATCH ARCHIVE ALL" archives all pending with confirmation dialog
- [ ] Drawer closes via ✕, overlay click, or Escape key

---

### I — Reflection Detail Modal
- [ ] BlurModal shell (Stitch #19)
- [ ] Content layout from Stitch #18
- [ ] Pending mode: Task (5 word limit enforced), 5 textarea fields (30 word limit each)
- [ ] Task + Date Completed pre-filled, read-only
- [ ] Word counters visible on all fields
- [ ] "Complete Later" saves draft, closes modal
- [ ] Submit validates all fields, shows inline errors
- [ ] On submit: item → archived, badge -1, toast fires
- [ ] Archived mode: all fields read-only, no edit inputs
- [ ] Archived mode bottom: Export PDF · Edit Entry · Close
- [ ] "Edit Entry" switches back to pending/editable mode
- [ ] Same component reused from member testimonials contribution history ✅

---

### J — Member Testimonials
- [ ] No left sidebar — full width layout
- [ ] All data dynamic (no hardcoded names)
- [ ] Document-style layout, centred
- [ ] Member profile header: name, email, issue date, ref number
- [ ] 5 performance metric cards in a row
- [ ] Contribution history timeline: date + hours left, content right
- [ ] Each timeline entry clickable → ReflectionDetailModal (archived/read-only) ✅ reused
- [ ] Executive Endorsement block at bottom
- [ ] "✨ Request Testimonial" button visible if not yet requested
- [ ] After requesting: button → "Requested ✓", member appears in Admin Testimonials

---

### K — Admin Navbar
- [ ] Top navbar only — no left sidebar on any admin page
- [ ] 4 nav items: Dashboard · Kanban · Attendance · Testimonials
- [ ] Active nav item visually distinct

---

### L — Admin Dashboard
- [ ] 4 KPI cards render correctly
- [ ] Tasks Due card: red number + pulsing dot when > 0
- [ ] Ongoing Initiatives: event cards with cover images, deadline badges
- [ ] Deadline tags: URGENT / IN VIEW / NEW based on date proximity
- [ ] Clicking event card → `/admin/kanban/[eventId]` (Open Board) ✅
- [ ] ❌ No Add Event button on this page
- [ ] Pending Submissions (renamed): loads late subcomm submissions
- [ ] Items sorted by urgency

---

### M — Admin Kanban (Bird's Eye)
- [ ] 4 pillars with event cards
- [ ] Deadline tags correct: URGENT/IN VIEW/NEW/IN REVIEW per logic
- [ ] IN REVIEW tag ONLY when ALL members have moved to In Review
- [ ] Global progress bar: 4 coloured segments, correct proportions
- [ ] Avatar stack: max 3 shown + "+N" overflow
- [ ] `OPEN BOARD →` → `/admin/kanban/[eventId]` ✅
- [ ] Per-card `Manage Members` → ManageMembersDrawer ✅
- [ ] Per-card `⋯` menu: Edit · Archive · Delete (delete has confirmation)
- [ ] `Filter ▾` button: dropdown with date sort (ascending/descending)
- [ ] Date sort affects cards across ALL pillars simultaneously
- [ ] `+ Add Event [▾]` split button: main area → CreateEventModal
- [ ] Split chevron dropdown: Add Event · Add Contribution
- [ ] Add Contribution → AddContributionModal (reused from member) ✅
- [ ] Admin can drag event cards to any pillar including Done

---

### N — Create Event Modal
- [ ] BlurModal shell (Stitch #19 design language)
- [ ] Form content from Stitch #14
- [ ] Event name large input: required
- [ ] Rich text editor: Bold, Italic, List, Quote toolbar work
- [ ] DateTimePicker: date, start time, end time, recurring toggle
- [ ] Recurring toggle works
- [ ] Cover image: file picker, preview updates
- [ ] Added Members section: logged-in admin pre-populated first, cannot be removed
- [ ] Search bar finds members from database
- [ ] Each added member: [✕ remove], avatar, name, dept, task, role picker
- [ ] Existing Members section below Added Members (from Stitch #14)
- [ ] DRAFT STATUS label updates as user types
- [ ] SAVE AS DRAFT: partial save allowed
- [ ] CREATE EVENT: validates all required fields
- [ ] On success: modal closes, new card in New pillar, toast fires
- [ ] CANCEL shows confirmation dialog before discarding

---

### O — Admin Kanban Open Board
- [ ] Breadcrumb: ← BACK TO KANBAN / EVENT NAME
- [ ] Event name, description, task count header
- [ ] Filter button works
- [ ] `+ New Task` opens task creation
- [ ] 4 pillars render with task count badges
- [ ] Task cards: dept badge, task name, assignee, status dot
- [ ] Drag handle visible on hover (left edge)
- [ ] Admin drags to any pillar including Done ✅
- [ ] Real-time: member moves visible without refresh ✅

---

### P — Attendance Registry
- [ ] Admin navbar shows Attendance tab
- [ ] 3-tab switcher: Members · Event Participation · Weekly Meetings
- [ ] Tab sliding indicator animation works
- [ ] 4 KPI stat cards always visible
- [ ] Members tab: full member database table
- [ ] Event Participation tab: "Add Member" → renamed "Add Attendance"
- [ ] Add Attendance modal: DateTimePicker + MemberAssignmentSection (reused) ✅
- [ ] Status selector per member: Attended / Absent / Excused
- [ ] Table: Member Name · Dept · Event Name · Status · Date · Notes
- [ ] Status badges: coloured dot + text label
- [ ] Weekly Meetings tab: same "Add Attendance" modal (reused) ✅
- [ ] Week number auto-calculated from date picker selection
- [ ] Weekly table: Member Name · Dept · Week · Status · Date · Notes
- [ ] Export Report downloads filtered CSV
- [ ] Pagination: "Showing X–Y of Z results" + PREVIOUS / NEXT

---

### Q — Admin Testimonials
- [ ] Admin navbar shows Testimonials tab
- [ ] No left sidebar — full width layout consistent with all pages
- [ ] 3 sub-tabs: Directory · Testimonial Requests · Onboarding
- [ ] KPI row: Total · Active · Departments · Pending (gold)
- [ ] Filter: All Departments · All Statuses
- [ ] Request cards: 3-column grid, avatar, stats, quote snippet
- [ ] `GENERATE TESTIMONIAL` gold button → `/admin/testimonials/[memberId]`
- [ ] `VIEW PROFILE` → links to Stitch #20 view (MemberTestimonialView reused) ✅
- [ ] Member profile page: contribution history entries → ReflectionDetailModal ✅ reused
- [ ] Generate Testimonial sidebar card visible on member profile page
- [ ] Executive Endorsement block at bottom of generated doc
- [ ] Endorsement quote editable inline by admin
- [ ] Admin name/title pre-fills from their Supabase profile
- [ ] `Finalise & Send` pushes to member's `/member/testimonials` ✅

---

### R — Auth & Role Security
- [ ] Middleware redirects unauthenticated → `/login`
- [ ] Member visiting `/admin/*` → `/member/dashboard`
- [ ] Admin visiting `/member/*` → allowed
- [ ] All tRPC `adminProcedure` routes throw FORBIDDEN for members
- [ ] RLS enabled on all Supabase tables
- [ ] Members can only read their own `event_members` rows (RLS tested)
- [ ] Members can only read/write their own `reflections` (RLS tested)
- [ ] Members can only read their own `testimonials` (RLS tested)
- [ ] Admins can read all tables (RLS tested)
- [ ] Logout clears session, returns to `/login`

---

### S — Accessibility
- [ ] All status colours have text labels (never colour-only)
- [ ] All interactive elements have focus states (2px Bamboo Green outline)
- [ ] All modals trap focus when open
- [ ] All modals return focus to trigger element on close
- [ ] All form fields have visible `<label>` elements
- [ ] All icon-only buttons have `aria-label`
- [ ] Drag-and-drop has keyboard alternative (arrow keys + Enter)
- [ ] Toast notifications use `aria-live="polite"`
- [ ] Tables have `<th scope="col">` on all headers
- [ ] `@media (prefers-reduced-motion: reduce)` disables non-essential animations
- [ ] All pages have meaningful `<title>` elements
- [ ] Minimum 44×44px tap targets on mobile

---

### T — Responsive & Performance
- [ ] All pages tested at 390px, 768px, 1440px — no horizontal scroll
- [ ] Kanban board horizontally scrollable on mobile
- [ ] All modals full-screen on mobile
- [ ] All drawers full-width on mobile
- [ ] `next/image` used for all images (automatic optimisation)
- [ ] Hero/cover images use `priority` prop where above fold
- [ ] IntersectionObserver disconnects after element has animated in
- [ ] Supabase Realtime channels unsubscribed on component unmount
- [ ] Search inputs debounced (300ms minimum)
- [ ] Tables paginated server-side

---

### U — Real-Time Behaviour
- [ ] Member kanban: admin task moves visible without refresh
- [ ] Admin kanban: member task moves visible without refresh
- [ ] Reflection badge increments in real-time when task → In Review
- [ ] Admin testimonials: new requests appear without refresh
- [ ] Supabase channels named: `kanban-[eventId]`, `reflections-[userId]`
- [ ] All channels cleaned up in `useEffect` return

---

### V — Component Reuse Verification
- [ ] `AddContributionModal` used in: Member Kanban ✅ · Admin Kanban dropdown ✅
- [ ] `ReflectionDetailModal` used in: Reflection Drawer (pending) ✅ · Reflection Drawer (archived) ✅ · Member Testimonials contribution history ✅ · Admin member profile contribution history ✅
- [ ] `MemberAssignmentSection` used in: Create Event ✅ · Attendance (event) ✅ · Attendance (weekly) ✅
- [ ] `DateTimePicker` used in: Create Event ✅ · Attendance (event) ✅ · Attendance (weekly) ✅
- [ ] `BlurModal` shell used in: Add Contribution ✅ · Reflection Drawer ✅ · Reflection Detail ✅ · Create Event ✅ · Add Attendance ✅
- [ ] `MemberTestimonialView` used in: Member Testimonials page ✅ · Admin member profile ✅
- [ ] `KanbanBoard` + `KanbanPillar` + `KanbanCard` used in: Member Kanban ✅ · Admin Open Board ✅

### W — Mobile Responsiveness (390px)

**Navigation**
- [ ] Bottom tab bar renders on mobile (fixed bottom-0, Deep Forest bg)
- [ ] Member bottom bar: Dashboard · Kanban 🔔 · Testimonials (3 tabs)
- [ ] Admin bottom bar: Dashboard · Kanban · Attendance · Testimonials (4 tabs)
- [ ] Active tab shows Bamboo Green dot indicator
- [ ] Bottom bar has iOS safe-area padding (pb-safe)
- [ ] Top navbar on mobile: logo + bell + avatar only (no nav links)
- [ ] Reflection badge shows on Kanban tab icon (bottom bar)

**Layout Collapse**
- [ ] KPI cards: 4-col desktop → 1-col mobile stack
- [ ] Testimonial request cards: 3-col → 1-col
- [ ] Contribution timeline: 2-col → 1-col (date above content)
- [ ] Performance metric cards: 5-col row → 2+3 wrap on mobile
- [ ] Ongoing event cards: horizontal scroll → 1-col stack
- [ ] No horizontal overflow on any page at 390px

**Kanban on Mobile**
- [ ] Pillars display as horizontal snap-scroll (one visible at a time)
- [ ] Each pillar min-width 85vw, next pillar peeks at edge
- [ ] Pill tab bar above kanban scrolls to selected pillar
- [ ] Long press (500ms) initiates card drag on touch
- [ ] Tap-to-move alternative: tapping card opens bottom sheet with valid pillar options
- [ ] Member: bottom sheet only shows New / In Progress / In Review (not Done)
- [ ] Admin: bottom sheet shows all 4 pillars

**Modals & Drawers on Mobile**
- [ ] All BlurModal instances: full-screen (100vw × 100dvh)
- [ ] Modals slide up from bottom (not fade-in from centre)
- [ ] Top corners rounded (rounded-t-3xl), bottom corners flush
- [ ] Swipe-down gesture dismisses modal
- [ ] Modal content is internally scrollable with momentum scroll
- [ ] Sticky footer buttons inside modals (full-width stacked if 2 buttons)
- [ ] All drawers: full-screen on mobile (not 480px side panel)

**Touch Targets & Forms**
- [ ] All tap targets minimum 44×44px
- [ ] All input heights minimum 48px
- [ ] Primary buttons minimum 48px height
- [ ] Table row heights minimum 56px
- [ ] Kanban cards minimum 80px tall
- [ ] Department—Task row stacks vertically on mobile (dept above, task below)
- [ ] Priority pill control is full-width on mobile
- [ ] Date picker uses native mobile input with custom styling overlay
- [ ] Submit buttons full-width on mobile

**Tables on Mobile**
- [ ] Attendance table: horizontal scroll, Member Name column sticky left
- [ ] Member directory table: horizontal scroll, Name column sticky left
- [ ] Pagination simplified: Previous / Page N / Next only

**Typography on Mobile**
- [ ] H1: 36px on mobile (56px desktop)
- [ ] H2: 28px on mobile (40px desktop)
- [ ] H3: 22px on mobile (28px desktop)
- [ ] Body, labels, badges: unchanged

**Images & Performance**
- [ ] All `next/image` components have correct `sizes` prop for responsive loading
- [ ] Testimonial auto-scroll paused on mobile (too distracting on small screen)
- [ ] Blur-in and scroll-reveal animations still run on mobile
- [ ] `@media (prefers-reduced-motion: reduce)` disables all animations

**Cross-Device Testing**
- [ ] Tested on iOS Safari (390px iPhone 14)
- [ ] Tested on Android Chrome (390px)
- [ ] Tested on iPad (768px)
- [ ] Tested on 1440px desktop Chrome
- [ ] No layout breaks with longer member names on mobile
- [ ] No layout breaks with long task strings on mobile kanban cards

---
*T3 + Supabase · Member-First · Stitch + Figma Make Migration*
*No left sidebar on any page · 1440px desktop standard · Ivory Paper backgrounds always*
