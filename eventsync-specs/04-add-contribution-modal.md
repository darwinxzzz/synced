# EventSync — Add Contribution Modal
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-add-contribution.png`
- Stitch ID (form fields): `f9f1135b2a4d45cd88a9c085eeee8dc7` — "Add Contribution"
- Stitch ID (shell/wrapper): `69af9520dab947daa0e587ecb1487ab3` — modal shell dimensions

## Component File
`src/components/kanban/AddContributionModal.tsx`

## Reused In
- Member Kanban → "+ Add Contribution" button
- Admin Kanban → "+ Add ▾" dropdown → "Add Contribution"
ZERO duplication — same component for both.

---

## Modal Shell (BlurModal)
```
Wrapper: BlurModal component (see 15-shared-components.md)
Width: ~640px desktop (follow Stitch 69af9520 dimensions)
Border-radius: rounded-2xl
Blur overlay: backdrop-blur on the page behind
Shadow: .card-shadow
```

---

## Header
```
Text:  "Add Contribution"
Font:  Playfair Display H2, italic
Close: ✕ button top-right, 44×44px tap target
```

---

## Department + Task Header Row
```
Desktop layout (side by side):
┌─────────────────────────┐ — ┌─────────────────────────────────────────┐
│ Department ▾            │   │ Task name                               │
│ (dropdown)              │   │ (text input)                            │
└─────────────────────────┘   └─────────────────────────────────────────┘
           ↑                               ↑
    Shadow hint:               Shadow hint:
    "e.g. Publicity"           "e.g. Social Media Slides"

The " — " hyphen connector between the two boxes is visible and decorative.
```

**Department dropdown:**
- Options: pulled from Supabase `profiles.department` — NOT hardcoded
- Placeholder: "Department ▾"
- Class: `.es-input`

**Task name input:**
- Type: text
- Placeholder: "e.g. Social Media Slides"
- Class: `.es-input`

**Mobile:** Stacks vertically — Department dropdown on top, Task input below. Hyphen connector hidden.

---

## Form Fields (below the header row)

### Detailed Description
```
Label:       "DETAILED DESCRIPTION" (.bamboo-label)
Type:        Textarea
Max words:   30
Live counter: "X / 30 words" shown bottom-right of textarea
             Turns var(--deadline-red) when approaching/exceeding limit
Class:       .es-input
```

### Aimed Result / Outcome
```
Label: "AIMED RESULT / OUTCOME" (.bamboo-label)
Type:  Textarea
Rule:  Required — cannot submit without this
Class: .es-input
```

### Priority Level
```
Label: "PRIORITY LEVEL" (.bamboo-label)
Type:  Segmented pill control (3 options)
Options: Low · Medium · High
Style: sliding indicator that moves to selected option
Colors:
  Low:    var(--deadline-green) when active
  Medium: var(--deadline-amber) when active
  High:   var(--deadline-red) when active
Default: none selected (required)
```

---

## ❌ No Attachment Section
File upload has been removed entirely. Do NOT add it.

---

## Footer Buttons
```
Left:  "Complete Later" — text link (no border/bg)
       Action: saves as draft, closes modal
Right: "Submit Contribution" — bg-[--deep-forest], text-white, 48px height
       Action: validates all required fields, then submits
       Shows inline errors on fields if validation fails
       Loading spinner while submitting
```

---

## On Success
1. Modal closes
2. New task card appears in member's "New" pillar on kanban
3. Toast notification fires: "Contribution added 🎋"

---

## Validation Rules
```
Department:  required
Task name:   required
Description: max 30 words (enforce with live counter + block submit if over)
Outcome:     required
Priority:    required
```
