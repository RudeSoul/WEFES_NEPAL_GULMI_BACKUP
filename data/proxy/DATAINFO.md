# Data Catalog: Surrogate Assumptions & Proxy Benchmarks (`data/proxy/`)

## 1. Classification & Governance
- **Data Type**: Proxy / Surrogate Assumption
- **Confidence Level**: MEDIUM / ADVISORY (Utilized strictly where local empirical records are absent)
- **Policy**: Must be explicitly labeled in UI and reports as a proxy. Every file must specify a replacement roadmap.

---

## 2. Proxy Datasets & Replacement Roadmaps

### `social/gender_labor_coefficients.json`
- **Surrogate Concept**: Female labor share percentage (68%), peak-season weeding drudgery hours, women-friendly micro-mechanization tools (mini-tillers, solar drip kits, cono-weeders), and municipal agricultural budget reallocation multipliers.
- **Reference Proxy**: Nepal Labour Force Survey (NLFS III), MoALD Gender Equity & Social Inclusion (GESI) in Agriculture Guidelines (2021), and field rapid assessments.
- **Limitation**: Regional mid-hill averages may vary across specific wards depending on male youth outmigration rates.
- **Replacement Criteria**: Replace with Palika-level GESI ward audits and annual municipal planning and budget formulation records.

### `economic_benchmarks/rural_tariff_estimates.json`
- **Surrogate Concept**: Off-grid rural micro-hydro tariffs and penstock capital installation costs.
- **Reference Proxy**: Nepal Electricity Authority (NEA) Off-Grid Guidelines & AEPC Subsidy Policy 2078.
- **Limitation**: Ignores local transport cost premiums for deep mountain wards (e.g. Madane Lekh).
- **Replacement Criteria**: Replace with Gulmi District Chamber of Commerce local supplier quotes and Palika electrification audits.

### `crop_suitability_proxies/crop_temperature_proxies.json`
- **Surrogate Concept**: Thermal and hygrometric growth ranges for indigenous specialty crops (Coffee, Cardamom, Ginger).
- **Reference Proxy**: NARC Hill Crops Research Programme & FAO ECOCROP database.
- **Limitation**: Assumes macro-climate bounds without micro-topographic solar aspect variation.
- **Replacement Criteria**: Replace with Agriculture Knowledge Centre (AKC) Gulmi trial station yield records.

### `environmental_proxies/default_eflow_parameters.json`
- **Surrogate Concept**: Universal 10% minimum lean dry-season flow reservation for aquatic ecosystem preservation.
- **Reference Proxy**: Department of Electricity Development (DOED) standard statutory policy.
- **Limitation**: May underestimate required flows for critical fish spawning habitats (e.g. Asala in Badigad).
- **Replacement Criteria**: Replace with stream-specific Environmental Impact Assessment (EIA) field measurements.
