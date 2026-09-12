# Rules for Applications (`apps/RULES.md`)

## 1. Zero Hardcoded Constants
- Domain indicators, centroids, and crop parameters MUST be loaded from `data/` or API contracts.
- Hardcoded numerical arrays in UI components are strictly prohibited.

## 2. In-Code Data Citations
- Any component, hook, or service reading local JSON/CSV data must include an explicit `// [DATA PROVENANCE]` comment citing the source file path and collection agency.

## 3. Dynamic Legends
- Map legends must use `<DynamicLegend />` powered by `SUBFILTER_LEGENDS` from `@wefes/shared-types`.
- Arbitrary static tier blocks (e.g. legacy 6 tiers) are prohibited.

## 4. Frontend-Backend Boundary
- `apps/web` must communicate with computational engines through `apps/api` endpoints or static pre-calculated artifacts in `data/calculated/`.
