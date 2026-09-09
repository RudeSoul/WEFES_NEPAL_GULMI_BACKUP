# Data Catalog: Observed & Official Records (`data/real/`)

## 1. Classification & Governance
- **Data Type**: Observed / Official Records (Empirical Ground Truth)
- **Confidence Level**: HIGH (Official government publications & hydrometric gauge records)
- **Access Policy**: **READ-ONLY**. Source files in this directory must never be modified or overwritten by automated code.

---

## 2. Directory Contents & Provenance

### `boundaries/`
- **Files**: `gulmi-palikas.json`, `District_code.csv`, `local_bodies_district_code.csv`, `palika_centroids.json`
- **Source**: Survey Department of Nepal & Ministry of Federal Affairs and General Administration (MoFAGA).
- **Coordinate System**: WGS 84 (EPSG:4326).
- **Description**: Official administrative boundaries and geographic centroids for the 12 local Palikas of Gulmi District.

### `municipal/`
- **Files**: `palika_profiles.json`
- **Source**: Nepal Local Levels (774 Palikas), MoFAGA, CBS Census 2021, and NARC Agro-Ecological Matrix.
- **Description**: Rich municipal profiles for all 12 Palikas of Gulmi including demographics, elevation, temperatures, soil pH, crop feasibility scores, and seasonal rotations.

### `hydrology/`
- **Files**: `gulmi_hydrology_assets.json`, `River_data.csv`, `Average_rainfall_by_altitude.csv`, `glacier_and_catchment_area_having_metrological_and_hydrological_station.csv`
- **Source**: Department of Hydrology and Meteorology (DHM) Nepal.
- **Description**: Hydrometric station records (stations 410, 430, 435, 420), altitude-dependent rainfall profiles, and lake altitude classifications.

### `infrastructure/`
- **Files**: `district_infrastructure_assets.json`
- **Source**: Nepal Electricity Authority (NEA) Powerhouse Registry, Survey Department of Nepal, and National Tea and Coffee Development Board (NTCDB).
- **Description**: Verified hydropower assets (Upper Hugdi, Ridi Khola, Badigad Khola), district summits/valleys, and historic coffee origin and processing landmarks (Aapchaur, Tamghas, Ruru).

### `agriculture/`
- **Files**: `crops.json`, `narc_crop_varieties.json`, `Nepal_District_Crops_Feasibility.csv`, `Coffee_Production_untill_2080.csv`
- **Source**: National Agricultural Research Council (NARC), MoALD Seed Quality Control Centre (SQCC), and Agriculture Knowledge Centre (AKC) Gulmi.
- **Description**: Certified hill seed varieties, yield potentials, resistance profiles, and district crop suitability baselines.

### `climate/`
- **Files**: `nasa_power_10_years_full.csv`
- **Source**: NASA POWER Agroclimatology Archive (10-Year Daily Meteorological Reanalysis).
- **Description**: Solar insolation, daily mean/min/max temperature, relative humidity, and precipitation.

### `land_and_soil/`
- **Files**: `district-soil-summary.json`, `gulmi_soil_points_81.json`, `type_and_area_soil_by_color.csv`, `affected_land_erosion.csv`
- **Source**: National Soil Science Research Centre (NARC) & Soil Management Directorate.
- **Description**: Soil texture, pH distribution, 81 geo-referenced field soil sampling observations, organic matter percentage, and erosion susceptibility by ecological belt.

### `socioeconomics/`
- **Files**: `nepal_investment_benchmarks.json`, `nepal_agricultural_labor_rates_by_district.csv`
- **Source**: World Bank REED Project (PAD-3712), USAID Feed the Future (FtF), and CBS Nepal Agricultural Census.
- **Description**: Validated commodity financial internal rates of return (EIRR), NPVs, switching values, and daily wage rates across agricultural domains.

### `rasters/`
- **Files**: `gulmi_dem_30m.tif`
- **Source**: Copernicus Global 30m DEM (GLO-30) via OpenTopography API.
- **License**: Open Data / CC-BY Copernicus.
