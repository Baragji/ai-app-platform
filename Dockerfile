# Build stage  
FROM node:20-bookworm-slim AS builder

# Install required system dependencies
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY packages/config/package*.json ./packages/config/
COPY packages/db/package*.json ./packages/db/
COPY packages/jobs/package*.json ./packages/jobs/
COPY packages/gateway/package*.json ./packages/gateway/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build gateway package first (required by other packages)
RUN npm run build --workspace=packages/gateway

# Generate Prisma client
RUN npm run generate --workspace=packages/db

# Build the application
RUN npm run build

# Production stage
FROM node:20-bookworm-slim AS runner

# Install system dependencies
RUN apt-get update && apt-get install -y curl openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create non-root user
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./apps/web/.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/apps ./apps
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]