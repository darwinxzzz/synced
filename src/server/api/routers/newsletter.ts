import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const newsletterRouter = createTRPCRouter({
  subscribe: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
      }),
    )
    .mutation(({ input }) => {
      // TODO: wire to an email provider (Resend, Mailchimp, etc.)
      return { success: true, email: input.email };
    }),
});
