# EventSync — Reflection Detail Modal
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-reflection-detail.png`
- Stitch ID (content): `14367f7696f54c6ba8aded7cf39d5594` — "Reflection Detail Card"
- Stitch ID (shell):   `69af9520dab947daa0e587ecb1487ab3` — modal shell

## Component File
`src/components/reflections/ReflectionDetailModal.tsx`

## Props
```typescript
interface ReflectionDetailModalProps {
  reflectionId: string
  mode: 'pending' | 'archived'
  viewerRole: 'member' | 'admin' | 'lead'  // ← controls edit permissions
  onClose: () => void
}
```

## Reused In (zero duplication — same component everywhere)
- Reflection Drawer → PENDING tab items → `mode="pending"`
- Reflection Drawer → ARCHIVED tab items → `mode="archived"`
- Member Testimonials → contribution history entries → `mode="archived"`
- Admin Open Board → task detail → `mode="pending"` or `mode="archived"` (admin editable)
- Admin member profile → history entries → `mode="archived"` (admin editable)
- Admin Testimonials → event press on member profile → `mode="archived"` (admin editable)

---

## Shell
```
Wrapper: BlurModal
Width: ~600px desktop (match Stitch 69af9520 for exact dimensions)
```

---

## Header
```
Title: "Reflection" or task name (match Stitch exactly)
Font:  Playfair Display italic
Close: ✕ button top-right, 44×44px
```

---

## Pre-filled Read-Only Fields (both modes, both roles)
These are always greyed/disabled — never editable by anyone:
```
CURRENT TASK:     [task name — pre-filled, read-only]
DATE COMPLETED:   [date — pre-filled, read-only]
```

---

## Edit Permission Rules

| Mode | Member | Admin |
|---|---|---|
| pending | Editable — all 5 fields | Editable — all 5 fields |
| archived | Read-only (unless they click "Edit Entry") | Always editable |

**Member edit gate:** Members can only edit reflections while `status = 'pending'`.
Once submitted (`status = 'archived'`), members see "Edit Entry" which reopens in editable mode
— but this is subject to RLS: `members_update_own_reflections_until_archived` policy
blocks the DB update if status is already `'archived'`.

**Admin edit:** Admins can edit any reflection at any time regardless of status.
`admins_update_all_reflections` policy has no status gate.

---

## PENDING MODE

### Form Fields
| Field label | DB column | Limit | Required |
|---|---|---|---|
| CURRENT TASK | `current_task` | **5 words max** | Yes |
| WHAT TOOK PLACE? | `description` | **30 words max** | Yes |
| IMPACT ON SYAI | `impact` | **30 words max** | Yes |
| CHALLENGES FACED | `challenges` | **30 words max** | Yes |
| PERSONAL LEARNING POINTS | `personal_learning` | **30 words max** | Yes |
| ORGANISATIONAL LEARNING POINTS | `org_learning` | **30 words max** | Yes |

**Live word counter on every field:**
```
"X / 5 words" or "X / 30 words" — bottom-right of each textarea
Turns var(--deadline-red) when at or over limit
Submission blocked if any field exceeds limit
```

All inputs: `.es-input` class.

### Footer — Member (Pending Mode)
```
Left:  "Complete Later" — text link
       Saves current inputs as draft (status stays 'pending'), closes modal
Right: "Submit Reflection" — bg-[--deep-forest], text-white, 48px
       Validates all required fields + word limits
       On success: status → 'archived', badge -1, toast "Reflection captured 🌿"
```

### Footer — Admin (Pending Mode)
```
Left:  "Save Changes" — outlined button
       Saves edits without changing status
Right: "Close" — bg-[--deep-forest], text-white, 48px
```

---

## ARCHIVED MODE

### Member View (read-only)
All 6 fields displayed as static text — no inputs, no counters.

Footer:
```
Left:   "Export as PDF" — outlined button
Centre: "Edit Entry" — text link
        Note: RLS will block the save if status = 'archived'
        Frontend should show a toast: "Reflection already submitted — contact admin to edit"
Right:  "Close" — bg-[--deep-forest], text-white, 48px
```

### Admin View (always editable)
All 6 fields shown as editable inputs even in archived mode.

Footer:
```
Left:   "Export as PDF" — outlined button
Centre: "Save Changes" — outlined, var(--bamboo-green) text
        Saves admin edits — no status change
Right:  "Close" — bg-[--deep-forest], text-white, 48px
```

---

## On Submit (member pending → archived)
```
1. reflections.status: 'pending' → 'archived'
2. reflections.submitted_at: set to now()
3. Reflection badge count on kanban button: -1 (via Supabase Realtime)
4. Toast: "Reflection captured 🌿"
5. Modal closes
6. Item moves from PENDING to ARCHIVED tab in ReflectionDrawer
```

---

## Mobile (390px)
- Full-screen modal, slides up from bottom
- rounded-t-3xl top corners
- Internally scrollable (fields can be long)
- Sticky footer buttons, full-width, stacked if 2 buttons
- All textareas min-height 100px
- Submit/Close button: 52px height
