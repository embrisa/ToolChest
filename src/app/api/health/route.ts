import { NextResponse } from "next/server";
import { server, features } from "@/lib/env";

// Lazy import prisma to avoid issues during build
async function getPrisma() {
  const { prisma } = await import("@/lib/prisma");
  return prisma;
}

export async function GET() {
  try {
    // Test database connectivity
    const startTime = Date.now();
    const prisma = await getPrisma();

    // Try to connect to the database
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    // Get basic database info
    const toolCount = await prisma.tool.count();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: server.nodeEnv,
      database: {
        status: "connected",
        responseTime: `${dbResponseTime}ms`,
        tools: toolCount,
      },
      features: {
        base64Tool: features.base64Tool,
        hashGenerator: features.hashGenerator,
        faviconGenerator: features.faviconGenerator,
        markdownToPdf: features.markdownToPdf,
        adminDashboard: features.adminDashboard,
      },
      server: {
        port: server.port,
        nodeEnv: server.nodeEnv,
        isDevelopment: server.isDevelopment,
      },
      version: process.env.npm_package_version || "0.1.0",
    });
  } catch (error) {
    console.error("Health check failed:", error);

    // Return a degraded health status instead of failing completely
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        environment: server.nodeEnv,
        database: {
          status: "disconnected",
          error:
            error instanceof Error ? error.message : "Unknown database error",
        },
        features: {
          base64Tool: features.base64Tool,
          hashGenerator: features.hashGenerator,
          faviconGenerator: features.faviconGenerator,
          markdownToPdf: features.markdownToPdf,
          adminDashboard: features.adminDashboard,
        },
        server: {
          port: server.port,
          nodeEnv: server.nodeEnv,
          isDevelopment: server.isDevelopment,
        },
        version: process.env.npm_package_version || "0.1.0",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 200 }, // Return 200 instead of 500 for Railway health checks
    );
  }
}
