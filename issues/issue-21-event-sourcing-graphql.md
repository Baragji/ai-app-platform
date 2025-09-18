# Issue #21: Event Sourcing & GraphQL

## Labels
- `phase-4`
- `feature`

## Assignee
- Copilot

## Milestone
Phase 4 - Distributed State & Events

## Description

Implement event sourcing for job orchestration with a complete audit trail and replay functionality, along with GraphQL subscriptions for real-time updates. This is a critical component of Phase 4's event-driven architecture that will enable distributed state management and comprehensive job observability.

## Background

As part of Phase 4's distributed state and events initiative, we need to transition from the current stateful job management to an event-sourced architecture. This will provide:

1. **Complete Audit Trail**: Every state change in job execution will be captured as immutable events
2. **Replay Capability**: Ability to reconstruct job state at any point in time
3. **Real-time Updates**: GraphQL subscriptions for live job status updates
4. **Distributed State Management**: Foundation for scaling orchestration across multiple instances

## Technical Requirements

### Event Sourcing Implementation

#### Core Files to Create/Modify
- `packages/orchestrator/src/events.ts` - Event sourcing core logic
- `packages/orchestrator/src/event-store.ts` - Event persistence layer
- `packages/orchestrator/src/replay.ts` - State reconstruction from events
- `packages/orchestrator/src/types/events.ts` - Event type definitions
- `apps/web/src/app/api/orchestrator/events/route.ts` - Event API endpoints

#### Event Types
```typescript
// Core job events
- JobCreated
- JobStarted  
- JobStepCompleted
- JobStepFailed
- JobPaused
- JobResumed
- JobCompleted
- JobFailed
- JobCancelled

// Orchestrator component events
- PlannerStarted
- PlannerCompleted
- CoderStarted
- CoderCompleted  
- CritiqueStarted
- CritiqueCompleted
```

#### Event Store Schema
```typescript
interface JobEvent {
  id: string;
  jobId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  sequence: number;
  metadata: {
    traceId?: string;
    userId?: string;
    version: string;
  };
}
```

### GraphQL Subscriptions

#### Core Files to Create/Modify
- `packages/orchestrator/src/graphql/schema.ts` - GraphQL schema definitions
- `packages/orchestrator/src/graphql/resolvers.ts` - Query/mutation/subscription resolvers
- `packages/orchestrator/src/graphql/subscriptions.ts` - Real-time subscription logic
- `apps/web/src/lib/graphql/client.ts` - GraphQL client setup
- `apps/web/src/hooks/useJobSubscription.ts` - React hook for job subscriptions

#### Subscription Types
```graphql
type Subscription {
  jobStatusUpdated(jobId: ID!): JobStatusUpdate
  jobLogsStream(jobId: ID!): JobLogEntry
  orchestratorHealth: OrchestratorStatus
}

type JobStatusUpdate {
  jobId: ID!
  status: JobStatus!
  currentStep: String
  progress: Float
  timestamp: DateTime!
  events: [JobEvent!]!
}
```

### Audit Trail & Replay

#### Audit Trail Features
- **Immutable Event Log**: All job state changes stored as immutable events
- **Trace Correlation**: Link events to OTel traces for full observability
- **User Attribution**: Track which user/system triggered each event
- **Metadata Enrichment**: Include context like model parameters, execution environment

#### Replay Functionality
- **Point-in-Time Recovery**: Reconstruct job state at any historical moment
- **Debugging Support**: Replay failed jobs with different parameters
- **State Validation**: Verify current state matches event history
- **Performance Analysis**: Analyze execution patterns across job replays

## Implementation Plan

### Phase 1: Event Store Foundation (Week 1)
1. Create event store infrastructure with Redis/PostgreSQL backend
2. Implement core event types and serialization
3. Add event publishing from existing orchestrator components
4. Create basic event querying APIs

### Phase 2: State Reconstruction (Week 1-2)
1. Implement event replay logic for state reconstruction
2. Add snapshot functionality for performance optimization
3. Create debugging tools for event history analysis
4. Integrate with existing job persistence layer

### Phase 3: GraphQL Integration (Week 2)
1. Set up GraphQL server with subscription support
2. Implement real-time job status subscriptions
3. Create React hooks for UI integration
4. Add authentication/authorization for GraphQL endpoints

### Phase 4: Advanced Features (Week 2-3)
1. Implement audit trail UI components
2. Add replay functionality through UI
3. Create performance monitoring for event processing
4. Add event-based alerting and notifications

## Acceptance Criteria

### Definition of Done (DoD): Complete audit trail with replay capability

#### Core Functionality
- [ ] All job state changes are captured as immutable events
- [ ] Event store persists events with proper ordering and metadata
- [ ] State can be reconstructed from events at any point in time
- [ ] GraphQL subscriptions provide real-time job updates
- [ ] Replay functionality works for both debugging and recovery

#### Technical Requirements
- [ ] Event sourcing integrated with existing orchestrator state machine
- [ ] GraphQL schema supports job queries, mutations, and subscriptions
- [ ] Events are correlated with OTel traces for full observability
- [ ] Performance impact is minimal (<10ms latency increase)
- [ ] Event store handles concurrent writes without conflicts

#### Testing Requirements
- [ ] Unit tests for all event types and handlers
- [ ] Integration tests for event store operations
- [ ] End-to-end tests for job replay scenarios
- [ ] GraphQL subscription tests with mock clients
- [ ] Performance tests with high-volume event generation

#### UI/UX Requirements
- [ ] Audit trail view shows complete job history
- [ ] Real-time status updates in job monitoring UI
- [ ] Replay functionality accessible from job details page
- [ ] Error states properly handled in GraphQL subscriptions

#### Documentation Requirements
- [ ] Event sourcing architecture documented in `docs/`
- [ ] GraphQL schema and subscription examples
- [ ] Replay procedure documentation for debugging
- [ ] Performance tuning guide for event store

## Dependencies

### Prerequisites
- Issue #20: Message Queue Integration (for event publishing)
- Issue #8: Job Persistence & Resume Capability (current state management)
- Issue #5: Observability Baseline with OTel (trace correlation)

### External Dependencies
- GraphQL server library (e.g., Apollo Server, GraphQL Yoga)
- WebSocket support for GraphQL subscriptions
- Event store backend (Redis Streams or PostgreSQL events table)

## Success Metrics

### Performance Targets
- Event publishing latency: <5ms p95
- State reconstruction time: <100ms for typical jobs
- GraphQL subscription latency: <50ms
- Event store write throughput: >1000 events/second

### Observability Goals
- 100% trace correlation between events and OTel spans
- Complete audit trail for all job state changes
- Real-time monitoring of event processing health
- Replay success rate >99% for valid historical states

## Risk Mitigation

### Technical Risks
- **Event Store Performance**: Implement proper indexing and partitioning
- **State Consistency**: Use optimistic concurrency control for event writes
- **Subscription Scalability**: Implement connection pooling and rate limiting
- **Replay Complexity**: Start with simple replay scenarios and expand gradually

### Operational Risks
- **Data Migration**: Plan migration from current state storage to event sourcing
- **Backward Compatibility**: Maintain existing APIs during transition
- **Monitoring Complexity**: Add comprehensive metrics for event processing
- **Debugging Overhead**: Provide tools to correlate events with system logs

## Related Issues

- Issue #19: [EPIC] Phase 4 - Event-Driven Architecture
- Issue #20: Message Queue Integration
- Issue #22: Service Contracts
- Issue #8: Job Persistence & Resume Capability
- Issue #12: Live Streaming Console (UI integration)

## Resources

### Documentation
- [Event Sourcing Pattern](https://microservices.io/patterns/data/event-sourcing.html)
- [GraphQL Subscriptions Best Practices](https://www.apollographql.com/docs/react/data/subscriptions/)
- [CQRS and Event Sourcing](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)

### Implementation Examples
- [Event Store Reference Implementation](https://github.com/EventStore/EventStore)
- [Apollo Server Subscriptions](https://github.com/apollographql/apollo-server)
- [Redis Streams for Event Sourcing](https://redis.io/topics/streams-intro)