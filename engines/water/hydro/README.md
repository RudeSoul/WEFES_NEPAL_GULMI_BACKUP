# WEFE Hydropower Assessment Pipeline (SAGA GIS Algorithms)

Modular, district-agnostic geospatial and hydrological modeling engine for river reach delineation and hydropower potential assessment. Built with exact algorithmic lineages from **SAGA GIS (System for Automated Geoscientific Analyses)** and international hydropower standards (BHA / IHA).

---

## Directory Architecture

```
engines/water/hydro/
├── cli.py                         # Master CLI entrypoint (--input-dem, --threshold, --output, --district)
├── README.md                      # Documentation, scientific citations & multi-district guide
├── RULES.md                       # Compliance & architectural boundaries
├── pyproject.toml                 # Package dependencies (rasterio, pysheds, scipy, geopandas)
└── src/                           # Modular SAGA calculation pipeline
    ├── __init__.py                # Clean public interface & run_hydro_pipeline
    ├── step1_dem_io.py            # [STEP 2 & 3] Load DEM (rasterio/pysheds) & NoData void filling
    ├── step2_depression_filling.py# [STEP 4] Wang & Liu (2006) Sink & Depression Filling
    ├── step3_flow_routing.py      # [STEP 5 & 6] O'Callaghan D8 Flow Direction & Tarboton Flow Accumulation
    ├── step4_stream_network.py    # [STEP 7 & 8] Jenson Stream Extraction & Reach Head/Tail Vectorization
    ├── step5_power_calculation.py # [STEP 9] BHA/IHA Hydropower Potential Formulation
    └── step6_export.py            # [STEP 10] 3D Vector GeoJSON & Summary CSV Exporter
```

---

## The 10 Pipeline Steps & Scientific Citations

| Step   | Operation                       | Source Algorithm / SAGA Lineage                 | Scientific Citation                                                                                                                                                                     |
| ------ | ------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Component Integration**       | SAGA Parameter System (`saga_cmd`)              | Standard CLI parser with robust error handling and step logging                                                                                                                         |
| **2**  | **Load DEM**                    | `CSG_Grid` via `rasterio` & `pysheds.grid.Grid` | Automatic metric resolution calibration ($dx, dy$ in meters)                                                                                                                            |
| **3**  | **Handle NoData**               | SAGA `CGrid_Gaps`                               | Soap-bubble / Dirichlet Laplacian boundary relaxation                                                                                                                                   |
| **4**  | **Fill Sinks & Depressions**    | SAGA `CFillSinks_WL`                            | **Wang, L., and Liu, H. (2006)**. _"An efficient method for identifying and filling depressions in digital elevation models."_ Int. J. of Geographical Information Science.             |
| **5**  | **Flow Direction**              | SAGA `CD8_Flow_Analysis::Get_Direction`         | **O'Callaghan, J. F., and Mark, D. M. (1984)**. _"The extraction of drainage networks from digital elevation models."_ Computer Vision, Graphics, and Image Processing.                 |
| **6**  | **Flow Accumulation**           | SAGA `CFlow_Parallel` (Top-down sort)           | **Tarboton, D. G., et al. (1991)**. _"On the extraction of channel networks from digital elevation data."_ Hydrological Processes.                                                      |
| **7**  | **Extract Streams**             | SAGA `CChannelNetwork` (Pass 2)                 | **Jenson, S. K., and Dominique, J. O. (1988)**. _"Extracting topographic structure from digital elevation model data for geographic information system analysis."_ PE&RS.               |
| **8**  | **Segment Reaches & Head/Tail** | SAGA `CD8_Flow_Analysis::Get_Segments`          | Continuous topologic reach tracing; extracts Intake $(X_h, Y_h, Z_h)$ & Powerhouse $(X_t, Y_t, Z_t)$                                                                                    |
| **9**  | **Calculate Power Output**      | BHA / IHA Hydropower Standard                   | **British Hydropower Association (BHA) / International Hydropower Association (IHA)** guidelines: $P (\text{kW}) = g \cdot Q \cdot H \cdot \eta$ ($g = 9.81\text{ m/s}^2, \eta = 0.70$) |
| **10** | **Output Generation**           | SAGA `CSG_Shapes` Vector Export                 | GeoJSON `LineString` format with 3D elevations, hydraulic attributes, and CSV summary                                                                                                   |

---

## How to Run for Any Other District (100% Reusable)

This engine is completely terrain, coordinate, and district agnostic. It can be run on any district in Nepal or worldwide without altering source code.

### 1. Default Run (Gulmi District)

```bash
python3 engines/water/hydro/cli.py --district Gulmi --threshold 500
```

### 2. Baglung District (Steep Mountain Heads)

```bash
python3 engines/water/hydro/cli.py \
    --input-dem /path/to/baglung_dem_30m.tif \
    --district Baglung \
    --threshold 300 \
    --runoff-factor 0.038 \
    --output data/calculated/hydro_reaches/baglung_hydro_reaches.geojson
```

### 3. Mustang District (Arid Trans-Himalayan Region)

```bash
python3 engines/water/hydro/cli.py \
    --input-dem /path/to/mustang_dem_30m.tif \
    --district Mustang \
    --threshold 600 \
    --runoff-factor 0.015 \
    --output data/calculated/hydro_reaches/mustang_hydro_reaches.geojson
```

### 4. Jhapa District (Lowland Terai River Stems)

```bash
python3 engines/water/hydro/cli.py \
    --input-dem /path/to/jhapa_dem_30m.tif \
    --district Jhapa \
    --threshold 2000 \
    --runoff-factor 0.028 \
    --output data/calculated/hydro_reaches/jhapa_hydro_reaches.geojson
```

---

## Key CLI Options

| Argument          | Type    | Default       | Description                                                        |
| ----------------- | ------- | ------------- | ------------------------------------------------------------------ |
| `--input-dem`     | String  | Auto-resolved | Path to input DEM GeoTIFF                                          |
| `--threshold`     | Integer | `500`         | Stream initiation flow accumulation threshold in cells             |
| `--output`        | String  | Auto-resolved | Target GeoJSON destination file path                               |
| `--output-csv`    | String  | Auto-resolved | Target CSV summary destination file path                           |
| `--district`      | String  | `"Gulmi"`     | Target district name for metadata attribution                      |
| `--runoff-factor` | Float   | `0.032`       | Localized runoff factor in $\text{m}^3/(\text{s}\cdot\text{km}^2)$ |
| `--efficiency`    | Float   | `0.70`        | Total electromechanical efficiency $\eta$ (BHA/IHA Standard)       |
| `--reach-len`     | Float   | `500.0`       | Target reach segmentation interval in meters                       |
| `--min-slope`     | Float   | `0.01`        | Minimum downward slope in degrees preserved during sink filling    |
