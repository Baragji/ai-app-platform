# GitHub Issues Summary - AI App Platform Roadmap

## Issues to Create Manually

Based on the comprehensive roadmap in `docs/ROADMAP.md`, here are the GitHub issues that need to be created:

### Phase 0: Foundation (Labels: `phase-0`, `epic`/`task`)

**Issue #1: [EPIC] Phase 0 - Finalize Foundation**

- Labels: `phase-0`, `epic`
- Assignees: Development team
- Milestone: Phase 0 Complete
- Description: Achieve production-grade foundation with stable tests, unified DB schema, OTel traces

**Issue #2: Fix Playwright E2E Test Flakiness**

- Labels: `phase-0`, `task`, `testing`
- Files: `tests/e2e/tests/projects.spec.ts`, `apps/web/src/app/projects/ProjectsClient.tsx`
- DoD: Reproducible green E2E across all browsers

**Issue #3: Prisma Source of Truth Consolidation**

- Labels: `phase-0`, `task`, `database`
- Files: `Dockerfile`, remove `packages/db/prisma/`, align postgres versions
- DoD: Single schema at `apps/web/prisma`

**Issue #4: Remove Legacy Mock DB**

- Labels: `phase-0`, `task`, `database`
- Files: Delete `apps/web/src/lib/db.ts`, audit imports
- DoD: No mock DB imports, real Prisma client only

**Issue #5: Observability Baseline with OTel**

- Labels: `phase-0`, `task`, `observability`
- Files: Create `packages/observability/`, wire traces
- DoD: Request→trace correlation documented

### Phase 1: Core Orchestration (Labels: `phase-1`, `ai-orchestrator`)

**Issue #6: [EPIC] Phase 1 - Core Orchestration System**

- Labels: `phase-1`, `epic`, `ai-orchestrator`
- Description: Planner → Coder → Critique pipeline with state machine

**Issue #7: Create Orchestrator State Machine**

- Labels: `phase-1`, `feature`, `ai-orchestrator`
- Files: Create `packages/orchestrator/`, REST/WebSocket endpoints
- DoD: E2E test calls trivial orchestration job

**Issue #8: Job Persistence & Resume Capability**

- Labels: `phase-1`, `feature`, `ai-orchestrator`
- Files: Redis job state, cancellation support
- DoD: Kill/restart scenario test passes

**Issue #9: Evidence Collection & Coverage**

- Labels: `phase-1`, `task`, `ai-orchestrator`
- DoD: OTel traces linked in PR, ≥80% coverage

### Phase 2: Advanced UI (Labels: `phase-2`, `ui`)

**Issue #10: [EPIC] Phase 2 - Advanced UI Features**

- Labels: `phase-2`, `epic`, `ui`
- Description: Monaco editor, live console, model picker, ops dashboard

**Issue #11: Monaco Code Editor Integration**

- Labels: `phase-2`, `feature`, `ui`
- Files: `apps/web/src/components/editor/`, `/projects/[id]` updates
- DoD: Full-featured code editor with linting

**Issue #12: Live Streaming Console**

- Labels: `phase-2`, `feature`, `ui`
- Files: WebSocket hooks, real-time log streaming
- DoD: Live orchestrator logs with component status

**Issue #13: Model Picker & Metrics Dashboard**

- Labels: `phase-2`, `feature`, `ui`
- Files: Model selection UI, cost/latency display
- DoD: Dynamic model selection with performance metrics

**Issue #14: Operations Console**

- Labels: `phase-2`, `feature`, `ui`
- Files: Progress bars, log export, status indicators
- DoD: Complete ops dashboard

### Phase 3: AI Gateway Enhancement (Labels: `phase-3`, `gateway`)

**Issue #15: [EPIC] Phase 3 - Multi-Model AI Gateway**

- Labels: `phase-3`, `epic`, `gateway`
- Description: Anthropic, Gemini support with failover & observability

**Issue #16: Multi-Provider Adapters**

- Labels: `phase-3`, `feature`, `gateway`
- Files: `packages/gateway/src/providers/`, Claude/Gemini adapters
- DoD: All major AI providers supported

**Issue #17: Failover & Circuit Breaker**

- Labels: `phase-3`, `feature`, `gateway`
- Files: Retry policies, circuit breaker implementation
- DoD: Automatic failover on provider outage

**Issue #18: Gateway Observability**

- Labels: `phase-3`, `feature`, `gateway`, `observability`
- Files: `packages/gateway/src/metrics.ts` (new), `/metrics` & `/health` endpoints, enhanced Langfuse integration, `apps/web/src/components/MetricsDashboard.tsx` (new)
- DoD: Complete metrics dashboard with real-time performance, cost tracking, and provider health monitoring

### Phase 4: Distributed State & Events (Labels: `phase-4`, `epic`)

**Issue #19: [EPIC] Phase 4 - Event-Driven Architecture**

- Labels: `phase-4`, `epic`
- Description: Message queues, event sourcing, service contracts

**Issue #20: Message Queue Integration**

- Labels: `phase-4`, `feature`
- Files: `packages/events/`, RabbitMQ/Kafka setup
- DoD: Reliable event processing with DLQ

**Issue #21: Event Sourcing & GraphQL**

- Labels: `phase-4`, `feature`
- Files: Event-sourced job logs, GraphQL subscriptions
- DoD: Complete audit trail with replay

**Issue #22: Service Contracts**

- Labels: `phase-4`, `feature`
- Files: gRPC definitions, JSON Schema validation
- DoD: Soak test @100 concurrent jobs

### Phase 5: Production & Compliance (Labels: `phase-5`, `compliance`)

**Issue #23: [EPIC] Phase 5 - Production Readiness**

- Labels: `phase-5`, `epic`, `compliance`
- Description: Security, compliance, deployment readiness

**Issue #24: Security & Supply Chain**

- Labels: `phase-5`, `task`, `compliance`
- Files: `docs/compliance/`, ASVS evidence, SBOM enhancements
- DoD: Complete security evidence bundle

**Issue #25: Regulatory Compliance**

- Labels: `phase-5`, `task`, `compliance`
- Files: EU AI Act docs, ISO/IEC 42001 alignment
- DoD: Regulatory compliance documentation

**Issue #26: Deployment & Operations**

- Labels: `phase-5`, `task`, `compliance`
- Files: Canary deployment, rollback procedures
- DoD: Successful canary rollout with SLO gates

## Issue Dependencies

```
Phase 0 (Issues #1-5) → Phase 1 (Issues #6-9)
Phase 1 → Phase 2 (Issues #10-14) + Phase 3 (Issues #15-18)
Phase 2 + Phase 3 → Phase 4 (Issues #19-22)
Phase 4 → Phase 5 (Issues #23-26)
```

## Next Actions

1. **Create all issues manually in GitHub** using the detailed descriptions above
2. **Set up issue templates** in `.github/ISSUE_TEMPLATE/` for future use
3. **Begin Phase 0.1** - Start with Issue #2 (Fix E2E Test Stability)
4. **Link issues** - Add cross-references and dependencies
5. **Set milestones** - Create Phase 0-5 milestones with target dates

All issues include:

- Comprehensive background from spec sections
- Specific files to modify/create
- Acceptance criteria with DoD
- Test requirements
- Evidence requirements (CI, coverage, SARIF, SBOM, SLSA)
