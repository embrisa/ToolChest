const path = require("path");
const fs = require("fs");

module.exports = async () => {
  console.log("🧹 Cleaning up global test environment...");

  try {
    // Clean up test database
    const testDbPath = path.join(__dirname, "../../test.db");
    try {
      if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
        console.log("✅ Test database cleaned up");
      }
    } catch (error) {
      console.warn("⚠️  Failed to clean up test database:", error.message);
    }

    // Clean up test artifacts
    const testResultsPath = path.join(__dirname, "../../test-results");
    if (fs.existsSync(testResultsPath)) {
      try {
        fs.rmSync(testResultsPath, { recursive: true, force: true });
        console.log("✅ Test results directory cleaned up");
      } catch (error) {
        console.warn("⚠️  Failed to clean up test results:", error.message);
      }
    }

    // Clean up coverage directory if not needed
    const coveragePath = path.join(__dirname, "../../coverage");
    if (fs.existsSync(coveragePath) && !process.env.KEEP_COVERAGE) {
      try {
        fs.rmSync(coveragePath, { recursive: true, force: true });
        console.log("✅ Coverage directory cleaned up");
      } catch (error) {
        console.warn("⚠️  Failed to clean up coverage:", error.message);
      }
    }

    console.log("✅ Global test teardown completed successfully");
  } catch (error) {
    console.error("❌ Global test teardown failed:", error.message);
    // Don't throw error in teardown to avoid masking test failures
  }
};
