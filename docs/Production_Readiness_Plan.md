# Production Readiness Plan — Consolidated Validation Actions

This plan consolidates findings from:

- docs/Validation/Validation_report_180925.md
- docs/Validation/validation_report2_180925.md

Goal: Achieve production-grade readiness with all tests (unit + E2E) and validations passing, a single source of truth for the database layer, and aligned CI/CD.

---

## Verified Completions (validated via git history and config)

- **Prisma generation source set to apps/web**:
  - Dockerfile runs `npm run generate --workspace=apps/web`
  - CI workflow generates, migrates, and seeds via `apps/web`
- **Postgres version alignment**:
  - CI uses `postgres:16`; docker-compose uses `postgres:16-alpine`
- **Legacy in-memory DB removed**:
  - `apps/web/src/lib/db.ts` deleted; no imports of `@/lib/db` or `@/src/lib/db` remain
- **E2E stability improvements**:
  - Playwright config sets correct `cwd` and `webServer` command
  - Projects tests rely on UI state (modal visibility, data-testids) and avoid brittle waits
- **Health endpoint implemented and composed**:
  - `/api/health` checks Prisma and job queue; docker-compose healthcheck targets it
  - Fixed DB check to `prisma.$queryRaw\`SELECT 1\``
- **Local validation successful**:
  - Next.js production build succeeded
  - Unit tests passed (3 suites, 20 tests)
  - E2E tests passed (66 tests across Chromium/Firefox/WebKit)

Note: Prisma schema duplication still exists at `packages/db/prisma/schema.prisma`. Consolidate to a single schema at `apps/web/prisma` to fully complete Section 2.

---

## 0) Baseline Environment Readiness

- [ ] Ensure .env is present with required values
  - **NEXTAUTH_SECRET**: set to a non-empty string for local/CI
  - **DATABASE_URL**, **REDIS_URL**, **NEXTAUTH_URL**
- [ ] Install Playwright browsers locally for E2E
  - `cd tests/e2e && npx playwright install --with-deps`
- [ ] Start local services (dev)
  - `docker compose up -d db redis`

Acceptance:

- `curl http://localhost:3000/health` returns 200 when app is running

---

## 1) E2E Test Stabilization (Projects + Auth)

Findings:

- Auth previously flagged; latest failures are mostly UI timing:
  - Modal not closing after creating a project ("Create New Project" remains visible)
  - Occasional timeouts waiting for `/api/projects` refresh
- Tests already use `#email` / `#password` and semantic selectors.

Actions:

1. Verify login success path (manual + logs)
   - Enable NextAuth debug locally if needed: `NEXTAUTH_DEBUG=true`
   - Confirm redirect to `/projects` on valid creds (`demo@example.com` / `demo123`)
2. Fix project creation modal closing
   - Ensure the create-project handler hides the modal after successful POST
   - Add explicit success state update and form reset
3. Prefer UI state over network waits in E2E
   - Replace brittle `waitForResponse` with:
     - Wait for modal to be hidden
     - Wait for the project card with the given name to appear
     - Use `toHaveCount`/`toBeHidden`/`toBeVisible` on stable data-testids
4. Deletion test: wait for absence by UI
   - After clicking delete, assert the card count becomes 0

Acceptance:

- All projects E2E tests pass reliably across Chromium, Firefox, WebKit

---

## 2) Prisma Source of Truth Consolidation

Findings:

- CI runs generate/migrate/seed via `apps/web`
- Dockerfile runs generate via `packages/db`
- Both `apps/web/prisma` and `packages/db/prisma` exist → drift risk
- Copilot instructions state: schema lives in `apps/web/prisma` (NOT in `packages/db`)

Decision:

- Use **apps/web/prisma** as the single source of truth.

Actions:

1. Update Dockerfile to generate via `apps/web`
   - Replace `npm run generate --workspace=packages/db` with `npm run generate --workspace=apps/web`
2. Audit and remove/merge `packages/db/prisma`
   - If `packages/db` exports utilities, keep code but remove duplicate schema
   - Ensure application imports Prisma client from a single location consistent with `apps/web`
3. Ensure app imports are unified
   - Import `prisma` consistently from the chosen client module (e.g., `@/lib/prisma` or a shared package)

Acceptance:

- One schema location (apps/web/prisma)
- CI and Docker builds work without referencing `packages/db/prisma`

---

## 3) Remove Legacy In-Memory DB

Finding:

- `apps/web/src/lib/db.ts` is an in-memory mock that conflicts with Prisma usage.

Actions:

- [x] Search for imports of `@/src/lib/db` or `@/lib/db`
- [x] If unused, delete the file
- [x] If used, replace references with the real Prisma client import and adjust code accordingly

Acceptance:

- No runtime imports of the in-memory DB; only real Prisma client is used

---

## 4) Postgres Version Alignment

Finding:

- CI uses `postgres:16`, docker-compose uses `postgres:15-alpine`.

Actions:

- Pick a version (recommend 16) and align both CI and compose for parity

Acceptance:

- Same major Postgres version in CI and local compose

---

## 5) CI/CD Enhancements

Current:

- CI runs lint, type-check, unit and E2E tests, builds gateway, generates SBOM
- OpenSSF Scorecard workflow present

Planned Enhancements (optional but recommended):

1. Supply-chain signing and provenance
   - Add Cosign keyless signing for container images
   - Generate and sign provenance (in-toto) and SBOM
   - Verify signatures in CI
2. Cache improvements
   - Ensure `actions/setup-node` caches NPM; optionally cache Playwright binaries per runner

Acceptance:

- CI artifact includes SBOM, and optionally signed provenance
- Reproducible builds with verification steps

---

## 6) LiteLLM Gateway Mode

Finding:

- E2E and local dev can use mock mode; real LiteLLM is external.

Actions:

- Ensure tests use mock mode by default
  - `LITELLM_MODE=mock` in E2E/CI environments, or rely on `NODE_ENV=test` behavior
- Document how to start LiteLLM for manual testing (optional)

Acceptance:

- E2E fully pass without external LiteLLM service

---

## 7) Final Validation Checklist

1. Fresh environment run:
   - `docker compose up -d db redis`
   - `npm ci --include-workspace-root --workspaces`
   - `npm run generate --workspace=apps/web`
   - `npm run migrate:deploy --workspace=apps/web`
   - `npm run seed --workspace=apps/web`
2. Build and test:
   - `npm run build --workspace=packages/gateway`
   - `npm run build --workspace=apps/web`
   - `npm run test --workspace=tests/unit`
   - `cd tests/e2e && npx playwright install --with-deps && cd -`
   - `npm run e2e --workspace=tests/e2e`
3. Health and smoke:
   - Start app: `npm run start --workspace=apps/web`
   - `curl -f http://localhost:3000/health`

Acceptance:

- All unit and E2E tests pass
- Health endpoint returns 200

---

## 8) Ownership & PR Strategy

- Create focused PRs per section:
  1. E2E stabilization (tests + minimal UI fixes)
  2. Prisma consolidation (Dockerfile + schema location + imports)
  3. Remove in-memory DB
  4. Postgres version alignment
  5. CI supply-chain enhancements (optional)
- Each PR includes:
  - Rationale summary
  - Commands to verify
  - Before/after notes

---

## 9) Risks & Mitigations

- Risk: Hidden code paths still import the mock DB
  - Mitigation: repo-wide search, add type-safe Prisma client, fail fast if ENV misconfigured
- Risk: Prisma consolidation breaks builds
  - Mitigation: stage changes, run full CI locally (`./scripts/ci-local.sh`), ensure generate/migrate run
- Risk: Flaky E2E due to timing
  - Mitigation: prefer UI state assertions; avoid network waits; use stable data-testids

---

## 10) Success Criteria

- Single Prisma schema at `apps/web/prisma`
- No in-memory DB usage in production code
- Postgres versions aligned
- CI green: lint, type-check, unit, E2E, build
- Health endpoint returns 200 in prod image and compose
- Optional: container signing and provenance verification steps operational
