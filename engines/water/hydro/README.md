# WEFE Hydropower Assessment Pipeline (Python & QGIS)

Modular geospatial and hydrologic modeling engine for district-scale run-of-river and micro-hydropower potential assessment, tailored for Nepal's mountainous topography and Department of Electricity Development (DOED) regulatory standards.

---

## Directory Architecture

```
engines/hydro/
├── cli.py                   # Master CLI entry point
├── README.md                # Documentation & QGIS replication guide
├── RULES.md                 # Engineering & mathematical rules
├── pyproject.toml           # Python package configuration
└── src/                     # Modular calculation engine
    ├── __init__.py          # Clean public interface
    ├── step1_topography.py   # Barnes et al. Priority-Flood, D8 flow, and 500m reach tracing
    ├── step2_hydrology.py    # WECS/NEA empirical model & DHM Station 430 gauge scaling
    ├── step3_constraints.py  # DOED 10% statutory E-flow & design flow allocation
    ├── step4_energy.py       # Hydraulic net head, installed capacity (kW), and 12-month energy (MWh)
    ├── step5_screening.py    # Palika boundary clipping, 50% border river sharing, slope filter
    └── step6_verification.py # AEPC / DOED ground-truth benchmarking & GeoJSON export
```

---

## Quick Start

Run the engine from the project root:

```bash
python3 engines/hydro/cli.py --district Gulmi --output-dir data/calculated/hydro_reaches
```

Or run standalone help:

```bash
python3 engines/hydro/cli.py --help
```

---

## Pipeline Workflow & Mathematical Foundations

### Step 1: Topographic Modeling (`src/step1_topography.py`)
- **Conditioning**: Priority-Flood algorithm (Barnes et al., 2014) to fill spurious sinks while preserving real valleys.
- **Routing**: Deterministic 8-neighbor (D8) steepest-slope direction coding.
- **Catchment Area**: Topological sort (Kahn's in-degree algorithm) calculating upstream accumulation in km².
- **Reach Extraction**: Continuously traces downstream reaches at target 500m intervals, sampling upstream elevation ($Z_u$), downstream elevation ($Z_d$), gross head ($H_{\text{gross}} = Z_u - Z_d$), and bed slope.

### Step 2: Hydrology & Flow Duration (`src/step2_hydrology.py`)
- **Method A (Tributaries $< 200\text{ km}^2$)**: WECS/NEA (1997) & MIP Regional Hydrology Method:
  $$Q_{\text{mean}} = 0.024 \cdot A^{0.98} \cdot \left(\frac{\text{MWI}}{1000}\right)^{1.10}$$
  $$Q_{40} = 0.0165 \cdot A^{0.99} \cdot \left(\frac{\text{MWI}}{1000}\right)^{1.05}$$
  $$Q_{65} = 0.0088 \cdot A^{1.01} \cdot \left(\frac{\text{MWI}}{1000}\right)^{0.95}$$
  With Gulmi Monsoon Wetness Index $\text{MWI} = 1,600\text{ mm}$.
- **Method B (Major Stems $\ge 200\text{ km}^2$)**: Gauge-transfer scaling from DHM Station 430 (Badigad at Rudrabeni, $A = 2,140\text{ km}^2$, $Q_{\text{mean}} = 68.5\text{ m}^3/\text{s}$):
  $$Q_{\text{reach}} = Q_{\text{gauge}} \cdot \left(\frac{A_{\text{reach}}}{A_{\text{gauge}}}\right)^{0.85}$$

### Step 3: Environmental Constraints (`src/step3_constraints.py`)
- **Statutory E-flow ($Q_{\text{env}}$)**: By Nepal DOED policy, at least 10% of the minimum lean monthly dry-season flow must remain in the natural riverbed:
  $$Q_{\text{env}} = 0.10 \times \min(Q_{\text{jan}} \dots Q_{\text{dec}})$$
  $$Q_{\text{net}} = \max(0, Q_{\text{design}} - Q_{\text{env}})$$
- **Scale Exceedance ($Q_{\text{design}}$)**:
  - Commercial RoR ($\ge 10\text{ km}^2$): $Q_{40}$ (wet-season peak grid export, $\eta = 0.82$).
  - Rural Micro-Hydro ($< 10\text{ km}^2$): $Q_{65}$ (reliable dry-season base load, $\eta = 0.65$).

### Step 4: Power & Energy Yield (`src/step4_energy.py`)
- **Net Head**: Accounts for 10% hydraulic losses: $H_{\text{net}} = 0.90 \times H_{\text{gross}}$.
- **Installed Capacity**:
  $$P_{\text{inst}} (\text{kW}) = 9.81 \cdot \eta \cdot Q_{\text{net}} \cdot H_{\text{net}}$$
- **12-Month Energy Simulation**: Simulates monthly power output and integrates operating hours for dry season (Dec–May) and wet season (Jun–Nov).

### Step 5: Spatial Screening & Apportionment (`src/step5_screening.py`)
- Clips reaches to Gulmi's 12 local municipal boundaries (Palikas).
- Apportions border rivers (Kaligandaki, Badigad) with a 50% capacity factor.
- Enforces strict viability criteria ($P \ge 5\text{ kW}$, slope $\ge 2\%$, head $\ge 5\text{ m}$).
- Applies a 1.5 km cultural exclusion buffer around sacred pilgrimage sites (Ridi Dham confluence).

### Step 6: Ground-Truth Verification (`src/step6_verification.py`)
- Cross-references results against registered AEPC installations (Chhaldi Khola, Panaha Khola, Huldi Khola, Darling Khola) and DOED commercial licenses (Upper Hugdi 5 MW, Badigad cascade).
- Exports:
  - `reaches_screened.csv`: Tabular dataset of all viable reaches with full hydrologic, head, and energy attributes.
  - `hydro_palika_summary.json`: Local-level summary for the 12 Palikas.
  - `hydro_reaches.geojson`: LineString features ready for Web GIS or QGIS visualization.

---

## Desktop QGIS Replication Reference

| Pipeline Step | Desktop QGIS Tool / Menu |
|---|---|
| **Fill Depressions** | Processing Toolbox $\to$ Whitebox Tools $\to$ *Fill Depressions* (or SAGA *Fill Sinks (Wang & Liu)*) |
| **Flow Direction & Accumulation** | Processing Toolbox $\to$ Whitebox Tools $\to$ *D8 Flow Accumulation* |
| **Stream Raster Extraction** | Raster Calculator $\to$ `("accumulation@1" >= 555)` |
| **Reach Vectorization** | Processing Toolbox $\to$ *Stream To Feature* $\to$ *Split lines by maximum length* (500 m) |
| **Elevation Sampling** | Processing Toolbox $\to$ *Sample raster values* (sample DEM at start and end vertices) |
| **Attribute Calculations** | Layer Attribute Table $\to$ Field Calculator (`Ctrl + E` / `Cmd + E`) applying formulas above |
| **Spatial Clipping & Joins** | Vector $\to$ Geoprocessing Tools $\to$ *Clip* / *Join Attributes by Location* |
