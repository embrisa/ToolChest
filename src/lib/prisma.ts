import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with build-time fallback
function createPrismaClient() {
  // If DATABASE_URL is not available (during build), provide a placeholder
  // The actual connection will only be attempted when queries are made
  if (!process.env.DATABASE_URL) {
    console.log(
      "DATABASE_URL not available, creating Prisma client with placeholder",
    );
    // Create client with minimal config that won't be used
    return new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://build:build@localhost:5432/build",
        },
      },
    });
  }

  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
