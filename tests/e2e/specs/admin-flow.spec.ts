/**
 * Admin flow tests — validates key admin journeys post-login.
 * Run with: pnpm e2e:admin
 */
import { test, expect } from "@playwright/test";

test.describe("Admin Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
  });

  test("admin dashboard loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    expect(errors, `Console errors: ${errors.join("; ")}`).toHaveLength(0);
  });

  test("admin session stays on admin routes", async ({ page }) => {
    expect(page.url()).not.toContain("/member/");
  });
});

test.describe("Admin Attendance", () => {
  test("attendance page loads without error", async ({ page }) => {
    await page.goto("/admin/attendance", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
    const hasError = await page
      .locator("text=/error|failed/i")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(false);
  });
});

test.describe("Admin Kanban", () => {
  test("admin kanban overview loads without error", async ({ page }) => {
    await page.goto("/admin/kanban", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
    const hasError = await page
      .locator("text=/error|failed/i")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(false);
  });
});

test.describe("Admin Testimonials", () => {
  test("testimonials overview loads without error", async ({ page }) => {
    await page.goto("/admin/testimonials", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
    const hasError = await page
      .locator("text=/error|failed/i")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(false);
  });
});

test.describe("Role Guards (admin session)", () => {
  test("admin is blocked from /member/dashboard", async ({ page }) => {
    await page.goto("/member/dashboard", { waitUntil: "networkidle" });
    expect(page.url()).toContain("/admin/dashboard");
  });

  test("authenticated admin redirected away from /login", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    expect(page.url()).not.toContain("/login");
  });
});
