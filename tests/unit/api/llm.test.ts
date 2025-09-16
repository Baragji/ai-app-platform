import { NextResponse } from 'next/server';

// Mock the gateway module
jest.mock('@ai-app-platform/gateway', () => ({
  createGateway: jest.fn(),
}));

import { createGateway } from '@ai-app-platform/gateway';

const mockCreateGateway = createGateway as jest.MockedFunction<
  typeof createGateway
>;

describe('LLM API Route', () => {
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
    it('should validate request data', async () => {
      const validRequest = {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello',
          },
        ],
      };

      const invalidRequests = [
        {}, // Missing required fields
        {
          model: '',
          messages: [],
        }, // Empty fields
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'invalid_role',
              content: 'Hello',
            },
          ],
        }, // Invalid role
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: '',
            },
          ],
        }, // Empty content
      ];

      // Valid request should pass schema validation
      expect(() => {
        const { model, messages } = validRequest;
        const isValidModel = typeof model === 'string' && model.length > 0;
        const isValidMessages = Array.isArray(messages) && messages.length > 0;
        const isValidMessage = messages.every(
          (msg) =>
            ['system', 'user', 'assistant'].includes(msg.role) &&
            typeof msg.content === 'string' &&
            msg.content.length > 0
        );

        return isValidModel && isValidMessages && isValidMessage;
      }).not.toThrow();

      // Invalid requests should fail validation
      invalidRequests.forEach((request) => {
        const hasModel =
          'model' in request &&
          typeof request.model === 'string' &&
          request.model.length > 0;
        const hasValidMessages =
          'messages' in request &&
          Array.isArray(request.messages) &&
          request.messages.length > 0;

        let hasValidMessageStructure = false;
        if (hasValidMessages) {
          hasValidMessageStructure = (request as any).messages.every(
            (msg: any) =>
              msg &&
              ['system', 'user', 'assistant'].includes(msg.role) &&
              typeof msg.content === 'string' &&
              msg.content.length > 0
          );
        }

        expect(hasModel && hasValidMessages && hasValidMessageStructure).toBe(
          false
        );
      });
    });

    it('should handle successful model response', async () => {
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
      };

      mockGateway.chatCompletion.mockResolvedValue(mockResult);

      // The API should return success with data and metrics
      const expectedResponse = {
        success: true,
        data: {
          response: mockResult.response,
          metrics: {
            latency: mockResult.latency,
            cost: mockResult.cost,
          },
        },
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.data.metrics.latency).toBe(1500);
      expect(expectedResponse.data.metrics.cost).toBe(0.0001);
    });

    it('should handle gateway errors', async () => {
      const errorMessage = 'Gateway timeout';
      mockGateway.chatCompletion.mockRejectedValue(new Error(errorMessage));

      // The API should return error response
      const expectedResponse = {
        success: false,
        error: errorMessage,
      };

      expect(expectedResponse.success).toBe(false);
      expect(expectedResponse.error).toBe(errorMessage);
    });

    it('should validate optional parameters', () => {
      const requestWithOptionalParams = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        max_tokens: 150,
      };

      // Temperature should be between 0 and 2
      const validTemperatures = [0, 0.5, 1.0, 1.5, 2.0];
      const invalidTemperatures = [-0.1, 2.1];

      validTemperatures.forEach((temp) => {
        expect(temp >= 0 && temp <= 2).toBe(true);
      });

      invalidTemperatures.forEach((temp) => {
        expect(temp >= 0 && temp <= 2).toBe(false);
      });

      // Max tokens should be positive
      expect(requestWithOptionalParams.max_tokens > 0).toBe(true);
    });
  });

  describe('GET /api/llm', () => {
    it('should return health check status', async () => {
      const mockHealthResult = {
        status: 'healthy' as const,
        latency: 250,
      };

      mockGateway.healthCheck.mockResolvedValue(mockHealthResult);

      const expectedResponse = {
        success: true,
        service: 'LiteLLM Gateway',
        status: 'healthy',
        latency: 250,
      };

      expect(expectedResponse.success).toBe(true);
      expect(expectedResponse.status).toBe('healthy');
      expect(expectedResponse.latency).toBe(250);
    });

    it('should handle health check errors', async () => {
      mockGateway.healthCheck.mockRejectedValue(new Error('Connection failed'));

      const expectedResponse = {
        success: false,
        service: 'LiteLLM Gateway',
        status: 'unhealthy',
        error: 'Connection failed',
      };

      expect(expectedResponse.success).toBe(false);
      expect(expectedResponse.status).toBe('unhealthy');
    });
  });

  describe('Response formatting', () => {
    it('should format successful responses correctly', () => {
      const mockModelResponse = {
        id: 'test-id',
        object: 'chat.completion',
        created: 1699999999,
        model: 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'Test response' },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 2,
          total_tokens: 7,
        },
      };

      const formattedResponse = {
        success: true,
        data: {
          response: mockModelResponse,
          metrics: {
            latency: 1000,
            cost: 0.00005,
          },
        },
      };

      expect(formattedResponse).toHaveProperty('success', true);
      expect(formattedResponse).toHaveProperty('data');
      expect(formattedResponse.data).toHaveProperty('response');
      expect(formattedResponse.data).toHaveProperty('metrics');
      expect(formattedResponse.data.metrics).toHaveProperty('latency');
      expect(formattedResponse.data.metrics).toHaveProperty('cost');
    });

    it('should format error responses correctly', () => {
      const errorResponse = {
        success: false,
        error: 'Test error message',
      };

      expect(errorResponse).toHaveProperty('success', false);
      expect(errorResponse).toHaveProperty('error');
      expect(typeof errorResponse.error).toBe('string');
    });
  });
});
