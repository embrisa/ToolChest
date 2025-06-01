/**
 * Environment Configuration and Validation
 *
 * This module validates all required environment variables and provides
 * type-safe access to configuration values throughout the application.
 */

// Type definition for our environment configuration
export interface EnvironmentConfig {
  // Database
  DATABASE_URL: string;

  // Next.js Configuration
  NODE_ENV: "development" | "production" | "test";
  PORT: number;

  // Authentication & Security
  ADMIN_SECRET_TOKEN?: string;
  ADMIN_SESSION_SECRET?: string;
  ADMIN_SESSION_TIMEOUT: number;
  ADMIN_REMEMBER_ME_TIMEOUT: number;
  ADMIN_BCRYPT_ROUNDS: number;
  ADMIN_DEFAULT_PASSWORD?: string;

  // Performance & Caching
  ENABLE_CACHING: boolean;
  CACHE_TTL: number;

  // Analytics & Monitoring
  ENABLE_ANALYTICS: boolean;
  ENABLE_ERROR_LOGGING: boolean;

  // Development Settings
  ENABLE_DEV_LOGGING: boolean;
  ENABLE_HOT_RELOAD: boolean;

  // Feature Flags
  FEATURE_BASE64_TOOL: boolean;
  FEATURE_HASH_GENERATOR: boolean;
  FEATURE_FAVICON_GENERATOR: boolean;
  FEATURE_MARKDOWN_TO_PDF: boolean;
  FEATURE_ADMIN_DASHBOARD: boolean;

  // File Processing
  MAX_FILE_SIZE: number;
  LARGE_FILE_THRESHOLD: number;

  // CORS & Security
  ALLOWED_ORIGINS: string[];
  ENABLE_SECURITY_HEADERS: boolean;
}

// Helper function to parse boolean from string
const parseBoolean = (
  value: string | undefined,
  defaultValue: boolean = false,
): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === "true" || value === "1";
};

// Helper function to parse number from string
const parseNumber = (
  value: string | undefined,
  defaultValue: number,
): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Helper function to parse array from comma-separated string
const parseArray = (
  value: string | undefined,
  defaultValue: string[] = [],
): string[] => {
  if (!value) return defaultValue;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

// Validate and parse environment variables
function validateEnvironment(): EnvironmentConfig {
  const requiredVars = ["DATABASE_URL"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file and ensure all required variables are set.\n" +
        "See env.example for a complete list of required variables.",
    );
  }

  // Validate NODE_ENV
  const nodeEnv = process.env.NODE_ENV || "development";
  if (!["development", "production", "test"].includes(nodeEnv)) {
    throw new Error(
      `Invalid NODE_ENV: ${nodeEnv}. Must be one of: development, production, test`,
    );
  }

  // Validate DATABASE_URL format
  const databaseUrl = process.env.DATABASE_URL!;
  const isPostgres =
    databaseUrl.startsWith("postgresql://") ||
    databaseUrl.startsWith("postgres://");
  const isSqlite =
    databaseUrl.startsWith("file:") || databaseUrl.startsWith("sqlite:");

  if (!isPostgres && !isSqlite) {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string or SQLite file URL",
    );
  }

  return {
    // Database
    DATABASE_URL: databaseUrl,

    // Next.js Configuration
    NODE_ENV: nodeEnv as "development" | "production" | "test",
    PORT: parseNumber(process.env.PORT, 3000),

    // Authentication & Security
    ADMIN_SECRET_TOKEN: process.env.ADMIN_SECRET_TOKEN,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    ADMIN_SESSION_TIMEOUT: parseNumber(
      process.env.ADMIN_SESSION_TIMEOUT,
      3600000,
    ), // 1 hour
    ADMIN_REMEMBER_ME_TIMEOUT: parseNumber(
      process.env.ADMIN_REMEMBER_ME_TIMEOUT,
      2592000000,
    ), // 30 days
    ADMIN_BCRYPT_ROUNDS: parseNumber(process.env.ADMIN_BCRYPT_ROUNDS, 12),
    ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD,

    // Performance & Caching
    ENABLE_CACHING: parseBoolean(process.env.ENABLE_CACHING, false),
    CACHE_TTL: parseNumber(process.env.CACHE_TTL, 300), // 5 minutes

    // Analytics & Monitoring
    ENABLE_ANALYTICS: parseBoolean(process.env.ENABLE_ANALYTICS, true),
    ENABLE_ERROR_LOGGING: parseBoolean(process.env.ENABLE_ERROR_LOGGING, true),

    // Development Settings
    ENABLE_DEV_LOGGING: parseBoolean(
      process.env.ENABLE_DEV_LOGGING,
      nodeEnv === "development",
    ),
    ENABLE_HOT_RELOAD: parseBoolean(
      process.env.ENABLE_HOT_RELOAD,
      nodeEnv === "development",
    ),

    // Feature Flags
    FEATURE_BASE64_TOOL: parseBoolean(process.env.FEATURE_BASE64_TOOL, true),
    FEATURE_HASH_GENERATOR: parseBoolean(
      process.env.FEATURE_HASH_GENERATOR,
      true,
    ),
    FEATURE_FAVICON_GENERATOR: parseBoolean(
      process.env.FEATURE_FAVICON_GENERATOR,
      true,
    ),
    FEATURE_MARKDOWN_TO_PDF: parseBoolean(
      process.env.FEATURE_MARKDOWN_TO_PDF,
      true,
    ),
    FEATURE_ADMIN_DASHBOARD: parseBoolean(
      process.env.FEATURE_ADMIN_DASHBOARD,
      true,
    ),

    // File Processing
    MAX_FILE_SIZE: parseNumber(process.env.MAX_FILE_SIZE, 10485760), // 10MB
    LARGE_FILE_THRESHOLD: parseNumber(
      process.env.LARGE_FILE_THRESHOLD,
      5242880,
    ), // 5MB

    // CORS & Security
    ALLOWED_ORIGINS: parseArray(process.env.ALLOWED_ORIGINS, [
      "http://localhost:3000",
    ]),
    ENABLE_SECURITY_HEADERS: parseBoolean(
      process.env.ENABLE_SECURITY_HEADERS,
      true,
    ),
  };
}

// Validate environment variables on module load
let env: EnvironmentConfig;

try {
  env = validateEnvironment();
} catch (error) {
  console.error("Environment validation failed:", error);
  if (process.env.NODE_ENV !== "production") {
    console.error("\n📝 To fix this:");
    console.error("1. Copy env.example to .env.local");
    console.error("2. Update the DATABASE_URL and other required variables");
    console.error("3. Restart the development server\n");
  }
  throw error;
}

// Export the validated configuration
export const config = env;

// Export individual sections for convenience
export const database = {
  url: env.DATABASE_URL,
};

export const server = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",
};

export const auth = {
  secretToken: env.ADMIN_SECRET_TOKEN,
  sessionSecret: env.ADMIN_SESSION_SECRET,
  sessionTimeout: env.ADMIN_SESSION_TIMEOUT,
  rememberMeTimeout: env.ADMIN_REMEMBER_ME_TIMEOUT,
  bcryptRounds: env.ADMIN_BCRYPT_ROUNDS,
  defaultPassword: env.ADMIN_DEFAULT_PASSWORD,
};

export const performance = {
  enableCaching: env.ENABLE_CACHING,
  cacheTTL: env.CACHE_TTL,
};

export const monitoring = {
  enableAnalytics: env.ENABLE_ANALYTICS,
  enableErrorLogging: env.ENABLE_ERROR_LOGGING,
  enableDevLogging: env.ENABLE_DEV_LOGGING,
};

export const features = {
  base64Tool: env.FEATURE_BASE64_TOOL,
  hashGenerator: env.FEATURE_HASH_GENERATOR,
  faviconGenerator: env.FEATURE_FAVICON_GENERATOR,
  markdownToPdf: env.FEATURE_MARKDOWN_TO_PDF,
  adminDashboard: env.FEATURE_ADMIN_DASHBOARD,
};

export const fileProcessing = {
  maxFileSize: env.MAX_FILE_SIZE,
  largeFileThreshold: env.LARGE_FILE_THRESHOLD,
  isLargeFile: (size: number) => size > env.LARGE_FILE_THRESHOLD,
  isValidFileSize: (size: number) => size <= env.MAX_FILE_SIZE,
};

export const security = {
  allowedOrigins: env.ALLOWED_ORIGINS,
  enableSecurityHeaders: env.ENABLE_SECURITY_HEADERS,
};

// Default export for the complete configuration
export default config;
