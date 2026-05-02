import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { createClient } from "~/lib/supabase/server";
 
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch profile once here — procedures read ctx.profile instead of re-querying
  const profile = user
    ? (await supabase.from("profiles").select("role, status").eq("id", user.id).single()).data
    : null;

  return {
    supabase,
    user,
    profile,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({  //TRPC is not middlewar.
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

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.profile) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { profile } = ctx;

    if (profile.status === "pending") {
      throw new TRPCError({ code: "FORBIDDEN", message: "ACCOUNT_PENDING_APPROVAL" });
    }

    if (profile.status === "rejected" || profile.status === "inactive") {
      throw new TRPCError({ code: "FORBIDDEN", message: "ACCOUNT_REJECTED" });
    }

    if (profile.status !== "active") {
      throw new TRPCError({ code: "FORBIDDEN", message: "ACCOUNT_NOT_ACTIVE" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(async ({ ctx, next }) => {
    if (!ctx.user || !ctx.profile) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const { profile } = ctx;

    if (profile.status !== "active") {
      throw new TRPCError({ code: "FORBIDDEN", message: "ACCOUNT_NOT_ACTIVE" });
    }

    if (profile.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "ADMIN_REQUIRED" });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });
