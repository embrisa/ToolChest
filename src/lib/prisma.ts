import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with build-time fallback
function createPrismaClient() {
  // During production builds on providers like Railway the DATABASE_URL secret
  // is not injected. We still need a PrismaClient instance to satisfy import
  // type references, but we don't want to flood the build logs with dozens of
  // noisy messages. Log a *single* warning only in non-production environments.

  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[prisma] DATABASE_URL not set – using placeholder Prisma client. All DB queries will fail at runtime.",
      );
    }

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
