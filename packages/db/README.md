# @ai-app-platform/db

Centralized Prisma client wrapper for the AI App Platform.

## Policy

- **Single source of truth for schema**: `apps/web/prisma`.
- **Single Prisma client instance**: Import from this package only.
  - Use:
    ```ts
    import { prisma } from '@ai-app-platform/db';
    ```
  - Do not:
    ```ts
    import { PrismaClient } from '@prisma/client';
    ```
- **Seeding and migrations**: Run via `apps/web` workspace.

## Rationale

- Prevents schema drift and ensures one Prisma client across the app and tests.
- Aligns with Dockerfile and CI which generate/migrate via `apps/web`.
