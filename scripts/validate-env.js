#!/usr/bin/env node

/**
 * Environment Validation Script
 *
 * This script validates that all required environment variables are set
 * and have valid values before starting the application.
 */

const fs = require("fs");
const path = require("path");

// Color codes for terminal output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Load environment variables from .env.local if it exists
function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    logError(".env.local file not found");
    logInfo('Run "npm run env:setup" to create .env.local from env.example');
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const envLines = envContent.split("\n");

  envLines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith("#")) {
      const [key, ...valueParts] = trimmedLine.split("=");
      if (key && valueParts.length > 0) {
        const value = valueParts.join("=").replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  });

  return true;
}

// Helper functions
function parseBoolean(value, defaultValue = false) {
  if (!value) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
}

function parseNumber(value, defaultValue) {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Validation functions
function validateRequired() {
  const requiredVars = ["DATABASE_URL"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    logError(`Missing required environment variables: ${missing.join(", ")}`);
    logInfo(
      "Please check your .env.local file and ensure all required variables are set.",
    );
    logInfo("See env.example for a complete list of required variables.");
    return false;
  }

  logSuccess("All required environment variables are present");
  return true;
}

function validateDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logError("DATABASE_URL is not set");
    return false;
  }

  if (
    !databaseUrl.startsWith("postgresql://") &&
    !databaseUrl.startsWith("postgres://")
  ) {
    logError("DATABASE_URL must be a valid PostgreSQL connection string");
    logInfo(
      "Format: postgresql://username:password@localhost:5432/database_name",
    );
    return false;
  }

  logSuccess("DATABASE_URL format is valid");
  return true;
}

function validateNodeEnv() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const validEnvs = ["development", "production", "test"];

  if (!validEnvs.includes(nodeEnv)) {
    logError(
      `Invalid NODE_ENV: ${nodeEnv}. Must be one of: ${validEnvs.join(", ")}`,
    );
    return false;
  }

  logSuccess(`NODE_ENV is valid: ${nodeEnv}`);
  return true;
}

function validateNumericValues() {
  const numericVars = {
    PORT: { default: 3000, min: 1, max: 65535 },
    ADMIN_SESSION_TIMEOUT: { default: 3600000, min: 60000 }, // min 1 minute
    ADMIN_REMEMBER_ME_TIMEOUT: { default: 2592000000, min: 86400000 }, // min 1 day
    ADMIN_BCRYPT_ROUNDS: { default: 12, min: 10, max: 15 },
    CACHE_TTL: { default: 300, min: 0 },
    MAX_FILE_SIZE: { default: 10485760, min: 1024 }, // min 1KB
    LARGE_FILE_THRESHOLD: { default: 5242880, min: 1024 }, // min 1KB
  };

  let allValid = true;

  Object.entries(numericVars).forEach(([varName, config]) => {
    const value = parseNumber(process.env[varName], config.default);

    if (config.min !== undefined && value < config.min) {
      logError(`${varName} must be at least ${config.min}, got ${value}`);
      allValid = false;
    }

    if (config.max !== undefined && value > config.max) {
      logError(`${varName} must be at most ${config.max}, got ${value}`);
      allValid = false;
    }
  });

  if (allValid) {
    logSuccess("All numeric values are valid");
  }

  return allValid;
}

function validateFeatureFlags() {
  const featureFlags = [
    "FEATURE_BASE64_TOOL",
    "FEATURE_HASH_GENERATOR",
    "FEATURE_FAVICON_GENERATOR",
    "FEATURE_MARKDOWN_TO_PDF",
    "FEATURE_ADMIN_DASHBOARD",
  ];

  featureFlags.forEach((flag) => {
    const value = parseBoolean(process.env[flag], true);
    logInfo(`${flag}: ${value ? "enabled" : "disabled"}`);
  });

  logSuccess("Feature flags validated");
  return true;
}

function main() {
  log(`${colors.bold}🔍 Environment Validation${colors.reset}\n`);

  // Load environment file
  if (!loadEnvFile()) {
    process.exit(1);
  }

  // Run all validations
  const validations = [
    validateRequired,
    validateDatabaseUrl,
    validateNodeEnv,
    validateNumericValues,
    validateFeatureFlags,
  ];

  let allValid = true;

  validations.forEach((validation) => {
    if (!validation()) {
      allValid = false;
    }
  });

  if (allValid) {
    log(
      `\n${colors.bold}${colors.green}✅ Environment validation passed!${colors.reset}`,
    );
    logInfo("Your environment is properly configured.");
  } else {
    log(
      `\n${colors.bold}${colors.red}❌ Environment validation failed!${colors.reset}`,
    );
    logInfo("Please fix the issues above and run validation again.");
    process.exit(1);
  }
}

// Run the validation
main();
