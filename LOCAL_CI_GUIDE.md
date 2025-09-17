# Local Development & CI Guide 🚀

Stop waiting for CI failures! Run all checks locally before pushing.

## Quick Commands

```bash
# 🔥 The essentials - run before every commit
npm run ci:quick          # Fast: lint + format + type-check
npm run precommit         # Auto-fix formatting + run checks

# 🚀 Full local CI simulation
npm run ci:local          # Complete CI pipeline (except tests)

# 🛠️ Individual checks
npm run lint              # ESLint
npm run format            # Fix formatting
npm run format:check      # Check formatting only
npm run type-check        # TypeScript
npm run build             # Build app
npm run test              # Unit tests (needs DB)
```

## Recommended Workflow

### Before Every Commit:
```bash
npm run precommit
```
This will:
1. Auto-fix Prettier formatting issues
2. Run ESLint, format check, and TypeScript
3. Catch 90% of CI failures instantly

### Before Every Push:
```bash
npm run ci:local
```
This runs the complete CI pipeline locally (minus database-dependent tests).

## Common Issues & Fixes

### ESLint Warnings
```bash
# Fix auto-fixable issues
npm run lint:fix

# For React Hook dependency warnings, either:
# 1. Add the missing dependency to the array
# 2. Add // eslint-disable-next-line react-hooks/exhaustive-deps
```

### Prettier Formatting
```bash
# Fix all formatting issues
npm run format

# Check what needs formatting
npm run format:check
```

### TypeScript Errors
```bash
# See all type errors
npm run type-check

# Fix in your editor or check specific files
npx tsc --noEmit apps/web/src/path/to/file.ts
```

### Build Issues
```bash
# Test the build locally
npm run build

# If it fails, check environment variables in ci-local.sh
```

## Database-Dependent Tests

To run the full test suite locally:

```bash
# Start services (in separate terminals or use Docker)
brew services start postgresql
brew services start redis

# Or with Docker
docker-compose up -d postgres redis

# Set up test database
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db"
export REDIS_URL="redis://localhost:6379"
export NEXTAUTH_SECRET="test-secret"
export NEXTAUTH_URL="http://localhost:3000"

# Run tests
npm run test --workspace=tests/unit
npm run e2e --workspace=tests/e2e
```

## Pro Tips

1. **Set up pre-commit hooks** (optional):
   ```bash
   # Add to .git/hooks/pre-commit
   #!/bin/bash
   npm run precommit
   ```

2. **VS Code integration**: Install these extensions:
   - ESLint
   - Prettier
   - TypeScript Importer

3. **Fast feedback loop**:
   - Keep `npm run type-check` running in watch mode: `npx tsc --noEmit --watch`
   - Use `npm run format` frequently

4. **Emergency fix workflow**:
   ```bash
   # Quick fix before urgent push
   npm run format && npm run ci:quick
   ```

## Never Wait for CI Again! 

With these commands, you'll catch 99% of CI failures locally in seconds instead of waiting 5-10 minutes for GitHub Actions. Happy coding! 🎉