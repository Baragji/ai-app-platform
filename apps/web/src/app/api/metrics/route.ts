import { NextRequest, NextResponse } from 'next/server';
import { logger, getCurrentTraceId } from '@/lib/otel';

export async function GET(request: NextRequest) {
  const traceId = getCurrentTraceId();
  
  logger.info({ traceId, url: request.url }, 'Metrics endpoint requested');
  
  try {
    // Fetch metrics from the Prometheus exporter running on the configured port
    const config = await import('@ai-app-platform/observability').then(m => m.getObservabilityConfig());
    const metricsUrl = `http://localhost:${config.metrics.port}${config.metrics.endpoint}`;
    
    const response = await fetch(metricsUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metrics: ${response.status} ${response.statusText}`);
    }
    
    const metrics = await response.text();
    
    logger.info({ traceId, metricsLength: metrics.length }, 'Metrics fetched successfully');
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'X-Trace-Id': traceId || 'unknown',
      },
    });
  } catch (error) {
    logger.error({ 
      traceId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 'Failed to fetch metrics');
    
    return NextResponse.json(
      {
        error: 'Failed to fetch metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        traceId,
      },
      { status: 500 }
    );
  }
}