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

// Check if we're in build mode
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.DATABASE_URL;

// Validate and parse environment variables
function validateEnvironment(): EnvironmentConfig {
  // Skip validation during build time
  if (isBuildTime) {
    console.log("Skipping environment validation during build phase");
    // Return a minimal config for build time
    return createBuildTimeConfig();
  }

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

  if (!isPostgres) {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string",
    );
  }

  return createRuntimeConfig(nodeEnv, databaseUrl);
}

// Create minimal config for build time
function createBuildTimeConfig(): EnvironmentConfig {
  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    // Database - use placeholder during build
    DATABASE_URL: "postgresql://build:build@localhost:5432/build",

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

// Create runtime config with validation
function createRuntimeConfig(nodeEnv: string, databaseUrl: string): EnvironmentConfig {
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

// Cache for the validated environment
let _cachedEnv: EnvironmentConfig | null = null;

// Get validated environment configuration (lazy-loaded)
function getEnv(): EnvironmentConfig {
  if (!_cachedEnv) {
    try {
      _cachedEnv = validateEnvironment();
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
  }
  return _cachedEnv;
}

// Export the lazy-loaded configuration getter
export const config = new Proxy({} as EnvironmentConfig, {
  get(target, prop) {
    const env = getEnv();
    return env[prop as keyof EnvironmentConfig];
  }
});

// Export individual sections for convenience
export const database = {
  get url() { return getEnv().DATABASE_URL; },
};

export const server = {
  get nodeEnv() { return getEnv().NODE_ENV; },
  get port() { return getEnv().PORT; },
  get isDevelopment() { return getEnv().NODE_ENV === "development"; },
  get isProduction() { return getEnv().NODE_ENV === "production"; },
  get isTest() { return getEnv().NODE_ENV === "test"; },
};

export const auth = {
  get secretToken() { return getEnv().ADMIN_SECRET_TOKEN; },
  get sessionSecret() { return getEnv().ADMIN_SESSION_SECRET; },
  get sessionTimeout() { return getEnv().ADMIN_SESSION_TIMEOUT; },
  get rememberMeTimeout() { return getEnv().ADMIN_REMEMBER_ME_TIMEOUT; },
  get bcryptRounds() { return getEnv().ADMIN_BCRYPT_ROUNDS; },
  get defaultPassword() { return getEnv().ADMIN_DEFAULT_PASSWORD; },
};

export const performance = {
  get enableCaching() { return getEnv().ENABLE_CACHING; },
  get cacheTTL() { return getEnv().CACHE_TTL; },
};

export const monitoring = {
  get enableAnalytics() { return getEnv().ENABLE_ANALYTICS; },
  get enableErrorLogging() { return getEnv().ENABLE_ERROR_LOGGING; },
  get enableDevLogging() { return getEnv().ENABLE_DEV_LOGGING; },
};

export const features = {
  get base64Tool() { return getEnv().FEATURE_BASE64_TOOL; },
  get hashGenerator() { return getEnv().FEATURE_HASH_GENERATOR; },
  get faviconGenerator() { return getEnv().FEATURE_FAVICON_GENERATOR; },
  get markdownToPdf() { return getEnv().FEATURE_MARKDOWN_TO_PDF; },
  get adminDashboard() { return getEnv().FEATURE_ADMIN_DASHBOARD; },
};

export const fileProcessing = {
  get maxFileSize() { return getEnv().MAX_FILE_SIZE; },
  get largeFileThreshold() { return getEnv().LARGE_FILE_THRESHOLD; },
  isLargeFile: (size: number) => size > getEnv().LARGE_FILE_THRESHOLD,
  isValidFileSize: (size: number) => size <= getEnv().MAX_FILE_SIZE,
};

export const security = {
  get allowedOrigins() { return getEnv().ALLOWED_ORIGINS; },
  get enableSecurityHeaders() { return getEnv().ENABLE_SECURITY_HEADERS; },
};

// Default export for the complete configuration
export default config;
