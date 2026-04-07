# EventSync — Admin Testimonials
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-admin-testimonials.png`
- Stitch ID: `cbdd22bda9934deabad466716145b4de` — "Admin Testimonials Tab"

## Files to Build
`src/app/(admin)/testimonials/page.tsx`
`src/app/(admin)/testimonials/[memberId]/page.tsx`

---

## Page Layout
No left sidebar. Full-width. Max-width container.
Background: `var(--ivory-paper)`

---

## Page Header
```
Label: "TESTIMONIALS" — .bamboo-label
H1:    Playfair Display italic
```

---

## 3 Sub-tabs (sliding pill)
```
[ DIRECTORY ] [ TESTIMONIAL REQUESTS ] [ ONBOARDING ]
```

---

## KPI Row (always visible across all tabs)
```
4 cards:
  Total Members     — var(--charcoal-ink)
  Active Members    — var(--bamboo-green)
  Departments       — var(--charcoal-ink) — count of distinct departments
  Pending Requests  — var(--accent-gold) colour for number
```

## Filter Row
```
[ All Departments ▾ ] [ All Statuses ▾ ]
Departments: Software · Inspire · Meet-ups · Publicity · Connectors · Labs
Pulled from Supabase — NOT hardcoded
```

---

## TESTIMONIAL REQUESTS Tab (primary view)

### Request Cards
```
Desktop: 3-column grid
Tablet:  2-column grid
Mobile:  1-column stack

Each card: var(--cream-white), .card-shadow, rounded-2xl, p-6
```

**Card Layout:**
```
[Avatar — 48px circle]
[Member Name — DM Sans SemiBold]
[Department badge]
[Tenure — "X months at SYAI" text-xs muted]

Stats row (3 items):
  [Events: N] · [Hours: N] · [Attendance: N%]

Quote snippet (italic, text-sm, var(--stone-grey))
  Short excerpt from member's best archived reflection

Buttons:
  [GENERATE TESTIMONIAL] — var(--accent-gold) bg, 48px
  [VIEW PROFILE]         — text link, var(--bamboo-green)
```

**"GENERATE TESTIMONIAL"** → `/admin/testimonials/[memberId]`

**"VIEW PROFILE"** → opens `MemberTestimonialView` with `headerOverride`:
```typescript
<MemberTestimonialView
  memberId={member.id}
  headerOverride={`${member.name} Details`}
  viewerRole="admin"  // ← enables admin edit mode
/>
```

---

## Generate Testimonial Page
**Route:** `/admin/testimonials/[memberId]`

### Layout
`MemberTestimonialView` as main content + Generate Testimonial sidebar card right column.

### Generate Testimonial Sidebar Card
```
Background: var(--deep-forest)
Padding: p-6, rounded-2xl

Label: "GENERATE TESTIMONIAL" — .bamboo-label (white text)
Quote snippet from member's contributions (italic, white/70)
Button: "✨ Generate Testimonial"
  - var(--accent-gold) bg, text-dark, 48px, full-width
  - Generates testimonial content → populates endorsement block below
```

### Contribution History Entries
Each entry is clickable → opens `ReflectionDetailModal`:
```typescript
<ReflectionDetailModal
  reflectionId={entry.reflectionId}
  mode="archived"
  viewerRole="admin"   // ← admin can edit even in archived mode
/>
```

Admin can edit any reflection from here at any time.
Changes saved via `admins_update_all_reflections` RLS policy.

### Executive Endorsement Block (EndorsementBlock component)
```
Location: bottom of page, full-width card
Background: subtle cream with left border accent

Content:
  Endorsement quote:
    - Inline editable for admin — click to edit, auto-saves on blur
    - Italic DM Sans, placeholder: "Add an endorsement quote..."
    - Admin can edit at ANY time — even after finalising (re-send updates member page)

  Signature area:
    - Admin name + title pre-filled from Supabase profiles
    - Both fields inline editable for admin

"Finalise & Send" button:
  - var(--bamboo-green) bg, text-white, 48px
  - On first click:
    1. Sets testimonials.finalised_at = now()
    2. Pushes to member's /member/testimonials page
    3. testimonial_requests.status → 'sent'
    4. Toast: "Testimonial sent to [member name] 🌿"
  - If already finalised: button shows "Re-send" — updates member page with latest edits
```

---

## Admin Edit Permissions Summary

| Content | Admin can edit? | When |
|---|---|---|
| Testimonial endorsement quote | ✅ | Always, even after finalised |
| Testimonial endorsement name/title | ✅ | Always |
| Reflection fields (all 6) | ✅ | Always, any status |
| Contribution write-ups | ✅ | Always |
| Member profile info | ✅ | Always (via Attendance → Members tab) |

**RLS policies backing this:**
- `admins_update_all_testimonials` — no time gate
- `admins_update_all_reflections` — no status gate
- `admins_update_all_contributions` — no stage gate

---

## Data (tRPC)
```typescript
getTestimonialRequests: () => Array<{
  memberId: string
  name: string
  avatarUrl: string
  department: string
  tenure: string           // "X months at SYAI"
  stats: {
    events: number
    hours: number
    attendancePct: number
  }
  quoteSnippet: string     // from best archived reflection
  requestStatus: 'pending' | 'generated' | 'sent'
}>

updateTestimonial: (input: {
  testimonialId: string
  endorsementQuote?: string
  endorsementName?: string
  endorsementTitle?: string
}) => void
// adminProcedure — no time restrictions, editable even after finalised_at is set

finaliseTestimonial: (input: {
  memberId: string
  endorsementQuote: string
}) => void
// Sets finalised_at, sets testimonial_requests.status = 'sent'
// Pushes to member's /member/testimonials (member can now see it)
// Can be called again to re-send with updated content

updateReflection: (input: {
  reflectionId: string
  currentTask?: string
  description?: string
  impact?: string
  challenges?: string
  personalLearning?: string
  orgLearning?: string
}) => void
// adminProcedure — no status gate, editable at any time
// Word limits still enforced at DB level
```

---

## Mobile (390px)
- Request cards: 1-column stack
- Generate page: sidebar card stacks below MemberTestimonialView content
- "Finalise & Send" / "Re-send" button: full-width, 52px
- Endorsement quote: full-width textarea on tap to edit
