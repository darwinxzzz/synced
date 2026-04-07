# EventSync — Reflection Drawer
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-reflection-drawer.png`
- Stitch ID (content): `39c82fd8d712492da0514146989cf4b1` — "Reflection Drawer – Inner Council"
- Stitch ID (shell):   `69af9520dab947daa0e587ecb1487ab3` — modal shell dimensions

## Component File
`src/components/reflections/ReflectionDrawer.tsx`

## Trigger
"Reflections 🔔 [N]" button on Member Kanban top bar.

---

## Shell
```
Wrapper: BlurModal component
Width:   ~520px desktop drawer (match Stitch 69af9520 for exact width/radius/shadow)
```

---

## Header
```
Title: "Inner Council" or "Reflections" (match Stitch exactly)
Font:  Playfair Display italic
Close: ✕ button top-right, 44×44px
```

---

## Tab Switcher (sliding pill)
```
Tab 1: "PENDING (N)"   — N = live count, updates as items are submitted
Tab 2: "ARCHIVED"
Style: sliding pill indicator moves between tabs
       Active: var(--deep-forest) bg, text-white
       Inactive: transparent, var(--stone-grey) text
```

---

## PENDING Tab

### Item Card Layout (one per pending reflection)
```
┌──────────────────────────────────────────────────────┐
│ Task name (DM Sans SemiBold, text-sm)    2D AGO      │
│ Short snippet of task description (1 line, truncated) │
│                                    ↪ REFLECT NOW     │
└──────────────────────────────────────────────────────┘
```

**"2D AGO" / time label:**
- Right-aligned, text-xs, var(--stone-grey)
- Format: "Xd ago" / "Xh ago" / "Just now"

**"↪ REFLECT NOW" link:**
- var(--bamboo-green) colour, text-xs uppercase
- On click → opens ReflectionDetailModal in **pending/editable mode**
  (see 06-reflection-detail-modal.md)

**Clicking the whole card row** also opens ReflectionDetailModal in pending mode.

---

## ARCHIVED Tab

### Item Card Layout
```
Same visual style as PENDING card.
No "REFLECT NOW" link — clicking card opens ReflectionDetailModal
in read-only/archived mode (see 06-reflection-detail-modal.md)
```

---

## Empty State (per tab)
```
PENDING empty:
  Icon: leaf or checkmark (lucide)
  Text: "No pending reflections"
  Sub:  "You're all caught up 🌿"

ARCHIVED empty:
  Icon: archive (lucide)
  Text: "No archived reflections yet"
```

---

## Badge Count Behaviour
- Badge on "Reflections 🔔 [N]" button on kanban page updates in real-time
- When a pending reflection is submitted → badge -1
- When count reaches 0 → badge disappears entirely
- Supabase Realtime channel: `reflections-[userId]`

---

## Dismiss Behaviour
```
Desktop: ✕ button, or click blur overlay behind drawer
Mobile:  swipe down, or ✕ button
Keyboard: Escape key
```

---

## Mobile (390px)
- Full-screen (100vw × 100dvh)
- Slides up from bottom, 350ms ease-out
- rounded-t-3xl top corners
- Internally scrollable
- Sticky header (tab switcher stays visible while scrolling cards)
