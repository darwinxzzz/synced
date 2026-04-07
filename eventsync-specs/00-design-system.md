# EventSync — Design System
> Feed this file alongside EVERY page spec. It contains all shared rules.

---

## Project Paths
```
T3 root:       src/
globals.css:   src/app/globals.css
tailwind:      tailwind.config.ts
env file:      .env  ← NOT .env.local
```

## Screenshots Folder Convention
```
screenshots/
  stitch-[page].png     ← export from Stitch, one per screen
  current-[page].png    ← Win+Shift+S of localhost:3000 for comparison
```
Always tell Claude Code: "Match screenshots/stitch-[page].png exactly."

---

## Design Tokens
Use variable names ONLY — never raw hex values in component code.

```css
--deep-forest:    #1C3A2B   /* navbars, dark buttons, primary bg */
--bamboo-green:   #4A7C59   /* active states, CTAs, progress bars */
--sage-mist:      #A8C5A0   /* badges, tags, hover backgrounds */
--ivory-paper:    #F5F0E8   /* PAGE BACKGROUND — always use this, never white */
--cream-white:    #FAFAF7   /* CARD SURFACE — all cards use this */
--charcoal-ink:   #2D2D2D   /* primary body text */
--stone-grey:     #8C8C8C   /* muted text, metadata, labels */
--accent-gold:    #C4A35A   /* testimonial CTA, star ratings */
--deadline-red:   #C0503A   /* ≤7 days deadline, urgent, absent */
--deadline-amber: #D4914A   /* 8–14 days deadline, excused, at risk */
--deadline-green: #3D8B5E   /* 15+ days deadline, attended, success */
```

## Typography
```
Headings (H1, H2, section titles): Playfair Display — italic where specified
Body text, labels, nav, buttons:   DM Sans
Bamboo labels (small caps):        11px DM Sans uppercase, var(--bamboo-green)
```

## Utility Classes (globals.css — use these, never override with raw Tailwind)
```
.card-shadow        → layered refined shadow — ALL cards use this, not shadow-lg
.bamboo-label       → 11px uppercase var(--bamboo-green) label
.reveal / .visible  → scroll-triggered fade+scale animation (JS adds .visible)
.animate-blur-in    → heading blur-in on scroll
.es-input           → input with bamboo-green focus ring
.kanban-drop-active → dashed green drop zone for DnD
.deadline-pulse     → scale pulse animation for urgent deadline badges
```

---

## Layout Rules (apply to every page)
- ❌ No left sidebar on ANY page at ANY breakpoint — ever
- Page background: `var(--ivory-paper)` = #F5F0E8 — NEVER pure white (#FFFFFF)
- Card surface: `var(--cream-white)` = #FAFAF7
- Shadow: `.card-shadow` class ONLY — never `shadow-lg` or `shadow-xl`
- Max width: `max-w-7xl` (1280px), padding `px-6 lg:px-8`
- Standard desktop target: 1440px

---

## Responsive Breakpoints
```
Default (no prefix) = Mobile 390px
md:                 = Tablet 768px+
lg:                 = Desktop 1024px+
```

## Mobile Navigation (390px)
**Top navbar on mobile:**
- Height: 56px
- Left: "🎋 Event Sync" logo only
- Right: 🔔 bell (with badge) + avatar circle
- No nav links visible (moved to bottom tab bar)

**Bottom Tab Bar — Member:**
```
[ Dashboard ] [ Kanban 🔔 ] [ Testimonials ]
Position: fixed bottom-0, h-16, bg-[--deep-forest], text-ivory
Active tab: var(--bamboo-green) dot indicator above icon
Icons: lucide-react 24px, centred above label (10px DM Sans)
Safe area: pb-safe (iOS home bar clearance)
```

**Bottom Tab Bar — Admin:**
```
[ Dashboard ] [ Kanban ] [ Attendance ] [ Testimonials ]
Same styling as member bar
```

## Mobile Grid Collapse
| Component | Desktop | Tablet (md) | Mobile |
|-----------|---------|-------------|--------|
| KPI cards | 4 columns | 2×2 grid | 1 column stack |
| Event cards | 2 columns | 2 columns | 1 column |
| Testimonial request cards | 3 columns | 2 columns | 1 column |
| Contribution history | 2-column timeline | 2-column | 1 column, date above |
| Performance metric cards | 5 columns | 3+2 wrap | 2+3 wrap |
| Attendance/Member tables | Full columns | Scroll | Scroll, sticky name column |

## Kanban on Mobile
```
Layout:       Horizontal snap scroll — one pillar visible at a time
Pillar width: min-w-[85vw] so next pillar peeks at right edge
Scroll snap:  scroll-snap-type-x mandatory, scroll-snap-align start
Pill tab bar: above kanban — tapping pill scrolls to that pillar
Drag method:  Long press (500ms) to drag, OR tap card → bottom sheet:
              "Move to: [valid next pillars only]"
```

## BlurModal on Mobile (ALL modals)
```
Size:      100vw × 100dvh (full screen)
Enter:     slides UP from bottom — translateY(100%) → translateY(0), 350ms ease-out
Corners:   rounded-t-3xl (top only)
Dismiss:   swipe down gesture OR ✕ button
Scroll:    internally scrollable with momentum
Footer:    sticky, full-width buttons, stacked vertically if 2 buttons
```

## Touch Sizing (minimum sizes — never smaller)
```
Tap targets:    44×44px
Inputs:         48px height
Primary buttons: 48px height, full-width on mobile
Submit buttons: 52px height on mobile
Table rows:     56px height
Kanban cards:   80px height
Bottom tab bar: 64px + safe-area-inset-bottom
```

## Typography on Mobile
```
H1: 56px → 36px
H2: 40px → 28px
H3: 28px → 22px
Body / labels / badges: unchanged
```

---

## DO NOT Rules (apply everywhere)
- ❌ Do NOT use `shadow-lg` or `shadow-xl` — use `.card-shadow` only
- ❌ Do NOT use pure white `#FFFFFF` — use `var(--ivory-paper)` for pages, `var(--cream-white)` for cards
- ❌ Do NOT add a left sidebar on any page
- ❌ Do NOT install new npm packages without asking first
- ❌ Do NOT hardcode department names — always pull from Supabase `profiles.department`
- ❌ Do NOT use raw hex values — use CSS variable names
- ✅ DO use `.es-input` class for all form inputs
- ✅ DO use `.bamboo-label` for all small uppercase labels
- ✅ DO reuse existing components before creating new ones (see 15-shared-components.md)
