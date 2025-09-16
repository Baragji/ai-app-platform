import { z } from 'zod';

// LiteLLM Chat Completion Request Schema
export const ChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  max_tokens: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().optional(),
});

// LiteLLM Chat Completion Response Schema
export const ChatCompletionResponseSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion'),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.string(),
        content: z.string(),
      }),
      finish_reason: z.string().nullable(),
    })
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
    total_tokens: z.number(),
  }),
});

// LiteLLM Error Response Schema
export const LiteLLMErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    code: z.string().optional(),
  }),
});

// TypeScript types derived from schemas
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;
export type ChatCompletionResponse = z.infer<
  typeof ChatCompletionResponseSchema
>;
export type LiteLLMError = z.infer<typeof LiteLLMErrorSchema>;

// Gateway Configuration
export interface GatewayConfig {
  baseUrl: string;
  timeout: number;
  langfuse?: {
    publicKey: string;
    secretKey: string;
    baseUrl?: string;
    enabled: boolean;
  };
}

// Model Call Result with metrics and tracing
export interface ModelCallResult {
  response: ChatCompletionResponse;
  latency: number; // in milliseconds
  cost?: number; // if available
  traceId?: string; // Langfuse trace ID for debugging
  requestId?: string; // Internal request ID
}

// Available models configuration
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  costPer1KTokens?: {
    input: number;
    output: number;
  };
}
