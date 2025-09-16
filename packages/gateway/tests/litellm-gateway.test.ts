import { LiteLLMGateway } from '../src/litellm-gateway';
import { ChatCompletionRequest } from '../src/types';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('LiteLLMGateway', () => {
  let gateway: LiteLLMGateway;

  beforeEach(() => {
    gateway = new LiteLLMGateway({
      baseUrl: 'http://localhost:4000',
      timeout: 30000,
      langfuse: {
        publicKey: '',
        secretKey: '',
        enabled: false,
      },
    });
    mockFetch.mockClear();
  });

  describe('chatCompletion', () => {
    it('should make a successful chat completion request', async () => {
      const mockResponse = {
        id: 'chatcmpl-test',
        object: 'chat.completion',
        created: 1699999999,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 9,
          total_tokens: 19,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const request: ChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      };

      const result = await gateway.chatCompletion(request);

      expect(result.response).toEqual(mockResponse);
      expect(result.latency).toBeGreaterThanOrEqual(0);
      expect(result.cost).toBeGreaterThan(0); // Should calculate cost for gpt-3.5-turbo
      expect(result.requestId).toBeDefined();
      expect(result.traceId).toBeUndefined(); // Langfuse disabled in test

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        })
      );
    });

    it('should handle API errors properly', async () => {
      const mockErrorResponse = {
        error: {
          message: 'Invalid API key',
          type: 'authentication_error',
          code: 'invalid_api_key',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      } as Response);

      const request: ChatCompletionRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      };

      await expect(gateway.chatCompletion(request)).rejects.toThrow(
        'LiteLLM API Error: Invalid API key'
      );
    });

    it('should validate request schema', async () => {
      const invalidRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'invalid_role', // Invalid role
            content: 'Hello',
          },
        ],
      } as any;

      await expect(gateway.chatCompletion(invalidRequest)).rejects.toThrow();
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when API is available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response);

      const result = await gateway.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.latency).toBeGreaterThanOrEqual(0);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/health',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return unhealthy status when API is unavailable', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await gateway.healthCheck();

      expect(result.status).toBe('unhealthy');
      expect(result.latency).toBeGreaterThanOrEqual(0);
    });
  });
});