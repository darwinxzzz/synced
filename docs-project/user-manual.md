# User Manual

## Who This Is For

Admins and members using Synced for internal community and team management.

## What You Can Do

- **Dashboard** — View your activity overview, pending items, and key metrics
- **Kanban Boards** — Collaborate on events and projects with task cards
- **Testimonials** — Request, review, and view verified contribution records
- **Attendance** (Admin) — Track event participation and weekly meeting attendance
- **Contributions** — Log contribution details for event work
- **Reflections** — Submit periodic reflections when task progress requires them

## Common Workflows

### Getting Started

1. Navigate to the app URL provided by your organization.
2. Sign in with your configured Supabase OAuth provider, such as Discord or Google.
3. After sign-in, Synced directs you to the dashboard for your role:
   - **Admin** users see admin tools for dashboards, attendance, kanban, and testimonials.
   - **Member** users see member tools for their dashboard, kanban boards, and testimonials.

If you are sent to the wrong area or cannot access expected pages, contact an organization admin so they can confirm your account role and membership status.

### Using Kanban Boards

Kanban boards organize event and project work into status columns:

- **New** — Work that has not started yet
- **In Progress** — Work currently being handled
- **In Review** — Work submitted for review, usually with contribution/reflection details
- **Done** — Completed work

#### Members

1. Open **Kanban** from the member navigation.
2. Select an event from the event selector if more than one event is available.
3. Review your assigned cards by status column.
4. Open a card to view details such as department, priority, deadline, description, outcome, and contribution information.
5. Move cards forward as your work progresses:
   - **New → In Progress** when you begin work.
   - **In Progress → In Review** when the work is ready for review.
6. Before moving a card to **In Review**, add a contribution if prompted. Synced may ask for details such as changes made and challenges faced.
7. Use available filters to sort or narrow cards, such as by priority or date.

Member card movement is intentionally limited. Members cannot move cards backward, skip stages, or move cards directly to **Done**. Admins complete final review and status changes.

#### Admins

1. Open **Kanban** from the admin navigation.
2. Use the birds-eye event view to monitor event boards by status.
3. Open an event board to review all related tasks.
4. Create new task cards, assign members, and update task details as needed.
5. Drag cards between status columns to reflect the current state of the work.
6. Use edit mode, search, and department filters to manage larger boards.
7. Review and save contribution details attached to member work.

Kanban updates are designed to refresh in near real time, so changes made by other users may appear without a full page reload.

### Managing Testimonials

Testimonials are internal verified records of a member's activity, contributions, attendance, and community impact.

#### Members

1. Open **Testimonials** from the member navigation.
2. Review your profile, attendance metrics, contribution history, reflections, and endorsement section.
3. Use **Request Testimonial** when you need an official testimonial prepared or reviewed.
4. If editable profile details are available on the page, review them carefully before saving.

After a request is submitted, admins can review it from the admin testimonial area. The exact turnaround process depends on your organization's internal workflow.

#### Admins

1. Open **Testimonials** from the admin navigation.
2. Review testimonial request counts and member cards.
3. Open a member testimonial record to inspect their profile, contribution timeline, reflections, attendance, and impact data.
4. Finalise the testimonial or endorsement when the record is ready.

Admins should verify contribution and attendance information before finalising testimonial content.

### Tracking Attendance (Admin)

Admins use the **Attendance Registry** to track member participation across events and weekly meetings.

1. Open **Attendance** from the admin navigation.
2. Review KPI cards for high-level attendance metrics.
3. Use the available tabs:
   - **Members** — View member attendance percentages and member details.
   - **Event Participation** — Review participation records for events.
   - **Weekly Meetings** — Review attendance for recurring weekly meetings.
4. Use event and department filters when available to narrow the view.
5. Add or record attendance through the available attendance actions.
6. Export CSV if you need a spreadsheet copy for reporting.

Attendance data may also appear in testimonials and member profile views, so keep records accurate and up to date.

### Logging Contributions

Contribution logging is connected to kanban work.

1. Open the relevant event board.
2. Open the task or contribution drawer.
3. Enter the requested contribution details, such as description, outcome, priority, changes, or challenges faced.
4. Save the contribution.
5. Move the task forward when it is ready for review.

Members normally log their own contributions. Admins can review or save contribution details from admin kanban views.

### Submitting Reflections

Reflections capture progress context for work that needs review.

1. Open **Kanban** from the member navigation.
2. Check for pending reflection indicators or prompts.
3. Submit the requested reflection information when moving work to review or when prompted by the dashboard.
4. Keep reflections specific and factual so admins can understand what changed, what was completed, and what challenges remain.

## Troubleshooting

### Login Issues

- Ensure you are using the correct authentication method configured for your organization, such as Discord or Google.
- Confirm you are using the same account your admin added to Synced.
- If you do not have access after signing in, contact an admin to verify your role and membership record.

### Page Not Loading

- Refresh the page.
- Check your internet connection.
- Sign out and sign back in if your session appears stale.
- If the issue persists, contact your organization admin or support contact with the page URL and a short description of what happened.

### Missing Events or Tasks

- Confirm you selected the correct event in the kanban event selector.
- Check whether filters are hiding cards.
- Ask an admin to verify that you are assigned to the event or task.

### Cannot Move a Kanban Card

- Members can only move cards forward through the allowed workflow.
- Add a contribution before moving a card to **In Review** if Synced prompts you to do so.
- Admin review may be required to move cards to **Done**.

### Testimonial Looks Incomplete

- Make sure your contribution and attendance records are up to date.
- Request a testimonial from the member testimonial page if you need admin review.
- Contact an admin if your profile, department, attendance, or contribution history appears incorrect.

## FAQ

### Which login method should I use?

Use the provider configured by your organization, commonly Discord or Google. If one provider does not work, ask your admin which account is registered for you.

### Why can I only see member pages?

Your account role controls which navigation and pages you can access. Admin-only pages require an admin role.

### Why can't I move my task to Done?

Members can move work forward to **In Progress** and **In Review**. Admins handle final review and completion status.

### Where do testimonial details come from?

Testimonials are built from verified Synced records such as profile information, attendance, contributions, reflections, and admin endorsements.

### Who should I contact for incorrect data?

Contact your organization admin. They can review assignments, attendance records, testimonial status, and account role settings.

## See Also

- [Systems Architecture](./architecture/systems-architecture.md)
