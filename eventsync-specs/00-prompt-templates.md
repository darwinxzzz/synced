# EventSync — Claude Code Prompt Templates
> Copy-paste these prompts directly into Claude Code terminal.
> Replace [brackets] with actual values.

---

## HOW TO USE THESE SPECS

1. Export your Stitch screen as PNG → save to `screenshots/stitch-[page].png`
2. Take a screenshot of your current build → save to `screenshots/current-[page].png`
3. Copy the prompt below for the page you're building
4. Paste into Claude Code terminal

---

## BUILD ORDER (always member before admin)
```
1.  Login page
2.  Member Dashboard
3.  Member Kanban
4.  Add Contribution Modal
5.  Reflection Drawer
6.  Reflection Detail Modal
7.  Member Testimonials
8.  Admin Dashboard
9.  Admin Kanban (Bird's Eye)
10. Create Event Modal
11. Admin Kanban (Open Board)
12. New Task Modal
13. Attendance Registry
14. Admin Testimonials
```

---

## PROMPT TEMPLATE — New Page Build

```
Read docs/00-design-system.md and docs/[NN-page-name].md.
Build [src/app/path/to/page.tsx] to match screenshots/stitch-[page].png exactly.

Screenshot reference: screenshots/stitch-[page].png
Current state:        screenshots/current-[page].png

Rules:
- Page background: var(--ivory-paper) — never pure white
- No left sidebar at any breakpoint
- All cards use .card-shadow class only — never shadow-lg
- All inputs use .es-input class
- Use variable names from globals.css — never raw hex values
- Do not install new npm packages without asking first
- Reuse existing components from docs/15-shared-components.md before creating new ones
```

---

## PROMPT TEMPLATE — Fix Visual Gap

```
Read docs/00-design-system.md and docs/[NN-page-name].md.

The current build (screenshots/current-[page].png) does not match
the design (screenshots/stitch-[page].png).

Specific issues to fix:
- [describe what's wrong — e.g. "H1 says 'Personal Workspace' but should be 'Your Upcoming Contributions'"]
- [e.g. "KPI cards are white bg but should be var(--cream-white)"]
- [e.g. "Shadow is shadow-lg but should be .card-shadow"]

Only touch [src/app/path/to/page.tsx] — do not modify other files.
```

---

## PROMPT TEMPLATE — Build Shared Component

```
Read docs/00-design-system.md and docs/15-shared-components.md.

Build the [ComponentName] component at [src/components/path/Component.tsx].

This component is reused in: [list pages that use it]
Props interface is defined in docs/15-shared-components.md.

Do not duplicate logic that already exists in other components.
```

---

## PROMPT TEMPLATE — Fix Mobile Layout

```
Read docs/00-design-system.md.

Fix the mobile layout (390px) of [src/app/path/to/page.tsx].

Mobile rules:
- H1: 36px (was 56px desktop)
- KPI cards: 1-column stack
- Bottom tab bar: fixed bottom-0, h-16, bg-[--deep-forest]
  Member tabs: Dashboard · Kanban · Testimonials
  Admin tabs:  Dashboard · Kanban · Attendance · Testimonials
- Active tab: var(--bamboo-green) dot above icon
- Top navbar on mobile: logo + bell + avatar only (no nav links)
- All inputs min-height 48px
- All buttons min-height 48px, full-width
- No horizontal overflow

Test at 390px viewport width.
```

---

## PROMPT TEMPLATE — Wire up tRPC

```
Read docs/16-supabase-and-auth.md and docs/[NN-page-name].md.

Wire up the tRPC data for [page name].
Create/update the router at [src/server/api/routers/[router].ts].

Data requirements are specified in the "Data (tRPC)" section of docs/[NN-page-name].md.

Rules:
- Use protectedProcedure for member data
- Use adminProcedure for admin-only operations (throws FORBIDDEN for members)
- RLS is enforced at Supabase level — do not bypass it
- Realtime channels: see docs/16-supabase-and-auth.md
- Always unsubscribe Realtime channels in useEffect cleanup
```

---

## PROMPT TEMPLATE — Session Start (feed to every new session)

```
Project: EventSync — T3 + Supabase app
Stack: Next.js 14 App Router, TypeScript, tRPC v11, Tailwind CSS, Supabase, shadcn/ui

Global rules (always apply):
- No left sidebar on any page
- Page bg: var(--ivory-paper) = #F5F0E8 — never pure white
- Cards: var(--cream-white) = #FAFAF7, .card-shadow class only
- Tokens in globals.css — never raw hex in component files
- No new npm packages without asking
- Build member views before admin views
- Reuse components from src/components/shared/ and src/components/kanban/

Design specs: docs/ folder
Screenshots: screenshots/ folder

What are we building today?
```

---

## SCREENSHOT WORKFLOW (Windows)

```
1. Open Stitch, navigate to the screen you need
2. Win+Shift+S → select the screen area → saves to clipboard
3. Paste into Paint / Photos → Save As → screenshots/stitch-[page].png

4. Open localhost:3000/[page] in browser
5. Win+Shift+S → select the browser content area
6. Paste into Paint → Save As → screenshots/current-[page].png

7. Drag and drop BOTH files into Claude Code terminal
   OR reference by path: screenshots/stitch-[page].png
```
