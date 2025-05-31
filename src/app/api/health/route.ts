import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { server, features } from '@/lib/env';

export async function GET() {
  try {
    // Test database connectivity
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbResponseTime = Date.now() - startTime;

    // Get basic database info
    const [userCount, toolCount] = await Promise.all([
      prisma.adminUser.count(),
      prisma.tool.count(),
    ]);

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: server.nodeEnv,
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
        users: userCount,
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
      version: process.env.npm_package_version || '0.1.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: server.nodeEnv,
        database: {
          status: 'disconnected',
          error:
            error instanceof Error ? error.message : 'Unknown database error',
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
