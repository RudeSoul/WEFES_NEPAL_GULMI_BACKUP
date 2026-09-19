# Monorepo Shared Packages (`packages/`)

This directory contains shared TypeScript libraries, database clients, data contracts, and tool configurations managed via `pnpm` workspaces.

---

## Packages
- `packages/shared-types`: Canonical TypeScript interfaces, Zod validation schemas, and map legend contracts (`SUBFILTER_LEGENDS`).
- `packages/database`: Database client connectors, repository abstractions, and schema models.
- `packages/config`: Shared ESLint, Prettier, and TypeScript base configurations (`tsconfig.base.json`).
