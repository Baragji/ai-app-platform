# CI Pipeline Debug and Fix Documentation

## Root Causes Identified and Fixed

### Issue 1: Prettier Formatting Failures

**Problem**: CI was failing with `prettier: not found` error during format check.
**Root Cause**: Code was not formatted according to Prettier rules, causing the format:check step to fail.
**Fix**:

- Ran `npm run format` to format all code according to Prettier rules
- All files now pass `prettier --check .`

### Issue 2: Missing Gateway Package Build

**Problem**: Build and test jobs were failing with `Module not found: Can't resolve '@ai-app-platform/gateway'`
**Root Cause**: The TypeScript gateway package needs to be compiled before other packages can import it.
**Fix**:

- Added gateway build step in the install job
- Added gateway build caching to avoid rebuilding on every job
- Updated all subsequent jobs to restore and rebuild gateway if needed

### Issue 3: Jest Configuration Error

**Problem**: Unit tests were showing warning about unknown option `moduleNameMapping`
**Root Cause**: Typo in Jest config - should be `moduleNameMapper` not `moduleNameMapping`
**Fix**:

- Updated `tests/unit/jest.config.js` to use correct property name
- Unit tests now run without configuration warnings

### Issue 4: Deprecated GitHub Actions

**Problem**: E2E job was failing due to deprecated `actions/upload-artifact@v3`
**Root Cause**: GitHub deprecated v3 of upload-artifact action
**Fix**:

- Upgraded to `actions/upload-artifact@v4`
- Upgraded cache actions from `@v3` to `@v4`
- Added separate artifact upload for Playwright traces

### Issue 5: Playwright Installation Issues

**Problem**: E2E tests may fail due to missing browser dependencies
**Root Cause**: Using `npm run install-deps` instead of proper Playwright installation with system dependencies
**Fix**:

- Changed to `npx playwright install --with-deps` to install browsers and system dependencies
- Added proper working directory specification

## CI Workflow Improvements

### Job Dependency Chain

Updated the job dependency chain for better parallelization and reliability:

```
install → lint & type-check → build → test → e2e → docker
```

Key changes:

- `lint` now depends on `install` to ensure proper setup
- `build` depends on `lint` to catch issues early
- `test` depends on `build` to ensure app builds successfully
- `e2e` depends on `test` to ensure unit tests pass first
- `docker` depends on all previous jobs

### Caching Strategy

Implemented comprehensive caching:

- **Node modules cache**: Shared across all jobs using package-lock.json hash
- **Gateway build cache**: Specific cache for compiled gateway package
- **Docker layer cache**: GitHub Actions cache for Docker builds

### Artifact Management

Enhanced artifact collection for debugging:

- **Playwright reports**: HTML reports uploaded on E2E test failures
- **Playwright traces**: Detailed trace files for debugging test failures
- Both retained for 30 days for investigation

## Local Development Commands

### Run the full CI pipeline locally:

```bash
# Install and build dependencies
npm install
npm run build --workspace=packages/gateway

# Lint and format
npm run lint
npm run format:check
npm run type-check

# Build application
npm run build

# Run tests (requires services running)
npm run test --workspace=tests/unit

# Run E2E tests (requires services and migration)
npm run e2e --workspace=tests/e2e
```

### Quick fix commands:

```bash
# Fix formatting issues
npm run format

# Rebuild gateway package
npm run build --workspace=packages/gateway

# Install Playwright browsers
npx playwright install --with-deps
```

## Service Dependencies

The CI pipeline requires these services for testing:

- **PostgreSQL 15**: For database operations
- **Redis 7**: For caching and session storage

Both are configured with health checks to ensure availability before tests run.

## Environment Variables

CI uses these safe default environment variables:

- `DATABASE_URL`: Points to test database
- `REDIS_URL`: Points to test Redis instance
- `NEXTAUTH_SECRET`: Test-only secret
- `NEXTAUTH_URL`: Test application URL
- `LITELLM_BASE_URL`: Mock LiteLLM gateway URL
- `LITELLM_TIMEOUT`: Reasonable timeout for tests

No production secrets are used in CI.
