import pino, { Logger, LogFn } from 'pino';
import { getObservabilityConfig } from './config';
import { getCurrentTraceId, getCurrentSpanId } from './tracing';

let logger: Logger | null = null;

export function initializeLogging(): Logger {
  if (logger) {
    return logger;
  }

  const config = getObservabilityConfig();

  // Create Pino logger configuration
  const pinoConfig: pino.LoggerOptions = {
    level: config.logging.level,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    // Add trace information to every log entry
    mixin: () => {
      const traceId = getCurrentTraceId();
      const spanId = getCurrentSpanId();
      
      const mixinData: Record<string, string> = {};
      
      if (config.logging.includeTraceId && traceId) {
        mixinData.traceId = traceId;
      }
      
      if (config.logging.includeTraceId && spanId) {
        mixinData.spanId = spanId;
      }
      
      return mixinData;
    },
    base: {
      service: config.serviceName,
      version: config.serviceVersion,
      environment: config.environment,
    },
  };

  // Configure transport for pretty printing in development
  if (config.logging.format === 'pretty' || config.environment === 'development') {
    logger = pino(pinoConfig, pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    }));
  } else {
    logger = pino(pinoConfig);
  }

  console.log(`📝 Structured logging initialized at ${config.logging.level} level`);
  return logger;
}

export function getLogger(): Logger {
  if (!logger) {
    return initializeLogging();
  }
  return logger;
}

// Enhanced logging functions with trace correlation
export class ObservabilityLogger {
  private logger: Logger;

  constructor(name?: string) {
    this.logger = name ? getLogger().child({ component: name }) : getLogger();
  }

  private addTraceContext(obj: any = {}) {
    const traceId = getCurrentTraceId();
    const spanId = getCurrentSpanId();
    
    if (traceId) {
      obj.traceId = traceId;
    }
    if (spanId) {
      obj.spanId = spanId;
    }
    
    return obj;
  }

  trace(obj: any, msg?: string): void;
  trace(msg: string): void;
  trace(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.trace(this.addTraceContext(), objOrMsg);
    } else {
      this.logger.trace(this.addTraceContext(objOrMsg), msg);
    }
  }

  debug(obj: any, msg?: string): void;
  debug(msg: string): void;
  debug(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.debug(this.addTraceContext(), objOrMsg);
    } else {
      this.logger.debug(this.addTraceContext(objOrMsg), msg);
    }
  }

  info(obj: any, msg?: string): void;
  info(msg: string): void;
  info(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.info(this.addTraceContext(), objOrMsg);
    } else {
      this.logger.info(this.addTraceContext(objOrMsg), msg);
    }
  }

  warn(obj: any, msg?: string): void;
  warn(msg: string): void;
  warn(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.warn(this.addTraceContext(), objOrMsg);
    } else {
      this.logger.warn(this.addTraceContext(objOrMsg), msg);
    }
  }

  error(obj: any, msg?: string): void;
  error(msg: string): void;
  error(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.error(this.addTraceContext(), objOrMsg);
    } else {
      this.logger.error(this.addTraceContext(objOrMsg), msg);
    }
  }

  fatal(obj: any, msg?: string): void;
  fatal(msg: string): void;
  fatal(objOrMsg: any, msg?: string): void {
    if (typeof objOrMsg === 'string') {
      this.logger.fatal(this.addTraceContext(), objOrMsg);
    } else {
      this.logger.fatal(this.addTraceContext(objOrMsg), msg);
    }
  }

  // Convenience methods for common patterns
  logRequest(req: any, msg = 'Request received'): void {
    this.info({
      req: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        userId: req.user?.id,
      },
    }, msg);
  }

  logResponse(res: any, latencyMs: number, msg = 'Request completed'): void {
    this.info({
      res: {
        statusCode: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
      },
      latencyMs,
    }, msg);
  }

  logError(error: Error, context?: Record<string, any>, msg = 'Error occurred'): void {
    this.error({
      err: error,
      ...context,
    }, msg);
  }

  logBusinessEvent(event: string, data: Record<string, any>, msg?: string): void {
    this.info({
      event,
      ...data,
    }, msg || `Business event: ${event}`);
  }

  logMetric(metric: string, value: number, unit?: string, tags?: Record<string, string>): void {
    this.info({
      metric,
      value,
      unit,
      tags,
    }, `Metric recorded: ${metric}`);
  }

  child(bindings: Record<string, any>): ObservabilityLogger {
    const childLogger = new ObservabilityLogger();
    childLogger.logger = this.logger.child(bindings);
    return childLogger;
  }
}

// Create default logger instance
export const defaultLogger = new ObservabilityLogger();

// Export common log functions for backward compatibility
export const log = {
  trace: defaultLogger.trace.bind(defaultLogger),
  debug: defaultLogger.debug.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  fatal: defaultLogger.fatal.bind(defaultLogger),
};

export function createLogger(name: string): ObservabilityLogger {
  return new ObservabilityLogger(name);
}