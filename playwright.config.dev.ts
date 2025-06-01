import { defineConfig, devices } from "@playwright/test";

/**
 * Development Playwright configuration for testing against dev server
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",

  // Timeout for each test (60 seconds)
  timeout: 60 * 1000,

  // Expect timeout for assertions (30 seconds)
  expect: {
    timeout: 30 * 1000,
  },

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // No retries for development
  retries: 0,

  // Single worker for development
  workers: 1,

  // Reporter configuration for development
  reporter: [
    ["line"],
    ["html", { outputFolder: "playwright-report", open: "on-failure" }],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL for tests
    baseURL: "http://localhost:3000",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Take screenshot on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Global test timeout
    actionTimeout: 30 * 1000,

    // Navigation timeout
    navigationTimeout: 30 * 1000,

    // Ignore HTTPS errors for development
    ignoreHTTPSErrors: true,

    // User agent
    userAgent: "tool-chest-E2E-Tests-Dev",

    // Accessibility testing configuration
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  },

  // Configure projects for major browsers (just Chrome for development)
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Enable Chrome DevTools Protocol for accessibility testing
        launchOptions: {
          args: [
            "--enable-accessibility-logging",
            "--disable-web-security",
            "--disable-features=TranslateUI",
            "--no-sandbox",
            "--disable-setuid-sandbox",
          ],
        },
      },
    },
  ],

  // Output directory for test artifacts
  outputDir: "test-results/playwright-artifacts",

  // Web server configuration for development
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120 * 1000, // 2 minutes for dev server start
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "development",
    },
  },

  // Global test settings
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],
});
