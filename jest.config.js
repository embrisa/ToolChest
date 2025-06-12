const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Setup files after environment is set up
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // Test environment
  testEnvironment: "jest-environment-jsdom",

  // Module name mapping for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // This line is often not needed with modern jest/next
    // "^@prisma/client$": "<rootDir>/node_modules/.prisma/client/index-browser.js",
  },

  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/**/index.ts", // Exclude barrel exports
    "!src/app/layout.tsx", // Exclude root layout
    "!src/app/globals.css", // Exclude CSS files
  ],

  // Coverage thresholds (80% minimum across all metrics)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage reporting
  coverageReporters: [
    "text",
    "text-summary",
    "lcov",
    "clover",
    "json",
    "json-summary",
  ],

  // Coverage directory
  coverageDirectory: "coverage",

  // Test match patterns
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}",
    "<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}",
  ],

  // Test path ignore patterns
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],

  // Module file extensions
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Verbose output for terminal-friendly testing
  verbose: true,

  // Test timeout (30 seconds for complex operations)
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Reset modules between tests
  resetMocks: true,

  // Global test setup
  globalSetup: "<rootDir>/tests/setup/globalSetup.js",
  globalTeardown: "<rootDir>/tests/setup/globalTeardown.js",

  // Test environment options
  testEnvironmentOptions: {
    url: "http://localhost:3000",
  },

  // Reporters for detailed test output
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-results",
        outputName: "junit.xml",
        ancestorSeparator: " › ",
        uniqueOutputName: "false",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        titleTemplate: "{title}",
      },
    ],
    [
      "jest-html-reporter",
      {
        outputPath: "test-results/test-report.html",
        pageTitle: "tool-chest Test Report",
        includeFailureMsg: true,
        includeSuiteFailure: true,
      },
    ],
  ],

  // Error on deprecated features
  errorOnDeprecated: true,

  // Notify mode (useful for watch mode)
  notify: false,

  // Max workers for parallel testing
  maxWorkers: "50%",

  // Stop ignoring next-intl for transformations
  transformIgnorePatterns: [],
};

// Create an async function to configure Jest
module.exports = async () => {
  // Create the base Jest config from next/jest
  const jestConfig = await createJestConfig(customJestConfig)();

  // By default, next/jest ignores all of node_modules for transformations.
  // We need to override this to tell Jest to transform `next-intl`.
  // This is the official recommended approach for this problem.
  jestConfig.transformIgnorePatterns[0] =
    "/node_modules/(?!(next-intl|use-intl))/";

  return jestConfig;
};
