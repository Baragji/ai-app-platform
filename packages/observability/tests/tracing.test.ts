import { initializeTracing, getTracer, getCurrentTraceId, withSpan, resetTracing } from '../src/tracing';
import { resetConfig } from '../src/config';

describe('Tracing', () => {
  beforeEach(() => {
    resetConfig();
    resetTracing();
  });

  afterEach(() => {
    resetConfig();
    resetTracing();
  });

  it('should initialize tracing when enabled', () => {
    process.env.OTEL_ENABLED = 'true';
    const sdk = initializeTracing();
    expect(sdk).toBeDefined();
  });

  it('should not initialize tracing when disabled', () => {
    process.env.OTEL_ENABLED = 'false';
    const sdk = initializeTracing();
    expect(sdk).toBeNull();
  });

  it('should create a tracer', () => {
    const tracer = getTracer('test-tracer', '1.0.0');
    expect(tracer).toBeDefined();
  });

  it('should execute function with span', async () => {
    const tracer = getTracer('test-tracer');
    let executed = false;
    
    const result = await withSpan(tracer, 'test-span', async () => {
      executed = true;
      return 'success';
    });

    expect(executed).toBe(true);
    expect(result).toBe('success');
  });

  it('should handle errors in span', async () => {
    const tracer = getTracer('test-tracer');
    const error = new Error('Test error');
    
    await expect(
      withSpan(tracer, 'test-span', async () => {
        throw error;
      })
    ).rejects.toThrow('Test error');
  });

  it('should get current trace ID when span is active', async () => {
    const tracer = getTracer('test-tracer');
    let traceId: string | undefined;
    
    await withSpan(tracer, 'test-span', async () => {
      traceId = getCurrentTraceId();
    });

    // Trace ID should be defined within span context
    // Note: In test environment, this might not work as expected due to mock setup
    // This test mainly checks that the function doesn't throw
    expect(typeof traceId).toBe('string');
  });
});