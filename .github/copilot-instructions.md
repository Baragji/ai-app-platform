# AI App Platform - GitHub Copilot Instructions

**ALWAYS follow these instructions first. Only fallback to search or additional context gathering if the information here is incomplete or found to be incorrect.**

## Project Overview

AI App Platform is a production-ready modular monolith built with Next.js 14, TypeScript, PostgreSQL, and Redis. It includes authentication, database management, job queues, and AI gateway functionality with LiteLLM integration.

## Working Effectively

### Bootstrap and Setup Requirements

- **Node.js Version**: Exactly v20 (check `.nvmrc`)
- **npm Version**: 10+
- **Docker**: Required for PostgreSQL and Redis services

### Initial Setup Commands (Run Once)

```bash
# Install dependencies - takes ~15 seconds
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration if needed

# Start required services
docker compose up -d db redis

# Setup database (requires services running)
export $(grep -v '^#' .env | xargs)
npm run generate  # Generate Prisma client (~1 second)
npm run migrate   # Run database migrations (~3 seconds)
npm run seed      # Seed with demo data (~2 seconds)
```

### Essential Build Commands

```bash
# Build gateway package FIRST (always required before other builds)
npm run build --workspace=packages/gateway  # ~2 seconds

# Generate Prisma client (required after schema changes)
npm run generate  # ~1 second

# Build application for production - CURRENTLY FAILING
# npm run build  # Known issue: Build fails with Next.js context errors
# Use development mode instead for current functionality
```

### Development Commands

```bash
# Start development server - WORKS CORRECTLY
npm run dev  # Starts at http://localhost:3000

# Start production server - CURRENTLY UNAVAILABLE due to build issues
# npm start  # Requires successful production build
```

### Testing Commands

```bash
# Run unit tests - PARTIAL SUCCESS. Set timeout to 15+ minutes.
npm run test  # Gateway tests fail (Langfuse), unit tests pass (20 tests)

# Run specific unit tests only (recommended)
npm run test --workspace=tests/unit  # ~6 seconds, 20/20 tests pass

# Install Playwright browsers (first time only)
cd tests/e2e && npx playwright install --with-deps  # ~5 minutes

# Run E2E tests - CURRENTLY BROKEN due to webServer config
# Playwright webServer cannot find workspace from e2e directory
# Manual workaround: start dev server separately, then run E2E tests
```

### Linting and Formatting

```bash
# Lint code
npm run lint  # ~2 seconds

# Check formatting
npm run format:check  # ~1 second

# Fix formatting issues
npm run format  # ~2 seconds

# Type checking
npm run type-check  # ~8 seconds
```

### Docker Commands

```bash
# Build Docker image - WORKS. Set timeout to 90+ minutes.
docker build -t ai-app-platform .  # ~70 seconds

# Start full stack with Docker - UNTESTED due to build issues
# docker compose up --build  # May fail due to Next.js build errors

# Start only services (for local development) - WORKS
docker compose up -d db redis  # PostgreSQL + Redis for development
```

## Critical Timing and Timeout Information

**NEVER CANCEL these commands - they may appear to hang but are working:**

- `npm install`: ~15 seconds
- `npm run build`: ~20 seconds (may take up to 30+ minutes in CI)
- `npm run test`: ~6 seconds (may take up to 15+ minutes in CI)
- `docker build`: ~70 seconds (may take up to 45+ minutes in CI)
- `npx playwright install --with-deps`: ~5 minutes

**Always set timeouts of 60+ minutes for build commands and 30+ minutes for test commands.**

## Validation Scenarios

After making changes, ALWAYS run these validation steps:

### 1. Basic Build Validation

```bash
npm run build --workspace=packages/gateway  # WORKS
npm run generate                           # WORKS
npm run lint                               # WORKS
npm run format:check                       # WORKS (may need npm run format)
npm run type-check                         # WORKS
# npm run build  # SKIP - currently fails with Next.js context errors
```

### 2. Test Validation

```bash
# Ensure services are running
docker compose up -d db redis

# Run unit tests with environment (recommended - gateway tests fail)
export $(grep -v '^#' .env | xargs)
npm run test --workspace=tests/unit  # 20/20 tests pass
```

### 3. Manual Functional Validation

Start the development server and test these scenarios:

```bash
npm run dev  # Server starts at http://localhost:3000
```

**Required Manual Tests:**

- Visit homepage: `curl http://localhost:3000/` should return 200
- Test health endpoint: `curl http://localhost:3000/api/health` should return 200
- Test authentication flow using demo account:
  - Email: `demo@example.com`
  - Password: `demo123`
- Test project creation and management functionality
- Verify AI gateway functionality on `/llm-test` page

### 4. Production Build Validation

```bash
# Production build currently fails - use development mode instead
npm run dev  # Test development server functionality

# Docker build works but runtime untested due to build issues
docker build -t ai-app-platform . # Build succeeds but app may not start
```

## Project Structure

```
├── apps/web/                    # Next.js application (main app)
├── packages/
│   ├── config/                  # Shared configuration
│   ├── db/                      # Database layer (Prisma)
│   ├── gateway/                 # LiteLLM AI gateway (build first!)
│   └── jobs/                    # Job queue system (BullMQ)
├── tests/
│   ├── unit/                    # Jest unit tests
│   └── e2e/                     # Playwright E2E tests
├── .github/workflows/ci.yml     # GitHub Actions pipeline
├── docker-compose.yml           # Development services
└── Dockerfile                   # Production container
```

## Important Notes

### Environment Variables

Required variables in `.env`:

- `DATABASE_URL`: PostgreSQL connection
- `REDIS_URL`: Redis connection
- `NEXTAUTH_SECRET`: Authentication secret
- `NEXTAUTH_URL`: Application URL

### Dependencies Between Packages

- **Gateway package MUST be built first** before any other builds
- Database must be migrated before running tests
- Services (PostgreSQL, Redis) must be running for tests and development

### Known Issues and Workarounds

- **Production build fails**: Next.js build fails with context errors. Use development mode instead
- **Gateway tests fail**: Langfuse integration tests fail due to configuration issues
- **E2E tests broken**: Playwright webServer config has working directory issues
- **Prettier formatting**: May fail on new files - run `npm run format` to fix
- **Docker runtime**: Build succeeds but app may not start due to Next.js build issues

### Current Working Status

✅ **Working**:

- Development server (`npm run dev`)
- Unit tests (`npm run test --workspace=tests/unit`)
- Linting and formatting
- Database operations
- Docker image building

❌ **Not Working**:

- Production builds (`npm run build`)
- Gateway package tests
- E2E tests (config issues)
- Production server (`npm start`)

### Recommendations for Development

1. **Always use development mode** for testing changes
2. **Focus on unit tests** in `tests/unit` - they work reliably
3. **Manual testing** is required since E2E tests are broken
4. **Avoid production builds** until Next.js context issues are resolved

### CI/CD Pipeline

The GitHub Actions workflow runs:

1. `install` → `lint` & `type-check` → `build` → `test` → `e2e` → `docker`
2. Uses PostgreSQL 15 and Redis 7 services
3. Caches node_modules and gateway builds
4. Runs with strict timeout and retry policies

## Development Workflow

1. **Make Changes**: Edit code in relevant workspace
2. **Test Locally**: `npm run lint && npm run test`
3. **Manual Validation**: Start dev server and test functionality
4. **E2E Testing**: Test complete user workflows
5. **Build Check**: `npm run build` to ensure production build works
6. **Docker Test**: Verify containerized deployment if needed

## Quick Reference Commands

```bash
# Recommended development workflow (what actually works):
npm install
npm run build --workspace=packages/gateway
npm run lint
npm run format:check  # Run 'npm run format' if this fails
npm run type-check
docker compose up -d db redis
export $(grep -v '^#' .env | xargs)
npm run migrate
npm run test --workspace=tests/unit  # Skip other tests - they fail
npm run dev  # Use development mode, production build broken
```

Remember: **Focus on what works - development mode and unit tests. Avoid broken production builds and E2E tests.**
