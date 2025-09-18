# Gateway Observability

## Description
This issue tracks the implementation of comprehensive observability for the AI Gateway with metrics endpoints, enhanced Langfuse integration, and a complete metrics dashboard.

## Definition of Done
- Complete metrics dashboard with real-time performance, cost tracking, and provider health monitoring
- `/metrics` endpoint (Prometheus-compatible) and enhanced `/health` endpoint
- Enhanced Langfuse integration with cost attribution and performance correlation
- ≥90% test coverage with performance benchmarks

## Files to Work On
- **New Files**: 
  - `packages/gateway/src/metrics.ts` - Core metrics collection
  - `apps/web/src/app/api/gateway/metrics/route.ts` - Metrics API endpoint  
  - `apps/web/src/components/MetricsDashboard.tsx` - UI dashboard
  - `packages/gateway/tests/metrics.test.ts` - Metrics tests
- **Modified Files**:
  - `packages/gateway/src/langfuse-service.ts` - Enhanced tracing
  - `packages/gateway/src/litellm-gateway.ts` - Metrics integration
  - `apps/web/src/app/api/llm/route.ts` - Metrics collection

## Key Features
- Prometheus-compatible `/metrics` endpoint
- Real-time metrics dashboard
- Cost and latency tracking
- Provider health monitoring
- Enhanced Langfuse traces with cost attribution

## Labels
`phase-3`, `feature`, `gateway`, `observability`