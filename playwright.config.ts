import { defineConfig, devices } from "@playwright/test";

/**
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

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration for different environments
  reporter: [
    // Always use line reporter for terminal output
    ["line"],
    // HTML reporter for local development
    ["html", { outputFolder: "playwright-report", open: "never" }],
    // JSON reporter for CI/CD integration
    ["json", { outputFile: "test-results/e2e-results.json" }],
    // JUnit reporter for CI systems
    ["junit", { outputFile: "test-results/e2e-results.xml" }],
  ],

  // Global setup and teardown
  globalSetup: require.resolve("./e2e/global-setup.ts"),
  globalTeardown: require.resolve("./e2e/global-teardown.ts"),

  // Shared settings for all the projects below
  use: {
    // Base URL for tests
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",

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
    userAgent: "tool-chest-E2E-Tests",

    // Accessibility testing configuration
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  },

  // Configure projects for major browsers
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

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        launchOptions: {
          firefoxUserPrefs: {
            "accessibility.force_disabled": 0,
          },
        },
      },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    // Mobile testing
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        // Mobile-specific accessibility settings
        hasTouch: true,
      },
    },

    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        hasTouch: true,
      },
    },

    // Tablet testing
    {
      name: "Tablet",
      use: {
        ...devices["iPad Pro"],
        hasTouch: true,
      },
    },

    // High DPI testing
    {
      name: "High DPI",
      use: {
        ...devices["Desktop Chrome HiDPI"],
        deviceScaleFactor: 2,
      },
    },

    // Accessibility-focused testing with specialized tools
    {
      name: "accessibility",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--enable-accessibility-logging",
            "--force-prefers-reduced-motion",
            "--enable-experimental-accessibility-features",
          ],
        },
      },
      testMatch: "**/*.accessibility.spec.ts",
    },

    // Performance testing
    {
      name: "performance",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--enable-precise-memory-info", "--enable-gpu-benchmarking"],
        },
      },
      testMatch: "**/*.performance.spec.ts",
    },
  ],

  // Output directory for test artifacts
  outputDir: "test-results/playwright-artifacts",

  // Web server configuration for local development
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes for build and start
    stdout: "pipe",
    stderr: "pipe",
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "file:./test-e2e.db",
      ADMIN_SECRET_TOKEN: "test-admin-token-e2e",
    },
  },

  // Global test settings
  testIgnore: ["**/node_modules/**", "**/dist/**", "**/.next/**"],

  // Metadata for test reporting
  metadata: {
    project: "tool-chest Next.js Migration",
    framework: "Next.js",
    testType: "End-to-End",
    environment: process.env.NODE_ENV || "test",
  },

  // Maximum test failures before stopping the test run
  maxFailures: process.env.CI ? 5 : undefined,
});
