import { authRouter } from "~/server/api/routers/auth";
import { attendanceRouter } from "~/server/api/routers/attendance";
import { contributionsRouter } from "~/server/api/routers/contributions";
import { dashboardRouter } from "~/server/api/routers/dashboard";
import { eventsRouter } from "~/server/api/routers/events";
import { kanbanRouter } from "~/server/api/routers/kanban";
import { newsletterRouter } from "~/server/api/routers/newsletter";
import { createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  attendance: attendanceRouter,
  contributions: contributionsRouter,
  dashboard: dashboardRouter,
  events: eventsRouter,
  kanban: kanbanRouter,
  newsletter: newsletterRouter,
});

export type AppRouter = typeof appRouter;
