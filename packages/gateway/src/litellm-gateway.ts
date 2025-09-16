import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ChatCompletionRequestSchema,
  ChatCompletionResponseSchema,
  LiteLLMErrorSchema,
  GatewayConfig,
  ModelCallResult,
} from './types';
import { LangfuseService } from './langfuse-service';
import { randomUUID } from 'crypto';

export class LiteLLMGateway {
  private config: GatewayConfig;
  private langfuseService: LangfuseService;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.langfuseService = new LangfuseService(config);
  }

  async chatCompletion(
    request: ChatCompletionRequest,
    metadata?: { userId?: string; sessionId?: string; [key: string]: any }
  ): Promise<ModelCallResult> {
    // Validate request
    const validatedRequest = ChatCompletionRequestSchema.parse(request);

    // Generate unique request ID for tracing
    const requestId = randomUUID();
    const startTime = Date.now();

    // Start Langfuse trace if enabled
    const traceId = await this.langfuseService.startTrace(
      validatedRequest,
      requestId,
      metadata
    );

    let error: Error | undefined;
    let response: ChatCompletionResponse | undefined;

    try {
      const httpResponse = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedRequest),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      const responseData = await httpResponse.json();

      if (!httpResponse.ok) {
        const errorData = LiteLLMErrorSchema.parse(responseData);
        error = new Error(`LiteLLM API Error: ${errorData.error.message}`);
        throw error;
      }

      response = ChatCompletionResponseSchema.parse(responseData);
      const latency = Date.now() - startTime;

      // Calculate cost if token information is available
      const cost = this.calculateCost(response, validatedRequest.model);

      // Update Langfuse trace with successful completion
      if (traceId) {
        await this.langfuseService.updateTrace(
          traceId,
          validatedRequest,
          response,
          latency,
          cost
        );
      }

      return {
        response,
        latency,
        cost,
        traceId,
        requestId,
      };
    } catch (caughtError) {
      const latency = Date.now() - startTime;
      error = caughtError instanceof Error ? caughtError : new Error('Unknown error occurred');
      
      // Update Langfuse trace with error
      if (traceId && response) {
        await this.langfuseService.updateTrace(
          traceId,
          validatedRequest,
          response,
          latency,
          undefined,
          error
        );
      }
      
      throw new Error(`Gateway Error (${latency}ms): ${error.message}`);
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