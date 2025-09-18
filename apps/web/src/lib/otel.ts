// OpenTelemetry initialization for the web application
// This file should be imported as early as possible
import { initializeObservability, getTracer, defaultLogger, defaultMetrics } from '@ai-app-platform/observability';

// Initialize observability stack
initializeObservability();

// Create application-specific tracer
export const webTracer = getTracer('ai-app-platform-web', '1.0.0');

// Export logger and metrics for use throughout the app
export { defaultLogger as logger, defaultMetrics as metrics };

// Export observability utilities
export {
  getCurrentTraceId,
  getCurrentSpanId,
  withSpan,
  addSpanAttributes,
  addSpanEvent,
  createLogger,
  measureLatency,
} from '@ai-app-platform/observability';

// Middleware helpers for Next.js
export function getTraceHeaders() {
  const traceId = require('@ai-app-platform/observability').getCurrentTraceId();
  const spanId = require('@ai-app-platform/observability').getCurrentSpanId();
  
  return {
    'x-trace-id': traceId || 'unknown',
    'x-span-id': spanId || 'unknown',
  };
}

export function logRequest(req: any, res: any) {
  const logger = require('@ai-app-platform/observability').defaultLogger;
  
  logger.logRequest(req, `${req.method} ${req.url}`);
  
  // Add response logging after request completes
  const originalSend = res.send;
  res.send = function(body: any) {
    const startTime = req.startTime || Date.now();
    const latency = Date.now() - startTime;
    
    logger.logResponse(res, latency, `${req.method} ${req.url} - ${res.statusCode}`);
    
    // Record metrics
    const metrics = require('@ai-app-platform/observability').defaultMetrics;
    metrics.recordRequest(req.url, req.method, res.statusCode);
    metrics.recordLatency(`http_request`, latency, {
      method: req.method,
      route: req.url,
      status_code: res.statusCode.toString(),
    });
    
    return originalSend.call(this, body);
  };
}