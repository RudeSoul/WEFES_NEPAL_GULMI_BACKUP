# WEFES Nexus Nepal — System Architecture & Technical Specification

> **Platform Version:** v0.0.1 Decision Support System  
> **Target Region:** Federal Democratic Republic of Nepal (77 Districts, 7 Provinces, 3 Ecological Zones)  
> **Architecture Pattern:** Monorepo Decoupled GIS & Simulation Engine  

---

## 1. Monorepo Structure & Data Flow

The repository is structured as a Turborepo monorepo to ensure strict mathematical and data decoupling:

```text
/wefes-nexus-nepal
├── apps/
│   ├── web/                    # Next.js / Vite + React 18, Leaflet, Recharts, Zustand, Tailwind
│   └── api/                    # NestJS Backend (REST/GraphQL) - PostGIS Spatial Queries
├── packages/
│   ├── database/               # Data access layer & seed loading (@wefes/database)
│   ├── shared-types/           # TypeScript interfaces & Zod validation schemas (@wefes/shared-types)
│   ├── wefes-engine/           # Core mathematical modeling & simulation engine (@wefes/wefes-engine)
│   └── config/                 # Shared tsconfig, ESLint, and build configurations
├── data/
│   ├── geojson/                # Official 77-District Nepal Boundary GeoJSONs
│   │   ├── nepal-districts.json
│   │   └── nepal-districts-enriched.json
│   ├── districts/              # Per-district baseline JSON datasets (Mustang, Kaski, Jhapa, etc.)
│   ├── vegetation/             # Crop suitability matrices, water footprints & yield rates
│   │   └── crops.json
│   └── formulas/               # Formula coefficients & 10-year projection parameters
│       └── coefficients.json
└── docs/
    └── WEFES_SYSTEM_ARCHITECTURE.md
```

### Data Decoupling Architecture
- **UI Components:** Completely free of hardcoded mathematical logic or raw constants.
- **Engine Package (`@wefes/wefes-engine`):** Contains pure, testable functions for 5-pillar calculations (`calculateHarvestImpact`), suitability scoring (`computeCropSuitability`), and 16-parameter scenario simulations (`simulateScenario`).
- **Data Repository (`/data/`):** Universal JSON source of truth.

---

## 2. Mathematical Modeling Engine

### 2.1 Water Pillar Equations
1. **Water Footprint Consumption:**
   $$W_{\text{liters}} = Q_{\text{base}} \times WF_{\text{crop}}$$
   $$W_{m^3} = \frac{W_{\text{liters}}}{1000}$$
2. **District Rainfall Factor:**
   $$R_{\text{factor}} = \max\left(0.5, \frac{\text{Rainfall}_{\text{district}}}{1500}\right)$$
3. **Severe Water Stress Index ($0 \le S_w \le 100$):**
   $$S_w = \min\left(100, \max\left(5, \text{round}\left(\frac{W_{m^3}}{R_{\text{factor}} \times 50} \times 15\right)\right)\right)$$

### 2.2 Energy Pillar Equations
1. **Total Load Requirements:**
   $$E_{\text{kWh}} = Q_{\text{base}} \times ER_{\text{crop}}, \quad E_{\text{MJ}} = E_{\text{kWh}} \times 3.6$$
2. **Renewable Share & Grid Split:**
   $$S_{\text{renew}} = \min\left(0.8, 0.25 + (\text{Solar}_{\text{kWh/m}^2} - 4.0) \times 0.1\right)$$
   $$E_{\text{renewable}} = E_{\text{kWh}} \times S_{\text{renew}}, \quad E_{\text{grid}} = E_{\text{kWh}} - E_{\text{renewable}}$$

### 2.3 Food & Yield Pillar Equations
1. **Yield Biomass:**
   $$Y_{\text{kg}} = \begin{cases} Q_{\text{base}} & \text{if unit = kg} \\ Q_{\text{base}} \times 650 & \text{if unit = } m^3 \text{ (Timber)} \end{cases}$$
2. **Food Security Index ($0 \le F_s \le 100$):**
   $$F_s = \min\left(100, \max\left(10, \text{round}\left(\frac{\text{Kcal}}{100,000} \times 20 + \frac{Y_{\text{kg}}}{500} \times 15 + 30\right)\right)\right)$$

### 2.4 Ecosystem Pillar Equations
1. **Carbon Offset:**
   $$C_{\text{offset}} = Q_{\text{base}} \times CO_{\text{crop}}$$
2. **Eco Health Score ($0 \le H_e \le 100$):**
   $$H_e = \min\left(100, \max\left(15, \text{round}\left(\frac{C_{\text{offset}}}{\max(1, Q_{\text{base}})} \times 12 + I_{\text{erosion}} \times 0.6\right)\right)\right)$$

### 2.5 Socioeconomics Pillar Equations
1. **Gross Revenue:**
   $$R_{\text{gross}} = Q_{\text{base}} \times V_{\text{market}}$$
2. **Labor & Energy Cost:**
   $$C_{\text{labor}} = D_{\text{labor}} \times L_{\text{rate}}, \quad C_{\text{energy}} = E_{\text{kWh}} \times 10.5 \text{ NPR}$$
3. **Net Economic Return:**
   $$R_{\text{net}} = \max\left(0, R_{\text{gross}} - C_{\text{labor}} - C_{\text{energy}}\right)$$
4. **Jobs Created (Direct FTE):**
   $$J_{\text{direct}} = \frac{D_{\text{labor}}}{250}, \quad J_{\text{indirect}} = J_{\text{direct}} \times 0.5$$

### 2.6 Composite Nexus Balance Index
$$NBI = \min\left(100, \max\left(10, \text{round}\left(\left(\frac{F_s + H_e}{2}\right) \times 0.45 + \left(\frac{R_{\text{net}}}{\max(1, R_{\text{gross}})} \times 100\right) \times 0.35 - (S_w \times 0.3 + \text{Fossil}_{\%} \times 0.2) + 20\right)\right)\right)$$

---

## 3. GIS Coordinate Mapping & Sub-District Feasibility Matrix

### GeoJSON Spatial Encoding
- Features map 1-to-1 with 77 Nepal administrative district IDs (e.g., `mustang`, `kaski`, `jhapa`, `humla`).
- Feature properties contain baseline eco-environmental attributes:
  ```json
  {
    "id": "mustang",
    "name": "Mustang",
    "nepaliName": "मुस्ताङ",
    "province": "Gandaki Province",
    "ecoZone": "Mountain",
    "avgRainfallMm": 350,
    "solarRadiationKwh": 6.8,
    "baseSoilPh": 7.4,
    "laborRateNprPerDay": 1200
  }
  ```

### Multi-Criteria Zonal Scoring
The sub-district feasibility score ($0 \le S_{\text{zone}} \le 100$) is computed across 5 environmental dimensions:
$$\text{Soil Score} = \min\left(100, \max\left(10, 100 - |\text{Soil}_{\text{pH}} - 6.2| \times 20\right)\right)$$
$$\text{Climate Score} = f(\text{EcoZone}, \text{CropType})$$
$$\text{Hydro Score} = \min\left(100, \text{round}\left(\frac{\text{Rainfall}}{2500} \times 80 + 20\right)\right)$$
$$\text{Slope Score} = \begin{cases} 90 & \text{Terai (Flat)} \\ 70 & \text{Hill (Moderate)} \\ 50 & \text{Mountain (Steep)} \end{cases}$$

---

## 4. Scenario Simulation Engine (16 Levers)

The simulator evaluates 16 real-world environmental, technological, agronomic, and policy variables:

| Group | Parameter Key | Range | Default | Impact Target |
|---|---|---|---|---|
| **Climate & Water** | `rainfallVariation` | -30% to +30% | 0% | Water Stress, Yield |
| | `monsoonShift` | -30% to +30% | 0% | Water Stress Index |
| | `droughtFrequency` | 1.0x to 3.0x | 1.0x | Crop Yield Penalty |
| | `glacierFlowVariation` | -40% to +40% | 0% | River Water Access |
| | `groundwaterLimit` | 500 to 5000 m³ | 2,500 m³ | Water Stress Penalty |
| **Energy System** | `renewableEnergyShare` | 0% to 100% | 30% | Fossil Energy Share |
| | `solarIrrigationAdoption` | 0% to 100% | 20% | Water & Energy Savings |
| | `microHydroAccess` | 0% to 100% | 15% | Clean Energy Boost |
| | `dieselDependency` | 0% to 100% | 10% | Energy Emissions |
| | `gridTariffNpr` | 5 to 25 NPR | 10.5 NPR | Energy Operating Cost |
| **Agronomy & Eco** | `regenerativeFarmingAdoption` | 0% to 100% | 10% | Yield, Carbon, Eco Health |
| | `bioFertilizerRatio` | 0% to 100% | 15% | Biomass Yield Boost |
| | `erosionBarrierRate` | 0% to 100% | 20% | Erosion Mitigation |
| | `deforestationRate` | 0% to 20% | 2% | Carbon Offset Penalty |
| **Socio & Market** | `marketPriceFluctuation` | -50% to +100% | 0% | Gross Revenue |
| | `laborRemittanceRate` | -30% to +30% | 0% | Labor Cost & Job FTE |
| | `transportInfraIndex` | 10 to 100 | 50 | Supply Chain Yield |
| | `exportTaxSubsidyRate` | -20% to +50% | 0% | Net Economic Revenue |

---

## 5. Guidelines for Updating `/data/` and Scaling Formulas

### Adding a New Crop
1. Open `/data/vegetation/crops.json`.
2. Add a new JSON object following the schema:
   ```json
   {
     "id": "buckwheat",
     "name": "Himalayan Buckwheat",
     "nepaliName": "फापर",
     "category": "High-Altitude Grain",
     "supportedUnits": ["kg", "metric_ton", "bag"],
     "defaultUnit": "kg",
     "baseUnitName": "kg",
     "baseUnitMultiplier": { "kg": 1, "metric_ton": 1000, "bag": 50 },
     "waterFootprintPerUnit": 450,
     "energyReqPerUnit": 0.4,
     "carbonOffsetPerUnit": 1.8,
     "marketValuePerUnit": 120,
     "laborDaysPerUnit": 0.08,
     "caloriesPerUnit": 3430,
     "idealSoilPh": { "min": 6.0, "max": 7.2 },
     "idealEcoZone": ["Mountain", "Hill"]
   }
   ```
3. Update `packages/database/src/seed.ts` if adding to the database seed layer.

### Modifying Calculation Coefficients
- Edit `/data/formulas/coefficients.json`.
- Modify weights under `nexusBalanceIndex`, `waterPillar`, or `projection10Year`.
- Re-run workspace tests to verify equation stability:
  ```bash
  pnpm test
  ```
