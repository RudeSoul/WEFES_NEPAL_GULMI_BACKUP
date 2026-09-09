# Data Catalog: Observed & Official Records (`data/real/`)

## 1. Classification & Governance
- **Data Type**: Observed / Official Records (Empirical Ground Truth)
- **Confidence Level**: HIGH (Official government publications & hydrometric gauge records)
- **Access Policy**: **READ-ONLY**. Source files in this directory must never be modified or overwritten by automated code.

---

## 2. Directory Contents & Provenance

### `boundaries/`
- **Files**: `gulmi-palikas.json`, `District_code.csv`, `local_bodies_district_code.csv`
- **Source**: Survey Department of Nepal & Ministry of Federal Affairs and General Administration (MoFAGA).
- **Coordinate System**: WGS 84 (EPSG:4326).
- **Description**: Official administrative boundaries for the 12 local Palikas of Gulmi District.

### `hydrology/`
- **Files**: `River_data.csv`, `Average_rainfall_by_altitude.csv`, `glacier_and_catchment_area_having_metrological_and_hydrological_station.csv`
- **Source**: Department of Hydrology and Meteorology (DHM) Nepal.
- **Description**: Hydrometric station records, elevation-dependent rainfall profiles, and river network tables.

### `agriculture/`
- **Files**: `crops.json`, `Nepal_District_Crops_Feasibility.csv`, `Coffee_Production_untill_2080.csv`
- **Source**: Ministry of Agriculture and Livestock Development (MoALD) & Agriculture Knowledge Centre (AKC) Gulmi.
- **Description**: District crop yield statistics, historical coffee harvest volumes, and agro-climatic suitability records.

### `climate/`
- **Files**: `nasa_power_10_years_full.csv`
- **Source**: NASA POWER Agroclimatology Archive (10-Year Daily Meteorological Reanalysis).
- **Description**: Solar insolation, daily mean/min/max temperature, relative humidity, and precipitation.

### `land_and_soil/`
- **Files**: `district-soil-summary.json`, `type_and_area_soil_by_color.csv`, `affected_land_erosion.csv`
- **Source**: National Soil Science Research Centre (NARC) & Soil Management Directorate.
- **Description**: Soil texture, pH distribution, organic matter percentage, and erosion susceptibility by ecological belt.

### `rasters/`
- **Files**: `gulmi_dem_30m.tif`
- **Source**: Copernicus Global 30m DEM (GLO-30) via OpenTopography API.
- **License**: Open Data / CC-BY Copernicus.
