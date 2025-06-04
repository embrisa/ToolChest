import { PrismaClient } from "@prisma/client";

/**
 * Database configuration utility
 * Automatically configures Prisma for different environments
 */

// Global Prisma instance to prevent multiple connections
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Get database configuration based on environment
 */
function getDatabaseConfig() {
  const isTest = process.env.NODE_ENV === "test";
  const provider =
    process.env.DATABASE_PROVIDER || (isTest ? "sqlite" : "postgresql");
  const url = process.env.DATABASE_URL || (isTest ? "file:./test.db" : "");

  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  return { provider, url };
}

/**
 * Create Prisma client with environment-appropriate configuration
 */
function createPrismaClient(): PrismaClient {
  const config = getDatabaseConfig();

  console.log(`🗄️  Connecting to ${config.provider} database`);

  return new PrismaClient({
    datasources: {
      db: {
        url: config.url,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

/**
 * Get or create the global Prisma instance
 * Uses singleton pattern to prevent multiple connections
 */
export function getPrismaClient(): PrismaClient {
  if (global.__prisma) {
    return global.__prisma;
  }

  const prisma = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    global.__prisma = prisma;
  }

  return prisma;
}

/**
 * Default export for convenience
 */
export const prisma = getPrismaClient();

/**
 * Cleanup function for tests
 */
export async function cleanupDatabase() {
  if (process.env.NODE_ENV === "test") {
    await prisma.$disconnect();
    if (global.__prisma) {
      global.__prisma = undefined;
    }
  }
}
