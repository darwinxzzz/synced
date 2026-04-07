# EventSync — Member Testimonials
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-member-testimonials.png`
- Stitch ID: `4729d29dd8ac4ea49ee2a41bd3be1a0d` — "Member Testimonial Profile Page"

## File to Build
`src/app/(member)/testimonials/page.tsx`

## Component (also reused by admin)
`src/components/testimonials/MemberTestimonialView.tsx`

## Props
```typescript
interface MemberTestimonialViewProps {
  memberId: string
  headerOverride?: string  // Admin uses this: "Hong Yu Details" instead of default header
}
```

## Reused In
- Member Testimonials page — default header
- Admin → Generate Testimonial page → `headerOverride="[Member Name] Details"`
- Admin → "VIEW PROFILE" button → `headerOverride="[Member Name] Details"`

---

## Layout
No left sidebar. Full-width content. Max-width container centred.
Background: `var(--ivory-paper)`

Document-style layout — resembles a formal credential/certificate page.
Main content: `var(--cream-white)` card, `.card-shadow`, rounded-2xl, wide padding.

---

## Page Header
```
Label (top):  "OFFICIAL DOCUMENT" — .bamboo-label
H1:           "Request Testimonial" (or headerOverride value if provided)
              Font: Playfair Display italic
Description:  Short 1–2 sentence description of what this page represents
              DM Sans, var(--stone-grey)
```

---

## Member Profile Row
```
Left:   Member name (DM Sans SemiBold, large)
        Member email (text-sm, var(--stone-grey))
Right:  Issue date: [today's date]
        Reference number: auto-generated (e.g. "SYAI-2026-[userId short hash]")
```

---

## Performance Metrics (5 cards)
```
Desktop: all 5 in a row
Tablet: 3 + 2 wrap
Mobile: 2 + 3 wrap

Card 1: Events Contributed   — count from Supabase
Card 2: Weekly Attendance %  — calculated from attendance table
Card 3: Project Leads        — count where role = 'lead' in event_members
Card 4: Collaborations       — count of unique events with other members
Card 5: Total Hours          — sum of hours from contributions

Each card: var(--cream-white) bg, .card-shadow, rounded-xl
Large number (Playfair Display), label below (.bamboo-label)
```

---

## Contribution History Timeline
```
Layout:
  Left:  Date + hours (text-xs, var(--stone-grey))
  Centre: var(--bamboo-green) vertical line with circular node dots
  Right: Entry title (DM Sans SemiBold) + description (text-sm muted)

Node dots: filled circle, var(--bamboo-green), ~10px diameter
```

**Each timeline entry is clickable:**
→ Opens `ReflectionDetailModal` in `mode="archived"` (read-only)
→ See 06-reflection-detail-modal.md

---

## Executive Endorsement Block (bottom of page)
```
Background: slightly darker cream or subtle border
Italic quote: endorsement text from admin
Line below:   decorative divider
Signature:    stylised name (cursive font if available)
Name + Title: admin's name and title (pulled from Supabase profiles)
```
This block is empty/placeholder until admin finalises testimonial via Generate page.

---

## Request Testimonial Button
```
Button: "✨ Request Testimonial"
Style:  var(--accent-gold) bg, text-white or dark, rounded-xl
        48px height
Visible: only when member has NOT yet requested a testimonial
         (testimonial_requests.status is null or not present)

On click:
  1. Sends request (creates row in testimonial_requests table)
  2. Button → "Requested ✓" (disabled state, greyed)
  3. Member appears in admin's Testimonial Requests queue
```

---

## Data (tRPC)
```typescript
getMemberTestimonial: (memberId: string) => {
  profile: { name, email, avatarUrl, department, joinedDate }
  metrics: {
    eventsContributed: number
    weeklyAttendancePct: number
    projectLeads: number
    collaborations: number
    totalHours: number
  }
  contributionHistory: Array<{
    id: string
    date: Date
    hours: number
    title: string
    description: string
    reflectionId: string | null
  }>
  endorsement: {
    quote: string
    adminName: string
    adminTitle: string
    finalisedAt: Date | null
  } | null
  hasRequestedTestimonial: boolean
}
```

---

## Mobile (390px)
- Performance metric cards: 2+3 wrap (2 on first row, 3 on second — or adjust to fit)
- Timeline: single column, date above content block
- Request Testimonial button: full-width, 52px
