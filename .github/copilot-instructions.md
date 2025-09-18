# AI App Platform - Copilot Instructions

## Project Overview

This is a production-ready **modular monolith** built with Next.js 14, featuring a multi-workspace npm architecture with shared packages. The platform combines web application, database layer, job queuing, and AI gateway functionality.

## Architecture & Key Concepts

### Workspace Structure

- **`apps/web`**: Next.js 14 app with App Router, NextAuth, and Prisma
- **`packages/gateway`**: LiteLLM integration with Langfuse observability
- **`packages/db`**: Shared Prisma schema and database client
- **`packages/jobs`**: BullMQ job queue system with Redis
- **`packages/config`**: Shared configuration and environment validation

### Service Dependencies

- **PostgreSQL**: Primary database via Prisma ORM
- **Redis**: Job queue backend and session storage
- **LiteLLM**: Multi-provider AI model gateway (runs on port 4000)

### Import Conventions

- Use workspace packages: `@ai-app-platform/gateway`, `@ai-app-platform/db`, etc.
- App imports use relative paths or `@/` alias for `src/` directory
- Shared types and utilities live in package exports, not duplicated

## Development Patterns

### Running Commands

Use workspace-scoped commands for targeted development:

```bash
# Development
npm run dev                               # Starts web app only
npm run dev --workspace=packages/gateway  # Watch-compile gateway

# Database operations (always on web workspace)
npm run migrate --workspace=apps/web
npm run seed --workspace=apps/web

# Testing
npm run test --workspace=tests/unit       # Jest unit tests
npm run e2e --workspace=tests/e2e         # Playwright e2e tests
```

### Environment Setup

- Copy `.env.example` to `.env` in project root
- Database migrations run via `npm run migrate` (not `prisma migrate dev`)
- Use `docker compose up -d db redis` for local services
- LiteLLM gateway must be started separately on port 4000

### Database Conventions

- All models use `cuid()` for IDs, not auto-increment
- User authentication via NextAuth with custom credentials provider
- Prisma schema lives in `apps/web/prisma/schema.prisma` (NOT in packages/db)
- Demo user: `demo@example.com` / `demo123` (created by seed)
- Models follow singular naming with `@@map("plural_table_names")`
- Use `prisma` import from `@/lib/db`, not direct client instantiation

### API Route Patterns

- **Authentication**: All protected routes check `getServerSession(authOptions)`
- **Validation**: Use Zod schemas for request validation (see `/api/llm/route.ts`)
- **Runtime**: Specify `export const runtime = 'nodejs'` for Prisma routes
- **Error Handling**: Return structured JSON with error messages
- **Response Format**: Consistent `{ success: boolean, data?: any, error?: string }` structure

### LiteLLM Integration

- **Gateway Creation**: Use `createGateway()` from `@ai-app-platform/gateway`
- **Mock Mode**: Automatically enabled when `NODE_ENV=test`
- **Observability**: Langfuse integration for tracing (when configured)
- **API Route**: `/api/llm` accepts OpenAI-compatible chat completion format

### Job Queue System

- **BullMQ**: Redis-backed job processing in `packages/jobs`
- **Worker**: Run `npm run worker --workspace=packages/jobs` for processing
- **Queue Health**: Monitored via `/health` endpoint
- **Job Creation**: Use `addSampleJob()` from `@/lib/jobs`

## Testing Strategies

### Unit Tests

- Located in `tests/unit/` with separate package.json
- **API Tests**: Mock database with Prisma in-memory
- **Gateway Tests**: Use mock LiteLLM responses
- **Mocking Pattern**: Mock workspace packages with `jest.mock('@ai-app-platform/gateway')`
- Run with `npm run test --workspace=tests/unit`

### E2E Tests

- **Playwright** configuration in `tests/e2e/`
- **Database**: Uses separate test database (configured in playwright.config.ts)
- **Authentication**: Test flows include signin/signout
- **Server**: Auto-starts web app on port 3000 during tests
- Run with `npm run e2e --workspace=tests/e2e`

## Build & Deployment

### Docker Development

```bash
# Services only (recommended for development)
docker compose up -d db redis

# Full stack (web + services)
docker compose up --build
```

### Production Considerations

- **Health Checks**: `/health` endpoint monitors database and job queue
- **Migrations**: Use `npm run migrate:deploy` for production deploys
- **Environment**: Set `NEXTAUTH_SECRET`, `DATABASE_URL`, `REDIS_URL`
- **Worker Process**: Deploy job worker separately via docker-compose

### CI/CD Integration

- **Local CI**: Run `./scripts/ci-local.sh` to mirror GitHub Actions
- **Quick Checks**: `npm run ci:quick` for lint + type checking
- **Format**: Auto-format with `npm run format` before commits
