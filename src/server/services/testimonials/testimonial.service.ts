import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/types/database";
import type {
  FinaliseTestimonialInput,
  UpdateTestimonialInput,
} from "./schemas";

/**
 * Testimonial authoring (write-path) service.
 *
 * Receives the caller's Supabase client so RLS still applies — it never creates
 * its own. Authorization is the procedure's job (adminProcedure); these functions
 * assume a trusted actor was already gated. See docs/architecture/responsibilities.md.
 */

type Client = SupabaseClient<Database>;

export interface AdminIdentity {
  name: string | null;
  department: string | null;
}

/** Pure: pick the endorsement name/title, falling back to the admin's identity. */
export function resolveEndorsementIdentity(
  input: Pick<FinaliseTestimonialInput, "endorsementName" | "endorsementTitle">,
  admin: AdminIdentity,
): { name: string | null; title: string } {
  const name = input.endorsementName?.trim();
  const title = input.endorsementTitle?.trim();
  return {
    name: name && name.length > 0 ? name : admin.name,
    title: title && title.length > 0 ? title : (admin.department ?? "Admin"),
  };
}

export async function requestTestimonial(supabase: Client, userId: string) {
  const { error } = await supabase
    .from("testimonial_requests")
    .upsert({ user_id: userId, status: "pending" }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  return { success: true as const };
}

export async function updateTestimonial(
  supabase: Client,
  input: UpdateTestimonialInput,
) {
  const { testimonialId, ...fields } = input;
  const updates: Record<string, string> = {};
  if (fields.endorsementQuote !== undefined)
    updates.endorsement_quote = fields.endorsementQuote;
  if (fields.endorsementName !== undefined)
    updates.endorsement_name = fields.endorsementName;
  if (fields.endorsementTitle !== undefined)
    updates.endorsement_title = fields.endorsementTitle;

  const { error } = await supabase
    .from("testimonials")
    .update(updates)
    .eq("id", testimonialId);
  if (error) throw new Error(error.message);
  return { success: true as const };
}

export async function finaliseTestimonial(
  supabase: Client,
  adminId: string,
  input: FinaliseTestimonialInput,
) {
  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("name, department")
    .eq("id", adminId)
    .single();
  if (!adminProfile) throw new Error("Admin profile not found");

  const { data: existing } = await supabase
    .from("testimonials")
    .select("id")
    .eq("user_id", input.memberId)
    .maybeSingle();

  const identity = resolveEndorsementIdentity(input, adminProfile);
  const payload = {
    endorsement_quote: input.endorsementQuote,
    endorsement_name: identity.name,
    endorsement_title: identity.title,
    finalised_at: new Date().toISOString(),
  };

  const query = existing
    ? supabase.from("testimonials").update(payload).eq("id", existing.id)
    : supabase
        .from("testimonials")
        .insert({ ...payload, user_id: input.memberId, generated_by: adminId });
  const { error } = await query;
  if (error) throw new Error(error.message);

  const { error: requestError } = await supabase
    .from("testimonial_requests")
    .update({ status: "sent" })
    .eq("user_id", input.memberId);
  if (requestError) throw new Error(requestError.message);

  return { success: true as const };
}
