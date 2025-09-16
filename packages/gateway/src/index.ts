export { LiteLLMGateway } from './litellm-gateway';
export { MockLiteLLMGateway, createMockGateway } from './mock-gateway';
export * from './types';

import { LiteLLMGateway } from './litellm-gateway';

// Default configuration
export const DEFAULT_GATEWAY_CONFIG = {
  baseUrl: process.env.LITELLM_BASE_URL || 'http://localhost:4000',
  timeout: parseInt(process.env.LITELLM_TIMEOUT || '30000', 10),
};

// Create a default gateway instance
export const createGateway = (baseUrl?: string, timeout?: number) => {
  // Use mock gateway in test environment
  if (process.env.NODE_ENV === 'test') {
    const { createMockGateway } = require('./mock-gateway');
    return createMockGateway(baseUrl, timeout);
  }

  return new LiteLLMGateway({
    baseUrl: baseUrl || DEFAULT_GATEWAY_CONFIG.baseUrl,
    timeout: timeout || DEFAULT_GATEWAY_CONFIG.timeout,
  });
};