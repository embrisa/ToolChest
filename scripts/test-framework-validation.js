#!/usr/bin/env node
/**
 * Testing Framework Validation Script
 * Validates that all testing framework components are properly configured
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const COLORS = {
  GREEN: "\x1b[32m",
  RED: "\x1b[31m",
  YELLOW: "\x1b[33m",
  BLUE: "\x1b[34m",
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
};

function log(message, color = COLORS.RESET) {
  console.log(`${color}${message}${COLORS.RESET}`);
}

function logSection(title) {
  log(`\n${COLORS.BOLD}${COLORS.BLUE}=== ${title} ===${COLORS.RESET}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, COLORS.GREEN);
}

function logError(message) {
  log(`❌ ${message}`, COLORS.RED);
}

function logWarning(message) {
  log(`⚠️  ${message}`, COLORS.YELLOW);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, COLORS.BLUE);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    logSuccess(`${description} exists: ${filePath}`);
    return true;
  } else {
    logError(`${description} missing: ${filePath}`);
    return false;
  }
}

function runCommand(command, description, options = {}) {
  logInfo(`Running: ${description}`);
  try {
    const result = execSync(command, {
      stdio: options.silent ? "pipe" : "inherit",
      encoding: "utf8",
      timeout: options.timeout || 30000,
      ...options,
    });
    logSuccess(`${description} completed successfully`);
    return { success: true, output: result };
  } catch (error) {
    logError(`${description} failed: ${error.message}`);
    return { success: false, error };
  }
}

function validatePackageJson() {
  logSection("Package.json Validation");

  const packagePath = path.join(__dirname, "../package.json");
  if (!checkFileExists(packagePath, "package.json")) {
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  // Check for required testing dependencies
  const requiredDeps = [
    "jest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "@testing-library/user-event",
    "jest-axe",
    "@playwright/test",
    "@axe-core/playwright",
  ];

  let allDepsPresent = true;
  requiredDeps.forEach((dep) => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      logSuccess(`Required dependency found: ${dep}`);
    } else {
      logError(`Missing required dependency: ${dep}`);
      allDepsPresent = false;
    }
  });

  // Check for required test scripts
  const requiredScripts = ["test", "test:coverage", "test:e2e", "test:a11y"];

  let allScriptsPresent = true;
  requiredScripts.forEach((script) => {
    if (packageJson.scripts?.[script]) {
      logSuccess(`Required script found: ${script}`);
    } else {
      logError(`Missing required script: ${script}`);
      allScriptsPresent = false;
    }
  });

  return allDepsPresent && allScriptsPresent;
}

function validateJestConfiguration() {
  logSection("Jest Configuration Validation");

  const jestConfigPath = path.join(__dirname, "../jest.config.js");
  const jestSetupPath = path.join(__dirname, "../jest.setup.js");

  let valid = true;
  valid = checkFileExists(jestConfigPath, "Jest configuration") && valid;
  valid = checkFileExists(jestSetupPath, "Jest setup file") && valid;

  // Check for test setup directories
  const testSetupDir = path.join(__dirname, "../tests/setup");
  valid = checkFileExists(testSetupDir, "Test setup directory") && valid;

  const globalSetupPath = path.join(testSetupDir, "globalSetup.js");
  const globalTeardownPath = path.join(testSetupDir, "globalTeardown.js");
  valid = checkFileExists(globalSetupPath, "Global setup file") && valid;
  valid = checkFileExists(globalTeardownPath, "Global teardown file") && valid;

  return valid;
}

function validatePlaywrightConfiguration() {
  logSection("Playwright Configuration Validation");

  const playwrightConfigPath = path.join(__dirname, "../playwright.config.ts");
  const e2eDir = path.join(__dirname, "../e2e");

  let valid = true;
  valid =
    checkFileExists(playwrightConfigPath, "Playwright configuration") && valid;
  valid = checkFileExists(e2eDir, "E2E tests directory") && valid;

  const globalSetupPath = path.join(e2eDir, "global-setup.ts");
  const globalTeardownPath = path.join(e2eDir, "global-teardown.ts");
  valid = checkFileExists(globalSetupPath, "E2E global setup") && valid;
  valid = checkFileExists(globalTeardownPath, "E2E global teardown") && valid;

  return valid;
}

function validateTestStructure() {
  logSection("Test Structure Validation");

  // Check for example test files
  const testFiles = [
    "../src/utils/__tests__/classNames.test.ts",
    "../src/components/ui/__tests__/Button.test.tsx",
    "../e2e/homepage.spec.ts",
  ];

  let valid = true;
  testFiles.forEach((testFile) => {
    const fullPath = path.join(__dirname, testFile);
    valid = checkFileExists(fullPath, `Test file: ${testFile}`) && valid;
  });

  return valid;
}

function validateTypeScriptConfiguration() {
  logSection("TypeScript Configuration Validation");

  const tsconfigPath = path.join(__dirname, "../tsconfig.json");
  if (!checkFileExists(tsconfigPath, "TypeScript configuration")) {
    return false;
  }

  // Test TypeScript compilation
  const typeCheckResult = runCommand(
    "npx tsc --noEmit --skipLibCheck",
    "TypeScript type checking",
    { silent: true },
  );

  return typeCheckResult.success;
}

function validateDatabaseSetup() {
  logSection("Database Setup Validation");

  const schemaPath = path.join(__dirname, "../prisma/schema.prisma");
  if (!checkFileExists(schemaPath, "Prisma schema")) {
    return false;
  }

  // Check if Prisma client is generated
  const prismaClientPath = path.join(
    __dirname,
    "../node_modules/.prisma/client",
  );
  const clientGenerated = checkFileExists(
    prismaClientPath,
    "Generated Prisma client",
  );

  if (!clientGenerated) {
    logInfo("Generating Prisma client...");
    const generateResult = runCommand(
      "npx prisma generate",
      "Prisma client generation",
      { silent: true },
    );
    return generateResult.success;
  }

  return true;
}

function runBasicTests() {
  logSection("Basic Test Execution");

  // Run Jest tests (dry run)
  const jestResult = runCommand(
    "npm run test -- --passWithNoTests --verbose --watchAll=false",
    "Jest test runner (dry run)",
    { timeout: 60000 },
  );

  if (!jestResult.success) {
    logError("Jest tests failed to run");
    return false;
  }

  // Check if Playwright is properly installed
  const playwrightResult = runCommand(
    "npx playwright --version",
    "Playwright version check",
    { silent: true },
  );

  return playwrightResult.success;
}

function validateAccessibilitySetup() {
  logSection("Accessibility Testing Setup Validation");

  // Check if axe-core is properly configured
  try {
    const jestSetupContent = fs.readFileSync(
      path.join(__dirname, "../jest.setup.js"),
      "utf8",
    );

    if (jestSetupContent.includes("jest-axe")) {
      logSuccess("jest-axe is configured in Jest setup");
    } else {
      logWarning("jest-axe might not be properly configured");
    }

    if (jestSetupContent.includes("toHaveNoViolations")) {
      logSuccess("Accessibility matchers are configured");
    } else {
      logWarning("Accessibility matchers might not be configured");
    }

    return true;
  } catch (error) {
    logError("Failed to validate accessibility setup");
    return false;
  }
}

function generateValidationReport() {
  logSection("Validation Report Generation");

  const reportPath = path.join(
    __dirname,
    "../test-framework-validation-report.json",
  );
  const report = {
    timestamp: new Date().toISOString(),
    frameworkVersion: "1.0.0",
    validationResults: {
      packageJson: false,
      jestConfiguration: false,
      playwrightConfiguration: false,
      testStructure: false,
      typeScriptConfiguration: false,
      databaseSetup: false,
      basicTests: false,
      accessibilitySetup: false,
    },
    recommendations: [],
  };

  // Run all validations
  report.validationResults.packageJson = validatePackageJson();
  report.validationResults.jestConfiguration = validateJestConfiguration();
  report.validationResults.playwrightConfiguration =
    validatePlaywrightConfiguration();
  report.validationResults.testStructure = validateTestStructure();
  report.validationResults.typeScriptConfiguration =
    validateTypeScriptConfiguration();
  report.validationResults.databaseSetup = validateDatabaseSetup();
  report.validationResults.basicTests = runBasicTests();
  report.validationResults.accessibilitySetup = validateAccessibilitySetup();

  // Generate recommendations
  Object.entries(report.validationResults).forEach(([key, passed]) => {
    if (!passed) {
      switch (key) {
        case "packageJson":
          report.recommendations.push(
            "Install missing testing dependencies: npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe @playwright/test @axe-core/playwright",
          );
          break;
        case "jestConfiguration":
          report.recommendations.push(
            "Configure Jest properly with jest.config.js and jest.setup.js files",
          );
          break;
        case "playwrightConfiguration":
          report.recommendations.push(
            "Set up Playwright configuration with playwright.config.ts",
          );
          break;
        case "testStructure":
          report.recommendations.push(
            "Create example test files to validate test structure",
          );
          break;
        case "typeScriptConfiguration":
          report.recommendations.push(
            "Fix TypeScript configuration and compilation errors",
          );
          break;
        case "databaseSetup":
          report.recommendations.push(
            "Set up Prisma schema and generate client",
          );
          break;
        case "basicTests":
          report.recommendations.push(
            "Ensure Jest and Playwright can run basic tests",
          );
          break;
        case "accessibilitySetup":
          report.recommendations.push(
            "Configure accessibility testing with jest-axe and @axe-core/playwright",
          );
          break;
      }
    }
  });

  // Write report
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logSuccess(`Validation report generated: ${reportPath}`);

  return report;
}

function main() {
  log(
    `${COLORS.BOLD}${COLORS.BLUE}🧪 Testing Framework Validation${COLORS.RESET}`,
  );
  log("Validating automated testing framework setup...\n");

  const report = generateValidationReport();

  logSection("Validation Summary");

  const results = report.validationResults;
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;

  if (passedTests === totalTests) {
    logSuccess(`All ${totalTests} validation checks passed!`);
    log("\n🎉 Testing framework is properly configured and ready for use!");
  } else {
    logWarning(
      `${passedTests}/${totalTests} validation checks passed, ${failedTests} failed`,
    );

    if (report.recommendations.length > 0) {
      logSection("Recommendations");
      report.recommendations.forEach((rec, index) => {
        log(`${index + 1}. ${rec}`);
      });
    }
  }

  logSection("Next Steps");
  if (passedTests === totalTests) {
    log("✅ Run tests: npm run test:all");
    log("✅ Run unit tests: npm run test:unit");
    log("✅ Run E2E tests: npm run test:e2e");
    log("✅ Check accessibility: npm run test:a11y");
  } else {
    log("🔧 Fix the issues above and run this validation script again");
    log(
      "📖 Refer to the testing documentation for detailed setup instructions",
    );
  }

  process.exit(passedTests === totalTests ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = {
  validatePackageJson,
  validateJestConfiguration,
  validatePlaywrightConfiguration,
  validateTestStructure,
  validateTypeScriptConfiguration,
  validateDatabaseSetup,
  runBasicTests,
  validateAccessibilitySetup,
  generateValidationReport,
};
