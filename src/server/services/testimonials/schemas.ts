import { z } from "zod";

/**
 * Single source of truth for testimonial write-path input shapes.
 * The router imports these for `.input()`; types are inferred for the service.
 * See docs/architecture/responsibilities.md (schemas live with the service).
 */

export const updateTestimonialInput = z.object({
  testimonialId: z.string().uuid(),
  endorsementQuote: z.string().optional(),
  endorsementName: z.string().optional(),
  endorsementTitle: z.string().optional(),
});
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialInput>;

export const finaliseTestimonialInput = z.object({
  memberId: z.string().uuid(),
  endorsementQuote: z.string().min(1),
  endorsementName: z.string().optional(),
  endorsementTitle: z.string().optional(),
});
export type FinaliseTestimonialInput = z.infer<typeof finaliseTestimonialInput>;
