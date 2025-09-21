import { NextRequest } from 'next/server';
import { POST, GET } from '../../../apps/web/src/app/api/llm/route';

// Mock the gateway module
jest.mock('@ai-app-platform/gateway', () => ({
  createGateway: jest.fn(),
}));

import { createGateway } from '@ai-app-platform/gateway';

const mockCreateGateway = createGateway as jest.MockedFunction<
  typeof createGateway
>;

describe('LLM API Route Handler', () => {
  let mockGateway: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGateway = {
      chatCompletion: jest.fn(),
      healthCheck: jest.fn(),
    };
    mockCreateGateway.mockReturnValue(mockGateway);
  });

  describe('POST /api/llm', () => {
    it('should handle valid chat completion request', async () => {
      const mockResult = {
        response: {
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
        },
        latency: 1500,
        cost: 0.0001,
        traceId: 'trace-123',
        requestId: 'req-456',
      };

      mockGateway.chatCompletion.mockResolvedValue(mockResult);

      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      };

      // Create mock NextRequest
      const request = new NextRequest('http://localhost:3000/api/llm', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockGateway.chatCompletion).toHaveBeenCalledWith(requestData);
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.data.response).toEqual(mockResult.response);
      expect(responseData.data.metrics.latency).toBe(1500);
      expect(responseData.data.metrics.cost).toBe(0.0001);
      expect(responseData.data.tracing.traceId).toBe('trace-123');
    });

    it('should handle validation errors', async () => {
      // Create an invalid request that should fail Zod validation
      const invalidRequestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'invalid_role', // This should fail validation
            content: 'Hello',
          },
        ],
      };

      const request = new NextRequest('http://localhost:3000/api/llm', {
        method: 'POST',
        body: JSON.stringify(invalidRequestData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid request format');
      expect(responseData.details).toBeDefined();
    });

    it('should handle gateway errors', async () => {
      const errorMessage = 'Gateway timeout';
      mockGateway.chatCompletion.mockRejectedValue(new Error(errorMessage));

      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
      };

      const request = new NextRequest('http://localhost:3000/api/llm', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe(errorMessage);
    });

    it('should validate optional parameters', async () => {
      const mockResult = {
        response: { id: 'test' },
        latency: 100,
        cost: 0.001,
        traceId: 'trace-123',
        requestId: 'req-456',
      };

      mockGateway.chatCompletion.mockResolvedValue(mockResult);

      const requestWithOptionalParams = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        max_tokens: 150,
      };

      const request = new NextRequest('http://localhost:3000/api/llm', {
        method: 'POST',
        body: JSON.stringify(requestWithOptionalParams),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(mockGateway.chatCompletion).toHaveBeenCalledWith(
        requestWithOptionalParams
      );
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
    });

    it('should reject invalid temperature values', async () => {
      const invalidRequestData = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 3.0, // Invalid: > 2
      };

      const request = new NextRequest('http://localhost:3000/api/llm', {
        method: 'POST',
        body: JSON.stringify(invalidRequestData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invalid request format');
    });
  });

  describe('GET /api/llm', () => {
    it('should return health check status', async () => {
      const mockHealthResult = {
        status: 'healthy' as const,
        latency: 250,
      };

      mockGateway.healthCheck.mockResolvedValue(mockHealthResult);

      const response = await GET();
      const responseData = await response.json();

      expect(mockGateway.healthCheck).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.service).toBe('LiteLLM Gateway');
      expect(responseData.status).toBe('healthy');
      expect(responseData.latency).toBe(250);
    });

    it('should handle health check errors', async () => {
      mockGateway.healthCheck.mockRejectedValue(new Error('Connection failed'));

      const response = await GET();
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.service).toBe('LiteLLM Gateway');
      expect(responseData.status).toBe('unhealthy');
      expect(responseData.error).toBe('Connection failed');
    });
  });
});
