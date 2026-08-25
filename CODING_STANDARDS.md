# WEFES Nexus Engineering & Coding Standards Guide

This document establishes the architecture rules, code organization patterns, file size constraints, and quality assurance standards for the **WEFES Nexus Nepal (Gulmi)** project.

---

## 1. Core Architectural Principles

1. **Strict Monorepo Separation of Concerns**:
   - `packages/shared-types`: Canonical domain models, Zod validation schemas, enums, DTOs.
   - `packages/wefes-engine`: Pure mathematical engines, FAO-56 Penman-Monteith, AquaCrop, QUEFTS, IPCC emissions, financial DCF models. **Zero UI or database dependencies**.
   - `packages/database`: In-memory and persistent data access layer, spatial vectors, logistics matrices, seed profiles.
   - `apps/api`: Domain microservices & Express API Gateway running on port 3001.
   - `apps/web`: React 18 + Vite frontend with feature-driven architecture.

2. **Single Source of Truth for Calculations**:
   - UI components and API controllers must **never** implement business or mathematical formulas inline.
   - All formulas must reside in `@wefes/wefes-engine` with corresponding unit tests.

---

## 2. File Length & Decomposition Standards

To maintain high readability, maintainability, and testability, strict line-of-code (LOC) limits are enforced across the repository:

| File Type | Target LOC | Hard Maximum Limit | Action Required When Exceeded |
|---|:---:|:---:|---|
| **React UI Components (`.tsx`)** | 100 – 250 lines | **350 lines** | Split into sub-components in a local `components/` or `tabs/` directory. |
| **Domain Engine Models (`.ts`)** | 150 – 300 lines | **400 lines** | Decompose into sub-domain calculations under a feature sub-folder. |
| **API Services & Controllers (`.ts`)** | 80 – 200 lines | **300 lines** | Separate controller handlers and business service logic. |
| **Custom Hooks (`use*.ts`)** | 50 – 150 lines | **200 lines** | Separate data fetching, state management, and side effects. |
| **Types & Interfaces (`.ts`)** | 50 – 200 lines | **250 lines** | Group into domain-specific type files. |

### Decomposition Pattern
When a component or service grows beyond 350 lines:
```
feature-name/
├── components/                    # Focused sub-components (≤ 250 lines each)
│   ├── FeatureHeader.tsx
│   ├── FeatureOverviewTab.tsx
│   ├── FeatureMetricsGrid.tsx
│   └── FeatureExportModal.tsx
├── hooks/                         # Isolated state & data fetching
│   └── useFeatureData.ts
├── types/                         # Local component DTOs
│   └── feature.types.ts
├── FeatureScreen.tsx              # Main orchestrator shell (≤ 150 lines)
└── index.ts                       # Public barrel export
```

---

## 3. TypeScript & Code Quality Rules

1. **Zero `any` Policy**:
   - Always use explicit types from `@wefes/shared-types` or local interface definitions.
   - Never use `as any` casting unless interfacing with untyped third-party library primitives.

2. **Clean Imports via Barrels**:
   - Import from top-level package or feature barrel exports:
     ```ts
     // ✅ Good
     import { calculateHarvestImpact, WEFESOutput } from '@wefes/wefes-engine';
     import { Header, InputModal } from '../../components/common';
     import { NexusRadarSpider } from '../../components/charts';

     // ❌ Bad (deep internal imports)
     import { calculateHarvestImpact } from '../../../../packages/wefes-engine/src/engine';
     ```

3. **Pure Function Rules for Engines**:
   - Functions in `@wefes/wefes-engine` must be pure, deterministic, and idempotent.
   - No `Date.now()`, random numbers, or external network requests inside calculation algorithms without passing them as explicit seeded parameters.

---

## 4. API Gateway & Microservice Standards

1. **URL Naming**:
   - All gateway endpoints must follow RESTful `/api/v1/:domain/:resource` naming:
     - `GET /api/v1/gis/palikas`
     - `GET /api/v1/agronomy/crops/:id`
     - `POST /api/v1/nexus/calculate`

2. **Standardized Response Envelope**:
   ```json
   {
     "success": true,
     "data": { ... },
     "count": 12,
     "timestamp": "2026-08-25T07:15:00.000Z"
   }
   ```

3. **Error Handling (RFC 7807)**:
   - Throw structured errors handled by `errorHandler.ts`:
   ```json
   {
     "success": false,
     "statusCode": 400,
     "error": "Validation failed",
     "details": [{ "field": "quantity", "message": "Quantity must be greater than 0" }],
     "timestamp": "2026-08-25T07:15:00.000Z"
   }
   ```

---

## 5. Quality Assurance & Pre-Commit Checklist

Before committing or pushing any changes, verify:
- [ ] `pnpm turbo run build` passes with **0 errors**.
- [ ] No single `.tsx` component exceeds **350 lines**.
- [ ] All new calculations are added to `@wefes/wefes-engine`.
- [ ] Microservice endpoints are registered in `apps/api/src/gateway/router.ts`.
- [ ] TypeScript strict mode passes with 0 diagnostics.
