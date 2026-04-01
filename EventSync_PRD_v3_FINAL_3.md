# 🎋 Event Sync — Product Requirements Document v3.0 (FINAL)
### Production-Ready | Dual User System | Premium Frontend Spec | Figma Make Ready
### Visual Theme: Arashiyama Bamboo Grove, Kyoto

> **Mission:** Build a complete, production-ready web application that looks like it was built by a top-tier design agency — NOT a generic template, NOT a bootstrap site. Every section must feel intentional, polished, and high-end. Two user roles — Admin (Exco) and Member — with distinct views, permissions, and interactions. The visual language draws from the Arashiyama Bamboo Grove: tall vertical rhythm, natural greens, breathing whitespace, organic calm, and purposeful motion.

---

## ═══════════════════════════════════════
## SECTION T — TECH STACK
## ═══════════════════════════════════════

> **Why this matters:** Every architectural decision in this PRD — API patterns, auth flows, real-time updates, file storage, and role enforcement — is shaped by this stack. Developers and Figma Make should generate code that fits these tools natively, not generic patterns that need to be rewritten.

---

### T1 — Stack Overview

| Layer | Technology | Version / Notes |
|-------|-----------|-----------------|
| **Framework** | Next.js (App Router) | v14+ — Server Components by default |
| **Language** | TypeScript | Strict mode enabled |
| **API Layer** | tRPC | v11 — type-safe end-to-end, no REST |
| **Styling** | Tailwind CSS | v3 — utility-first, all PRD classes pre-defined |
| **Auth** | Supabase Auth | Email/password + role metadata |
| **Database** | Supabase Postgres | Row-Level Security (RLS) enforced |
| **ORM / Query** | Supabase JS Client (`@supabase/supabase-js`) | Used inside tRPC procedures |
| **Real-time** | Supabase Realtime | Live Kanban updates, KPI refresh |
| **File Storage** | Supabase Storage | Member contribution attachments |
| **Deployment** | Vercel | Edge-compatible, Next.js native |

> 💡 **T3 Stack** = Next.js + TypeScript + tRPC + Tailwind CSS. Supabase replaces Prisma + traditional REST backend in the standard T3 setup.

---

### T2 — Project Structure (T3 + Supabase)

```
event-sync/
├── src/
│   ├── app/                          ← Next.js App Router pages
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.tsx    ← Contribution Dashboard
│   │   │   ├── kanban/page.tsx       ← Kanban Board (Exco)
│   │   │   └── attendance/page.tsx   ← Attendance
│   │   ├── (member)/
│   │   │   └── kanban/page.tsx       ← Member Kanban
│   │   ├── layout.tsx                ← Root layout (navbar, providers)
│   │   └── api/
│   │       └── trpc/[trpc]/route.ts  ← tRPC HTTP handler
│   │
│   ├── server/
│   │   ├── api/
│   │   │   ├── root.ts               ← tRPC root router
│   │   │   └── routers/
│   │   │       ├── events.ts         ← Event CRUD + kanban procedures
│   │   │       ├── members.ts        ← Member management procedures
│   │   │       ├── contributions.ts  ← Member contribution procedures
│   │   │       ├── attendance.ts     ← Attendance procedures
│   │   │       └── dashboard.ts      ← KPI + metrics procedures
│   │   └── supabase.ts              ← Supabase server client
│   │
│   ├── trpc/
│   │   ├── server.ts                 ← Server-side tRPC caller
│   │   └── react.tsx                 ← Client-side tRPC provider + hooks
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             ← Browser Supabase client
│   │   │   ├── server.ts             ← Server Supabase client (cookies)
│   │   │   └── middleware.ts         ← Auth middleware (role redirect)
│   │   └── utils.ts
│   │
│   ├── components/
│   │   ├── ui/                       ← Shared components (button, badge, toast...)
│   │   ├── kanban/                   ← KanbanBoard, KanbanCard, KanbanPillar
│   │   ├── dashboard/                ← KPICard, EventCountdown, MemberTable
│   │   ├── attendance/               ← AttendanceTable, AttendanceTabs
│   │   └── member/                   ← MemberDetailPanel, ContributionForm
│   │
│   └── types/
│       └── index.ts                  ← Shared TypeScript types (User, Event, etc.)
│
├── supabase/
│   ├── migrations/                   ← SQL migration files
│   └── seed.sql                      ← Dev seed data
│
├── middleware.ts                     ← Next.js middleware (auth + role guard)
├── tailwind.config.ts
└── .env.local
```

---

### T3 — Authentication (Supabase Auth + Role System)

**How roles are stored:**

Option A — `user_metadata` (simpler, recommended for MVP):
```typescript
// On signup or admin provisioning:
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: { role: 'admin' } // or 'member'
})

// Reading role on the client:
const { data: { user } } = await supabase.auth.getUser()
const role = user?.user_metadata?.role // 'admin' | 'member'
```

Option B — Separate `profiles` table (more flexible, recommended for production):
```sql
-- profiles table (auto-created via trigger on auth.users insert)
create table profiles (
  id uuid references auth.users(id) primary key,
  name text,
  department text,
  role text check (role in ('admin', 'member')),
  avatar_url text,
  joined_date timestamptz default now(),
  status text default 'active'
);
```

**Middleware — role-based route protection:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const role = user.user_metadata?.role
  const path = request.nextUrl.pathname

  // Member trying to access admin routes → redirect to member kanban
  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/member/kanban', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/member/:path*']
}
```

---

### T4 — Supabase Row-Level Security (RLS) Rules

> **Critical:** RLS enforces data access at the database level. Even if someone bypasses the UI, they cannot access data they're not permitted to see.

```sql
-- ─── EVENTS ───────────────────────────────────────────────
-- Anyone authenticated can read events
create policy "Authenticated users can read events"
  on events for select using (auth.role() = 'authenticated');

-- Only admins can insert / update / delete events
create policy "Admins can manage events"
  on events for all using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- ─── EVENT_MEMBERS (tasks) ────────────────────────────────
-- Members can only read their own task assignments
create policy "Members see own tasks"
  on event_members for select using (
    user_id = auth.uid()
    OR
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- Only admins can assign tasks
create policy "Admins manage task assignments"
  on event_members for all using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- ─── CONTRIBUTIONS ────────────────────────────────────────
-- Members can read and insert their own contributions
create policy "Members manage own contributions"
  on contributions for all using (user_id = auth.uid());

-- Admins can read all contributions
create policy "Admins read all contributions"
  on contributions for select using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );

-- ─── ATTENDANCE ───────────────────────────────────────────
-- Only admins can manage attendance
create policy "Admins manage attendance"
  on attendance for all using (
    (select role from profiles where id = auth.uid()) = 'admin'
  );
```

---

### T5 — tRPC Router Patterns

**Example — Events router:**
```typescript
// src/server/api/routers/events.ts
import { z } from 'zod'
import { createTRPCRouter, adminProcedure, protectedProcedure } from '../trpc'

export const eventsRouter = createTRPCRouter({

  // Admin only — get all events with member progress %
  getAll: adminProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from('events')
      .select(`*, event_members(user_id, pillar_status, profiles(name, avatar_url))`)
      .order('date', { ascending: true })
    return data
  }),

  // Admin only — create a new event
  create: adminProcedure
    .input(z.object({
      name: z.string().max(80),
      description: z.string().max(500).optional(),
      date: z.string().datetime(),
      members: z.array(z.object({
        userId: z.string().uuid(),
        department: z.enum(['Inspire','Monthly Meet-ups','Publicity','Software Technology','Connectors','Labs']),
        task: z.string(),
        role: z.enum(['project_ic','member'])
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: event } = await ctx.supabase
        .from('events').insert({ name: input.name, description: input.description, date: input.date })
        .select().single()

      await ctx.supabase.from('event_members').insert(
        input.members.map(m => ({ event_id: event.id, user_id: m.userId, ...m }))
      )
      return event
    }),

  // Member only — get tasks assigned to ME
  getMyTasks: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('event_members')
        .select(`*, events(name, date)`)
        .eq('user_id', ctx.userId)
        .eq('event_id', input.eventId)
      return data
    }),
})
```

**Procedure guards:**
```typescript
// src/server/api/trpc.ts
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.userRole !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' })
  return next()
})
```

---

### T6 — Supabase Realtime (Live Kanban)

```typescript
// In KanbanBoard component — subscribe to live task status changes
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useKanbanRealtime(eventId: string, onUpdate: () => void) {
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`kanban-${eventId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'event_members',
        filter: `event_id=eq.${eventId}`
      }, () => onUpdate()) // Refetch data when any task status changes
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])
}
```

---

### T7 — Supabase Storage (File Uploads)

```typescript
// Uploading a contribution attachment
const uploadAttachment = async (file: File, userId: string) => {
  const path = `contributions/${userId}/${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('attachments')          // Supabase Storage bucket name
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get a signed URL (not public — only accessible to authenticated users)
  const { data: { signedUrl } } = await supabase.storage
    .from('attachments')
    .createSignedUrl(path, 3600) // 1 hour expiry

  return signedUrl
}
```

**Storage bucket policy:**
```sql
-- Only authenticated users can upload to their own folder
create policy "Users upload own files"
  on storage.objects for insert with check (
    auth.uid()::text = (storage.foldername(name))[2]
  );

-- Admins can read all attachments; members read only their own
create policy "Controlled read access"
  on storage.objects for select using (
    auth.uid()::text = (storage.foldername(name))[2]
    OR (select role from profiles where id = auth.uid()) = 'admin'
  );
```

---

### T8 — Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...          # Safe to expose (RLS protects data)
SUPABASE_SERVICE_ROLE_KEY=eyJh...              # NEVER expose — server-only
```

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Only use it in server-side tRPC procedures, never in client components or `NEXT_PUBLIC_` variables.

---

### T9 — Tech Stack Additions to QA Checklist

Add these checks to Section 10 of the PRD:

**P — T3 / NEXT.JS SPECIFIC**
- [ ] All interactive components (`useState`, `useEffect`, drag-and-drop, animations) have `"use client"` directive
- [ ] Data-fetching pages use Server Components (no unnecessary `"use client"` at page level)
- [ ] `middleware.ts` correctly redirects unauthenticated users to `/login`
- [ ] Admin routes are protected: member session → redirect to `/member/kanban`
- [ ] tRPC `adminProcedure` guard throws `FORBIDDEN` for non-admin callers
- [ ] tRPC `protectedProcedure` guard throws `UNAUTHORIZED` for unauthenticated callers
- [ ] All tRPC inputs validated with Zod schemas
- [ ] No `any` types in TypeScript — strict mode passes

**Q — SUPABASE SPECIFIC**
- [ ] RLS enabled on ALL tables (events, profiles, event_members, contributions, attendance, member_details)
- [ ] Members cannot query other members' tasks (RLS `event_members` policy tested)
- [ ] Members cannot query other members' contributions (RLS `contributions` policy tested)
- [ ] Admin-only tables return empty / error for member sessions (tested via Supabase dashboard)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT in any `NEXT_PUBLIC_` variable
- [ ] Supabase Realtime channel unsubscribes on component unmount
- [ ] File uploads go to correct user subfolder in Storage
- [ ] Signed URLs used for attachment access (not public URLs)
- [ ] Storage bucket policies tested (member cannot access another member's files)
- [ ] Supabase Auth session persists across page refresh (cookie-based SSR auth)
- [ ] Logout calls `supabase.auth.signOut()` and clears session cookie
- [ ] Role stored in `profiles` table or `user_metadata` — consistent throughout app
- [ ] Database migrations tracked in `supabase/migrations/` (not applied manually)
- [ ] Seed data exists for local development (`supabase/seed.sql`)

---

## ═══════════════════════════════════════
## SECTION 0 — FIGMA MAKE SYSTEM PROMPT
## ═══════════════════════════════════════

> **Paste this block FIRST into Figma Make before anything else.**

```
You are a world-class frontend developer specializing in premium, conversion-optimized
websites for real businesses.

YOUR MISSION
Build a complete, production-ready web application called "Event Sync" — a dashboard for 
tracking member event progress across two user roles: Admin (Exco) and Member.

The visual style is inspired by the Arashiyama Bamboo Grove in Kyoto, Japan.
Apply wabi-sabi philosophy: beauty in simplicity, intentional imperfection, organic calm.

━━━ COLOR TOKENS ━━━
  --deep-forest:    #1C3A2B   (primary, navbars, headers)
  --bamboo-green:   #4A7C59   (active states, progress, CTAs)
  --sage-mist:      #A8C5A0   (badges, tags, hover backgrounds)
  --ivory-paper:    #F5F0E8   (page background)
  --cream-white:    #FAFAF7   (card surfaces, inputs)
  --charcoal-ink:   #2D2D2D   (primary text)
  --stone-grey:     #8C8C8C   (muted text, metadata)
  --accent-gold:    #C4A35A   (CTAs, highlights, stars)
  --deadline-red:   #C0503A   (≤7 days warning)
  --deadline-amber: #D4914A   (8-14 days warning)
  --deadline-green: #3D8B5E   (15+ days safe)
  --leaf-green:     #3D8B5E   (success states)
  --clay-red:       #C0503A   (errors)

━━━ TYPOGRAPHY ━━━
  Headings:  "Noto Serif JP" or "Playfair Display" — elegant, editorial
  Body:      "DM Sans" — clean, modern, legible (NOT Inter, NOT Roboto)
  UI Labels: "DM Sans" 11px uppercase, letter-spacing 0.12em, --bamboo-green
  Code/mono: "JetBrains Mono"

━━━ SPACING (8pt grid) ━━━
  4px / 8px / 16px / 24px / 32px / 48px / 64px / 96px

━━━ SHAPE RULES ━━━
  Cards / containers / image wrappers: border-radius 20-24px (rounded-3xl)
  Inputs: border-radius 8px
  Badges / pills: border-radius 999px (fully rounded)
  NO sharp corners anywhere on the site

━━━ SHADOW SYSTEM ━━━
  Apply this EXACT multi-layered shadow on ALL cards, navbar, and floating elements.
  Do NOT use shadow-lg or shadow-xl — this layered approach is far more refined:

  box-shadow:
    rgba(14, 63, 126, 0.04) 0px 0px 0px 1px,
    rgba(42, 51, 69,  0.04) 0px 1px 1px -0.5px,
    rgba(42, 51, 70,  0.04) 0px 3px 3px -1.5px,
    rgba(42, 51, 70,  0.04) 0px 6px 6px -3px,
    rgba(14, 63, 126, 0.04) 0px 12px 12px -6px,
    rgba(14, 63, 126, 0.04) 0px 24px 24px -12px;

━━━ ANIMATION SYSTEM ━━━

  1. Scroll-Triggered Reveals (IntersectionObserver)
     - Cards and images: opacity-0 scale-95 → opacity-100 scale-100
     - Duration: 700ms, timing: ease-out
     - Stagger each card: 0ms, 80ms, 160ms, 240ms...
     - Threshold: 0.1

  2. Text Blur-In (apply to ALL section headings):
     @keyframes blur-in {
       0%   { filter: blur(12px); opacity: 0; transform: translateY(8px); }
       100% { filter: blur(0);    opacity: 1; transform: translateY(0);   }
     }
     .animate-blur-in { animation: blur-in 0.8s ease-out forwards; }
     Stagger: label 0.2s, headline 0.4s, subtext 0.6s
     Elements start opacity-0 and only animate when scrolled into view

  3. Hover Micro-Interactions
     - Cards: hover:scale-[1.02] with 300ms transition
     - Buttons with arrows: group-hover:translate-x-1 on the arrow icon
     - Quick-add buttons: opacity-0 translate-y-2 → group-hover:opacity-100 translate-y-0
     - All interactive elements: transition-all duration-300 ease-out

━━━ LAYOUT RULES ━━━
  Section padding:  py-24 (96px vertical)
  Content max-width: max-w-7xl with px-6 lg:px-8
  Responsive: Desktop 1440px + Mobile 390px frames for every view
  Generous whitespace between every element — never feel cramped
```

---

## ═══════════════════════════════════════
## SECTION 1 — BRAND IDENTITY
## ═══════════════════════════════════════

### Brand Personality
- **Tone:** Calm authority. Like a knowledgeable guide through a quiet bamboo grove.
- **Voice:** Clear, purposeful, grounded. No jargon. No noise.
- **Values:** Progress over perfection. Community. Clarity. Natural momentum.
- **User feeling:** "I always know exactly where I stand — and it feels effortless."

---

### Color Palette (Full Token Set)

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Deep Forest | `#1C3A2B` | Navbar, hero overlays, primary buttons |
| Primary Light | Bamboo Green | `#4A7C59` | Active states, progress bars, CTAs |
| Secondary | Sage Mist | `#A8C5A0` | Badges, tags, hover states |
| Background | Ivory Paper | `#F5F0E8` | Page backgrounds |
| Surface | Cream White | `#FAFAF7` | Card surfaces, inputs |
| Text Primary | Charcoal Ink | `#2D2D2D` | Headings, body text |
| Text Muted | Stone Grey | `#8C8C8C` | Subtitles, metadata, placeholders |
| Accent | Accent Gold | `#C4A35A` | CTAs, highlights, star ratings |
| Deadline 1 | Deadline Red | `#C0503A` | ≤7 days |
| Deadline 2 | Deadline Amber | `#D4914A` | 8–14 days |
| Deadline 3 | Deadline Green | `#3D8B5E` | 15+ days |
| Success | Leaf Green | `#3D8B5E` | Completed states |
| Error | Clay Red | `#C0503A` | Errors, failures |

---

### Typography

| Style | Font | Size | Weight | Color | Line-height |
|-------|------|------|--------|-------|-------------|
| H1 | Playfair Display | 56px | Bold | Deep Forest | 1.15 |
| H2 | Playfair Display | 40px | SemiBold | Deep Forest | 1.2 |
| H3 | Playfair Display | 28px | SemiBold | Charcoal Ink | 1.3 |
| H4 | DM Sans | 20px | Medium | Charcoal Ink | 1.4 |
| Body Large | DM Sans | 18px | Regular | Charcoal Ink | 1.6 |
| Body | DM Sans | 16px | Regular | Charcoal Ink | 1.65 |
| Small | DM Sans | 14px | Regular | Stone Grey | 1.5 |
| Caption | DM Sans | 12px | Medium | Stone Grey | 1.4 |
| Bamboo Label | DM Sans | 11px | SemiBold | Bamboo Green | — |

**Bamboo Label:** UPPERCASE, letter-spacing: 0.12em — used for section labels, status pills, table column headers.

---

## ═══════════════════════════════════════
## SECTION 2 — COMPONENT BLUEPRINTS
## ═══════════════════════════════════════

### 2A — NAVBAR

```
Position: fixed top-0, floating with 12px margin from edges
Height: 68px
Background: backdrop-blur-md with bg-[rgba(245,240,232,0.72)]
Border: 1px border-[rgba(74,124,89,0.16)]
Border-radius: rounded-2xl (on the floating bar itself)
Shadow: Apply multi-layered shadow from system prompt

Layout:
  LEFT:   Nav links (Dashboard, Kanban, Attendance) — DM Sans 15px
  CENTER: Logo "🎋 Event Sync" — absolutely positioned
  RIGHT:  Search icon | Notification bell (with badge count) | Avatar dropdown

Mobile:
  Hamburger menu icon (right side)
  On open: max-h-0 → max-h-64 slide-down transition (300ms ease-out)
  Menu items stack vertically with 16px gap

Entry animation:
  Page load: translateY(-100%) → translateY(0) + opacity 0→1, 600ms ease-out
```

---

### 2B — HERO SECTION (Login/Landing Page)

```
Layout: min-h-screen with flex items-center justify-center
Background: Full-bleed bamboo grove photograph covering entire viewport
  → Image: Arashiyama bamboo path shot from below, sunlight through stalks
  → Overlay: bg-gradient-to-t from-[#1C3A2B] via-[rgba(28,58,43,0.5)] to-transparent
  → Bamboo SVG texture layer: 5% opacity, Ivory Paper colour, tiled
  → Subtle parallax: bamboo stalks move at 0.3x scroll speed (desktop only)

Content (centered, max-w-2xl):
  1. Label: "BAMBOO LABEL style" → "Community Event Tracking"
     animation-delay: 0.2s, blur-in
  2. Headline: "Track Every Event. Never Miss Progress."
     animation-delay: 0.4s, blur-in, Playfair Display 56px, Ivory Paper colour
  3. Subtext: paragraph (see copy below)
     animation-delay: 0.6s, blur-in
  4. CTA row: [Get Started Free →] [See How It Works]
     animation-delay: 0.8s

CTA Primary Button:
  bg-[#C4A35A], text-[#1C3A2B], rounded-full, px-8 py-4, DM Sans 16px SemiBold
  hover: scale-[1.02] brightness-105, group arrow → translate-x-1

CTA Secondary Button:
  border-2 border-[rgba(245,240,232,0.48)], text-ivory, rounded-full, backdrop-blur-sm
  hover: bg-[rgba(255,255,255,0.08)]

Scroll Indicator (bottom center):
  Text: "Scroll" — DM Sans 12px uppercase letter-spacing 0.2em, Stone Grey
  Below: Vertical animated line, 40px tall, animate-pulse, Bamboo Green colour
```

---

### 2C — FEATURE SECTION (Bento Grid — Marketing/Info pages)

```
Desktop layout: grid-cols-4 grid-rows-[300px_300px]

Block A (col-span-2 row-span-2) — LARGE:
  Full-bleed dashboard screenshot or video
  White overlay card at bottom-left corner (p-6, rounded-2xl, shadow system)
  Overlay card content: metric stat + label + mini sparkline

Block B (col-span-1 row-span-1):
  Background: bamboo texture image
  Text overlay: dark gradient, H3 + body, Ivory Paper colour

Block C (col-span-1 row-span-1):
  Background video loop (subtle nature motion)
  Icon + title + description overlay

Below Bento Grid:
  Two-column layout:
    LEFT: Large video or image (aspect-[4/5], rounded-3xl)
    RIGHT: H2 heading (blur-in) + 2x2 feature card grid

Feature Cards (2x2 grid):
  Icon in 48px rounded-full circle (Sage Mist bg, Bamboo Green icon)
  H4 title
  Body description (Stone Grey)
  hover:scale-[1.02] transition-all duration-300
  Stagger reveal: 0ms, 80ms, 160ms, 240ms
```

---

### 2D — KANBAN BOARD COMPONENT

```
Layout: 4 equal-width columns, horizontal scroll on mobile, min-h-screen

Column Header:
  Pill badge with count (e.g. "New · 3")
  Colour-coded top border (3px): Grey / Green / Amber / Gold
  Column title: H4 DM Sans

Drag-and-drop behaviour:
  Card dragging: opacity-90, scale-[1.02], rotate-1deg, enhanced shadow
  Drop zone: bg-[--sage-mist] at 20% opacity, dashed border 2px [--bamboo-green]
  On drop: smooth position animation 300ms ease-out

Event Card (in Overview):
  rounded-3xl, bg-cream-white, shadow system
  Left border stripe: 4px, deadline colour (red/amber/green)
  Content: Event name + date + 4-row progress summary + [Open Board →]
  hover:scale-[1.02] transition 300ms

Task Card (in Open Board):
  rounded-2xl, bg-cream-white, shadow system
  Department badge (top-left)
  Task text (DM Sans 15px SemiBold)
  Assignee name (Stone Grey, 13px)
  Drag handle: left edge, 4px wide, Sage Mist, appears on hover
```

---

### 2E — DATA TABLE COMPONENT

```
Container: rounded-3xl bg-cream-white shadow system overflow-hidden

Table Header Row:
  bg-[--ivory-paper], Bamboo Label style (11px uppercase)
  Sticky on scroll: position sticky top-0
  Sort indicators: ↑↓ arrow icons, Bamboo Green when active

Table Rows:
  hover:bg-[--sage-mist] at 20% opacity, transition 150ms
  Border-bottom: 1px solid [--sage-mist]
  Alternating row: very subtle — every 2nd row bg at 3% ivory

Pagination bar:
  rounded-2xl bottom bar
  < Prev | Page 1 of 4 | Next > 
  Current page highlighted: Bamboo Green background, Ivory Paper text

Status Badges (in rows):
  rounded-full pill, 8px horizontal padding, 4px vertical padding
  Active → Bamboo Green bg at 15%, Bamboo Green text
  At Risk → Amber bg at 15%, Amber text
  Inactive → Red bg at 15%, Red text
  Completed → Gold bg at 15%, Gold text
```

---

### 2F — FORMS & INPUTS

```
Input fields:
  rounded-xl (not sharp, not pill)
  border: 1px solid [--sage-mist]
  focus: border-[--bamboo-green] + box-shadow: 0 0 0 3px rgba(74,124,89,0.12)
  bg: [--cream-white]
  placeholder: [--stone-grey]
  DM Sans 15px

Textarea:
  Same as input, min-height 120px, resize-vertical

Select / Dropdown:
  Same styling as input
  Dropdown menu: rounded-2xl shadow system, bg-cream-white
  Option hover: bg-[--sage-mist] at 30%

Date picker:
  Native with custom CSS overlay
  Calendar highlight: Bamboo Green for selected date

Priority Radio (Member contribution form):
  Segmented pill control (not separate radio buttons)
  Active segment: animated sliding bg div
  Container: rounded-full bg-[--ivory-paper] p-1
  Active: rounded-full bg-[--bamboo-green] text-ivory transition-all 300ms

Multi-select member picker:
  Search input at top
  Dropdown list: member avatar + name + department
  Selected members: appear as pill tags below input
  Tag: avatar + name + [✕], rounded-full, Sage Mist bg
```

---

### 2G — SLIDE-IN DRAWER COMPONENT

```
Overlay: bg-charcoal-ink at 40% opacity, backdrop-blur-sm, fade in 200ms
Drawer panel:
  Width: 480px desktop, 100% mobile
  Slides in from RIGHT: translateX(100%) → translateX(0), 300ms ease-out
  bg-[--cream-white], rounded-l-3xl (desktop), full screen (mobile)
  Shadow: inset multi-layered shadow on left edge
  
Header:
  px-8 py-6, border-bottom 1px [--sage-mist]
  Title (H3) left, [✕ Close] button right

Content:
  px-8 py-6, scrollable (overflow-y-auto)

Footer:
  px-8 py-6, border-top 1px [--sage-mist]
  Primary + Cancel buttons
  Sticky at bottom of drawer
```

---

### 2H — TESTIMONIALS SECTION

```
Layout: 3-column desktop, 1-column mobile
Height: h-[600px] overflow-hidden
Gradient masks: h-32 at top AND bottom
  top: from-[--ivory-paper] to-transparent
  bottom: from-transparent to-[--ivory-paper]

Auto-scroll:
  @keyframes scroll-down { 0% { transform: translateY(0) } 100% { transform: translateY(-50%) } }
  @keyframes scroll-up   { 0% { transform: translateY(-50%) } 100% { transform: translateY(0) } }
  Duration: 30s infinite linear
  Column 1: scroll-down | Column 2: scroll-up | Column 3: scroll-down
  Hover: animation-duration switches to 60s (slow down on hover)
  Duplicate cards array twice ([...cards, ...cards]) for seamless loop

Testimonial Card:
  rounded-3xl p-6 bg-[--cream-white] shadow system
  Quote: Playfair Display italic, Charcoal Ink
  Author: DM Sans SemiBold + city (Stone Grey)
  Service badge: rounded-full Sage Mist bg, Bamboo Label style
  Star rating: Accent Gold ★ symbols
```

---

### 2I — CTA BANNER

```
Container: rounded-3xl min-h-[400px] overflow-hidden relative
Background: full bamboo grove image
Overlay gradient: bg-gradient-to-r from-[#1C3A2B] via-[rgba(28,58,43,0.8)] to-transparent

Content (left-aligned, max-w-lg):
  H2 headline (Playfair Display, Ivory Paper) — blur-in animation
  3 value propositions: icon + title + description, staggered reveal
  CTA button: Accent Gold, rounded-full

Scroll-triggered animation:
  Banner: opacity-0 scale-95 → opacity-100 scale-100, 700ms ease-out
```

---

### 2J — NEWSLETTER / LEAD CAPTURE

```
Container: Full-width, bg-[--deep-forest], py-24

Content (centered, max-w-2xl):
  Section label: Bamboo Label style, Sage Mist colour
  H2: Playfair Display, Ivory Paper colour
  Subtext: DM Sans 18px, Stone Grey

Form:
  Row layout: [email input] [Submit button] side by side (stacked on mobile)
  Input: backdrop-blur-sm, bg-[rgba(255,255,255,0.08)], border rgba(255,255,255,0.16)
         rounded-full (pill shape), text-ivory, placeholder Stone Grey, px-6 py-4
  Button: bg-[--accent-gold], text-[--deep-forest], rounded-full, px-8 py-4 SemiBold
  
Success state:
  Swap form for: ✓ checkmark icon + "You're in! Welcome to The Sync." message
  Animate: old form fades out, success slides up from below, 400ms

Micro-copy: "No spam. One email a month. Unsubscribe anytime."
  DM Sans 13px, Stone Grey, centered below form
```

---

### 2K — FOOTER

```
Container: bg-[--charcoal-ink], relative overflow-hidden

Watermark (behind all content):
  Text: "EventSync"
  Font size: text-[200px] md:text-[400px]
  Color: [--ivory-paper] opacity-[0.06]
  Positioned: absolute bottom-0 left-0
  Font: Playfair Display Bold
  Pointer-events: none, user-select: none

4-column grid:
  Column 1 (Brand):
    Logo mark + "🎋 Event Sync"
    Tagline: "Grow together. Track every step."
    Social icons row: rounded-full bg-[--charcoal-ink] border border-[--stone-grey]
      hover: border-[--bamboo-green] + icon turns Bamboo Green, transition 300ms
    Social platforms: Instagram, LinkedIn, Twitter/X, GitHub

  Columns 2–4 (Links):
    Heading: DM Sans 12px uppercase letter-spacing 0.1em, Stone Grey
    Links: DM Sans 15px, Stone Grey, hover:text-ivory transition 200ms
    Column 2: Platform (Features, Pricing, Changelog, Roadmap, API Docs)
    Column 3: About (Our Story, Design Philosophy, Team, Blog, Careers)
    Column 4: Support (Help Center, Getting Started, Contact, Status, Forum)

Bottom bar:
  border-top: 1px solid rgba(140,140,140,0.2)
  © 2025 Event Sync | Privacy Policy | Terms | Cookie Settings
  DM Sans 13px, Stone Grey
```

---

## ═══════════════════════════════════════
## SECTION 3 — USER ROLES & PERMISSIONS
## ═══════════════════════════════════════

| Feature | Admin (Exco) | Member |
|---------|-------------|--------|
| Contribution Dashboard | ✓ Full access | ✗ |
| Kanban — Bird's Eye Overview | ✓ | ✗ |
| Kanban — Open Board (Task Detail) | ✓ | ✓ (own tasks only) |
| Kanban — Add Event | ✓ | ✗ |
| Kanban — Manage Members | ✓ | ✗ |
| Kanban — Drag & Drop | ✓ | ✗ |
| Add Contribution | ✗ | ✓ (personal only) |
| Attendance — View & Manage | ✓ | ✗ |
| Member Detail View | ✓ Full edit | ✗ |
| Settings | ✓ | ✓ (own profile only) |

---

## ═══════════════════════════════════════
## SECTION 4 — ADMIN (EXCO) SCREENS
## ═══════════════════════════════════════

### 4A — CONTRIBUTION DASHBOARD

**Route:** `/admin/dashboard`

---

#### 4A-1. Event Countdown Cards

**Section heading:** `Upcoming Events & Deadlines` (H2 + blur-in)

**Layout:** Horizontal scroll row. Cards: min-width 280px, rounded-3xl, shadow system.

**Deadline colour rules (left border stripe 4px + badge):**

| Remaining | Badge | Color | Hex |
|-----------|-------|-------|-----|
| ≤ 7 days | `URGENT` | Deadline Red | `#C0503A` |
| 8–14 days | `DUE SOON` | Deadline Amber | `#D4914A` |
| 15+ days | `ON TRACK` | Deadline Green | `#3D8B5E` |

**Per card:** Event name, date, countdown label, overall progress bar, `[Open Kanban →]` link.

**Animation:** Urgent cards pulse: scale 1 → 1.03 → 1, 2s loop.

**Empty state:** Bamboo sprout SVG + *"No upcoming events. Add one from the Kanban Board."*

---

#### 4A-2. Metrics KPI Cards

**Section heading:** `At a Glance`

**Layout:** 4-column grid desktop, 2×2 tablet, 1-column mobile. Each: rounded-3xl, shadow system, hover:scale-[1.02].

| # | Icon | Metric | Trend |
|---|------|--------|-------|
| 1 | 🤝 | **Avg Weekly Meeting Participation** (%) | ↑/↓ vs last month |
| 2 | 🎯 | **Avg Event Participation** (%) | ↑/↓ vs last month |
| 3 | 📅 | **Upcoming Meeting Collaborations** (count + next date) | — |
| 4 | 📧 | **Unreplied Emails** (count + oldest timestamp) | Red if > 5 |

**Card anatomy:**
- Icon: 48×48px rounded-full, Sage Mist bg, Bamboo Green icon
- Metric number: 48px bold, Deep Forest
- Label: DM Sans 14px, Stone Grey
- Trend chip: rounded-full pill, ↑ Leaf Green / ↓ Deadline Red

---

#### 4A-3. Member Contribution Table

**Section heading:** `Member Overview`

**Controls row:**
- `Search members...` input (left)
- `Filter by Department ▼` dropdown
- `Filter by Status ▼` dropdown
- `Export CSV` button (right, outlined)

**Departments:**
Inspire | Monthly Meet-ups | Publicity | Software Technology | Connectors | Labs

**Table columns:**

| Column | Notes |
|--------|-------|
| # | Row number |
| Name | Avatar (32px circle) + Full name |
| Department | Colour-coded pill badge |
| Events | Count (e.g. `3`) |
| Tasks | Mini progress `3/5` + inline progress bar |
| Contribution Status | Active / At Risk / Inactive / Completed badge |
| Hours Logged | e.g. `14.5 hrs` |
| Last Submitted | Relative date (e.g. `3 days ago`) |
| Actions | `View` button + `Edit` button |

**Department badge colours:**

| Dept | Background | Text |
|------|------------|------|
| Inspire | `#D4E8D4` | `#1C3A2B` |
| Monthly Meet-ups | `#D4E0F0` | `#1A2F5A` |
| Publicity | `#F0E8D4` | `#5A3A1A` |
| Software Technology | `#E8D4F0` | `#3A1A5A` |
| Connectors | `#F0D4D4` | `#5A1A1A` |
| Labs | `#D4F0EC` | `#1A5A4A` |

**Contribution status colours:**

| Status | Colour |
|--------|--------|
| Active | Bamboo Green `#4A7C59` |
| At Risk | Deadline Amber `#D4914A` |
| Inactive | Deadline Red `#C0503A` |
| Completed | Accent Gold `#C4A35A` |

**Pagination:** 10 rows / page. `< Prev | Page 1 of 4 | Next >`

---

#### 4A-4. Member Detail — Slide-in Panel

**Trigger:** `View` button in table Actions column.

**Layout:** Right slide-in drawer (480px, see Component 2G).

**Panel sections:**

**Header:**
- Avatar (80px circle), Name (H3), Department badge, Status badge
- `Member since [date]`
- `[Edit Member]` button (top-right of panel)

**Section 1 — Basic Info (2-col grid):**
Full Name, Department, Role (Member / Project IC), Email, Contribution Status, Hours Logged, Last Submitted Work.

**Section 2 — Events & Tasks (mini table):**
Event Name | Task | Status | Due Date | Hours Spent

**Section 3 — Challenges Faced** *(subheading, Playfair Display italic)*
Rich text field. Timestamped entries. Each entry: date prefix + challenge description.
> e.g. *"March 2025 — Difficulty coordinating with Publicity team for slide deck handover."*

**Section 4 — Outcome of Contribution** *(subheading, Playfair Display italic)*
Rich text field. Bullet list of contributions.
> e.g.
> - Developed event registration module
> - Contributed 3 design reviews cross-department
> - Completed all tasks for Open Day event

**Edit mode:** All fields become inline-editable. Sticky footer: `Save Changes` + `Cancel`.

---

### 4B — KANBAN BOARD (EXCO VIEW)

**Route:** `/admin/kanban`

---

#### 4B-1. Board Overview

**Page header row:**
```
[🗂 Kanban Board]         [Manage Members]   [+ Add Event]
─────────────────────────────────────────────────────────
Showing N active events
```

**4 Pillars:**

| Pillar | Header Color | Description |
|--------|-------------|-------------|
| 🆕 New | Stone Grey | Not yet started |
| 🔄 In Progress | Bamboo Green | Actively working |
| 🔍 In Review | Deadline Amber | Submitted, awaiting review |
| ✅ Done | Accent Gold | Completed & approved |

**Event Card (per pillar):**
```
┌─────────────────────────────────────────┐  ← rounded-3xl, shadow system
│ [DEADLINE BADGE]    🎉 Open Day 2025 [⋮]│
│ 📅 28 March 2025                        │
│ ─────────────────────────────────────── │
│ Progress:                               │
│  New        ████░░░░  2 (25%)           │
│  In Progress████████  4 (50%)           │
│  In Review  ██░░░░░░  1 (12.5%)         │
│  Done       ██░░░░░░  1 (12.5%)         │
│                                         │
│ [Open Board →]                          │
└─────────────────────────────────────────┘
```

**3-dot menu (⋮):** Edit Event | Archive Event | Delete Event

**Drag behaviour:**
- Dragging: card lifts 4px, opacity 90%, rotate 1deg, shadow increases
- Drop zone: dashed border, Sage Mist bg at 20%
- On drop: slides to position 300ms, pillar count badge updates instantly

---

#### 4B-2. Open Board — Task Detail

**Trigger:** `Open Board →` button on Event Card

**Breadcrumb:** `← Back to Kanban → Open Day 2025`

**Same 4-pillar layout.** Now shows individual **task cards**:

```
┌──────────────────────────────┐
│ [DEPT BADGE]                 │
│ Publicity — Slides           │  ← DM Sans 15px SemiBold
│ Assigned: Jie Ying           │  ← Stone Grey 13px
│ ≡  (drag handle)             │  ← Appears on hover, left edge
└──────────────────────────────┘
```

**Task name convention:** `Department — Task`
Examples: `Publicity — Slides` | `Inspire — Proposal` | `Software Technology — Feature` | `Connectors — Outreach Email` | `Labs — Research Report` | `Monthly Meet-ups — Logistics`

---

#### 4B-3. Manage Members Drawer

**Trigger:** `Manage Members` button

**Drawer:** Right slide-in, 480px (see Component 2G)

**Existing members list:**
```
[Avatar 32px]  Jie Ying     [Project IC badge]  [✕ Remove]
[Avatar 32px]  Alex Tan     [Member badge]       [✕ Remove]
```

**Role badges:**
- `Project IC` → Accent Gold bg, Deep Forest text
- `Member` → Sage Mist bg, Deep Forest text

**Add member:**
- Search input: `Search by name or email...`
- Dropdown: shows avatar + name + department from database
- On select: append row with role selector (Project IC / Member)

**Footer:** `Save Changes` (Bamboo Green, full-width) | `Cancel`

---

#### 4B-4. Add Event Form

**Trigger:** `+ Add Event` button (top-right)

**Layout:** Full-screen modal (desktop) / new page (mobile)

**Form fields:**

| Field | Type | Rules |
|-------|------|-------|
| Event Name | Text | Required, max 80 chars |
| Description | Rich textarea | Optional, max 500 chars |
| Event Date | Date picker | Required, future dates only |
| Members | Multi-select from database | Min 1 required |

**Per selected member sub-row:**
```
[Avatar] Name  [Department ▼]  [Task input]  [Role ▼]  [✕]
```
- Department: dropdown (all 6 departments)
- Task: free-text
- Role: Project IC / Member

**Form footer:** `Create Event` (primary) | `Save as Draft` (outlined) | `Cancel` (text)

---

### 4C — ATTENDANCE

**Route:** `/admin/attendance`

**Tab switcher:** `[Event Participation]  [Weekly Meetings]` — pill segmented control

---

#### 4C-1. Event Participation Tab

**Filters:** Event selector dropdown | Date range picker | Department filter

**Table columns:** Member Name + Avatar | Department | Event Name | Status | Date | Notes

**Status options:**

| Status | Colour |
|--------|--------|
| Attended | Leaf Green `#3D8B5E` |
| Absent | Deadline Red `#C0503A` |
| Excused | Deadline Amber `#D4914A` |

**Summary bar above table:**
> Total: 8 events | Avg Attendance: 76% | Highest: Open Day (92%) | Lowest: Workshop A (54%)

---

#### 4C-2. Weekly Meetings Tab

Same table structure + extra column: `Week Number` (e.g. `Week 11 — 14 Mar 2025`)

**3 summary KPI cards above table:**
- Total Weekly Meetings This Month
- Avg Attendance Rate
- Members with Perfect Attendance (this month)

---

## ═══════════════════════════════════════
## SECTION 5 — MEMBER SCREENS
## ═══════════════════════════════════════

### 5A — MEMBER KANBAN BOARD

**Route:** `/member/kanban`

**Page header:**
```
[My Kanban Board]                    [+ Add Contribution]
─────────────────────────────────────────────────────────
Viewing: Open Day 2025  [Event selector ▼]
```

**Same 4-pillar layout as Admin.**

**Key differences:**
- Shows ONLY tasks assigned to THIS member (not all members)
- No drag-and-drop (read-only pillar assignment)
- No `Manage Members` button
- No event management controls
- `+ Add Contribution` replaces `+ Add Event`

**Member Task Card:**
```
┌──────────────────────────────────┐
│ [DEPT BADGE]                     │
│ Software Technology — Feature    │
│ 📅 Due: 28 March 2025            │
│ Assigned by: Admin               │
└──────────────────────────────────┘
```

---

### 5B — ADD CONTRIBUTION FORM

**Trigger:** `+ Add Contribution` button (top-right)

**Layout:** Right slide-in drawer, 480px (see Component 2G)

**Panel title:** `Add My Contribution`

**Sub-copy:** *"Log your individual contribution to the team. Your admin will review and update your task status."*

**Form fields:**

| Field | Type | Validation |
|-------|------|------------|
| Task | Text input | Required. Hint: `Department — Task` |
| Description | Textarea | Required, max 400 chars |
| Outcome | Textarea | Required, max 300 chars |
| Priority Level | Segmented pill control | Required |
| Attachment | File upload | Optional. PDF/PNG/JPG/DOCX, max 10MB |

**Priority Levels:**

| Priority | Icon | Background | Text |
|----------|------|------------|------|
| Low | 🌱 | Sage Mist `#A8C5A0` 20% | Bamboo Green |
| Medium | 🎋 | Bamboo Green `#4A7C59` 20% | Bamboo Green |
| High | 🔥 | Deadline Amber `#D4914A` 20% | Amber |
| Urgent | ⚡ | Deadline Red `#C0503A` 20% | Red |

**After submission:**
- New contribution card appears in member's `New` pillar
- Toast: *"Your contribution has been logged! ✓"* (Leaf Green, 4s auto-dismiss)
- Admin sees card immediately in Open Board

---

## ═══════════════════════════════════════
## SECTION 6 — SHARED COMPONENTS
## ═══════════════════════════════════════

### Progress Ring
- SVG, 80px large / 40px small
- Stroke: Bamboo Green on Sage Mist track
- Animated on mount: ease-out, 800ms, draws from 0% to value
- Center: % number, bold, Deep Forest

### Deadline Countdown Badge
- Coloured dot + text label + days remaining
- Background: matching colour at 15% opacity, 1px matching border
- `URGENT` badge pulses (scale 1→1.03→1, 2s loop) when ≤3 days

### Department Badge
- Pill (border-radius 999px)
- Per-department colour map (see Section 4A-3)
- 11px uppercase, letter-spacing 0.1em

### Toast Notifications

| Type | Icon | Colour | Duration |
|------|------|--------|----------|
| Success | ✓ | Leaf Green | 4s |
| Warning | ⚠ | Deadline Amber | 6s |
| Error | ✕ | Deadline Red | 6s |
| Info | ℹ | Bamboo Green | 4s |

Slide in from right: translateX(100%) → 0, 200ms. Auto-dismiss: fade + slide out.

### Empty States

| Screen | Illustration | Copy |
|--------|-------------|------|
| No events | Bamboo sprout SVG | *"Your grove starts here. Add your first event."* |
| No members | Silhouette + leaf | *"No members yet. Invite your first member."* |
| No contributions | Open scroll | *"Nothing logged yet. Add your contribution above."* |
| No attendance | Calendar + leaf | *"No records found for this period."* |

---

## ═══════════════════════════════════════
## SECTION 7 — ANIMATION REFERENCE
## ═══════════════════════════════════════

```css
/* Blur-in — for all section headings */
@keyframes blur-in {
  0%   { filter: blur(12px); opacity: 0; transform: translateY(8px); }
  100% { filter: blur(0);    opacity: 1; transform: translateY(0);   }
}
.animate-blur-in { animation: blur-in 0.8s ease-out forwards; }

/* Testimonial auto-scroll */
@keyframes scroll-down {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}
@keyframes scroll-up {
  0%   { transform: translateY(-50%); }
  100% { transform: translateY(0); }
}
.col-scroll-down { animation: scroll-down 30s linear infinite; }
.col-scroll-up   { animation: scroll-up   30s linear infinite; }
.col-scroll-down:hover,
.col-scroll-up:hover { animation-duration: 60s; }

/* Deadline red pulse */
@keyframes deadline-pulse {
  0%, 100% { transform: scale(1);    }
  50%       { transform: scale(1.03); }
}
.deadline-pulse { animation: deadline-pulse 2s ease-in-out infinite; }
```

### Micro-interaction Reference Table

| Interaction | Before | After | Duration |
|-------------|--------|-------|----------|
| Page load navbar | translateY(-100%) opacity-0 | translateY(0) opacity-1 | 600ms |
| Section heading | blur(12px) opacity-0 translateY(8px) | blur(0) opacity-1 translateY(0) | 800ms |
| Card reveal | opacity-0 scale-95 | opacity-100 scale-100 | 700ms |
| Card hover | scale(1) | scale(1.02) | 300ms |
| Button arrow | translateX(0) | translateX(4px) | 300ms |
| Drawer open | translateX(100%) | translateX(0) | 300ms |
| Kanban drag start | scale(1) rotate(0) | scale(1.02) rotate(1deg) opacity(0.9) | 150ms |
| Kanban drop | — | slide to position | 300ms |
| Progress ring | strokeDashoffset full | strokeDashoffset 0 | 800ms |
| Urgent badge | scale(1) | scale(1.03) | 2s loop |
| Toast in | translateX(100%) | translateX(0) | 200ms |
| Toast out | opacity(1) | opacity(0) translateX(100%) | 150ms |
| Tab switch | — | active bg slides across | 300ms |
| Form success | form visible | form fades out, success slides up | 400ms |
| Mobile menu | max-h-0 | max-h-64 | 300ms |

---

## ═══════════════════════════════════════
## SECTION 8 — DATA MODEL
## ═══════════════════════════════════════

```
User
  id, name, email, avatar_url
  role: "admin" | "member"
  department: one of 6 departments
  joined_date, status: "active" | "inactive"

Event
  id, name, description, date
  created_by (user_id of admin)
  status: "new" | "in_progress" | "in_review" | "done"

EventMember (join table)
  event_id, user_id
  role: "project_ic" | "member"
  department, task
  pillar_status: "new" | "in_progress" | "in_review" | "done"

Contribution (member-submitted)
  id, user_id, event_id (nullable)
  task, description, outcome
  priority: "low" | "medium" | "high" | "urgent"
  attachment_url, submitted_at

Attendance
  id, user_id
  event_id (nullable — null = weekly meeting)
  type: "event" | "weekly_meeting"
  meeting_week (for weekly type: e.g. "2025-W11")
  status: "attended" | "absent" | "excused"
  notes, date

MemberDetail (extended profile)
  user_id (1:1 with User)
  hours_logged (float)
  last_submitted_date
  challenges_faced (rich text, JSON array of {date, text} entries)
  contribution_outcome (rich text, JSON array of bullet strings)
```

---

## ═══════════════════════════════════════
## SECTION 9 — FIGMA FILE STRUCTURE
## ═══════════════════════════════════════

```
📁 Event Sync v3 — Design System
  ├── 🎨  00 — Tokens
  │       Colors · Typography · Spacing · Shadows · Animation values
  │
  ├── 🧩  01 — Components
  │       Buttons (Primary, Secondary, Ghost, Danger, Icon)
  │       Inputs (Text, Textarea, Select, Date, File upload)
  │       Badges (Department × 6, Status × 4, Deadline × 3, Priority × 4, Role × 2)
  │       Progress (Ring large, Ring small, Bar, Mini inline bar)
  │       Cards (Event, Task, KPI, Member row, Testimonial, Feature, Plan)
  │       Kanban Pillar (header + card slot)
  │       Navigation (Sidebar, Topbar, Mobile Bottom Nav, Breadcrumb)
  │       Table (Header row, Body row, Pagination bar)
  │       Modals (Full-screen form, Confirmation dialog)
  │       Drawers (Right slide-in, with header/content/footer slots)
  │       Toasts (Success, Warning, Error, Info)
  │       Empty States (× 4 variants)
  │       Countdown Badge (Red, Amber, Green)
  │       Priority Segmented Control
  │       Tab Switcher (pill style)
  │
  ├── 👑  02 — Admin (Exco) Pages
  │       Dashboard — Contribution Overview
  │       Dashboard — Member Detail Panel
  │       Kanban — Bird's Eye Board
  │       Kanban — Open Board (Task Detail)
  │       Kanban — Add Event Form (modal)
  │       Kanban — Manage Members (drawer)
  │       Attendance — Event Participation
  │       Attendance — Weekly Meetings
  │
  ├── 🌿  03 — Member Pages
  │       Kanban — My Board
  │       Kanban — Add Contribution (drawer)
  │
  ├── 🔐  04 — Auth Pages
  │       Login (with bamboo hero background)
  │       Role redirect (Admin → Dashboard | Member → Kanban)
  │
  ├── 🌐  05 — Marketing / Landing Pages
  │       Homepage (all 8 sections)
  │       Plans & Pricing page
  │
  └── 📱  06 — Mobile Frames (390px)
          Admin — Dashboard
          Admin — Kanban
          Admin — Attendance
          Member — My Kanban
          Member — Add Contribution drawer
          Auth — Login
```

---

## ═══════════════════════════════════════
## SECTION 10 — COMPLETE QA CHECKLIST
## ═══════════════════════════════════════

> **How to use:** Work through this checklist screen by screen, feature by feature. Every item must be ticked before the build is considered production-ready. Mark each as ✅ (done), 🔄 (in progress), or ❌ (blocked).

---

### 🎨 A — BRAND & DESIGN TOKENS

- [ ] All 13 colour tokens defined as CSS variables / Figma styles
- [ ] Deadline colours (Red / Amber / Green) applied ONLY via token, never hardcoded
- [ ] Playfair Display loaded for all H1–H3 headings
- [ ] DM Sans loaded for all H4, body, UI labels
- [ ] Bamboo Label style (11px, uppercase, 0.12em letter-spacing, Bamboo Green) applied to all section labels, table headers, and badge text
- [ ] No sharp corners anywhere — minimum border-radius 8px on any visible element
- [ ] All cards, containers, image wrappers use border-radius 20–24px (rounded-3xl)
- [ ] Badge/pill elements use border-radius 999px (fully rounded)
- [ ] Multi-layered shadow system applied to all cards, navbar, drawers, modals — no shadow-lg/xl
- [ ] Section padding is py-24 (96px) on all full-width sections
- [ ] Content blocks use max-w-7xl with px-6 lg:px-8
- [ ] 8pt spacing grid followed throughout (no arbitrary spacing)
- [ ] Bamboo SVG texture overlay applied to hero at 5% opacity
- [ ] No generic fonts (Arial, Roboto, Inter, System-UI) in production
- [ ] Ivory Paper `#F5F0E8` is the page background (not white)

---

### ✨ B — ANIMATION & MOTION

- [ ] `blur-in` keyframe defined and applied to all section headings
- [ ] Section label: animation-delay 0.2s
- [ ] Section headline: animation-delay 0.4s
- [ ] Section subtext: animation-delay 0.6s
- [ ] All heading elements start `opacity-0` and only animate when scrolled into view (not on page load)
- [ ] IntersectionObserver used for scroll-triggered reveals (threshold: 0.1)
- [ ] Scroll-triggered cards: opacity-0 scale-95 → opacity-100 scale-100, 700ms ease-out
- [ ] Card stagger delays: 0ms, 80ms, 160ms, 240ms... (80ms increments)
- [ ] Card hover: scale(1.02) with 300ms transition-all ease-out
- [ ] Button arrow icons: group-hover translate-x-1
- [ ] Quick-add / reveal buttons: opacity-0 translate-y-2 → group-hover opacity-100 translate-y-0
- [ ] Navbar entry: translateY(-100%) → translateY(0) + opacity, 600ms on page load
- [ ] Progress rings animate from 0% to value on mount, ease-out, 800ms
- [ ] Deadline URGENT badges pulse (scale 1 → 1.03 → 1) when ≤3 days, 2s loop
- [ ] Testimonial columns auto-scroll (Col 1+3 down, Col 2 up), 30s linear
- [ ] Testimonial hover slows to 60s animation-duration
- [ ] Testimonial cards duplicated ([...cards, ...cards]) for seamless loop
- [ ] Testimonial section has h-32 gradient masks top and bottom
- [ ] Tab switcher: active indicator slides across, 300ms
- [ ] Kanban drag: card lifts (shadow, opacity 90%, rotate 1deg, scale 1.02), 150ms
- [ ] Kanban drop: card slides to position 300ms, pillar count updates instantly
- [ ] Drop zone: dashed Bamboo Green border + Sage Mist bg 20% while dragging over
- [ ] Drawer open: translateX(100%) → 0, 300ms ease-out
- [ ] Drawer overlay: fade in 200ms, bg 40% opacity + backdrop-blur-sm
- [ ] Toast slide in from right: 200ms
- [ ] Toast dismiss: fade + slide out 150ms
- [ ] Mobile nav menu: max-h-0 → max-h-64 slide-down, 300ms ease-out
- [ ] Form success state: form fades out, success message slides up, 400ms
- [ ] CTA Banner: scroll-triggered scale opacity reveal, 700ms

---

### 🧭 C — NAVBAR

- [ ] Fixed position (stays at top on scroll)
- [ ] Floating with 12px margin from all edges
- [ ] Height is exactly 68px
- [ ] Backdrop-blur-md applied
- [ ] Background: rgba(245,240,232,0.72) (not solid white)
- [ ] Border: 1px border-[rgba(74,124,89,0.16)]
- [ ] Logo centered via absolute positioning
- [ ] Nav links left-aligned
- [ ] Icons right-aligned (search, bell, avatar)
- [ ] Notification bell shows unread count badge
- [ ] Avatar opens dropdown (profile, settings, logout)
- [ ] Active nav link is visually distinct (Bamboo Green, bold, or underline indicator)
- [ ] Mobile: hamburger icon visible, desktop links hidden
- [ ] Mobile menu opens/closes with slide-down transition
- [ ] Mobile menu closes when clicking outside or pressing Escape
- [ ] Admin nav shows: Dashboard, Kanban, Attendance
- [ ] Member nav shows: My Kanban only
- [ ] Entry animation fires once on page load

---

### 📊 D — CONTRIBUTION DASHBOARD (Admin)

**D1 — Countdown Cards**
- [ ] Events sorted by date (soonest first) by default
- [ ] Left border stripe is correctly colour-coded per deadline rule
- [ ] Badge label is correct: URGENT / DUE SOON / ON TRACK
- [ ] Countdown text shows correct number of days/weeks remaining
- [ ] Overall progress bar calculates % from member task statuses
- [ ] `Open Kanban →` navigates to correct event's kanban board
- [ ] 3-dot menu has Edit / Archive / Delete options
- [ ] URGENT badge pulses when ≤3 days remaining
- [ ] Cards are horizontally scrollable on mobile
- [ ] Empty state displays when no events exist

**D2 — KPI Cards**
- [ ] All 4 KPI cards render with correct icon, metric, label, trend
- [ ] Trend arrow is green (↑) or red (↓) depending on direction
- [ ] Trend shows "vs last month" comparison text
- [ ] Unreplied Emails card turns red when count > 5
- [ ] Upcoming collaborations shows next meeting date
- [ ] Cards are responsive (4-col → 2×2 → 1-col)
- [ ] Scroll-triggered reveal with 80ms stagger between cards

**D3 — Member Table**
- [ ] Table displays all required columns (see Section 4A-3)
- [ ] Department badges are colour-coded correctly for all 6 departments
- [ ] Contribution Status badges are colour-coded correctly (4 states)
- [ ] Tasks column shows `done/total` format + mini progress bar
- [ ] Last Submitted shows relative date (e.g. "3 days ago")
- [ ] Columns are sortable (clicking header toggles ↑/↓)
- [ ] Search input filters rows in real-time
- [ ] Department filter shows correct options (All + 6 departments)
- [ ] Status filter shows correct options (All + 4 statuses)
- [ ] Pagination shows 10 rows per page
- [ ] Pagination controls work correctly (Prev / Next / page numbers)
- [ ] Export CSV button downloads all filtered data
- [ ] Empty state shows when no members match filters
- [ ] Row hover has Sage Mist background transition

**D4 — Member Detail Panel**
- [ ] `View` button opens right slide-in drawer
- [ ] Drawer header shows avatar, name, department, status, joined date
- [ ] Basic Info grid shows all 7 fields correctly
- [ ] Events & Tasks mini-table loads correctly for this member
- [ ] "Challenges Faced" section is visible with timestamp entries
- [ ] "Outcome of Contribution" section renders as bullet list
- [ ] `Edit Member` opens edit mode (fields become editable)
- [ ] Edit mode has sticky Save / Cancel footer
- [ ] Saving updates the table row immediately
- [ ] Drawer closes via ✕ button or clicking overlay
- [ ] Escape key closes drawer
- [ ] Mobile: drawer is full-screen

---

### 🗂 E — KANBAN BOARD (Admin)

**E1 — Board Overview**
- [ ] 4 pillars visible: New, In Progress, In Review, Done
- [ ] Column headers show pillar name + card count badge
- [ ] Column header has 3px top border in correct colour
- [ ] Event cards show: name, date, deadline badge, 4-row progress breakdown, Open Board button
- [ ] Progress % calculations are accurate (members per pillar / total)
- [ ] `Open Board →` navigates to correct event's detail board
- [ ] 3-dot menu on each card: Edit, Archive, Delete
- [ ] Drag-and-drop works across all 4 pillars
- [ ] Drag animation: lift + opacity + rotate applied
- [ ] Drop zone: highlighted with dashed border + Sage Mist bg
- [ ] After drop: pillar count badges update
- [ ] `+ Add Event` button is visible top-right
- [ ] `Manage Members` button is visible in header

**E2 — Open Board (Task Detail)**
- [ ] Breadcrumb shows `← Back to Kanban → Event Name`
- [ ] Event name and date shown in page header
- [ ] Tasks are shown only for THIS event
- [ ] Task cards show: department badge, task text (Dept — Task format), assignee name
- [ ] Task cards are draggable between pillars
- [ ] Drag handle appears on card hover (left edge, 4px wide)
- [ ] All 6 department badge colours apply correctly to task cards
- [ ] Task name follows convention: `Department — Task`

**E3 — Manage Members Drawer**
- [ ] Drawer opens from `Manage Members` button
- [ ] Existing members list shows avatar, name, role badge, remove button
- [ ] Role badges: Project IC (Accent Gold) vs Member (Sage Mist)
- [ ] Removing a member shows confirmation step before removing
- [ ] Search field filters from member database
- [ ] Selecting a member adds them to list
- [ ] Role selector (Project IC / Member) available on add
- [ ] `Save Changes` saves all adds/removals
- [ ] Changes reflect immediately in board without full page reload
- [ ] Cancel discards all unsaved changes

**E4 — Add Event Form**
- [ ] Form opens as full-screen modal (desktop) or new page (mobile)
- [ ] Event Name: required, max 80 char counter shown
- [ ] Description: optional, max 500 char counter shown
- [ ] Event Date: date picker, past dates disabled
- [ ] Members multi-select works (search + select from database)
- [ ] Per-member sub-row appears for each selected member
- [ ] Sub-row has: avatar, name, Department dropdown, Task input, Role dropdown, Remove
- [ ] Department dropdown has all 6 options
- [ ] Role dropdown: Project IC / Member
- [ ] `Create Event` validates all required fields before submitting
- [ ] Validation errors shown inline below each field
- [ ] `Save as Draft` saves without requiring all fields
- [ ] On success: modal closes, new event card appears in `New` pillar
- [ ] Success toast fires after creation

---

### 📅 F — ATTENDANCE (Admin)

- [ ] Tab switcher (Event Participation / Weekly Meetings) works
- [ ] Active tab is visually distinct with sliding indicator
- [ ] Event Participation tab loads with correct table columns
- [ ] Event selector dropdown loads all events
- [ ] Date range picker filters records correctly
- [ ] Department filter works
- [ ] Status badges: Attended (Green), Absent (Red), Excused (Amber)
- [ ] Summary bar shows: Total events, Avg attendance, Highest, Lowest
- [ ] Weekly Meetings tab has same table + Week Number column
- [ ] Weekly tab shows 3 KPI cards (Meetings count, Avg rate, Perfect attendance)
- [ ] Export CSV downloads filtered table data

---

### 🌿 G — MEMBER KANBAN

- [ ] Member only sees tasks assigned to THEM (not other members' tasks)
- [ ] All 4 pillars visible (New, In Progress, In Review, Done)
- [ ] Tasks are read-only (no drag-and-drop)
- [ ] No `Manage Members`, `+ Add Event`, or admin controls visible
- [ ] Event selector dropdown works
- [ ] Task cards show: department badge, task text, due date, "Assigned by Admin"
- [ ] `+ Add Contribution` button visible top-right
- [ ] Empty state shows if no tasks assigned

---

### 📝 H — ADD CONTRIBUTION (Member)

- [ ] Drawer slides in from right
- [ ] Title and sub-copy are correct
- [ ] Task input: required, shows format hint `Department — Task`
- [ ] Description textarea: required, 400 char counter
- [ ] Outcome textarea: required, 300 char counter
- [ ] Priority segmented control: 4 options with correct colours
- [ ] Active priority option has sliding background indicator
- [ ] File upload: accepts PDF/PNG/JPG/DOCX, max 10MB
- [ ] File upload shows file name + size after selection
- [ ] Oversized file shows error inline
- [ ] Submit validates all required fields
- [ ] Validation errors shown inline
- [ ] On success: drawer closes, card appears in Member's `New` pillar
- [ ] Success toast fires with correct message
- [ ] Admin sees the new card in Open Board immediately (or on next refresh)
- [ ] Cancel closes drawer without saving

---

### 🧩 I — SHARED COMPONENTS

**Progress Ring**
- [ ] Large (80px) and small (40px) variants exist
- [ ] Bamboo Green stroke on Sage Mist track
- [ ] Animates from 0% to value on mount, 800ms ease-out
- [ ] Centre label shows % correctly

**Deadline Badge**
- [ ] 3 variants: Urgent (Red), Due Soon (Amber), On Track (Green)
- [ ] Background is matching colour at 15% opacity
- [ ] Border is 1px in matching colour
- [ ] Text: coloured dot + label + days remaining
- [ ] ≤3-day badges have pulse animation

**Department Badges**
- [ ] All 6 departments render with correct background + text colour
- [ ] Font style: Bamboo Label (11px, uppercase, 0.12em spacing)

**Toast Notifications**
- [ ] 4 variants: Success, Warning, Error, Info
- [ ] Slide in from right, 200ms
- [ ] Auto-dismiss after 4s (Success/Info) or 6s (Warning/Error)
- [ ] Manual ✕ close button works
- [ ] Only 1 toast visible at a time (queue if multiple fire)
- [ ] aria-live region announces to screen readers

**Empty States**
- [ ] All 4 empty state illustrations and copy are implemented
- [ ] Displayed only when relevant list/table is truly empty
- [ ] CTA button in empty state links to correct action

**Drawers**
- [ ] Overlay dims background at 40% opacity + backdrop-blur-sm
- [ ] Drawer slides in from right, 300ms ease-out
- [ ] ✕ button closes drawer
- [ ] Clicking overlay closes drawer
- [ ] Escape key closes drawer
- [ ] Footer buttons sticky at bottom of drawer
- [ ] Mobile: drawer is 100% width full-screen

---

### 🔐 J — AUTH & ROLE ROUTING

- [ ] Login page uses bamboo hero background
- [ ] Login form has email + password fields (DM Sans, rounded-xl inputs)
- [ ] Invalid credentials show error toast/inline message
- [ ] On login: role is checked
- [ ] Admin role → redirected to `/admin/dashboard`
- [ ] Member role → redirected to `/member/kanban`
- [ ] Accessing admin routes as a member → redirected to member kanban
- [ ] Accessing member routes as admin → allowed (admin can see all)
- [ ] Session persists on page refresh (token stored)
- [ ] Logout clears session and returns to login page
- [ ] Avatar dropdown has `Log Out` option

---

### ♿ K — ACCESSIBILITY

- [ ] All text meets WCAG AA contrast minimum (4.5:1 for normal, 3:1 for large text)
- [ ] Deep Forest on Ivory Paper: contrast checked ✓
- [ ] Bamboo Green on Cream White: contrast checked ✓
- [ ] All deadline colour text has a text label (colour is never the ONLY indicator)
- [ ] All status badges have text label (not colour-only)
- [ ] Focus states: 2px Bamboo Green outline, 2px offset, on every interactive element
- [ ] All interactive elements reachable via keyboard Tab key
- [ ] Kanban drag-and-drop has keyboard alternative (arrow keys + Enter/Space)
- [ ] All form fields have visible `<label>` elements (no placeholder-as-label)
- [ ] Required fields are marked (asterisk + aria-required)
- [ ] Form validation errors use aria-describedby to link error to input
- [ ] All icon-only buttons have aria-label attribute
- [ ] All decorative images have empty alt=""
- [ ] All informative images have descriptive alt text
- [ ] Tables have `<th scope="col">` on all header cells
- [ ] Tables have `<th scope="row">` on row headers (member names)
- [ ] Drawer/modal traps focus while open (Tab loops within)
- [ ] Drawer/modal returns focus to trigger element on close
- [ ] Toast notifications use aria-live="polite" region
- [ ] Error messages use aria-live="assertive"
- [ ] Hamburger menu button has aria-expanded and aria-controls
- [ ] Skip-to-main-content link as first focusable element on all pages
- [ ] Reduced motion: @media (prefers-reduced-motion: reduce) disables non-essential animations
- [ ] Scroll-triggered animations have reduced-motion fallback (instant show)
- [ ] All animations respect prefers-reduced-motion
- [ ] Colour scheme respects prefers-color-scheme if dark mode planned
- [ ] Page language set: `<html lang="en">`
- [ ] Meaningful page `<title>` for every route

---

### 📱 L — RESPONSIVE & CROSS-DEVICE

- [ ] All pages tested at 390px (mobile), 768px (tablet), 1440px (desktop)
- [ ] No horizontal scroll on any page at any breakpoint
- [ ] Navbar collapses to hamburger below 768px
- [ ] 4-column Kanban: horizontal scroll on mobile (< 768px)
- [ ] KPI cards: 4-col → 2×2 → 1-col responsive
- [ ] Member table: horizontal scroll on mobile with sticky first column (Name)
- [ ] Feature Bento Grid: stacks to single column on mobile
- [ ] Testimonials: 3-col → 1-col swipeable carousel on mobile
- [ ] Footer: 4-col → 2×2 → stacked on mobile
- [ ] Drawers: 480px desktop → full-screen mobile
- [ ] Add Event form: modal desktop → full page mobile
- [ ] All tap targets minimum 44×44px on mobile
- [ ] Text is legible without pinch-zoom on mobile (min 16px body)
- [ ] Tested on Chrome, Firefox, Safari, Edge
- [ ] Tested on iOS Safari and Android Chrome
- [ ] No layout breaks with longer member names or long task strings

---

### ⚡ M — PERFORMANCE

- [ ] Playfair Display and DM Sans loaded via Google Fonts with `display=swap`
- [ ] Hero image lazy-loaded or eagerly loaded as LCP image (no lazy on above-fold)
- [ ] All below-fold images use `loading="lazy"`
- [ ] SVG assets optimised (no unnecessary groups or paths)
- [ ] Bamboo SVG texture is CSS-generated or minimal SVG (< 5KB)
- [ ] Testimonial duplicate array only created once (not re-created on render)
- [ ] IntersectionObserver disconnects after element has been revealed
- [ ] No layout shift (CLS) from font loading (font-display: swap)
- [ ] Progress ring animation uses CSS/SVG, not JavaScript per-frame
- [ ] Kanban drag-and-drop uses native HTML5 API or lightweight library (not heavy DnD suite)
- [ ] All API calls debounced on search inputs (300ms minimum)
- [ ] Table data paginated server-side (not loading all rows at once)

---

### 🔒 N — SECURITY & DATA

- [ ] Role-based access enforced on the SERVER (not just UI hiding)
- [ ] Admin API endpoints require admin JWT/session
- [ ] Member cannot call admin-only API endpoints (returns 403)
- [ ] Member can only see their own tasks (server-filtered query)
- [ ] File uploads validated: type, size, virus scan (if applicable)
- [ ] File uploads stored securely (not publicly accessible direct URLs)
- [ ] All form inputs sanitised before DB write (no XSS)
- [ ] Email field validated as proper email format
- [ ] Date input: server validates date is in the future (for Add Event)
- [ ] CSV export is role-gated (admin only)
- [ ] Session timeout after inactivity (recommend 30 min)
- [ ] HTTPS enforced in production
- [ ] Sensitive data (email, hours, challenges) not exposed in client-side API responses for wrong role

---

### 🧪 O — FUNCTIONAL TESTING

- [ ] Can create a new event with all fields and it appears in Kanban `New` pillar
- [ ] Can drag event card from New → In Progress → In Review → Done
- [ ] Progress % on event card updates after drag
- [ ] Can add members to an event with department and task
- [ ] Can remove a member from Manage Members
- [ ] View Member detail shows correct member's data
- [ ] Edit Member saves changes and table row updates
- [ ] Challenges Faced entry saves with timestamp
- [ ] Outcome of Contribution saves as bullet list
- [ ] Member can only see their own tasks (not others)
- [ ] Member Add Contribution form saves and appears in Member's New pillar
- [ ] Admin sees member's contribution in Open Board
- [ ] Attendance tab: can mark attendance status for each member
- [ ] Attendance: summary stats update when records change
- [ ] KPI cards refresh when data changes
- [ ] Deadline badge updates daily (not stale after date change)
- [ ] Export CSV contains all correct columns and data
- [ ] Login with wrong credentials shows error
- [ ] Login with admin credentials → admin dashboard
- [ ] Login with member credentials → member kanban
- [ ] Logout returns to login page and clears session

---

*PRD Version 3.0 FINAL — Event Sync*
*Dual User: Admin (Exco) + Member | Premium Frontend Spec | Figma Make Ready*
*Theme: Arashiyama Bamboo Grove, Kyoto | Desktop 1440px + Mobile 390px*
*Last updated: March 2025*
