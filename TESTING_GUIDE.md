# WEFES Nexus Testing & Quality Assurance Guide

This guide details the test suites, validation commands, and regression test protocols for the **WEFES Nexus Gulmi** platform.

---

## 1. Test Suite Architecture

```
tests/
├── unit/                          # Unit tests for mathematical calculation engines
│   ├── penmanMonteith.test.ts     # FAO-56 reference evapotranspiration ET0
│   ├── queftsFertilizer.test.ts   # QUEFTS nutrient prescription & balanced uptake
│   ├── dcfBioeconomy.test.ts      # 15-Year Discounted Cash Flow & NPV/EIRR
│   ├── entericLivestock.test.ts   # IPCC Tier-2 Dairy Methane & Manure Slurry
│   └── nexus5Pillar.test.ts       # 5-Pillar Score Normalization & WEFES Composite
│
├── integration/                   # API Gateway & Microservice Route Tests
│   ├── healthGateway.test.ts      # Gateway health check & service discovery
│   ├── gisRoutes.test.ts          # Palikas GeoJSON & 39-year climate series
│   ├── agronomyRoutes.test.ts     # Crop catalog & suitability scoring
│   └── nexusRoutes.test.ts        # POST /api/v1/nexus/calculate & /simulate
│
└── e2e/                           # End-to-End browser flow tests
    └── simulatorFlow.test.ts      # User scenario simulation & dossier export
```

---

## 2. Running Test Commands

### 1. Build Verification
```bash
pnpm turbo run build
```
Validates full TypeScript typing, bundle creation, and `.d.ts` declaration generation across all 5 workspace packages.

### 2. Microservice API Health Test
```bash
# Verify API Gateway endpoints
node -e "
const http = require('http');
['/health', '/api/v1/gis/palikas', '/api/v1/agronomy/crops', '/api/v1/energy/hydropower'].forEach(path => {
  http.get('http://localhost:3001' + path, res => {
    console.log(path, '=> Status:', res.statusCode);
  });
});
"
```

---

## 3. Mathematical Formula Acceptance Criteria

All engines in `@wefes/wefes-engine` must adhere to verified physical bounds:

1. **FAO-56 Evapotranspiration**:
   - $ET_0 \in [1.2, 8.5]$ mm/day across Mid-Hills elevation gradients (450m – 2,690m).
2. **5-Pillar Normalized Scores**:
   - Each pillar score $\in [0, 100]$.
   - Composite Nexus Balance Index $\in [0, 100]$.
3. **QUEFTS Fertilizer Prescriptions**:
   - NPK kg/ha recommendations must be non-negative and bounded by agronomic physiological maximums for the target crop.
4. **DCF Financial Metrics**:
   - Economic Internal Rate of Return (EIRR) must converge; Benefit-Cost Ratio (BCR) $> 0$.
