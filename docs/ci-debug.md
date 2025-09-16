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

### Issue 6: Deprecated Cache Actions (CRITICAL FIX)

**Problem**: CI failing with "This request has been automatically failed because it uses a deprecated version of `actions/cache`"
**Root Cause**: Using `actions/cache@0c45773b623bea8c8e75f6c82b208c3cf94ea4f9` (v4.0.2) which has been deprecated
**Fix**:

- Updated all `actions/cache` references from v4.0.2 to v4.1.0
- Updated cache SHA from `0c45773b623bea8c8e75f6c82b208c3cf94ea4f9` to `2cdf405574d6ef1f33a1d12acccd3ae82f47b3f2`
- All cache operations now use the latest stable version

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
- **Supply chain artifacts**: SBOM, provenance, and signatures
- **Docker image**: Complete container image for verification
- All retained for 30 days for investigation

### Supply Chain Security Integration

Added comprehensive supply chain security features:

- **Cosign keyless signing**: Container images signed with OIDC
- **SBOM generation**: Software Bill of Materials with Anchore
- **Build provenance**: Cryptographically signed build attestations
- **Signature verification**: Automated verification of all signatures

### Security Analysis Integration

Added OpenSSF Scorecard for continuous security monitoring:

- **PR analysis**: Automated security analysis on pull requests
- **Nightly monitoring**: Daily security posture assessment
- **Security dashboard**: Results integrated with GitHub Security tab
- **PR comments**: Automatic reporting of security scores

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

## New Security Features

### Supply Chain Security

The CI pipeline now includes comprehensive supply chain security:

- **Container Image Signing**: All Docker images are signed with cosign using keyless OIDC
- **SBOM Generation**: Software Bill of Materials created and signed for every build
- **Build Provenance**: Cryptographic attestation of the build process
- **Verification Steps**: Automated verification of all signatures

### OpenSSF Scorecard Integration

Added automated security analysis:

- **Pull Request Analysis**: Security posture evaluated on every PR
- **Nightly Monitoring**: Daily security assessment on main branch
- **GitHub Security Integration**: Results uploaded to Security tab
- **Comprehensive Documentation**: Complete guide in `docs/security/scorecard.md`

## Workflow Approval Requirements

**Important**: New workflows may require approval when first introduced due to GitHub's security policies for third-party Actions. This is expected for:

- OpenSSF Scorecard workflow (uses `ossf/scorecard-action`)
- Supply chain security features (uses `sigstore/cosign-installer`, `anchore/sbom-action`)

Repository administrators can approve these workflows in the Actions tab.

## Documentation Updates

- **docs/supply-chain.md**: Complete supply chain security documentation with verification commands
- **docs/security/scorecard.md**: Comprehensive OpenSSF Scorecard guide and interpretation
- **docs/ci-debug.md**: Updated with all fixes and new features
