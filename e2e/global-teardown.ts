import fs from "fs";
import path from "path";

async function globalTeardown() {
  console.log("🧹 Cleaning up Playwright E2E test environment...");

  try {
    // Clean up E2E test database
    const testDbPath = path.join(__dirname, "../test-e2e.db");
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log("✅ E2E test database cleaned up");
      }
    } catch (error) {
      console.warn("⚠️  Failed to clean up E2E test database:", error);
    }

    // Clean up Playwright test artifacts
    const playwrightResultsPath = path.join(
      __dirname,
      "../test-results/playwright-artifacts",
    );
    if (fs.existsSync(playwrightResultsPath)) {
      try {
        fs.rmSync(playwrightResultsPath, { recursive: true, force: true });
        console.log("✅ Playwright artifacts cleaned up");
      } catch (error) {
        console.warn("⚠️  Failed to clean up Playwright artifacts:", error);
      }
    }

    // Clean up Playwright reports
    const playwrightReportPath = path.join(__dirname, "../playwright-report");
    if (fs.existsSync(playwrightReportPath)) {
      try {
        fs.rmSync(playwrightReportPath, { recursive: true, force: true });
        console.log("✅ Playwright reports cleaned up");
      } catch (error) {
        console.warn("⚠️  Failed to clean up Playwright reports:", error);
      }
    }

    // Clean up authentication state files
    const authPath = path.join(__dirname, "auth");
    if (fs.existsSync(authPath)) {
      try {
        fs.rmSync(authPath, { recursive: true, force: true });
        console.log("✅ Authentication state files cleaned up");
      } catch (error) {
        console.warn("⚠️  Failed to clean up auth files:", error);
      }
    }

    console.log("✅ Playwright global teardown completed successfully");
  } catch (error) {
    console.error("❌ Playwright global teardown failed:", error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
