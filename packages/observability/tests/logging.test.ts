import {
  initializeLogging,
  ObservabilityLogger,
  createLogger,
  defaultLogger,
} from '../src/logging';
import { resetConfig } from '../src/config';

describe('Logging', () => {
  beforeEach(() => {
    resetConfig();
  });

  afterEach(() => {
    resetConfig();
  });

  it('should initialize logging', () => {
    const logger = initializeLogging();
    expect(logger).toBeDefined();
  });

  it('should create observability logger', () => {
    const logger = new ObservabilityLogger('test-component');
    expect(logger).toBeDefined();

    // Test that log methods don't throw
    expect(() => {
      logger.info('Test info message');
      logger.warn('Test warning message');
      logger.error('Test error message');
      logger.debug('Test debug message');
    }).not.toThrow();
  });

  it('should create named logger', () => {
    const logger = createLogger('test-service');
    expect(logger).toBeDefined();
  });

  it('should support object and string logging', () => {
    const logger = new ObservabilityLogger();

    expect(() => {
      logger.info({ key: 'value' }, 'Message with object');
      logger.info('Simple string message');
      logger.error({ error: 'Something failed' });
    }).not.toThrow();
  });

  it('should log requests and responses', () => {
    const logger = new ObservabilityLogger();

    const mockReq = {
      method: 'GET',
      url: '/api/test',
      headers: { 'user-agent': 'test' },
      user: { id: 'user123' },
    };

    const mockRes = {
      statusCode: 200,
      getHeaders: () => ({ 'content-type': 'application/json' }),
    };

    expect(() => {
      logger.logRequest(mockReq);
      logger.logResponse(mockRes, 150);
    }).not.toThrow();
  });

  it('should log business events and metrics', () => {
    const logger = new ObservabilityLogger();

    expect(() => {
      logger.logBusinessEvent('user_signup', {
        userId: 'user123',
        source: 'web',
      });
      logger.logMetric('response_time', 250, 'ms', { endpoint: '/api/users' });
    }).not.toThrow();
  });

  it('should log errors with context', () => {
    const logger = new ObservabilityLogger();
    const error = new Error('Database connection failed');

    expect(() => {
      logger.logError(error, { query: 'SELECT * FROM users', timeout: 5000 });
    }).not.toThrow();
  });

  it('should create child logger', () => {
    const parentLogger = new ObservabilityLogger('parent');
    const childLogger = parentLogger.child({ requestId: 'req123' });

    expect(childLogger).toBeDefined();
    expect(() => {
      childLogger.info('Child logger message');
    }).not.toThrow();
  });

  it('should use default logger', () => {
    expect(() => {
      defaultLogger.info('Default logger test');
    }).not.toThrow();
  });
});
