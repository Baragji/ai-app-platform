# Gateway Observability

**Labels**: `phase-3`, `feature`, `gateway`, `observability`  
**Milestone**: Phase 3 - AI Gateway Enhancement  
**Epic**: [EPIC] Phase 3 - Multi-Model AI Gateway

## Overview

Implement comprehensive observability for the AI Gateway with metrics endpoints, enhanced Langfuse integration, and a complete metrics dashboard. This establishes full visibility into gateway performance, costs, and AI provider interactions.

## Background

The AI Gateway currently has basic Langfuse tracing capabilities and health checks via `/api/llm`. We need to expand this to provide production-grade observability including:

- Prometheus-compatible metrics endpoint
- Enhanced health checks
- Cost and latency tracking
- Complete metrics dashboard for operations

## Acceptance Criteria

### 1. Metrics Collection & Endpoints

- [ ] **Create `packages/gateway/src/metrics.ts`**
  - Request/response metrics (count, latency, errors)
  - Cost tracking per model and provider
  - Token usage statistics
  - Provider availability metrics
  - Circuit breaker status

- [ ] **Implement `/metrics` endpoint**
  - Prometheus-compatible format
  - Expose gateway performance metrics
  - Include custom AI-specific metrics (cost, tokens, model usage)

- [ ] **Enhanced `/health` endpoint**
  - Check connectivity to all configured providers
  - Return detailed status for each component
  - Include latency measurements
  - Provider-specific health indicators

### 2. Langfuse Integration Enhancement

- [ ] **Expand existing Langfuse service**
  - Cost tracking integration with traces
  - Enhanced metadata collection
  - Error tracking and debugging context
  - Performance metrics correlation

- [ ] **Trace correlation with metrics**
  - Link request IDs between metrics and traces
  - Provider failover event tracking
  - Cost attribution per trace

### 3. Web API Integration

- [ ] **Create `/api/gateway/metrics` endpoint**
  - Expose metrics for UI consumption
  - Historical data aggregation
  - Real-time performance indicators

- [ ] **Update `/api/llm` route**
  - Include metrics collection
  - Enhanced response metadata
  - Performance timing integration

### 4. Complete Metrics Dashboard

- [ ] **Create `apps/web/src/components/MetricsDashboard.tsx`**
  - Real-time gateway status
  - Cost tracking visualization
  - Performance metrics (p50, p95, p99 latency)
  - Provider health indicators
  - Token usage trends

- [ ] **Dashboard features**
  - Model selection performance comparison
  - Cost per model/provider breakdown
  - Request volume and success rates
  - Error rate trending

## Implementation Details

### Files to Create/Modify

**New Files**:

- `packages/gateway/src/metrics.ts` - Core metrics collection
- `apps/web/src/app/api/gateway/metrics/route.ts` - Metrics API endpoint
- `apps/web/src/components/MetricsDashboard.tsx` - UI dashboard
- `packages/gateway/tests/metrics.test.ts` - Metrics tests

**Modified Files**:

- `packages/gateway/src/langfuse-service.ts` - Enhanced tracing
- `packages/gateway/src/litellm-gateway.ts` - Metrics integration
- `apps/web/src/app/api/llm/route.ts` - Metrics collection
- `packages/gateway/src/types.ts` - Metrics type definitions

### Technical Requirements

**Metrics Format**:

```typescript
interface GatewayMetrics {
  requests: {
    total: number;
    success: number;
    error: number;
    byModel: Record<string, number>;
    byProvider: Record<string, number>;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
    average: number;
  };
  costs: {
    total: number;
    byModel: Record<string, number>;
    byProvider: Record<string, number>;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  providers: Record<
    string,
    {
      status: 'healthy' | 'unhealthy' | 'degraded';
      lastCheck: string;
      latency: number;
    }
  >;
}
```

**Health Check Response**:

```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  components: {
    langfuse: ComponentHealth;
    providers: Record<string, ComponentHealth>;
    metrics: ComponentHealth;
  };
  metrics: {
    uptime: number;
    requestCount: number;
    averageLatency: number;
  };
}
```

## Testing Requirements

### Unit Tests

- [ ] **Metrics collection accuracy**
  - Counter increments
  - Latency calculations
  - Cost tracking precision
  - Provider status updates

- [ ] **Langfuse integration**
  - Trace creation with enhanced metadata
  - Cost attribution
  - Error handling

### Integration Tests

- [ ] **API endpoint functionality**
  - `/metrics` endpoint returns valid Prometheus format
  - `/health` endpoint validates all components
  - `/api/gateway/metrics` provides UI data

- [ ] **Dashboard integration**
  - Real-time data updates
  - Chart rendering with metrics
  - Error state handling

### Performance Tests

- [ ] **Metrics overhead**
  - Measure impact on request latency
  - Memory usage with metrics collection
  - Dashboard rendering performance

## Definition of Done

✅ **Complete metrics dashboard** operational with:

- Real-time gateway performance visualization
- Cost tracking and breakdown by model/provider
- Historical trend analysis
- Provider health monitoring
- Integration with existing Langfuse traces

✅ **Production-ready endpoints**:

- `/metrics` - Prometheus-compatible metrics
- Enhanced `/health` with component status
- `/api/gateway/metrics` for dashboard consumption

✅ **Enhanced Langfuse integration** with:

- Cost attribution per trace
- Performance correlation
- Error context and debugging

✅ **Comprehensive test coverage** (≥90%):

- Unit tests for all metrics collection
- Integration tests for API endpoints
- Dashboard component tests
- Performance regression tests

✅ **Documentation**:

- Metrics collection specification
- Dashboard usage guide
- Langfuse integration documentation
- Troubleshooting guide

## Dependencies

- **Phase 3.1**: Multi-Provider Adapters (for provider-specific metrics)
- **Phase 3.2**: Failover & Circuit Breaker (for circuit breaker metrics)
- **Existing**: Current Langfuse integration in `packages/gateway/src/langfuse-service.ts`

## Acceptance Evidence

- [ ] Screenshots of metrics dashboard showing real-time data
- [ ] `/metrics` endpoint returning Prometheus format
- [ ] Langfuse traces with cost attribution
- [ ] Test coverage report ≥90%
- [ ] Performance benchmarks showing <5ms overhead

## Related Issues

- Issue #15: [EPIC] Phase 3 - Multi-Model AI Gateway
- Issue #16: Multi-Provider Adapters
- Issue #17: Failover & Circuit Breaker
- Issue #13: Model Picker & Metrics Dashboard (Phase 2)

---

**Priority**: High  
**Effort**: 8-10 story points  
**Timeline**: 3-4 days
