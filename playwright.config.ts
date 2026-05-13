import { defineConfig, devices } from "@playwright/test";
import path from "path";
import fs from "fs";

// Manually load .env.test.local
const envFile = path.resolve(__dirname, ".env.test.local");
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, "utf-8")
    .split("\n")
    .forEach((line) => {
      const [key, ...rest] = line.split("=");
      if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
    });
}

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,        // run sequentially to avoid auth conflicts
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,                  // single worker for stable auth
  timeout: 45000,              // 45s per test
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    video: "on",
    screenshot: "only-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
