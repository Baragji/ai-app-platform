import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ModelCallResult,
  GatewayConfig,
} from './types';

/**
 * Mock LiteLLM Gateway for testing and CI environments
 * Provides deterministic responses without making actual API calls
 */
export class MockLiteLLMGateway {
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async chatCompletion(
    request: ChatCompletionRequest,
    metadata?: { userId?: string; sessionId?: string; [key: string]: any }
  ): Promise<ModelCallResult> {
    // Simulate network latency
    const baseLatency = 100;
    const variableLatency = Math.floor(Math.random() * 500); // 0-500ms
    const latency = baseLatency + variableLatency;

    await new Promise((resolve) => setTimeout(resolve, latency));

    // Generate deterministic mock response based on input
    const mockResponse: ChatCompletionResponse = {
      id: `chatcmpl-mock-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: this.generateMockContent(request),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: this.calculatePromptTokens(request.messages),
        completion_tokens: this.calculateCompletionTokens(request),
        total_tokens: 0, // Will be calculated below
      },
    };

    // Calculate total tokens
    mockResponse.usage.total_tokens =
      mockResponse.usage.prompt_tokens + mockResponse.usage.completion_tokens;

    // Calculate mock cost
    const cost = this.calculateMockCost(mockResponse, request.model);

    // Generate mock trace ID and request ID for testing
    const traceId = `trace-mock-${Date.now()}`;
    const requestId = `req-mock-${Date.now()}`;

    return {
      response: mockResponse,
      latency,
      cost,
      traceId,
      requestId,
    };
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    // Simulate health check latency
    const latency = 50 + Math.floor(Math.random() * 100); // 50-150ms
    await new Promise((resolve) => setTimeout(resolve, latency));

    return {
      status: 'healthy',
      latency,
    };
  }

  private generateMockContent(request: ChatCompletionRequest): string {
    const userMessage = request.messages
      .filter((msg) => msg.role === 'user')
      .pop()?.content || 'Hello';

    // Generate different responses based on content patterns
    if (userMessage.toLowerCase().includes('hello')) {
      return 'Hello! How can I help you today?';
    }

    if (userMessage.toLowerCase().includes('weather')) {
      return 'I don\'t have access to real-time weather data, but I can help you find reliable weather sources!';
    }

    if (userMessage.toLowerCase().includes('test')) {
      return 'This is a mock response for testing purposes. The LiteLLM gateway is working correctly!';
    }

    if (userMessage.toLowerCase().includes('code')) {
      return 'Here\'s a simple example:\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```';
    }

    // Default response for other inputs
    return `I understand you're asking about: "${userMessage}". This is a mock response from the LiteLLM gateway for testing purposes.`;
  }

  private calculatePromptTokens(messages: ChatCompletionRequest['messages']): number {
    // Simple token estimation: ~4 characters per token
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    return Math.ceil(totalChars / 4);
  }

  private calculateCompletionTokens(request: ChatCompletionRequest): number {
    // Use max_tokens if specified, otherwise estimate based on prompt
    if (request.max_tokens) {
      return Math.min(request.max_tokens, 150);
    }

    // Default completion length
    return 20 + Math.floor(Math.random() * 30); // 20-50 tokens
  }

  private calculateMockCost(
    response: ChatCompletionResponse,
    model: string
  ): number | undefined {
    // Mock cost database (prices per 1K tokens)
    const costDatabase: Record<string, { input: number; output: number }> = {
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'claude-3-sonnet': { input: 0.015, output: 0.075 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'gemini-pro': { input: 0.00035, output: 0.00105 },
    };

    const modelCost = costDatabase[model];
    if (!modelCost || !response.usage) {
      return undefined;
    }

    const inputCost = (response.usage.prompt_tokens / 1000) * modelCost.input;
    const outputCost = (response.usage.completion_tokens / 1000) * modelCost.output;

    return inputCost + outputCost;
  }
}

// Factory function for creating mock gateway
export const createMockGateway = (baseUrl?: string, timeout?: number) => {
  return new MockLiteLLMGateway({
    baseUrl: baseUrl || 'http://localhost:4000',
    timeout: timeout || 30000,
    langfuse: {
      publicKey: '',
      secretKey: '',
      enabled: false,
    },
  });
};