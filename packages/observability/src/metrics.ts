import { NodeSDK } from '@opentelemetry/sdk-node';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { metrics, Meter } from '@opentelemetry/api';
import { getObservabilityConfig } from './config';
import * as http from 'http';

let meterProvider: MeterProvider | null = null;
let prometheusExporter: PrometheusExporter | null = null;
let metricsServer: http.Server | null = null;
let defaultMeter: Meter | null = null;

export function initializeMetrics(): MeterProvider | null {
  if (meterProvider) {
    return meterProvider;
  }

  const config = getObservabilityConfig();

  if (!config.metrics.enabled) {
    console.log('📊 Metrics collection is disabled');
    return null;
  }

  try {
    // Create resource with service information
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment,
    });

    // Create Prometheus exporter
    prometheusExporter = new PrometheusExporter({
      port: config.metrics.port,
      endpoint: config.metrics.endpoint,
    });

    // Create meter provider
    meterProvider = new MeterProvider({
      resource,
    });

    // Add prometheus exporter as reader
    meterProvider.addMetricReader(prometheusExporter);

    // Set as global meter provider
    metrics.setGlobalMeterProvider(meterProvider);

    // Create default meter
    defaultMeter = meterProvider.getMeter(
      config.serviceName,
      config.serviceVersion
    );

    console.log(
      `📊 Metrics initialized on port ${config.metrics.port}${config.metrics.endpoint}`
    );

    return meterProvider;
  } catch (error) {
    console.error('❌ Failed to initialize metrics:', error);
    return null;
  }
}

export function getMeter(name?: string, version?: string): Meter {
  if (!defaultMeter) {
    initializeMetrics();
  }

  if (name && meterProvider) {
    return meterProvider.getMeter(name, version);
  }

  return defaultMeter || metrics.getMeter('default');
}

export function resetMetrics(): void {
  meterProvider = null;
  prometheusExporter = null;
  metricsServer = null;
  defaultMeter = null;
}

export function shutdownMetrics(): Promise<void> {
  if (meterProvider) {
    console.log('📊 Shutting down metrics...');
    return meterProvider.shutdown();
  }
  return Promise.resolve();
}

// Utility functions for common metrics patterns
export class MetricsCollector {
  private meter: Meter;
  private counters = new Map();
  private histograms = new Map();
  private gauges = new Map();

  constructor(name?: string, version?: string) {
    this.meter = getMeter(name, version);
  }

  // Counter methods
  createCounter(name: string, description?: string, unit?: string) {
    if (!this.counters.has(name)) {
      const counter = this.meter.createCounter(name, {
        description,
        unit,
      });
      this.counters.set(name, counter);
    }
    return this.counters.get(name);
  }

  incrementCounter(
    name: string,
    value = 1,
    attributes?: Record<string, string | number | boolean>
  ) {
    const counter = this.createCounter(name);
    counter.add(value, attributes);
  }

  // Histogram methods
  createHistogram(name: string, description?: string, unit?: string) {
    if (!this.histograms.has(name)) {
      const histogram = this.meter.createHistogram(name, {
        description,
        unit,
      });
      this.histograms.set(name, histogram);
    }
    return this.histograms.get(name);
  }

  recordHistogram(
    name: string,
    value: number,
    attributes?: Record<string, string | number | boolean>
  ) {
    const histogram = this.createHistogram(name);
    histogram.record(value, attributes);
  }

  // Gauge methods
  createGauge(name: string, description?: string, unit?: string) {
    if (!this.gauges.has(name)) {
      const gauge = this.meter.createObservableGauge(name, {
        description,
        unit,
      });
      this.gauges.set(name, gauge);
    }
    return this.gauges.get(name);
  }

  // Convenience methods for common patterns
  recordLatency(
    operation: string,
    latencyMs: number,
    attributes?: Record<string, string | number | boolean>
  ) {
    this.recordHistogram('operation_duration_ms', latencyMs, {
      operation,
      ...attributes,
    });
  }

  recordRequest(
    endpoint: string,
    method: string,
    statusCode: number,
    attributes?: Record<string, string | number | boolean>
  ) {
    this.incrementCounter('http_requests_total', 1, {
      endpoint,
      method,
      status_code: statusCode.toString(),
      ...attributes,
    });
  }

  recordError(
    operation: string,
    errorType?: string,
    attributes?: Record<string, string | number | boolean>
  ) {
    this.incrementCounter('operation_errors_total', 1, {
      operation,
      error_type: errorType || 'unknown',
      ...attributes,
    });
  }

  recordBusinessMetric(
    name: string,
    value: number,
    attributes?: Record<string, string | number | boolean>
  ) {
    this.recordHistogram(`business_${name}`, value, attributes);
  }
}

// Create a default metrics collector
export const defaultMetrics = new MetricsCollector();

// Utility function to measure execution time
export async function measureLatency<T>(
  operation: string,
  fn: () => Promise<T> | T,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await Promise.resolve(fn());
    const latency = Date.now() - startTime;
    defaultMetrics.recordLatency(operation, latency, attributes);
    return result;
  } catch (error) {
    const latency = Date.now() - startTime;
    defaultMetrics.recordLatency(operation, latency, {
      ...attributes,
      error: 'true',
    });
    defaultMetrics.recordError(
      operation,
      error instanceof Error ? error.name : 'UnknownError',
      attributes
    );
    throw error;
  }
}

export { metrics };
