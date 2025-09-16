import { LangfuseService } from '../src/langfuse-service';
import { ChatCompletionRequest, ChatCompletionResponse, GatewayConfig } from '../src/types';

describe('LangfuseService', () => {
  let config: GatewayConfig;

  beforeEach(() => {
    config = {
      baseUrl: 'http://localhost:4000',
      timeout: 30000,
      langfuse: {
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
        baseUrl: 'https://cloud.langfuse.com',
        enabled: true,
      },
    };
  });

  describe('when Langfuse is disabled', () => {
    it('should not start trace when disabled', async () => {
      const disabledConfig = { ...config };
      disabledConfig.langfuse!.enabled = false;
      
      const service = new LangfuseService(disabledConfig);
      
      const request: ChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const traceId = await service.startTrace(request, 'test-request-id');
      
      expect(traceId).toBeUndefined();
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('when Langfuse is enabled', () => {
    it('should gracefully handle missing Langfuse module', async () => {
      const service = new LangfuseService(config);
      
      const request: ChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      // Since Langfuse module might not be available in test environment,
      // it should handle this gracefully
      const traceId = await service.startTrace(request, 'test-request-id');
      
      // Should not throw an error, might return undefined if module not available
      expect(typeof traceId === 'string' || traceId === undefined).toBe(true);
    });

    it('should handle updateTrace without errors', async () => {
      const service = new LangfuseService(config);
      
      const request: ChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const response: ChatCompletionResponse = {
        id: 'test-response',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-3.5-turbo',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hi there!' },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      };

      // Should not throw even if Langfuse is not available
      await expect(
        service.updateTrace('test-trace-id', request, response, 100, 0.001)
      ).resolves.not.toThrow();
    });

    it('should handle createEvent without errors', async () => {
      const service = new LangfuseService(config);
      
      // Should not throw even if Langfuse is not available
      await expect(
        service.createEvent('test-trace-id', 'test-event', { key: 'value' })
      ).resolves.not.toThrow();
    });

    it('should handle flush without errors', async () => {
      const service = new LangfuseService(config);
      
      // Should not throw even if Langfuse is not available
      await expect(service.flush()).resolves.not.toThrow();
    });
  });

  describe('configuration validation', () => {
    it('should be disabled when missing public key', () => {
      const invalidConfig = { ...config };
      invalidConfig.langfuse!.publicKey = '';
      
      const service = new LangfuseService(invalidConfig);
      expect(service.isEnabled()).toBe(false);
    });

    it('should be disabled when missing secret key', () => {
      const invalidConfig = { ...config };
      invalidConfig.langfuse!.secretKey = '';
      
      const service = new LangfuseService(invalidConfig);
      expect(service.isEnabled()).toBe(false);
    });

    it('should be disabled when Langfuse section is missing', () => {
      const invalidConfig = { ...config };
      delete invalidConfig.langfuse;
      
      const service = new LangfuseService(invalidConfig);
      expect(service.isEnabled()).toBe(false);
    });
  });
});