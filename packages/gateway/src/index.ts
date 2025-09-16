export { LiteLLMGateway } from './litellm-gateway';
export { MockLiteLLMGateway, createMockGateway } from './mock-gateway';
export { LangfuseService } from './langfuse-service';
export * from './types';

import { LiteLLMGateway } from './litellm-gateway';

// Default configuration
export const DEFAULT_GATEWAY_CONFIG = {
  baseUrl: process.env.LITELLM_BASE_URL || 'http://localhost:4000',
  timeout: parseInt(process.env.LITELLM_TIMEOUT || '30000', 10),
  langfuse: {
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL,
    enabled: process.env.LANGFUSE_ENABLED === 'true',
  },
};

// Create a default gateway instance
export const createGateway = (baseUrl?: string, timeout?: number) => {
  // Use mock gateway in test environment or when explicitly enabled
  if (process.env.NODE_ENV === 'test' || process.env.LITELLM_MODE === 'mock') {
    const { createMockGateway } = require('./mock-gateway');
    return createMockGateway(baseUrl, timeout);
  }

  return new LiteLLMGateway({
    baseUrl: baseUrl || DEFAULT_GATEWAY_CONFIG.baseUrl,
    timeout: timeout || DEFAULT_GATEWAY_CONFIG.timeout,
    langfuse: DEFAULT_GATEWAY_CONFIG.langfuse,
  });
};
