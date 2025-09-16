import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionRequestSchema,
  ChatCompletionResponseSchema,
  LiteLLMErrorSchema,
  GatewayConfig,
  ModelCallResult,
} from './types';

export class LiteLLMGateway {
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ModelCallResult> {
    // Validate request
    const validatedRequest = ChatCompletionRequestSchema.parse(request);

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedRequest),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorData = LiteLLMErrorSchema.parse(responseData);
        throw new Error(`LiteLLM API Error: ${errorData.error.message}`);
      }

      const validatedResponse = ChatCompletionResponseSchema.parse(responseData);
      const latency = Date.now() - startTime;

      // Calculate cost if token information is available
      const cost = this.calculateCost(validatedResponse, validatedRequest.model);

      return {
        response: validatedResponse,
        latency,
        cost,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      
      if (error instanceof Error) {
        throw new Error(`Gateway Error (${latency}ms): ${error.message}`);
      }
      
      throw new Error(`Gateway Error (${latency}ms): Unknown error occurred`);
    }
  }

  private calculateCost(
    response: ChatCompletionResponse,
    model: string
  ): number | undefined {
    // This is a simplified cost calculation
    // In a real implementation, you'd have a cost database for different models
    const costDatabase: Record<string, { input: number; output: number }> = {
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      // Add more models as needed
    };

    const modelCost = costDatabase[model];
    if (!modelCost || !response.usage) {
      return undefined;
    }

    const inputCost = (response.usage.prompt_tokens / 1000) * modelCost.input;
    const outputCost = (response.usage.completion_tokens / 1000) * modelCost.output;

    return inputCost + outputCost;
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        return { status: 'healthy', latency };
      } else {
        return { status: 'unhealthy', latency };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      return { status: 'unhealthy', latency };
    }
  }
}