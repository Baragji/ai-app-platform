import { ChatCompletionRequest, ChatCompletionResponse, GatewayConfig } from './types';

// Dynamic import for Langfuse to avoid Jest issues
let Langfuse: any = null;

async function getLangfuse() {
  if (!Langfuse) {
    try {
      const module = await import('langfuse');
      Langfuse = module.Langfuse;
    } catch (error) {
      console.warn('Langfuse module not available:', error);
    }
  }
  return Langfuse;
}

export class LangfuseService {
  private langfuse: any = null;
  private enabled: boolean = false;
  private config: GatewayConfig;
  private initialized: boolean = false;

  constructor(config: GatewayConfig) {
    this.config = config;
    if (config.langfuse?.enabled && config.langfuse.publicKey && config.langfuse.secretKey) {
      this.enabled = true;
    }
  }

  private async ensureInitialized() {
    if (!this.enabled || this.initialized) {
      return;
    }

    try {
      // Skip initialization in test environment
      if (process.env.NODE_ENV === 'test') {
        console.warn('Langfuse initialization skipped in test environment');
        return;
      }

      const LangfuseClass = await getLangfuse();
      if (LangfuseClass) {
        this.langfuse = new LangfuseClass({
          publicKey: this.config.langfuse!.publicKey,
          secretKey: this.config.langfuse!.secretKey,
          baseUrl: this.config.langfuse!.baseUrl,
        });
        this.initialized = true;
      }
    } catch (error) {
      console.warn('Failed to initialize Langfuse:', error);
      this.enabled = false;
    }
  }

  /**
   * Create a trace for a model call and return trace ID
   */
  async startTrace(
    request: ChatCompletionRequest,
    requestId: string,
    metadata?: Record<string, any>
  ): Promise<string | undefined> {
    if (!this.enabled) {
      return undefined;
    }

    await this.ensureInitialized();

    if (!this.langfuse) {
      return undefined;
    }

    try {
      const trace = this.langfuse.trace({
        id: requestId,
        name: 'llm-completion',
        userId: metadata?.userId,
        sessionId: metadata?.sessionId,
        metadata: {
          model: request.model,
          ...(request.temperature !== undefined && { temperature: request.temperature }),
          ...(request.max_tokens !== undefined && { max_tokens: request.max_tokens }),
          ...metadata,
        },
      });

      // Create a generation within the trace
      const generation = trace.generation({
        name: 'chat-completion',
        model: request.model,
        input: request.messages,
        modelParameters: {
          ...(request.temperature !== undefined && { temperature: request.temperature }),
          ...(request.max_tokens !== undefined && { max_tokens: request.max_tokens }),
        },
      });

      return trace.id;
    } catch (error) {
      console.warn('Failed to start Langfuse trace:', error);
      return undefined;
    }
  }

  /**
   * Update trace with completion results
   */
  async updateTrace(
    traceId: string,
    request: ChatCompletionRequest,
    response: ChatCompletionResponse,
    latency: number,
    cost?: number,
    error?: Error
  ): Promise<void> {
    if (!this.enabled || !traceId) {
      return;
    }

    await this.ensureInitialized();

    if (!this.langfuse) {
      return;
    }

    try {
      const trace = this.langfuse.trace({
        id: traceId,
      });

      const generation = trace.generation({
        name: 'chat-completion',
        model: request.model,
        input: request.messages,
        output: response.choices?.[0]?.message,
        usage: response.usage ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        } : undefined,
        modelParameters: {
          ...(request.temperature !== undefined && { temperature: request.temperature }),
          ...(request.max_tokens !== undefined && { max_tokens: request.max_tokens }),
        },
        metadata: {
          latency_ms: latency,
          cost_usd: cost,
          response_id: response.id,
          finish_reason: response.choices?.[0]?.finish_reason,
        },
      });

      if (error) {
        generation.update({
          level: 'ERROR',
          statusMessage: error.message,
        });
      }

      // Update the overall trace
      trace.update({
        output: response.choices?.[0]?.message?.content,
        metadata: {
          latency_ms: latency,
          cost_usd: cost,
          total_tokens: response.usage?.total_tokens,
        },
      });

      // Flush to ensure data is sent
      await this.langfuse.flushAsync();
    } catch (error) {
      console.warn('Failed to update Langfuse trace:', error);
    }
  }

  /**
   * Create an event for debugging or additional context
   */
  async createEvent(
    traceId: string,
    name: string,
    metadata: Record<string, any>
  ): Promise<void> {
    if (!this.enabled || !traceId) {
      return;
    }

    await this.ensureInitialized();

    if (!this.langfuse) {
      return;
    }

    try {
      const trace = this.langfuse.trace({ id: traceId });
      trace.event({
        name,
        metadata,
      });
      
      await this.langfuse.flushAsync();
    } catch (error) {
      console.warn('Failed to create Langfuse event:', error);
    }
  }

  /**
   * Flush any pending traces
   */
  async flush(): Promise<void> {
    if (this.enabled && this.langfuse) {
      await this.langfuse.flushAsync();
    }
  }

  /**
   * Check if Langfuse is enabled and configured
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}