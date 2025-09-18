import { getObservabilityConfig, resetConfig } from '../src/config';

describe('Observability Config', () => {
  beforeEach(() => {
    resetConfig();
    // Clear environment variables
    delete process.env.OTEL_SERVICE_NAME;
    delete process.env.OTEL_ENABLED;
    delete process.env.LOG_LEVEL;
  });

  afterEach(() => {
    resetConfig();
  });

  it('should return default configuration', () => {
    const config = getObservabilityConfig();

    expect(config.serviceName).toBe('ai-app-platform');
    expect(config.serviceVersion).toBe('1.0.0');
    expect(config.otel.enabled).toBe(true);
    expect(config.otel.exporterType).toBe('console');
    expect(config.logging.level).toBe('info');
    expect(config.logging.includeTraceId).toBe(true);
  });

  it('should parse environment variables', () => {
    process.env.OTEL_SERVICE_NAME = 'test-service';
    process.env.OTEL_ENABLED = 'false';
    process.env.LOG_LEVEL = 'debug';

    const config = getObservabilityConfig();

    expect(config.serviceName).toBe('test-service');
    expect(config.otel.enabled).toBe(false);
    expect(config.logging.level).toBe('debug');
  });

  it('should use defaults for invalid configuration', () => {
    process.env.LOG_LEVEL = 'invalid-level';
    process.env.OTEL_ENABLED = 'not-a-boolean';

    // Capture console.error to avoid test output noise
    const originalError = console.error;
    console.error = jest.fn();

    const config = getObservabilityConfig();

    // Should fall back to defaults when invalid values are provided
    expect(config.logging.level).toBe('info');
    expect(config.otel.enabled).toBe(true);

    // Restore console.error
    console.error = originalError;
  });

  it('should cache configuration', () => {
    const config1 = getObservabilityConfig();
    const config2 = getObservabilityConfig();

    expect(config1).toBe(config2); // Same object reference
  });
});
