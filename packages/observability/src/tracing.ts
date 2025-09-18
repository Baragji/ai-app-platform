import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { getObservabilityConfig } from './config';

let sdk: NodeSDK | null = null;
let isInitialized = false;

export function initializeTracing(): NodeSDK | null {
  if (sdk) {
    return sdk;
  }

  const config = getObservabilityConfig();
  
  if (!config.otel.enabled) {
    console.log('🔍 OpenTelemetry tracing is disabled');
    return null;
  }

  // Create appropriate exporter based on configuration
  let traceExporter;
  switch (config.otel.exporterType) {
    case 'otlp':
      traceExporter = new OTLPTraceExporter({
        url: config.otel.endpoint,
      });
      break;
    case 'console':
    default:
      traceExporter = new ConsoleSpanExporter();
      break;
  }

  // Create resource with service information
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
  });

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disable potentially problematic instrumentations during build
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-aws-lambda': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-aws-sdk': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-amqplib': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-cassandra-driver': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-connect': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-cucumber': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dataloader': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-dns': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-fastify': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-graphql': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-grpc': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-hapi': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-ioredis': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-knex': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-koa': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-lru-memoizer': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-memcached': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-mongodb': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-mongoose': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-mysql': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-mysql2': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-nestjs-core': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-net': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-pg': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-pino': {
          enabled: false, // We handle logging separately
        },
        '@opentelemetry/instrumentation-redis': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-redis-4': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-restify': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-router': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-socket.io': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-tedious': {
          enabled: false,
        },
        '@opentelemetry/instrumentation-winston': {
          enabled: false, // We handle logging separately
        },
        // Enable only essential instrumentations
        '@opentelemetry/instrumentation-http': {
          enabled: true,
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true,
        },
      }),
    ],
  });

  try {
    sdk.start();
    isInitialized = true;
    console.log(`🔍 OpenTelemetry tracing initialized with ${config.otel.exporterType} exporter`);
  } catch (error) {
    console.error('❌ Failed to initialize OpenTelemetry:', error);
  }

  return sdk;
}

export function resetTracing(): void {
  sdk = null;
  isInitialized = false;
}

export function shutdownTracing(): Promise<void> {
  if (sdk && isInitialized) {
    console.log('🔍 Shutting down OpenTelemetry...');
    return sdk.shutdown();
  }
  return Promise.resolve();
}

// Utility functions for manual tracing
export function getTracer(name: string, version?: string) {
  return trace.getTracer(name, version);
}

export function getCurrentTraceId(): string | undefined {
  const span = trace.getActiveSpan();
  if (span) {
    const spanContext = span.spanContext();
    return spanContext.traceId;
  }
  return undefined;
}

export function getCurrentSpanId(): string | undefined {
  const span = trace.getActiveSpan();
  if (span) {
    const spanContext = span.spanContext();
    return spanContext.spanId;
  }
  return undefined;
}

export function createSpan(
  tracer: ReturnType<typeof getTracer>,
  name: string,
  options?: {
    kind?: SpanKind;
    attributes?: Record<string, string | number | boolean>;
  }
) {
  return tracer.startSpan(name, {
    kind: options?.kind || SpanKind.INTERNAL,
    attributes: options?.attributes,
  });
}

export function withSpan<T>(
  tracer: ReturnType<typeof getTracer>,
  name: string,
  fn: () => T | Promise<T>,
  options?: {
    kind?: SpanKind;
    attributes?: Record<string, string | number | boolean>;
  }
): Promise<T> {
  const span = createSpan(tracer, name, options);
  
  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await Promise.resolve(fn());
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.setAttributes(attributes);
  }
}

export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent(name, attributes);
  }
}

export { trace, context, SpanStatusCode, SpanKind };