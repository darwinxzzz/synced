import { defineConfig, devices } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const MEMBER_AUTH = path.join(__dirname, "tests/e2e/.auth/member.json");
export const ADMIN_AUTH = path.join(__dirname, "tests/e2e/.auth/admin.json");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "member-setup",
      testMatch: "**/setup/member.setup.ts",
      use: { ...devices["Desktop Chrome"], headless: false },
    },
    {
      name: "admin-setup",
      testMatch: "**/setup/admin.setup.ts",
      use: { ...devices["Desktop Chrome"], headless: false },
    },
    {
      name: "member",
      testMatch: "**/specs/member*.spec.ts",
      use: { ...devices["Desktop Chrome"], storageState: MEMBER_AUTH },
    },
    {
      name: "admin",
      testMatch: "**/specs/admin*.spec.ts",
      use: { ...devices["Desktop Chrome"], storageState: ADMIN_AUTH },
    },
    {
      name: "audit",
      testMatch: "**/specs/audit.spec.ts",
      use: { ...devices["Desktop Chrome"], storageState: MEMBER_AUTH },
    },
  ],

  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
