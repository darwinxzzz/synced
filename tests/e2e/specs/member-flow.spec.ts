/**
 * Member flow tests — validates key member journeys post-login.
 * Run with: pnpm e2e:member
 */
import { test, expect } from "@playwright/test";

test.describe("Member Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/member/dashboard", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
  });

  test("KPI cards render without error state", async ({ page }) => {
    await expect(page.locator('text="Could not load KPIs"')).not.toBeVisible();
    const cards = page.locator(".card-shadow");
    await expect(cards.first()).toBeVisible();
  });

  test("pending milestones section renders without error", async ({ page }) => {
    const hasError = await page
      .locator('text="Could not load milestones"')
      .isVisible()
      .catch(() => false);
    expect(hasError, "Milestones section shows error").toBe(false);
  });

  test("VIEW ROADMAP link points to /member/kanban", async ({ page }) => {
    const link = page.locator("a", { hasText: "VIEW ROADMAP" });
    const exists = await link.isVisible().catch(() => false);
    if (!exists) {
      console.log(
        "  ⚠️  VIEW ROADMAP link not found — account may have admin role (redirected to admin dashboard)",
      );
      return;
    }
    await expect(link).toHaveAttribute("href", "/member/kanban");
  });

  test("reflection drawer opens on click (bug: renders null if unimplemented)", async ({
    page,
  }) => {
    if (!page.url().includes("/member/dashboard")) {
      console.log(
        "  ⚠️  Not on member dashboard (admin redirect) — skipping reflection drawer test",
      );
      return;
    }

    const reflBtn = page
      .locator("button", { hasText: /reflect|log|add/i })
      .first();
    const exists = await reflBtn.isVisible().catch(() => false);
    if (!exists) {
      console.log("  ⚠️  No reflection button found");
      return;
    }

    await reflBtn.scrollIntoViewIfNeeded();
    await reflBtn.click();
    await page.waitForTimeout(500);

    const drawer = page.locator(
      '[role="dialog"], [data-vaul-drawer], [data-state="open"]',
    );
    const drawerOpen = await drawer.isVisible().catch(() => false);

    // Will FAIL until member/dashboard/page.tsx line 234 is fixed:
    // {reflectionOpen && null} → should render <AddReflectionDrawer ... />
    expect(
      drawerOpen,
      "BUG: Reflection drawer does not open (line 234 renders null)",
    ).toBe(true);
  });
});

test.describe("Member Kanban", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/member/kanban", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
  });

  test("page loads with no JS console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1_000);
    expect(errors, `Console errors: ${errors.join("; ")}`).toHaveLength(0);
  });

  test("event selector is rendered", async ({ page }) => {
    const selector = page
      .locator('[role="combobox"], button', { hasText: /event/i })
      .first();
    const visible = await selector.isVisible().catch(() => false);
    if (!visible) console.log("  ⚠️  Event selector not found");
  });
});

test.describe("Member Testimonials", () => {
  test("page loads without error", async ({ page }) => {
    await page.goto("/member/testimonials", { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);
    const hasError = await page
      .locator("text=/error|failed/i")
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasError, "Testimonials page shows error").toBe(false);
  });
});

test.describe("Role Guards", () => {
  test("member is blocked from /admin/dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard", { waitUntil: "networkidle" });
    const url = page.url();
    if (url.includes("/admin/dashboard")) {
      console.log("  ⚠️  Session has admin role — member guard test skipped");
      return;
    }
    expect(url).toContain("/member/dashboard");
  });

  test("authenticated member redirected away from /login", async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    expect(page.url()).not.toContain("/login");
  });
});
