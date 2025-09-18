// Main observability package exports
export * from './config';
export * from './tracing';
export * from './metrics';
export * from './logging';

import { initializeTracing, shutdownTracing } from './tracing';
import { initializeMetrics, shutdownMetrics } from './metrics';
import { initializeLogging } from './logging';
import { getObservabilityConfig } from './config';

let isInitialized = false;

/**
 * Initialize the complete observability stack
 * This should be called as early as possible in your application
 */
export function initializeObservability() {
  if (isInitialized) {
    console.log('🔍 Observability already initialized');
    return;
  }

  const config = getObservabilityConfig();
  console.log(`🚀 Initializing observability for ${config.serviceName} v${config.serviceVersion}`);

  // Initialize tracing first as it affects other components
  initializeTracing();
  
  // Initialize metrics
  initializeMetrics();
  
  // Initialize logging
  initializeLogging();

  // Register shutdown handlers
  process.on('SIGTERM', async () => {
    console.log('🔍 Received SIGTERM, shutting down observability...');
    await shutdownObservability();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('🔍 Received SIGINT, shutting down observability...');
    await shutdownObservability();
    process.exit(0);
  });

  isInitialized = true;
  console.log('✅ Observability initialization complete');
}

/**
 * Shutdown the observability stack
 */
export async function shutdownObservability(): Promise<void> {
  if (!isInitialized) {
    return;
  }

  console.log('🔍 Shutting down observability stack...');
  
  try {
    // Shutdown in reverse order
    await Promise.all([
      shutdownTracing(),
      shutdownMetrics(),
    ]);
    
    isInitialized = false;
    console.log('✅ Observability shutdown complete');
  } catch (error) {
    console.error('❌ Error during observability shutdown:', error);
  }
}

/**
 * Auto-initialize observability if OTEL_AUTO_INIT is set
 * This allows for zero-config initialization via environment variable
 */
if (process.env.OTEL_AUTO_INIT === 'true') {
  initializeObservability();
}

// Re-export commonly used items for convenience
// (Already exported via * exports above, just for explicit documentation)

// Export types for TypeScript users
export type { ObservabilityConfig } from './config';