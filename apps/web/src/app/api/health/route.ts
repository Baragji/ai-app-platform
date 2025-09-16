import { NextResponse } from 'next/server';
import { prisma } from '@ai-app-platform/db';
import { getQueueHealth } from '@ai-app-platform/jobs';

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check job queue health
    const queueHealth = await getQueueHealth();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        jobQueue: {
          status: queueHealth.connection,
          counts: queueHealth.counts,
        },
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}