import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  reporter: "list",
  timeout: 10000,
  use: {
    baseURL: "http://localhost:5173",
    actionTimeout: 3000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev:e2e",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120000, // 2 minutes for Convex backend to start, deploy, and frontend to start
  },
});