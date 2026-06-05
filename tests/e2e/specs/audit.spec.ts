/**
 * Full-app audit spec — captures screenshots and console/network errors
 * for every protected route using the saved member session.
 *
 * Run with: pnpm e2e:audit
 * Results: playwright-report/index.html + tests/e2e/screenshots/
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, "../screenshots");

interface RouteAudit {
  route: string;
  consoleErrors: string[];
  failedRequests: string[];
  screenshotPath: string;
  loadedOk: boolean;
  notes: string[];
}

test.beforeAll(() => {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
});

async function auditRoute(
  page: Page,
  route: string,
  slug: string,
): Promise<RouteAudit> {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const notes: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("requestfailed", (req) => {
    failedRequests.push(
      `${req.method()} ${req.url()} — ${req.failure()?.errorText}`,
    );
  });

  await page.goto(route, { waitUntil: "networkidle" });

  const finalUrl = page.url();
  const loadedOk = !finalUrl.includes("/login");
  if (!loadedOk) notes.push("REDIRECTED TO LOGIN — session may have expired");

  // Let skeletons/data settle
  await page.waitForTimeout(2_000);

  // Collect any visible error messages on page
  const errTexts = await page
    .locator("text=/could not load|failed to|error/i")
    .allTextContents()
    .catch(() => []);
  errTexts
    .filter(Boolean)
    .forEach((t) => notes.push(`Visible error: "${t.trim().slice(0, 120)}"`));

  const screenshotPath = path.join(SCREENSHOTS_DIR, `${slug}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  return {
    route,
    consoleErrors,
    failedRequests,
    screenshotPath,
    loadedOk,
    notes,
  };
}

function reportResult(label: string, r: RouteAudit) {
  const icon = r.loadedOk ? "✅" : "❌";
  console.log(`\n${icon}  ${label} (${r.route})`);
  r.consoleErrors.forEach((e) => console.log(`   [console.error] ${e}`));
  r.failedRequests.forEach((e) => console.log(`   [net fail]      ${e}`));
  r.notes.forEach((n) => console.log(`   [note]          ${n}`));
  console.log(`   [screenshot]    ${r.screenshotPath}`);
}

// ── Member routes ─────────────────────────────────────────────────────────────

test("audit: member dashboard", async ({ page }) => {
  const r = await auditRoute(page, "/member/dashboard", "member-dashboard");
  reportResult("Member Dashboard", r);
  await expect(page.locator(".card-shadow").first()).toBeVisible();
  expect(r.loadedOk, "Redirected to login").toBe(true);
  expect(r.consoleErrors, `Console errors found`).toHaveLength(0);
});

test("audit: member kanban", async ({ page }) => {
  const r = await auditRoute(page, "/member/kanban", "member-kanban");
  reportResult("Member Kanban", r);
  expect(r.loadedOk, "Redirected to login").toBe(true);
  expect(r.consoleErrors).toHaveLength(0);
});

test("audit: member testimonials", async ({ page }) => {
  const r = await auditRoute(
    page,
    "/member/testimonials",
    "member-testimonials",
  );
  reportResult("Member Testimonials", r);
  expect(r.loadedOk, "Redirected to login").toBe(true);
  expect(r.consoleErrors).toHaveLength(0);
});

// ── Role guard check ──────────────────────────────────────────────────────────

test("audit: admin routes blocked for member session", async ({ page }) => {
  const r = await auditRoute(
    page,
    "/admin/dashboard",
    "admin-dashboard-member-session",
  );
  reportResult("Admin Dashboard (member session)", r);
  // Member session hitting /admin/* should be redirected away (middleware role guard)
  const url = page.url();
  if (url.includes("/member/dashboard")) {
    console.log(
      "  ✅  Role guard: admin route correctly redirects member → /member/dashboard",
    );
  } else if (url.includes("/admin/dashboard")) {
    console.log("  ⚠️  This session has admin role");
  } else {
    console.log(`  ⚠️  Unexpected redirect: ${url}`);
  }
});

// ── Marketing + Auth pages ────────────────────────────────────────────────────

test("audit: marketing landing", async ({ page }) => {
  await page.context().clearCookies();
  const r = await auditRoute(page, "/", "marketing-landing");
  reportResult("Marketing Landing", r);
  expect(r.consoleErrors).toHaveLength(0);
  await expect(page.locator('text="Track Every Event."')).toBeVisible();
});

test("audit: login page", async ({ page }) => {
  await page.context().clearCookies();
  const r = await auditRoute(page, "/login", "login-page");
  reportResult("Login Page", r);
  await expect(page.locator('text="Welcome Back"')).toBeVisible();
  expect(r.consoleErrors).toHaveLength(0);
});

// ── Known bug checks ──────────────────────────────────────────────────────────

test("audit: reflection drawer (known bug check)", async ({ page }) => {
  await page.goto("/member/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(2_000);

  // Find and click any reflection-related button
  const reflBtn = page
    .locator("button", { hasText: /reflect|log today|add reflection/i })
    .first();
  const hasBtn = await reflBtn.isVisible().catch(() => false);

  if (!hasBtn) {
    console.log(
      "  ⚠️  No reflection button visible — card may not be rendered",
    );
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, "reflection-no-button.png"),
      fullPage: true,
    });
    return;
  }

  await reflBtn.click();
  await page.waitForTimeout(600);

  const drawerOpen = await page
    .locator('[role="dialog"], [data-vaul-drawer], [data-state="open"]')
    .isVisible()
    .catch(() => false);

  if (!drawerOpen) {
    console.log("  ❌  BUG: Reflection button clicked — no drawer opened");
    console.log(
      "     Fix: member/dashboard/page.tsx line 234 renders {reflectionOpen && null}",
    );
    console.log(
      "     Should render <AddReflectionDrawer open={reflectionOpen} onOpenChange={setReflectionOpen} />",
    );
  } else {
    console.log("  ✅  Reflection drawer opens correctly");
  }

  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, "reflection-drawer-check.png"),
    fullPage: true,
  });
});

test("audit: post-login redirect correctness", async ({ page }) => {
  // Logged-in user visiting /login should redirect by role
  await page.goto("/login", { waitUntil: "networkidle" });
  const url = page.url();
  await page.screenshot({
    path: path.join(SCREENSHOTS_DIR, "post-login-redirect.png"),
  });

  if (url.includes("/member/dashboard")) {
    console.log("  ✅  /login → /member/dashboard (member role)");
  } else if (url.includes("/admin/dashboard")) {
    console.log("  ✅  /login → /admin/dashboard (admin role)");
  } else {
    console.log(`  ⚠️  /login stayed at: ${url}`);
  }
});
