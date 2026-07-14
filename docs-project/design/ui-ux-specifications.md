# UI/UX Specifications

## Principles
- Utility-first styling with Tailwind v4 classes as the primary building block.
- Accessible interaction patterns come from Radix UI primitives wrapped in app-specific styling.
- Reusable UI lives in `src/app/_components/ui/`; feature UI stays colocated with the feature area.
- Styling is driven by semantic CSS variables in `src/styles/globals.css`, not a large custom theme file.
- The visual tone is deliberate and warm: serif display headings, sans-serif body copy, paper-like backgrounds, and green/gold accents.
- Motion is used in focused places such as page reveals, drawers, scrolling testimonials, and kanban feedback states.
- Admin and member experiences share patterns but use separate shells and navigation treatments for their roles.

## Information Architecture

```
                    ┌───────────────────┐
                    │   Root Layout     │
                    │ (providers, font) │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                  │
            ▼                 ▼                  ▼
┌────────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ (marketing)        │ │  (auth)      │ │  Admin Portal    │
│ Public Route Group │ │  Route Group │ │  /admin/*        │
├────────────────────┤ ├──────────────┤ ├──────────────────┤
│   / landing page   │ │  /login      │ │  /admin/         │
│   Navbar + Footer  │ │  minimal     │ │  dashboard       │
│                    │ │  layout      │ │  /admin/         │
│                    │ │              │ │  attendance      │
│                    │ │              │ │  /admin/kanban   │
│                    │ │              │ │  /admin/         │
│                    │ │              │ │  testimonials    │
└────────┬───────────┘ └──────────────┘ └──────────────────┘
         │                                              │
         │                                              │
         │              ┌───────────────────────────────┘
         │              │
         ▼              ▼
┌──────────────────┐
│  Member Portal   │
│  /member/*       │
├──────────────────┤
│  /member/        │
│  dashboard       │
│  /member/kanban  │
│  /member/        │
│  testimonials    │
└──────────────────┘

         ┌─────────────────────────────────────────────────┐
         │           Navigation by Role                     │
         │  ┌─────────────────┐  ┌──────────────────────┐   │
         │  │    Desktop      │  │       Mobile         │   │
         │  │  Sidebar Nav    │  │    Tab Bar           │   │
         │  │  + Profile      │  │    + Drawer          │   │
         │  │  Drawer         │  │                      │   │
         │  └─────────────────┘  └──────────────────────┘   │
         └─────────────────────────────────────────────────┘
```

### Summary
- **Public:** Marketing landing page
- **Auth:** Login page
- **Admin:** Dashboard, Attendance, Kanban, Testimonials
- **Member:** Dashboard, Kanban, Testimonials
- **Navigation:** Desktop sidebar + mobile tab bar with profile drawer

## Components

### UI Primitives (`src/app/_components/ui/`)
- `button.tsx` — Variant-based button using `cva`, `Slot`, and `data-slot="button"`
- `select.tsx` — Radix select wrapper with trigger, content, items, labels, separators, and scroll buttons
- `dialog.tsx` — Dialog primitive wrapper for modal surfaces
- `input.tsx` — Text input primitive
- `textarea.tsx` — Multiline text input primitive
- `sonner.tsx` — Toast notifications via Sonner
- `input-otp.tsx` — OTP/code entry field
- `utils.ts` — `cn()` helper that combines `clsx` and `tailwind-merge`

### Feature Components
- `kanban/` — Task cards, panels, dialogs, drawers, filters, badges, and task-detail interactions
- `dashboard/` — KPI cards, upcoming meeting cards, reflection cards, and milestone items
- `marketing/` — Landing page composition, navbar, footer, CTA banner, bento section, and hero heading treatment
- `shared/` — Cross-feature pieces such as deadline badges, drawers, save bars, assignment UI, and confirmation surfaces
- `testimonials/` — Member testimonial views, timelines, and endorsement blocks
- `attendance/` — Attendance-specific date/time selection and related controls
- `admin/` — Admin task cards, event cards, create/edit modals, and pending submission views

## Tokens / Styles
- **Framework:** Tailwind v4 (`@import "tailwindcss";` in global styles)
- **PostCSS:** `@tailwindcss/postcss`
- **Global styles:** `src/styles/globals.css`
- **Theme model:** CSS variables mapped into Tailwind with `@theme inline`
- **Typography:** Playfair Display for headings, DM Sans for body text, JetBrains Mono for code/compact utility text
- **Color system:** Semantic variables plus a warm palette (`--deep-forest`, `--bamboo-green`, `--ivory-paper`, `--accent-gold`, etc.)
- **Dark mode:** Controlled through `.dark` variable overrides and `@custom-variant dark`
- **Layout helpers:** Custom utilities like `.card-shadow`, `.reveal`, `.kanban-highlight`, and `.mobile-menu`

## Interaction Patterns
- Radix primitives handle keyboard navigation, focus management, and ARIA behavior.
- Select menus use portal-based popovers with scroll buttons and animated open/close states.
- Dialogs and drawers are used for task details, edits, and quick forms.
- Toast feedback is centralized through Sonner.
- Motion is intentionally concentrated in a few reusable classes: blur-in, nav drop-in, scroll columns, pulse states, and drag feedback.

## Accessibility
- Radix components provide the base accessibility model for dialogs, selects, and other overlays.
- Focus-visible rings are defined in primitive classes and backed by semantic ring variables.
- Disabled and invalid states are styled explicitly in button and select controls.

## Responsive Behavior
- Admin and member layouts use a desktop navigation shell plus a mobile tab bar.
- Forms and controls are built with full-width utility patterns so they collapse cleanly on smaller screens.
- Overlay components use Radix portals and viewport sizing to stay usable on mobile.

## User Flows
- **Login:** User enters credentials on the auth page and lands in the correct role-based shell.
- **Dashboard:** Users review KPI cards, meetings, milestones, and reflection items.
- **Kanban:** Users create, filter, move, and inspect tasks through cards, drawers, and modals.
- **Testimonials:** Members add or review testimonials and endorsements in a timeline-oriented view.
- **Attendance:** Admins manage attendance through event-focused forms and selectors.
