import { NextRequest, NextResponse } from 'next/server';
import { createGateway } from '@ai-app-platform/gateway';
import { z } from 'zod';

// Request validation schema
const LLMRequestSchema = z.object({
  model: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(['system', 'user', 'assistant']),
      content: z.string(),
    })
  ),
  max_tokens: z.number().optional(),
  temperature: z.number().min(0).max(2).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedRequest = LLMRequestSchema.parse(body);

    // Create gateway instance
    const gateway = createGateway();

    // Make the model call
    const result = await gateway.chatCompletion(validatedRequest);

    return NextResponse.json({
      success: true,
      data: {
        response: result.response,
        metrics: {
          latency: result.latency,
          cost: result.cost,
        },
        tracing: {
          traceId: result.traceId,
          requestId: result.requestId,
        },
      },
    });
  } catch (error) {
    console.error('LLM API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request format',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Health check endpoint
    const gateway = createGateway();
    const health = await gateway.healthCheck();

    return NextResponse.json({
      success: true,
      service: 'LiteLLM Gateway',
      status: health.status,
      latency: health.latency,
    });
  } catch (error) {
    console.error('LLM Health Check Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        service: 'LiteLLM Gateway',
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}