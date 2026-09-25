# Data Catalog: Palika Sectoral Indicators (`data/calculated/indicators/`)

## 1. Classification & Governance
- **Data Type**: Calculated / Empirical Downscaled Palika Indicators
- **Confidence Level**: HIGH (Derived deterministically from official Census 2021/22, NEA transmission records, NARC soil samples, and Global Solar Atlas)
- **Access Policy**: **REPRODUCIBLE**. Aggregated from primary spatial and survey records in `data/real/`.

---

## 2. Dataset Inventory

| File Name | Format | Primary Source Tier | Description |
|---|---|---|---|
| `gulmi_palika_cooking.json` | JSON | `data/real/infrastructure/cooking_household.geojson` | NSO Census 2021 cooking fuel breakdown by palika (firewood, LPG, biogas, electric). |
| `gulmi_palika_ghi.json` | JSON | `data/real/climate/gulmi_solar_pvout_opta.geojson` | Global Solar Atlas / ESMAP downscaled mean Global Horizontal Irradiance ($kWh/m^2/day$) and PV potential. |
| `gulmi_palika_grid.json` | JSON | `data/real/infrastructure/gulmi_nea_substations.geojson` | NEA 132/33/11 kV substations, transmission lines, and palika electrification metrics. |
| `gulmi_palika_landholding.json` | JSON | `data/real/agriculture/gulmi_agricultural_landholding.geojson` | NSO Agricultural Census 2021/22 land typology (Khet %, Bari %, parcel counts, irrigation access). |
| `gulmi_palika_soil.json` | JSON | `data/real/land_and_soil/gulmi_soil_points_81.json` | NARC laboratory soil points aggregated to palika means (Nitrogen %, Phosphorus, Potassium, pH). |
| `gulmi_palika_transit.json` | JSON | `data/real/boundaries/palika_centroids.json` | Palika road connectivity and transit hub access times. |

---

## 3. Provenance & Citations
- **Census Data**: National Statistics Office (NSO), Government of Nepal (2021/22 Population and Agriculture Census).
- **Electricity & Grid**: Nepal Electricity Authority (NEA) Transmission Directorate.
- **Solar**: Global Solar Atlas 2.0 (ESMAP / World Bank / Solargis).
- **Soil Science**: Nepal Agricultural Research Council (NARC) Soil Science Division.
