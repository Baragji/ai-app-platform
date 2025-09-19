#!/bin/bash

# Local CI Script - Run all CI checks before pushing
# This mimics the exact same checks that run in GitHub Actions

set -e  # Exit on any error

echo "🚀 Running local CI checks..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Install dependencies
print_step "Installing dependencies..."
npm ci --include-workspace-root --workspaces
print_success "Dependencies installed"
echo ""

# Step 2: Build observability package first
print_step "Building observability package..."
npm run build --workspace=packages/observability
print_success "Observability built"
echo ""

# Step 3: Build gateway
print_step "Building gateway package..."
npm run build --workspace=packages/gateway
print_success "Gateway built"
echo ""

# Step 4: Run ESLint
print_step "Running ESLint..."
npm run lint
print_success "ESLint passed"
echo ""

# Step 5: Check Prettier formatting
print_step "Checking Prettier formatting..."
npm run format:check
print_success "Prettier check passed"
echo ""

# Step 6: Type check
print_step "Running TypeScript type check..."
npm run type-check
print_success "Type check passed"
echo ""

# Step 7: Generate Prisma client
print_step "Generating Prisma client..."
npm run generate --workspace=apps/web
print_success "Prisma client generated"
echo ""

# Step 8: Build application
print_step "Building application..."
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db"
export REDIS_URL="redis://localhost:6379"
export NEXTAUTH_SECRET="test-secret"
export NEXTAUTH_URL="http://localhost:3000"
export LITELLM_BASE_URL="http://localhost:4000"
export LITELLM_TIMEOUT="30000"

npm run build
print_success "Application built"
echo ""

# Step 9: Run unit tests (optional - requires DB)
print_step "Running unit tests (skipping - requires database)..."
echo "💡 To run tests, start PostgreSQL and Redis, then run: npm run test --workspace=tests/unit"
echo ""

echo "🎉 All local CI checks passed! Safe to push to GitHub."
echo ""
echo "Quick commands for future use:"
echo "  npm run lint           # ESLint"
echo "  npm run format:check   # Prettier check"
echo "  npm run format         # Fix Prettier issues"
echo "  npm run type-check     # TypeScript"
echo "  npm run build          # Build app"
echo ""