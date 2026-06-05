import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema lives in the router — test its contract before the router exists (RED)
const subscribeInput = z.object({
  email: z.string().email("Please enter a valid email address"),
});

describe("newsletter subscribe input schema", () => {
  it("accepts a valid email", () => {
    const result = subscribeInput.safeParse({ email: "user@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects a plaintext string that is not an email", () => {
    const result = subscribeInput.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = subscribeInput.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email field", () => {
    const result = subscribeInput.safeParse({});
    expect(result.success).toBe(false);
  });
});
