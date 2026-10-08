## GULMI JI JINDABAAD

# WEFES NEXUS NEPAL (GULMI DISTRICT)

### Integrated Water-Energy-Food-Ecosystem-Society Spatial Decision Support System

[![Governance](https://img.shields.io/badge/Governance-8--Tier%20Gatekeeper%20Verified-emerald)](file:///scripts/verify_data_integrity.py)
[![Jurisdiction](https://img.shields.io/badge/Jurisdiction-Gulmi%20District%2C%20Lumbini%20Province%2C%20Nepal-blue)](#the-12-local-palikas-of-gulmi)
[![Evidence Hierarchy](https://img.shields.io/badge/Data%20Tier-Immutable%20Empirical%20Ground%20Truth-indigo)](#scientific-data-provenance--evidence-hierarchy)
[![Architecture](https://img.shields.io/badge/Monorepo-Turborepo%20%7C%20Polyglot%20Engines-slate)](#system-architecture)

---

## 1. Vision & Core Mission

### Why Gulmi District?

Gulmi District, nestled in the mid-hills of Lumbini Province, Nepal, exemplifies the acute ecological and developmental paradox of the central Himalayas. Characterized by steep topographic gradients (ranging from 400m river valleys to ridges exceeding 2,600m), fragile terraced slopes, and extreme precipitation seasonality (80% of rainfall concentrated in four monsoon months), Gulmi faces compound pressures:

- **Severe Post-Monsoon Water Deficits**: Despite receiving substantial annual precipitation, rapid hillside runoff and drying spring sources leave farmers with 6 to 8 months of critical crop water stress.
- **Siloed Sectoral Policies**: Historically, agricultural subsidies, rural electrification, water supply schemes, and forest conservation programs were planned in complete isolation, frequently causing resource competition, tariff inefficiency, and ecological degradation.
- **Youth Out-Migration & Land Abandonment**: Unreliable irrigation, volatile farmgate prices, and labor-intensive hill farming accelerate rural depopulation, threatening municipal food sovereignty and terrace maintenance.

### The WEFES Vision

**WEFES Nexus Nepal** is an open, scientifically rigorous, spatial Decision Support System (DSS) engineered to unify planning across the five critical pillars of sustainable mountain development: **Water, Energy, Food, Ecosystem, and Society**.

Instead of treating resources as separate administrative silos, this platform models the **physical couplings, ecological feedbacks, and economic trade-offs** between them. It empowers local municipal planners (Palikas), agricultural cooperatives, watershed managers, and provincial policymakers to make transparent, evidence-backed decisions:

1. **From Heuristics to Physics**: Eliminating arbitrary percentages and guesswork in favor of peer-reviewed biophysical equations (FAO-56, FAO-33, RUSLE, IPCC Tier 1/2, fluid mechanics).
2. **From Centralized Assumptions to Hyper-Local Resolution**: Grounded in 100m NARC soil grids, DHM hydrometric gauge records, SRTM topographic DEMs, and local administrative boundaries.
3. **From Fragility to Climate Resilience**: Enabling stress-testing of interventions (solar river-lift pumping, regenerative agroforestry, high-value crop transitions) under changing climate scenarios.

---

## 2. The Five Interlinked Pillars

```
                     ┌───────────────────────────────────┐
                     │          WEFES NEXUS NEPAL        │
                     │          (Gulmi District)         │
                     └─────────────────┬─────────────────┘
                                       │
        ┌──────────────┬───────────────┼───────────────┬──────────────┐
        ▼              ▼               ▼               ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌───────────┐    ┌─────────┐   ┌────────────┐
   │  WATER  │◄──►│ ENERGY  │◄──►│   FOOD    │◄──►│ECOSYSTEM│◄─►│  SOCIETY   │
   └─────────┘    └─────────┘    └───────────┘    └─────────┘   └────────────┘
    Hydrology,     Pumping,       Agronomic        Soil NPK,     Employment,
    DHM Gauges,    Solar PV,      Suitability,     Carbon Stock, Farm Margins,
    WEI+ Stress,   NEA Hydro,     Biomass Yield,   Erosion Loss, DAO Wages,
    River-Lift     Tariffs        Food Security    Terraces      Migration
```

### 💧 Water Pillar (Agro-Hydrology & Catchment Yield)

- **Reference Evapotranspiration ($ET_0$)**: Standardized FAO-56 Penman-Monteith formulation driven by net radiation, temperature, wind speed, and vapor pressure deficit.
- **Crop Water Consumption ($ET_c$)**: Single crop coefficient dynamics ($K_c \cdot ET_0$) across terrace rotations.
- **Sequential Soil Moisture Balance**: Root-zone water capacity ($TAW$, $RAW$), active depletion thresholds, deep aquifer percolation, and USDA SCS effective rainfall ($P_{\text{eff}}$).
- **Water Scarcity & Stress Metrics**:
  - _Crop Water Deficit_: Physiological transpiration stress ($ET_c - ET_a$).
  - _Catchment Stress_: FAO Water Exploitation Index ($\text{WEI}^+$ = Abstraction vs. renewable river/spring discharge calibrated with DHM gauge records).
- **Multi-Head River-Lift Irrigation**: Pumping hydro-mechanics across alluvial valleys (40m), mid-hill terraces (120m), and ridge settlements (220m).

### ⚡ Energy Pillar (Clean Energy Transition & Pumping Power)

- **Hydraulic Lift Power**: Governed by fundamental fluid mechanics ($P_{\text{hyd}} = \frac{\rho \cdot g \cdot Q \cdot H}{\eta_{\text{sys}}}$).
- **Multi-Energy Power Sources**:
  - _Off-Grid Solar PV_: Dimensioned via Global Solar Atlas GHI/PVOUT with seasonal tilt adjustments.
  - _NEA National Grid Hydro_: Grid capacity and statutory agricultural power tariffs (NPR 5.00/kWh).
  - _Hybrid Solar-Grid_: Dual power routing maximizing daytime direct solar pumping.
  - _Diesel Displacement Baseline_: Quantifying avoided fossil fuel expenditures and direct greenhouse gas emissions.

### 🌾 Food Pillar (Agro-Ecological Suitability & Biomass Yield)

- **Agro-Ecological Zoning (AEZ)**: NARC-calibrated crop thermal, elevation, rainfall, and slope suitability classes (S1 Highly Suitable to N Not Suitable).
- **Crop Yield Response to Water**: Governed by the FAO-33 water-yield relationship:
  $$1 - \frac{Y_a}{Y_m} = K_y \left(1 - \frac{ET_a}{ET_m}\right)$$
- **Terraced Land Typology**: Explicit delineation of irrigated lowland Khet land vs. rainfed sloped Bari land.
- **Nutritional & Caloric Density**: Realized harvestable biomass translated into nutritional caloric energy (kcal) and municipal food sovereignty indexes.

### 🌲 Ecosystem Pillar (Soil Health & Carbon Stocks)

- **100m Gridded Soil Geochemistry**: Ingested directly from NARC NSSRC high-resolution NetCDF grids (37,800+ cells across Gulmi) measuring Soil pH, Total Nitrogen (N), Available Phosphorus ($P_2O_5$), Available Potassium ($K_2O$), and Soil Organic Matter.
- **Slope Soil Loss & Terracing**: Revised Universal Soil Loss Equation (RUSLE) parameterized for steep Himalayan hillslopes.
- **Carbon Accounting**: IPCC 2006 Guidelines for National GHG Inventories (Volume 4 AFOLU) computing biomass stock changes ($\Delta C = C_t - C_{t-1}$) across agroforestry, community forestry, and crop roots.

### 👥 Society Pillar (Rural Livelihoods & Equity)

- **Farmgate Economic Return**: Net Revenue = Gross Market Value − Statutory Labor Costs − Energy Power Tariffs − Seed/Input Costs.
- **Statutory Wage Grounding**: Calibrated with District Administration Office (DAO) Gulmi official daily agricultural labor wage rates and Kalimati wholesale market price indices.
- **Labor & Employment Accounting**: Full-Time Equivalent (FTE) labor demand grounded in the standard agrarian benchmark of 250 person-days per FTE year.
- **Youth Retention & Cooperative Economy**: Modeling downstream employment in post-harvest sorting, coffee parchment drying, milling, and collective municipal marketing.

---

## 3. The 12 Local Government Palikas of Gulmi

The platform models all 12 local government bodies of Gulmi District independently, capturing their distinct topographic profiles, soil chemistry, river corridors, and cropping micro-climates:

| Palika Name      | Type               | Key Agricultural & Hydrological Profile                                                                                          |
| :--------------- | :----------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Resunga**      | Municipality       | District headquarters (Tamghas HQ, 1,450m), high ridge water divide, urban vegetable peri-agriculture, Badighat tributary heads. |
| **Musikot**      | Municipality       | Northern Badighat river corridor, high hydropower potential, extensive Khet valley irrigation, commercial cereal crops.          |
| **Isma**         | Rural Municipality | Sloped mid-hills, rainfed Bari land dominance, ginger and spice cultivation, seasonal spring vulnerability.                      |
| **Madane**       | Rural Municipality | High-altitude agroforestry zone, livestock dairy systems, cold-tolerant crops, source headwaters of local streams.               |
| **Malika**       | Rural Municipality | Rugged ridge topography, organic hill maize and millet, high potential for terrace soil conservation.                            |
| **Dhurkot**      | Rural Municipality | Historic terraced agriculture, citrus orange belts, intermediate catchment runoff zones.                                         |
| **Kaligandaki**  | Rural Municipality | Eastern border on the holy Kaligandaki River corridor, low-elevation alluvial plains, major river-lift potential.                |
| **Gulmi Durbar** | Rural Municipality | Historic hill ridge, commercial horticulture, solar irradiance harvesting potential, road-corridor logistics.                    |
| **Satyawati**    | Rural Municipality | Diverse agro-climatic range from Kaligandaki bank to high peaks, landslide risk-sensitive slopes, sub-tropical fruits.           |
| **Chandrakot**   | Rural Municipality | Agroforestry and specialty coffee zone, moderate elevation valleys, high river discharge availability.                           |
| **Rurukshetra**  | Rural Municipality | Ridi confluence, religious tourism and organic farming synergy, sacred Kaligandaki river water access.                           |
| **Chhatrakot**   | Rural Municipality | Leading organic coffee production hub, highland agroforestry, cooperative value-chain integration.                               |

---

## 4. Scientific Data Provenance & Evidence Hierarchy

To guarantee academic rigor and prevent algorithmic hallucination, every metric, equation, and parameter in this platform is governed by a strict **Four-Tier Evidence Framework**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │ TIER A: Peer-Reviewed International Standards                          │
 │         FAO-56 Penman-Monteith, FAO-33 Ky, RUSLE, IPCC 2006 AFOLU,     │
 │         Fundamental Fluid Mechanics (ISO 9906:2012)                    │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER B: Official Government & Versioned Empirical Datasets             │
 │         DHM Nepal Gauge Network, NSO Census of Agriculture 2021/22,    │
 │         NARC 100m Soil NetCDF Grid, Survey Department GeoJSON, NEA     │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER C: Declared Engineering Design Assumptions & Sensitivities        │
 │         Pump efficiency (η=0.65), Pipe friction head loss (+10%),      │
 │         Depletion fraction (p=0.50), Solar derate (0.85)               │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER D: Unprovenanced Magic Numbers / Fabricated Data                  │
 │         STRICT ZERO TOLERANCE — Blocked by Automated CI/CD Gatekeepers  │
 └────────────────────────────────────────────────────────────────────────┘
```

### Immutable Data Provenance Declaration

Every file in the codebase consuming or exposing analytical data declares an in-code provenance block:

```ts
// [DATA PROVENANCE]
// Data Source: FAO AquaCrop/WEI+, NARC AEZ Guidelines, IPCC Tier 1/2, RUSLE Soil Loss, CBS/DAO Nepal
// Classification: SCIENTIFIC FACTOR PROJECTIONS & SCENARIO SIMULATION
// Citations: FAO (1998, 2012), NARC Nepal, DHM Gauge Network, CBS Agriculture Census 2021/22, NEA Tariffs
```

---

## 5. System Architecture

WEFES is architected as an ultra-responsive, decoupled monorepo managed by **Turborepo** and **pnpm**:

```
WEFES_NEXUS_NEPAL_GULMI/
├── apps/
│   ├── web/                    # React 18 + Vite + Leaflet + Tailwind CSS Spatial Frontend
│   └── api/                    # Node.js / Express API Gateway & GeoJSON Tile Endpoints
├── engines/
│   ├── nexus/                  # Autonomous Headless Multi-Pillar WEFES Nexus Calculation Engine
│   └── water/hydro/            # Standalone Python / NumPy Topographic Drainage & Hydrology Engine
├── packages/
│   ├── shared-types/           # Shared TypeScript Domain Interfaces & Legend Contracts
│   ├── database/               # Prisma ORM Schema & Geographic Entity Models
│   └── config/                 # Base TypeScript & Tooling Configurations
├── data/
│   ├── real/                   # IMMUTABLE Read-Only Official Datasets (DHM, NARC, NSO, Survey Dept)
│   └── calculated/             # Pre-Processed Geospatial Indicators & Derived Palika Matrices
├── docs/                       # Technical Validation Pre-Audit Dossiers & Mathematical Guides
└── scripts/
    └── verify_data_integrity.py# 8-Tier Automated Governance Pre-Commit Gatekeeper
```

### 3-Tier Anti-Lag Lazy-Loading Lifecycle

To guarantee silky-smooth 60fps performance on standard municipal laptop hardware without map stutter:

1. **Tier 1 (Base Viewport Mount)**: Loads only the district boundary polygon, 12 Palika polygons, primary roads, and DHM weather stations (<500 KB total).
2. **Tier 2 (On-Demand Vector & Raster Overlays)**: Heavy vector assets (`hydro_potential_reaches.geojson` ~5MB, river networks, 30m DEM contours) and GeoTIFF rasters load **only** when their respective pillar subfilter is explicitly activated.
3. **Tier 3 (Route-Specific Municipal Profiles)**: Detailed Palika agronomic matrices (`gulmi_palika_agro_hydrology.json`) load exclusively on `/palikas/:palikaName` routes.

---

## 6. Automated Platform Governance (8-Tier Gatekeeper)

Compliance with scientific rigor is enforced not through manual code reviews alone, but through an **automated pre-commit gatekeeper script** (`scripts/verify_data_integrity.py`):

```bash
==================================================================
 🛡️  WEFES NEXUS NEPAL: 8-TIER AUTOMATED GOVERNANCE GATEKEEPER
==================================================================
 [Rule 1] ✅ Zero-Synthesis in data/real/ (empirical tier clean)
 [Rule 2] ✅ In-Code [DATA PROVENANCE] Declaration (all consumers declare lineage)
 [Rule 3] ✅ Physical Disk Verification (all cited paths exist on disk)
 [Rule 4] ✅ Headless Engine Isolation (zero inward imports into engines/)
 [Rule 5] ✅ Zero Hardcoding (zero dummy palika dictionaries in UI components)
 [Rule 6] ✅ Git Hygiene & Branch Protection (protected main branch)
 [Rule 7] ✅ Numerical Invariants & Mass Balance (12 palikas verified closure)
 [Rule 8] ✅ Decoupled Data Hygiene & Universal Client (zero bypassed fetches)
==================================================================
 🚀 ALL 8 PLATFORM RULES VERIFIED — COMMIT PERMITTED
==================================================================
```

---

## 7. Getting Started & Development

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm**: v9.0.0 or higher
- **Python**: v3.10 or higher (for hydro engine and data verification tools)

### Installation

```bash
# Clone the repository
git clone git@github.com:Stable-Steps/WEFES_NEPAL_GULMI.git
cd WEFES_NEPAL_GULMI

# Install monorepo dependencies
pnpm install
```

### Local Development Server

```bash
# Run all workspace applications concurrently
pnpm dev

# Or run the web client standalone
pnpm --filter @wefes/web dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the interactive spatial dashboard.

### Testing & Verification

```bash
# Run unit & mathematical integration tests across all packages
pnpm test

# Verify all 8 platform data governance rules
pnpm check:data

# Type check all TypeScript workspaces
pnpm --filter @wefes/web typecheck
```

---

## 8. License & Institutional Context

Developed for **Gulmi District, Lumbini Province, Nepal** to support local government agro-ecological planning, climate adaptation investment, and municipal water-energy resource stewardship.

> _"Scientific truth and data integrity are not afterthoughts — they are the foundational prerequisites for sustainable mountain futures."_
