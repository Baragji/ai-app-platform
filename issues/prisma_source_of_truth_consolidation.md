### Issue: Prisma Source of Truth Consolidation

#### Description:
Consolidate the Prisma database schema into a single source of truth.

#### Tasks:
- Update the Dockerfile.
- Remove the packages/db/prisma/ directory.
- Align PostgreSQL versions across the application.

#### Definition of Done:
- A single schema located at apps/web/prisma.

#### Labels:
- phase-0
- task
- database

#### Assignee:
- copilot