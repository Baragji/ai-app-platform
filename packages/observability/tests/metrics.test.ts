import { initializeMetrics, getMeter, MetricsCollector, measureLatency, resetMetrics } from '../src/metrics';
import { resetConfig } from '../src/config';

describe('Metrics', () => {
  beforeEach(() => {
    resetConfig();
    resetMetrics();
  });

  afterEach(() => {
    resetConfig();
    resetMetrics();
  });

  it('should initialize metrics when enabled', () => {
    process.env.METRICS_ENABLED = 'true';
    const meterProvider = initializeMetrics();
    expect(meterProvider).toBeDefined();
  });

  it('should not initialize metrics when disabled', () => {
    process.env.METRICS_ENABLED = 'false';
    const meterProvider = initializeMetrics();
    expect(meterProvider).toBeNull();
  });

  it('should create a meter', () => {
    const meter = getMeter('test-meter', '1.0.0');
    expect(meter).toBeDefined();
  });

  it('should create metrics collector', () => {
    const collector = new MetricsCollector('test-collector');
    expect(collector).toBeDefined();
    
    // Test counter creation and increment
    expect(() => {
      collector.incrementCounter('test_counter', 1, { tag: 'value' });
    }).not.toThrow();
    
    // Test histogram recording
    expect(() => {
      collector.recordHistogram('test_histogram', 100, { operation: 'test' });
    }).not.toThrow();
    
    // Test latency recording
    expect(() => {
      collector.recordLatency('test_operation', 250, { service: 'test' });
    }).not.toThrow();
  });

  it('should measure latency with measureLatency utility', async () => {
    const result = await measureLatency('test_operation', async () => {
      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
      return 'success';
    });

    expect(result).toBe('success');
  });

  it('should handle errors in measureLatency', async () => {
    const error = new Error('Test error');
    
    await expect(
      measureLatency('test_operation', async () => {
        throw error;
      })
    ).rejects.toThrow('Test error');
  });

  it('should record business metrics', () => {
    const collector = new MetricsCollector();
    
    expect(() => {
      collector.recordBusinessMetric('user_signups', 5, { region: 'us-east' });
      collector.recordRequest('/api/test', 'GET', 200, { version: 'v1' });
      collector.recordError('database_query', 'ConnectionError', { table: 'users' });
    }).not.toThrow();
  });
});