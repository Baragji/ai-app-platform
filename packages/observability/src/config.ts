import { z } from 'zod';

const observabilityConfigSchema = z.object({
  // Service identification
  serviceName: z.string().default('ai-app-platform'),
  serviceVersion: z.string().default('1.0.0'),
  
  // OpenTelemetry configuration
  otel: z.object({
    enabled: z.boolean().default(true),
    endpoint: z.string().default('http://localhost:4318/v1/traces'),
    exporterType: z.enum(['otlp', 'console']).default('console'),
  }),
  
  // Metrics configuration
  metrics: z.object({
    enabled: z.boolean().default(true),
    port: z.number().default(9464),
    endpoint: z.string().default('/metrics'),
  }),
  
  // Logging configuration
  logging: z.object({
    level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
    format: z.enum(['json', 'pretty']).default('json'),
    includeTraceId: z.boolean().default(true),
  }),
  
  // Environment
  environment: z.string().default('development'),
});

export type ObservabilityConfig = z.infer<typeof observabilityConfigSchema>;

let config: ObservabilityConfig | null = null;

export function getObservabilityConfig(): ObservabilityConfig {
  if (!config) {
    // Parse from environment variables with OTEL_ prefix
    const envConfig = {
      serviceName: process.env.OTEL_SERVICE_NAME || process.env.SERVICE_NAME,
      serviceVersion: process.env.OTEL_SERVICE_VERSION || process.env.SERVICE_VERSION,
      otel: {
        enabled: process.env.OTEL_ENABLED !== 'false',
        endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || process.env.JAEGER_ENDPOINT,
        exporterType: process.env.OTEL_EXPORTER_TYPE as 'otlp' | 'console',
      },
      metrics: {
        enabled: process.env.METRICS_ENABLED !== 'false',
        port: process.env.METRICS_PORT ? parseInt(process.env.METRICS_PORT, 10) : undefined,
        endpoint: process.env.METRICS_ENDPOINT,
      },
      logging: {
        level: process.env.LOG_LEVEL as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
        format: process.env.LOG_FORMAT as 'json' | 'pretty',
        includeTraceId: process.env.LOG_INCLUDE_TRACE_ID !== 'false',
      },
      environment: process.env.NODE_ENV || process.env.ENVIRONMENT,
    };

    const result = observabilityConfigSchema.safeParse(envConfig);
    if (!result.success) {
      console.error('❌ Invalid observability configuration:', result.error.issues);
      // Use defaults for invalid config
      config = observabilityConfigSchema.parse({
        otel: {},
        metrics: {},
        logging: {},
      });
    } else {
      config = result.data;
    }
  }

  return config;
}

export function resetConfig(): void {
  config = null;
}