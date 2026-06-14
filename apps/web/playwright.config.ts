import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const rootDir = path.join(__dirname, "../..");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    locale: "ar-SY",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm --filter @hazjak/api dev",
      url: "http://localhost:4000/health",
      cwd: rootDir,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @hazjak/web dev",
      url: "http://localhost:3000",
      cwd: rootDir,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
