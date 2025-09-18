# Observability with OpenTelemetry

This document describes the comprehensive observability solution implemented in the AI App Platform using OpenTelemetry for distributed tracing, Prometheus metrics, and structured logging.

## Overview

The `@ai-app-platform/observability` package provides:

- **Distributed Tracing**: Request correlation across services using OpenTelemetry
- **Metrics Collection**: Business and system metrics with Prometheus compatibility
- **Structured Logging**: JSON logging with trace correlation using Pino
- **Auto-instrumentation**: Automatic HTTP and Express.js instrumentation
- **Configuration Management**: Environment-based configuration with sensible defaults

## Quick Start

### Basic Setup

```typescript
import { initializeObservability } from '@ai-app-platform/observability';

// Initialize the complete observability stack
initializeObservability();
```

### Environment Variables

Configure observability using environment variables:

```bash
# Service identification
OTEL_SERVICE_NAME=ai-app-platform
OTEL_SERVICE_VERSION=1.0.0

# Tracing configuration
OTEL_ENABLED=true
OTEL_EXPORTER_TYPE=console  # or 'otlp'
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Metrics configuration
METRICS_ENABLED=true
METRICS_PORT=9464

# Logging configuration
LOG_LEVEL=info  # trace, debug, info, warn, error, fatal
LOG_FORMAT=json  # json or pretty
LOG_INCLUDE_TRACE_ID=true
```

## Features

### 1. Distributed Tracing

#### Automatic Instrumentation

- HTTP requests and responses
- Express.js middleware and routes
- Database queries (when using supported libraries)

#### Manual Tracing

```typescript
import { webTracer, withSpan, getCurrentTraceId } from '@/lib/otel';

// Wrap operations in spans
const result = await withSpan(webTracer, 'business-operation', async () => {
  const traceId = getCurrentTraceId();
  console.log(`Processing with trace ID: ${traceId}`);

  // Your business logic here
  return await processData();
});
```

#### Trace Correlation

Every log entry automatically includes trace and span IDs:

```json
{
  "level": "info",
  "time": 1758234041000,
  "service": "ai-app-platform",
  "traceId": "18d4403d11fa172c390cbc6090531d71",
  "spanId": "991f1a489f68c09a",
  "msg": "Request processed successfully"
}
```

### 2. Metrics Collection

#### Built-in Metrics

- HTTP request counts and latencies
- Error rates by operation
- Business metrics
- System performance metrics

#### Custom Metrics

```typescript
import { metrics, measureLatency } from '@/lib/otel';

// Record business metrics
metrics.recordBusinessMetric('user_signups', 1, {
  source: 'web',
  region: 'us-east',
});

// Measure operation latency
const result = await measureLatency('database-query', async () => {
  return await db.users.findMany();
});

// Record custom counters and histograms
metrics.incrementCounter('custom_events', 1, { type: 'user_action' });
metrics.recordHistogram('response_size', 1024, { endpoint: '/api/data' });
```

#### Metrics Endpoint

Metrics are exposed in Prometheus format at:

- Direct: `http://localhost:9464/metrics`
- Via app: `http://localhost:3000/api/metrics`

### 3. Structured Logging

#### Enhanced Logger

```typescript
import { logger, createLogger } from '@/lib/otel';

// Use default logger
logger.info({ userId: '123', action: 'login' }, 'User logged in');

// Create component-specific logger
const dbLogger = createLogger('database');
dbLogger.warn(
  { query: 'SELECT * FROM users', duration: 5000 },
  'Slow query detected'
);
```

#### Request/Response Logging

```typescript
import { logger } from '@/lib/otel';

// Log HTTP requests with trace correlation
logger.logRequest(req, 'API request received');
logger.logResponse(res, 150, 'API request completed');

// Log errors with context
logger.logError(error, { userId: '123', operation: 'data-sync' });

// Log business events
logger.logBusinessEvent('user_signup', {
  userId: '123',
  source: 'web',
  plan: 'premium',
});
```

## Integration Examples

### Next.js API Routes

```typescript
import {
  webTracer,
  logger,
  metrics,
  withSpan,
  getCurrentTraceId,
} from '@/lib/otel';

export async function GET(request: NextRequest) {
  const traceId = getCurrentTraceId();

  return withSpan(webTracer, 'api-handler', async () => {
    try {
      logger.info({ traceId, url: request.url }, 'Processing request');

      const result = await measureLatency('business-logic', async () => {
        return await businessOperation();
      });

      metrics.recordBusinessMetric('api_success', 1, { endpoint: '/api/data' });

      logger.info({ traceId, result }, 'Request completed successfully');
      return NextResponse.json(result);
    } catch (error) {
      logger.error({ traceId, error }, 'Request failed');
      metrics.recordError('api-handler', error.name);

      return NextResponse.json(
        { error: 'Internal server error', traceId },
        { status: 500 }
      );
    }
  });
}
```

### Database Operations

```typescript
import { webTracer, withSpan, logger } from '@/lib/otel';

class UserService {
  async createUser(userData: CreateUserData) {
    return withSpan(webTracer, 'user-service.create', async () => {
      logger.info({ userData: { email: userData.email } }, 'Creating user');

      const user = await measureLatency('database.user.create', async () => {
        return prisma.user.create({ data: userData });
      });

      logger.logBusinessEvent('user_created', {
        userId: user.id,
        email: user.email,
      });

      metrics.recordBusinessMetric('users_created', 1);

      return user;
    });
  }
}
```

## Configuration

### Observability Config Schema

```typescript
{
  serviceName: string; // Default: 'ai-app-platform'
  serviceVersion: string; // Default: '1.0.0'
  environment: string; // Default: 'development'

  otel: {
    enabled: boolean; // Default: true
    endpoint: string; // Default: 'http://localhost:4318/v1/traces'
    exporterType: 'otlp' | 'console'; // Default: 'console'
  }

  metrics: {
    enabled: boolean; // Default: true
    port: number; // Default: 9464
    endpoint: string; // Default: '/metrics'
  }

  logging: {
    level: string; // Default: 'info'
    format: 'json' | 'pretty'; // Default: 'json'
    includeTraceId: boolean; // Default: true
  }
}
```

### Development vs Production

Development (default):

- Console trace exporter (traces output to stdout)
- Pretty log formatting
- All instrumentations enabled

Production:

- OTLP trace exporter (send to observability backend)
- JSON log formatting
- Optimized instrumentation set

## Monitoring Setup

### Local Development

1. No external dependencies required
2. Traces appear in console output
3. Metrics available at `http://localhost:9464/metrics`
4. Structured logs with trace correlation

### Production Deployment

1. Configure OTLP endpoint for traces
2. Set up Prometheus scraping for metrics
3. Configure log aggregation system
4. Set appropriate log levels

## Best Practices

### Tracing

- Use meaningful span names that describe the operation
- Add relevant attributes to spans for filtering and analysis
- Keep span hierarchies shallow for better performance
- Don't trace overly granular operations

### Metrics

- Use consistent naming conventions (snake_case)
- Add relevant labels but avoid high cardinality
- Prefer histograms for latency measurements
- Use counters for event counting

### Logging

- Log at appropriate levels (info for normal operations, warn for issues, error for failures)
- Include relevant context in log messages
- Use structured logging with consistent field names
- Avoid logging sensitive information

### Performance

- Observability overhead is minimal (~1-5% CPU)
- Sampling can be configured for high-throughput scenarios
- Metrics collection is lightweight
- Log levels can be adjusted to reduce volume

## Troubleshooting

### Common Issues

1. **Traces not appearing**
   - Check `OTEL_ENABLED=true`
   - Verify exporter configuration
   - Ensure instrumentation is loaded before app code

2. **Metrics endpoint not accessible**
   - Check `METRICS_ENABLED=true`
   - Verify port is not in use
   - Check firewall settings

3. **Missing trace correlation in logs**
   - Ensure `LOG_INCLUDE_TRACE_ID=true`
   - Verify spans are active when logging
   - Check OpenTelemetry context propagation

### Performance Tuning

```typescript
// Disable specific instrumentations if needed
process.env.OTEL_NODE_DISABLED_INSTRUMENTATIONS = 'fs,net,dns';

// Adjust log level in production
process.env.LOG_LEVEL = 'warn';

// Configure sampling for high-throughput services
process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
process.env.OTEL_TRACES_SAMPLER_ARG = '0.1'; // 10% sampling
```

## API Reference

See the TypeScript definitions in `packages/observability/src/` for complete API documentation.

## Examples

Complete examples are available in:

- `apps/web/src/app/api/health/route.ts` - Health check with observability
- `apps/web/src/app/api/metrics/route.ts` - Metrics endpoint
- `apps/web/src/lib/otel.ts` - Application integration
