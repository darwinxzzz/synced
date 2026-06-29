import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createClient } from "~/lib/supabase/server";
import { evaluateAccess, getAuthState, type UserRole } from "~/lib/auth/access";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createClient();

  // user + profile derived once, the same way the server route guards do it.
  const { user, profile } = await getAuthState(supabase);

  return {
    supabase,
    user,
    profile,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  //TRPC is not middlewar.
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;
export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  if (t._config.isDev) {
    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
  }

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Shared gate for authenticated procedures. The status/role rule lives in one place
 * (evaluateAccess) so it cannot drift between tRPC and the edge/server guards.
 */
const enforceAccess = (requireRole?: UserRole) =>
  t.middleware(async ({ ctx, next }) => {
    const decision = evaluateAccess(
      ctx.profile,
      requireRole ? { requireRole } : {},
    );

    if (!decision.ok) {
      throw new TRPCError({
        code:
          decision.code === "UNAUTHENTICATED" ? "UNAUTHORIZED" : "FORBIDDEN",
        message: decision.reason,
      });
    }

    // decision.ok guarantees an active, authenticated user.
    return next({ ctx: { ...ctx, user: ctx.user! } });
  });

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAccess());

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(enforceAccess("admin"));
