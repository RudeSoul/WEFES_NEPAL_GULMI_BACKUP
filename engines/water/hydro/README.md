# WEFE Hydropower Potential Assessment Engine

Modular, district-agnostic geospatial and hydrological modeling engine for river reach delineation and hydropower potential assessment. Built with verified priority-flood algorithms, topological stream networks, and international hydropower standards (BHA / IHA).

---

## Directory Architecture

```
engines/water/hydro/
├── cli.py                         # Master CLI entrypoint (--input-dem, --boundary, --threshold, etc.)
├── README.md                      # Documentation, scientific citations & multi-district guide
├── RULES.md                       # Compliance & architectural boundaries
├── pyproject.toml                 # Package dependencies (rasterio, scipy, geopandas, pyproj)
├── tests/                         # Automated unit test suite
│   └── test_hydro_engine.py       # Physics, DAG cycles, Net Head, and reprojection tests
└── src/                           # Modular calculation pipeline
    ├── __init__.py                # Clean public interface & run_hydro_pipeline
    ├── step1_dem_io.py            # [STEP 2 & 3] Load DEM, validate QA, & Dirichlet-Laplace void smoothing
    ├── step2_depression_filling.py# [STEP 4] Priority-Flood Depression Filling (Wang & Liu, 2006)
    ├── step3_flow_routing.py      # [STEP 5 & 6] D8 Flow Direction & Acyclic DAG Accumulation
    ├── step4_stream_network.py    # [STEP 7 & 8] Stream Extraction & Curvilinear Path Distance Tracing
    ├── step5_power_calculation.py # [STEP 9] Net Head BHA/IHA Hydropower Potential & Palika Attribution
    └── step6_export.py            # [STEP 10] RFC 7946 WGS84 GeoJSON & Summary CSV Exporter
```

---

## The 10 Pipeline Steps & Scientific Citations

| Step    | Operation                      | Source Algorithm / SAGA Lineage               | Scientific Citation & Physics                                                                                                                                                         |
| ------- | ------------------------------ | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**   | **Component Integration**      | SAGA Parameter System (`saga_cmd`)            | CLI parser with input validation, non-Gulmi fallback guards, and step logging                                                                                                         |
| **2**   | **Load DEM & QA Validation**   | `rasterio` & Single-Band Validation           | Dimensions, bounds, affine transform, elevation range checks, and metric resolution calibration ($dx, dy$ in meters)                                                                  |
| **3**   | **Handle NoData**              | SAGA `CGrid_Gaps` / Discrete Laplace Solver   | Iterative Dirichlet-Laplace boundary smoothing solving discrete $\nabla^2 Z = 0$ over void masks initialized with Euclidean distance transform                                        |
| **4**   | **Fill Sinks & Depressions**   | Priority-Flood Least-Cost Path                | **Wang, L., and Liu, H. (2006)**. _"An efficient method for identifying and filling depressions in digital elevation models."_ Int. J. of GIS. (Independent Python implementation)    |
| **5**   | **D8 Flow Direction**          | Steepest Descent                              | **O'Callaghan, J. F., and Mark, D. M. (1984)**. _"The extraction of drainage networks from digital elevation models."_ Computer Vision, Graphics, and Image Processing.               |
| **6**   | **Flow Accumulation & DAG QA** | Topological In-Degree Sort (Kahn's Algorithm) | **Tarboton, D. G., et al. (1991)**. _"On the extraction of channel networks from digital elevation data."_ Hydrological Processes. Enforces 0 topological cycles (acyclic DAG).       |
| **7**   | **Extract Streams**            | Channel Initiation Threshold                  | **Jenson, S. K., and Dominique, J. O. (1988)**. _"Extracting topographic structure from digital elevation model data for geographic information system analysis."_ PE&RS.             |
| **8**   | **Curvilinear Reach Tracing**  | Continuous Topologic Graph Segmentation       | Traces reach corridors by accumulating actual curvilinear Euclidean path distance ($\ge 500\text{ m}$); extracts Upstream $(X_u, Y_u, Z_u)$ & Downstream $(X_d, Y_d, Z_d)$ nodes      |
| **9**   | **Calculate Power Output**     | BHA / IHA Hydropower Standard (Net Head)      | **BHA / IHA Guidelines**: $P (\text{kW}) = 9.81 \cdot Q_{\text{turb}} \cdot H_{\text{net}} \cdot \eta$ ($H_{\text{net}} = H_{\text{gross}} \cdot 0.90, \eta = 0.70$)                  |
| **9.1** | **Boundary Clip & Viability**  | Spatial Join & Capacity Screening             | **Administrative Clipping**: Uses `geopandas` & `shapely.prepared` (`covers()`) to clip out-of-district reaches, assign Palikas, and screen sub-viable trickles ($P \ge 5\text{ kW}$) |
| **10**  | **Output Generation**          | RFC 7946 Vector & Tabular Export              | Standard GeoJSON `LineString` format with coordinates reprojected to WGS84 (`EPSG:4326`), CSV summary, and QA audit report                                                            |

---

## Scientific & Hydrological Disclosures

1. **Gross Theoretical Reach Potential (GTRP) vs Independent Developable Projects:**
   - Consecutive stream reaches (e.g. Reach $A \to B \to C$) along the same river trunk share and compete for the same discharge.
   - Aggregate district potential is a **theoretical ceiling of available kinetic energy**, NOT the sum of mutually exclusive or independent cascade projects.
2. **Hydrological Drainage vs Administrative Boundaries:**
   - River catchments do not stop at district boundaries. Streams entering Gulmi from Baglung or Parbat have upstream contributing areas extending beyond the district border.
   - Reaches are clipped based on administrative location inside the district, while contributing drainage area is computed across natural topography.
3. **Net Head Formulation ($H\_{\text{net}}$):**
   - The engine accounts for friction and hydraulic losses in penstocks and intake trash racks ($H_{\text{net}} = H_{\text{gross}} \cdot \text{head\_loss\_factor}$, default $0.90$).
4. **Environmental Flow Reserve ($Q\_{\text{env}}$):**
   - In accordance with Nepal National Hydropower Policy, an environmental reserve fraction ($10\%$) is reserved in the riverbed ($Q_{\text{turb}} = Q_{\text{gross}} \cdot (1 - \text{env\_flow\_fraction})$).
5. **Specific Discharge ($Q\_{\text{spec}}$):**
   - Parameterized in $\text{m}^3/(\text{s}\cdot\text{km}^2)$ (default: $0.032$). Discharge is evaluated at the downstream endpoint of each reach segment.
6. **Screening Capacity Factor:**
   - Annual generation ($GWh/\text{yr}$) is a screening estimate based on an assumed capacity factor ($CF = 0.60$), not a continuous flow-duration curve (FDC) hydrograph simulation.

---

## How to Run for Any Other District (100% Reusable)

This engine is completely terrain, coordinate, and district agnostic. It can be run on any district in Nepal or worldwide without altering source code.

### ⚠️ Mandatory Requirement When Adding a New District: Always Provide the Boundary

When evaluating any new district, you **must provide both the DEM raster (`--input-dem`) AND the administrative boundary vector (`--boundary`)**.

**Why the Boundary is Required:**

1. **Satellite Footprint Multi-District Coverage:** Satellite DEM GeoTIFFs (SRTM, ALOS PALSAR, Copernicus 30m) are rectangular scenes covering 5,000–10,000 km² across multiple adjacent districts. For example, the Gulmi DEM tile covers 6,942 km² across 7 districts (Gulmi, Baglung, Parbat, Syangja, Palpa, Arghakhanchi, Pyuthan). Gulmi itself is only 1,149 km² (~16.5% of the scene).
2. **Preventing Regional Reach Inflation:** Without `--boundary`, the algorithm delineates stream networks across all 7 districts (15,000+ reaches). Providing `--boundary` restricts delineation strictly to the target district.
3. **Local Palika Attribution:** The engine performs a spatial test against the boundary features, tagging every reach with its exact local municipality (Palika).
4. **Zero Fallback Protection:** The CLI strictly refuses to substitute Gulmi's DEM when another district is specified.

---

### Example Commands

#### 1. Gulmi District (Default)

```bash
python3 engines/water/hydro/cli.py --district Gulmi --threshold 500 --min-power-kw 5.0
```

#### 2. Baglung District (Steep Mountain Heads)

```bash
python3 engines/water/hydro/cli.py \
    --input-dem /path/to/baglung_dem_30m.tif \
    --boundary /path/to/baglung-palikas.json \
    --district Baglung \
    --threshold 300 \
    --specific-discharge 0.038 \
    --min-power-kw 5.0 \
    --output output/baglung_hydro_reaches.geojson
```

#### 3. Mustang District (Arid Trans-Himalayan Region)

```bash
python3 engines/water/hydro/cli.py \
    --input-dem /path/to/mustang_dem_30m.tif \
    --boundary /path/to/mustang-palikas.json \
    --district Mustang \
    --threshold 600 \
    --specific-discharge 0.015 \
    --min-power-kw 5.0 \
    --output output/mustang_hydro_reaches.geojson
```

---

## Key CLI Options

| Argument               | Type    | Default       | Description                                                                    |
| ---------------------- | ------- | ------------- | ------------------------------------------------------------------------------ |
| `--input-dem`          | String  | Auto-resolved | Path to input DEM GeoTIFF                                                      |
| `--boundary`           | String  | Auto-resolved | Path to district administrative boundary vector (GeoJSON/Shapefile)            |
| `--district`           | String  | `"Gulmi"`     | Target district name for metadata attribution                                  |
| `--threshold`          | Integer | `500`         | Stream initiation flow accumulation threshold in cells                         |
| `--min-power-kw`       | Float   | `5.0`         | Minimum capacity threshold in kW to filter sub-viable trickles                 |
| `--specific-discharge` | Float   | `0.032`       | Localized specific discharge in $\text{m}^3/(\text{s}\cdot\text{km}^2)$        |
| `--efficiency`         | Float   | `0.70`        | Total electromechanical efficiency $\eta$ (BHA/IHA Standard)                   |
| `--head-loss-factor`   | Float   | `0.90`        | Head loss preservation factor ($H_{\text{net}} = H_{\text{gross}} \cdot 0.90$) |
| `--capacity-factor`    | Float   | `0.60`        | Screening plant capacity factor for annual energy estimation                   |
| `--env-flow-fraction`  | Float   | `0.10`        | Environmental reserve fraction ($10\%$ standard per Nepal Hydropower Policy)   |
| `--reach-len`          | Float   | `500.0`       | Target reach segmentation interval in curvilinear path meters                  |
| `--min-slope`          | Float   | `0.01`        | Minimum downward slope in degrees preserved during sink filling                |
| `--allow-unbounded`    | Flag    | `False`       | Allow full-scene delineation without administrative clipping                   |
| `--output`             | String  | Auto-resolved | Target GeoJSON destination file path (RFC 7946, EPSG:4326)                     |
| `--output-csv`         | String  | Auto-resolved | Target CSV summary destination file path                                       |

---

## Verification & Automated Tests

To execute the unit tests covering DAG acyclicity, sink filling, Dirichlet-Laplace smoothing, and hydraulic power equations:

```bash
python3 engines/water/hydro/tests/test_hydro_engine.py
```
