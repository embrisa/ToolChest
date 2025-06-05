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
  testEnvironment: "jsdom",

  // Module name mapping for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@prisma/client$": "<rootDir>/node_modules/@prisma/client/index.js",
    "^next-intl(.*)$": "<rootDir>/node_modules/next-intl/dist/cjs$1",
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

  // Transform patterns
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },

  // Transform ignore patterns for node_modules
  transformIgnorePatterns: [
    "node_modules/(?!next-intl)",
    "^.+\\.module\\.(css|sass|scss)$",
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
};

// Create Jest config that is merged with Next.js config
module.exports = createJestConfig(customJestConfig);
