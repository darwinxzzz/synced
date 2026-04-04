import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const authRouter = createTRPCRouter({
  getUser: publicProcedure.query(({ ctx }) => {
    return ctx.user ?? null;
  }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single();

    if (error) return null;
    return data;
  }),

  signOut: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  }),
});
