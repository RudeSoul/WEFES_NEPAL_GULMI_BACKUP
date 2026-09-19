# Data Catalog: Observed & Official Records (`data/real/`)

## 1. Classification & Governance
- **Data Type**: Observed / Official Records (Empirical Ground Truth)
- **Confidence Level**: HIGH (Official government publications & hydrometric gauge records)
- **Access Policy**: **READ-ONLY**. Source files in this directory must never be modified or overwritten by automated code.

---

## 2. Directory Contents & Provenance

### `boundaries/`
- **Files**: `gulmi-palikas.json`, `local_bodies_district_code.csv`, `palika_centroids.json`
- **Source**: Survey Department of Nepal, Ministry of Federal Affairs and General Administration (MoFAGA).
- **Coordinate System**: WGS 84 (EPSG:4326).
- **Description**: Official administrative boundaries and geographic centroids across all 12 Palikas of Gulmi District.

### `municipal/`
- **Files**: `palika_profiles.json`
- **Source**: Nepal Local Levels (774 Palikas), MoFAGA, CBS Census 2021, and NARC Agro-Ecological Matrix.
- **Description**: Rich municipal profiles for all 12 Palikas of Gulmi including demographics, elevation, temperatures, soil pH, crop feasibility scores, and seasonal rotations.

### `hydrology/`
- **Files**: `gulmi_dhm_stations.geojson`, `gulmi_hydrology_assets.json`, `River_data.csv`
- **Source**: Department of Hydrology and Meteorology (DHM), Ministry of Energy, Water Resources and Irrigation, Nepal.
- **Description**: 8 official DHM ground monitoring stations (Indices 701 Ridi, 722 Musikot, 725 Tamghas, 731 Agimir, 732 Anp Chour, 733 Bharse, 734 Daugha, and Tamghas New AWS) and hydrometric ratings.

### `infrastructure/`
- **Files**: `gulmi_nea_substations.geojson`, `cooking_household.geojson`, `district_infrastructure_assets.json`
- **Source**: Nepal Electricity Authority (NEA) Transmission Directorate, National Statistics Office (NSO / CBS 2021 Census), and Survey Department of Nepal.
- **Description**: Official NEA 132/33 kV substations (Tamghas/Unaichaur 46 MVA, Paudi Amarai 30 MVA, Kisantari 3 MVA, Birbas 8 MVA, Ridi 10 MVA) and Census 2021 12-Palika household cooking fuel reliance metrics.

### `agriculture/`
- **Files**: `gulmi_agricultural_landholding.geojson`, `crops.json`, `narc_crop_varieties.json`, `Nepal_District_Crops_Feasibility.csv`, `Coffee_Production_untill_2080.csv`
- **Source**: MoALD Land Resources Survey, National Agricultural Research Council (NARC), MoALD Seed Quality Control Centre (SQCC), National Statistics Office (NSO Census 2021), and OpenStreetMap.
- **Description**: Certified hill seed varieties, yield potentials, resistance profiles, district crop suitability baselines, and empirical municipal agricultural landholdings (total cultivated ha, Khet/Bari split, Census households, building counts, and ha & Ropani per household).

### `climate/`
- **Files**: `gulmi_solar_pvout_opta.geojson`, `nasa_power_10_years_full.csv`
- **Source**: Global Solar Atlas 2.0 (World Bank / ESMAP / Solargis) and NASA POWER Agroclimatology Archive.
- **Description**: Photovoltaic electricity potential (PVOUT), optimum tilt angle (OPTA), and 10-year daily reanalysis meteorological data.

### `land_and_soil/`
- **Files**: `district-soil-summary.json`, `gulmi_soil_points_81.json`
- **Source**: National Soil Science Research Centre (NARC) & Soil Management Directorate.
- **Description**: Soil texture, pH distribution, 81 geo-referenced field soil sampling observations, and organic matter percentage.

### `socioeconomics/`
- **Files**: `nepal_investment_benchmarks.json`, `nepal_agricultural_labor_rates_by_district.csv`
- **Source**: World Bank REED Project (PAD-3712), USAID Feed the Future (FtF), and CBS Nepal Agricultural Census.
- **Description**: Validated commodity financial internal rates of return (EIRR), NPVs, switching values, and daily wage rates across agricultural domains.

### `rasters/`
- **Files**: `gulmi_dem_30m.tif`
- **Source**: Copernicus Global 30m DEM (GLO-30) via OpenTopography API.
- **License**: Open Data / CC-BY Copernicus.
