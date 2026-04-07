# EventSync — Attendance Registry
> Read 00-design-system.md first. Feed both files together.

## Screenshot Reference
- Design target: `screenshots/stitch-attendance.png`
- Stitch ID: `0c50ecd175f54d29b62a2cb949807a3e` — "Attendance Dashboard – with Add Member Button"

## File to Build
`src/app/(admin)/attendance/page.tsx`

---

## Page Header
```
H1: "Attendance Registry"
    Font: Playfair Display italic
```

---

## 4 KPI Cards (ALWAYS visible — above tabs, not tab-specific)
```
Desktop: 4 columns
Tablet:  2×2
Mobile:  1-column stack

Card 1: Total Events        — count of all events
Card 2: Avg Attendance %    — calculated across all events
Card 3: Highest Rate        — event name + percentage (var(--deadline-green))
Card 4: Lowest Rate         — event name + percentage (var(--deadline-red))

All cards: var(--cream-white), .card-shadow, rounded-2xl
```

---

## Filter Row (below KPI cards, above tab switcher)
```
[ Event selector ▾ ] [ Date Range picker ] [ Department ▾ ] [ Export Report (CSV) ]
All filters apply to whichever tab is active.
Export CSV: downloads filtered data for the active tab.
```

---

## 3-Tab Switcher (sliding pill)
```
[ Members ] [ Event Participation ] [ Weekly Meetings ]
Left tab is default (Members).
Content refreshes without page reload on toggle.
Active: var(--deep-forest) bg, text-white pill
```

---

## TAB 1: Members (default)

### "Add Member" Button
```
Position: top-right of Members tab content
Label: "Add Member"
Style: bg-[--deep-forest], text-white, 48px
On click: opens BlurModal (shell: Stitch 69af9520) with new member form:
  - Name (required)
  - Email (required)
  - Department (dropdown — existing depts from Supabase)
  - Role: Member / Admin (segmented pill or select)
  - Join Date (date picker)
  - Avatar upload (optional)
  Footer: [Cancel] [Add Member — validates then writes to profiles table]
```

### Members Table
```
Columns: Member Name · Department · Join Date · Status · Total Events · Attendance %
Sorting: clickable column headers
Pagination: "Showing X–Y of Z entries" + PREVIOUS · page N · NEXT buttons

Status badges:
  Active  → var(--deadline-green) pill
  Inactive → var(--stone-grey) pill
```

**Clicking any member row** → opens `MemberProfileDrawer` slide-in
(Stitch `0dbfa90e2d814190b76ee0b92fb4c3cb` — shows member profile + attendance history)

---

## TAB 2: Event Participation

### Status Filter Pills (above event list)
```
[ Not Recorded ] [ Ended ] [ Archived ]
Default: "Not Recorded" active
Not Recorded: events where end_date has passed AND no attendance rows for that event_id
Ended:        events that have ended regardless of attendance
Archived:     events manually archived by admin
```

### Event Card List (horizontal cards)
```
Each event as a long horizontal card:
  Event name · Date · Member count · Submission status tag
  Same visual style as member row in Members tab (consistent horizontal card)
```

**Clicking an event card:**
Opens detail panel. Shell: `ReflectionDetailCard` layout (Stitch `14367f7696f54c6ba8aded7cf39d5594`).
Contains:
- `MemberAssignmentSection` showing all assigned members
- Status selector per member: `Attended` / `Absent` / `Excused`
- Submit button: records attendance, removes event from "Not Recorded"

### "Add Attendance" Button
```
Opens BlurModal (Stitch 69af9520 shell):
  - DateTimePicker (reused — event date + time)
  - MemberAssignmentSection (Added Members + search + Members list)
  - Status per member: Attended / Absent / Excused
```

### Attendance Table (after submission)
```
Columns: Member Name · Department · Event Name · Status · Date · Notes
Status badges:
  Attended → ● var(--deadline-green)
  Absent   → ● var(--deadline-red)
  Excused  → ● var(--deadline-amber)
Pagination: Showing X–Y of Z + PREVIOUS / NEXT
```

---

## TAB 3: Weekly Meetings

### "Add Attendance" Button
```
Opens BlurModal (Stitch 69af9520 shell):
  - DateTimePicker — meeting date + time
  - MemberAssignmentSection — select who attended
  - Status per member: Attended / Absent / Excused
  - Week number: auto-calculated from selected date (ISO week), shown read-only
```

### Weekly Meetings Table
```
Columns: Member Name · Department · Week · Status · Date · Notes
Same status badges as Event Participation tab.
Pagination: Showing X–Y of Z + PREVIOUS / NEXT
```

---

## Data (tRPC)
```typescript
// All with server-side pagination
getMembers: (filters, page) => { members[], total }
getEventParticipation: (filters, status, page) => { events[], total }
getWeeklyMeetings: (filters, page) => { meetings[], total }
addMember: (memberData) => profiles row
recordAttendance: (attendanceData) => attendance row
```

---

## Mobile (390px)
- KPI cards: 1-column stack
- Tab switcher: horizontal scroll if needed (or smaller font)
- Tables: horizontal scroll, Member Name column sticky left
- Pagination: PREVIOUS / Page N / NEXT only (no per-page selector)
- Table rows: min 56px height
- All inputs in modals: min 48px height
