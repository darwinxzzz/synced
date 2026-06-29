import { describe, expect, it } from "vitest";
import { evaluateAccess } from "~/lib/auth/access";

describe("evaluateAccess", () => {
  it("rejects a null profile as unauthenticated", () => {
    const decision = evaluateAccess(null);
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.code).toBe("UNAUTHENTICATED");
  });

  it("rejects a pending account with the approval reason", () => {
    const decision = evaluateAccess({ role: "member", status: "pending" });
    expect(decision).toEqual({
      ok: false,
      code: "FORBIDDEN",
      reason: "ACCOUNT_PENDING_APPROVAL",
    });
  });

  it("rejects rejected and inactive accounts", () => {
    for (const status of ["rejected", "inactive"]) {
      const decision = evaluateAccess({ role: "member", status });
      expect(decision.ok).toBe(false);
      if (!decision.ok) expect(decision.reason).toBe("ACCOUNT_REJECTED");
    }
  });

  it("rejects any other non-active status", () => {
    const decision = evaluateAccess({ role: "member", status: "unknown" });
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.reason).toBe("ACCOUNT_NOT_ACTIVE");
  });

  it("allows an active member", () => {
    const decision = evaluateAccess({ role: "member", status: "active" });
    expect(decision).toEqual({ ok: true, role: "member" });
  });

  it("allows an active admin", () => {
    const decision = evaluateAccess({ role: "admin", status: "active" });
    expect(decision).toEqual({ ok: true, role: "admin" });
  });

  it("requires the admin role when opts.requireRole is admin", () => {
    const decision = evaluateAccess(
      { role: "member", status: "active" },
      { requireRole: "admin" },
    );
    expect(decision).toEqual({
      ok: false,
      code: "FORBIDDEN",
      reason: "ADMIN_REQUIRED",
    });
  });

  it("checks status before role for an admin-required call", () => {
    const decision = evaluateAccess(
      { role: "member", status: "pending" },
      { requireRole: "admin" },
    );
    expect(decision.ok).toBe(false);
    if (!decision.ok) expect(decision.reason).toBe("ACCOUNT_PENDING_APPROVAL");
  });
});
