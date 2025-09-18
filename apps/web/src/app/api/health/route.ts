import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@ai-app-platform/db';
import { getQueueHealth } from '@/lib/jobs';
import { 
  webTracer, 
  logger, 
  metrics, 
  withSpan, 
  getCurrentTraceId,
  measureLatency 
} from '@/lib/otel';

export async function GET(request: NextRequest) {
  const traceId = getCurrentTraceId();
  
  logger.info({ traceId, url: request.url }, 'Health check requested');
  
  return withSpan(webTracer, 'health-check', async () => {
    try {
      // Check database connection (simple round-trip)
      const dbHealth = await measureLatency('database-health-check', async () => {
        await prisma.$queryRaw`SELECT 1`;
        return 'connected';
      });

      // Check job queue health
      const queueHealth = await measureLatency('queue-health-check', async () => {
        return await getQueueHealth();
      });

      // Record business metric
      metrics.recordBusinessMetric('health_check_success', 1, {
        component: 'health-endpoint',
        traceId: traceId || 'unknown',
      });

      const response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        traceId,
        services: {
          database: dbHealth,
          jobQueue: {
            status: queueHealth.connection,
            counts: queueHealth.counts,
          },
        },
      };

      logger.info({ traceId, response }, 'Health check completed successfully');
      return NextResponse.json(response);
      
    } catch (error) {
      logger.error({ 
        traceId, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined 
      }, 'Health check failed');

      // Record error metric
      metrics.recordError('health-check', error instanceof Error ? error.constructor.name : 'UnknownError', {
        traceId: traceId || 'unknown',
      });

      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          traceId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  });
}
