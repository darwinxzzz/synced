/**
 * Admin auth setup — run once with: pnpm e2e:setup:admin
 *
 * Opens a real browser. Fills email + password automatically.
 * When the MFA modal appears, YOU type your 6-digit code and click Verify.
 * Playwright saves your session so all admin tests skip login entirely.
 */
import { test } from "@playwright/test";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADMIN_AUTH = path.join(__dirname, "../.auth/admin.json");

test("save admin session", async ({ page }) => {
  test.setTimeout(180_000); // 3 min for MFA entry
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD in .env.test\n" +
        "Copy .env.test.example → .env.test and fill in your credentials.",
    );
  }

  fs.mkdirSync(path.dirname(ADMIN_AUTH), { recursive: true });

  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(password);
  await page.locator('button[type="submit"]').first().click();

  await page.waitForSelector('text="Two-Factor Authentication"', {
    timeout: 180_000,
  });

  console.log("\n✅  MFA modal is open in the browser window.");
  console.log("👉  Enter your 6-digit authenticator code and click Verify.");
  console.log("⏳  Waiting up to 2 minutes...\n");

  await page.waitForURL("**/admin/dashboard", { timeout: 120_000 });

  await page.context().storageState({ path: ADMIN_AUTH });
  console.log(`\n✅  Admin session saved to ${ADMIN_AUTH}`);
});
