---
description: Repository Information Overview
alwaysApply: true
---

# AI App Platform Information

## Summary
A production-ready modular monolith built with Next.js 14, featuring authentication, database management, job queues, and comprehensive testing. The platform includes LiteLLM integration for unified access to multiple AI providers.

## Structure
- **apps/web**: Next.js application with pages, components, and API routes
- **packages/config**: Environment configuration and validation
- **packages/db**: Database schema, migrations, and Prisma client
- **packages/jobs**: Job queue system with BullMQ
- **packages/gateway**: LLM integration with provider routing
- **tests**: Unit (Jest) and E2E (Playwright) tests

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.3.0
**Node Version**: Node.js 20+ (specified in .nvmrc)
**Package Manager**: npm 10+

## Dependencies
**Main Dependencies**:
- Next.js 14.0.0
- React 18.2.0
- NextAuth 4.24.0
- Prisma 5.7.0
- BullMQ 4.15.0
- Zod 3.22.4
- Langfuse 3.25.0

**Development Dependencies**:
- ESLint 8.55.0
- Prettier 3.1.0
- Jest 29.7.0
- Playwright 1.40.0
- TailwindCSS 3.3.6

## Build & Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run generate

# Run database migrations
npm run migrate

# Seed database
npm run seed

# Development server
npm run dev

# Production build
npm run build
npm start
```

## Docker
**Dockerfile**: Dockerfile (multi-stage build)
**Image**: Node.js 20 (bookworm-slim)
**Configuration**: 
- PostgreSQL database
- Redis for job queue
- Worker service for background jobs
- Health checks for all services

**Run with Docker Compose**:
```bash
# Start all services
docker compose up --build

# Start just dependencies
docker compose up -d db redis
```

## Testing
**Unit Testing**:
- **Framework**: Jest with ts-jest
- **Test Location**: tests/unit
- **Run Command**:
```bash
npm run test
```

**E2E Testing**:
- **Framework**: Playwright
- **Test Location**: tests/e2e/tests
- **Browsers**: Chrome, Firefox, Safari
- **Run Command**:
```bash
npm run e2e
```

## API Endpoints
- **Authentication**: /api/auth/signin, /api/auth/signout, /api/auth/session
- **Projects**: /api/projects (CRUD operations)
- **LLM**: /api/llm (AI model integration)
- **System**: /health (Health check endpoint)