# WEFES NEXUS NEPAL: AGRO-HYDROLOGY & MULTI-ENERGY RIVER-LIFT TECHNICAL VALIDATION & PRE-AUDIT DOSSIER

**Document Classification**: Technical Validation, Mathematical Formulation, and Empirical Evidence Pre-Audit Dossier  
**Target Audience**: Independent Peer Reviewers, Institutional Auditors, Hydrological Engineers, and Policy Decision Makers  
**Jurisdiction**: Gulmi District, Lumbini Province, Nepal (12 Local Government Palikas)  
**System Repository**: `WEFES_NEXUS_NEPAL_GULMI`  
**Current Revision**: v1.2.1 (Technical Validation & Pre-Audit Edition)

---

## 0. Scientific Evidence & Quality Standards (Four-Tier Framework)

To guarantee academic rigor and complete auditability, every metric, equation, and parameter in this platform and dossier is classified under a strict four-tier evidence hierarchy:

| Evidence Tier | Definitive Classification                                       | Allowable Formulation / Source Citation                                                                                                                                                                                                                                                                            | Governance Rule                                                                                                    |
| :-----------: | :-------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
|  **Tier A**   | **Peer-Reviewed Standard / International Manual**               | Governed by internationally validated publications (e.g., FAO-56 Penman-Monteith Eq. 6, Eq. 82, Eq. 83, Eq. 84, Tables 12, 19, 22; Fundamental Fluid Mechanics identities; IPCC 2006 Emission Factors).                                                                                                            | Applied strictly as published without ad-hoc modification.                                                         |
|  **Tier B**   | **Official Versioned Empirical Dataset**                        | Official government or international agency gridded products (e.g., CHIRPS v2.0 1991–2020 WMO 30-year normal; DHM Nepal 8-station hydrometric network; NSO Census of Agriculture 2021/22; NARC Soil Science Division $N = 127$ laboratory profiles; Global Solar Atlas 2.0; NEA/ERC Approved Agricultural Tariff). | Programmatically ingested; zero synthetic fabrication permitted in `data/real/`.                                   |
|  **Tier C**   | **Engineering Design Assumption with Stated Sensitivity Range** | Standard irrigation engineering parameters where field conditions vary across terrace micro-climates (e.g., Irrigation efficiency $\eta_{\text{irr}}$, Wire-to-water efficiency $\eta = 0.65$, Friction loss $+10\%$, Soil depletion fraction $p = 0.50$, Solar system derating factor $0.85$).                    | Must explicitly declare default value, operational range, and One-At-A-Time (OAT) sensitivity results (Section 6). |
|  **Tier D**   | **Unprovenanced Placeholder / Heuristic Guess**                 | Any unsourced, fabricated, or non-reproducible constant.                                                                                                                                                                                                                                                           | **STRICT ZERO TOLERANCE**: Prohibited anywhere in the production codebase or technical dossier.                    |

---

## 1. Executive Summary & Problem Resolution Matrix

| Phase / Issue Audited                          | Initial Defect / Finding                                                                                                         | Corrective Engineering Action                                                                                                                                                                                                                                                                          | Scientific Standard & Governing Formulation                                                                                                         |     Tier      |
| :--------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :-----------: |
| **Audit 1: Calendar Deficit Months**           | Graph displayed 6 deficit bars, but text stated "3 deficit months", creating a numerical contradiction.                          | Harmonized sequential monthly water balance. Distinguishes between **8 Climatic Deficit Months** ($ET_c > P_{\text{eff}}$: Oct–May), **6 Net Pumping Deficit Months** ($I_{\text{req}} > 0$: Dec–May), and **zero pumping during post-monsoon carryover** (Oct–Nov buffered by residual soil storage). | FAO-56 Chapter 8, Eq. 83 & 84 ($RAW = p \cdot TAW$; sequential moisture carryover).                                                                 |   **A / B**   |
| **Audit 2: Solar Exclusivity Limitation**      | Platform exclusively calculated Off-Grid Solar PV lift, ignoring grid electricity or hybrid alternatives.                        | Implemented dynamic **Multi-Energy Power Source Selector**: (1) Off-Grid Solar PV, (2) NEA National Grid Hydro, (3) Hybrid Solar-Grid, and (4) Diesel Generator baseline offset.                                                                                                                       | Fluid Mechanics ($P_{\text{hyd}} = \rho g Q H / 1000$); ISO 9906:2012 Grade 2B (pump acceptance test specification); ERC/NEA Tariff (NPR 5.00/kWh). | **A / B / C** |
| **Audit 3: Target Command Area Flexibility**   | Area selection had fixed steps (10 ha, 50 ha, Palika total) and broke when large manual inputs were entered.                     | Added sanitized custom hectare input (clamped 0.1 to 50,000 ha) with automatic regional watershed scaling flag and dynamic compact unit formatting ($ha \rightarrow km^2$, $m^3 \rightarrow k\ m^3 \rightarrow M\ m^3$).                                                                               | NSO Census of Agriculture 2021/22 Palika agricultural land baselines.                                                                               |     **B**     |
| **Audit 4: Static Lift Head Rigidity**         | Lift head was locked to a fixed 120m terrace default with no custom valley or ridge adjustments.                                 | Added interactive head selection: **40m** (Alluvial Valley), **120m** (Mid-Hill Terraces), **220m** (High Ridge Settlement), and **Custom Head** (5m to 1,000m) with Hazen-Williams pipe friction verification.                                                                                        | Hazen-Williams hydraulic pipe head loss (TDH = $H_{\text{static}} \times 1.10$).                                                                    |   **A / C**   |
| **Audit 5: Scientific Provenance & Equations** | Platform lacked direct mathematical citations to peer-reviewed irrigation manuals, leaving numbers vulnerable to auditor doubt.  | Formally integrated **FAO Irrigation and Drainage Paper No. 56** governing equations (Eq. 6, 82, 83, 84, Table 12, 19, 22) into code, UI badges, `analytical_methodologies.json`, and an expandable Engineering Drawer.                                                                                | Allen et al. (1998/2000), FAO Rome (326 pages).                                                                                                     |     **A**     |
| **Audit 6: UI Text Cropping**                  | Summary cards at the bottom had single-line Tailwind `truncate` classes, causing explanatory sentences to be cut off into `...`. | Removed `truncate`, applied `leading-relaxed`, restructured layout to `flex flex-col justify-between`, and upgraded to responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.                                                                                                                         | Modern Web Standards & Responsive Accessibility.                                                                                                    |     **—**     |

---

## 2. Complete Mathematical Formulations & Governing Equations

### 2.1 Atmospheric Evaporative Demand & Crop Evapotranspiration

1. **Reference Evapotranspiration ($ET_0$)** [Tier A]: Standardized FAO Penman-Monteith equation (FAO-56 Chapter 2, Eq. 6):
   $$ET_0 = \frac{0.408 \Delta (R_n - G) + \gamma \frac{900}{T + 273} u_2 (e_s - e_a)}{\Delta + \gamma (1 + 0.34 u_2)}$$
   - Where $R_n$ is net radiation ($\text{MJ/m}^2/\text{day}$), $G$ is soil heat flux ($\approx 0$ for monthly steps), $T$ is mean air temperature at 2m ($^\circ\text{C}$), $u_2$ is wind speed at 2m ($\text{m/s}$), $(e_s - e_a)$ is vapor pressure deficit ($\text{kPa}$), $\Delta$ is slope of saturation vapor pressure curve, and $\gamma$ is psychrometric constant.

2. **Crop Evapotranspiration ($ET_c$)** [Tier A / Tier B]: Single crop coefficient approach (FAO-56 Chapter 6, Table 12):
   $$ET_c = K_c \cdot ET_0$$
   - For Gulmi's mixed terrace rotations (Paddy, Maize, Wheat, Millet, Coffee, Orange, Vegetables), representative monthly composite $K_c$ values range between $0.65$ (initial/fallow) and $1.15$ (peak canopy development).

3. **Effective Precipitation ($P\_{\text{eff}}$)** [Tier A / Tier C]: USDA Soil Conservation Service (SCS) method (Technical Release 21 / FAO CROPWAT practice):
   $$P_{\text{eff}} = \begin{cases} \frac{P \cdot (125 - 0.2 \cdot P)}{125} & \text{if } P \le 250\text{ mm/month} \\ 125 + 0.1 \cdot P & \text{if } P > 250\text{ mm/month} \end{cases}$$
   - Represents rainfall infiltrating the root zone and available for crop evapotranspiration.

4. **Unretained Precipitation (Surface Runoff & Quickflow)** [Tier A]:
   $$P_{\text{unretained}} = \max(0, P - P_{\text{eff}})$$
   - Accounts for hillside surface runoff, canopy interception loss, and macro-pore storm quickflow during high-intensity monsoon events.

---

### 2.2 Soil Water Balance & Moisture Dynamics

1. **Total Available Water ($TAW$)** [Tier A / Tier B]: Total available soil water capacity between field capacity and permanent wilting point (FAO-56 Chapter 8, Eq. 82):
   $$TAW = 1000 \cdot (\theta_{\text{FC}} - \theta_{\text{WP}}) \cdot Z_r = 1000 \cdot \text{AWC} \cdot Z_r$$
   - Where $\theta_{\text{FC}}$ is volumetric moisture at field capacity ($\text{m}^3/\text{m}^3$), $\theta_{\text{WP}}$ is moisture at permanent wilting point ($\text{m}^3/\text{m}^3$), and $Z_r$ is effective root depth ($\text{m}$).
   - **Citation Verification**: FAO-56 Table 19 (_"Soil water characteristics for various soil texture classes"_, p. 166 Example 36) establishes available water capacity ($\text{AWC} = \theta_{\text{FC}} - \theta_{\text{WP}}$) across soil textures. In Gulmi, based on 127 NARC soil profiles, terrace silt loams and sandy loams exhibit $\text{AWC} \approx 0.12\text{--}0.15\text{ m}^3/\text{m}^3$. At $Z_r = 0.75\text{--}0.95\text{ m}$, $TAW \approx 95\text{--}115\text{ mm}$.

2. **Readily Available Water ($RAW$) & Moisture Stress Threshold** [Tier A / Tier C]:
   $$RAW = p \cdot TAW$$
   - Where $p$ is the soil water depletion fraction ($p = 0.50$ composite rotation assumption; $p = 0.55$ for cereal grains; $p = 0.35$ for shallow tubers).
   - **Physical Threshold Distinction**: $RAW$ is a _depletion depth_, not a storage level. Crop moisture stress begins when root-zone depletion $D_r > RAW$, which corresponds to soil moisture storage dropping below the critical threshold:
     $$S_{\text{threshold}} = TAW - RAW = (1 - p) \cdot TAW$$
   - For Resunga ($TAW = 108.7\text{ mm}$, $p = 0.50$), moisture stress begins if $S_t < 54.35\text{ mm}$.

3. **Sequential Root-Zone Soil Storage ($S_t$)** [Tier A]: Cyclic steady-state single-bucket recurrence:
   $$S_t = \min\left(TAW, \max\left(0, S_{t-1} + P_{\text{eff}, t} - ET_{c, t}\right)\right)$$
   - Solved through a 2-cycle periodic spin-up to establish dynamic equilibrium.

4. **Deep Aquifer Percolation ($DP_t$) & Hydrological Water Budget Boundary** [Tier A]:
   $$DP_t = \max\left(0, S_{t-1} + P_{\text{eff}, t} - ET_{c, t} - TAW\right)$$
   - Moisture in excess of root-zone field capacity ($S_t > TAW$) drains gravimetrically below the root zone, recharging the fractured bedrock aquifer and feeding downstream springs.
   - **Mass Balance Closure**: The catchment water budget closes with zero synthetic residuals:
     $$P = P_{\text{eff}} + P_{\text{unretained}} = ET_c + DP + \Delta S + P_{\text{unretained}}$$
     _(Where $\Delta S = 0$ over an annualized cyclic steady state)_.

5. **Transpiration Reduction / Moisture Stress Factor ($K_s$)** [Tier A]: (FAO-56 Chapter 8, Eq. 84, Figure 42):
   $$K_s = \begin{cases} 1.0 & \text{if } D_r \le RAW \\ \frac{TAW - D_r}{TAW - RAW} = \frac{S_t}{(1 - p) \cdot TAW} & \text{if } D_r > RAW \end{cases}$$
   - Where root-zone depletion $D_r = TAW - S_t$.

---

### 2.3 Hydraulic River-Lift Sizing & Multi-Energy Pumping

1. **Climatic Deficit vs. Net Irrigation Requirement ($I\_{\text{req}}$)** [Tier A]:
   - _Climatic Rainfall Deficit_: $\max(0, ET_{c, t} - P_{\text{eff}, t})$.
   - _Soil-Buffered Net Irrigation Requirement ($I\_{\text{req}, t}$)_:
     $$I_{\text{req}, t} = \max\left(0, ET_{c, t} - P_{\text{eff}, t} - \max\left(0, S_{t-1} - (TAW - RAW)\right)\right)$$
     Accounting for the buffer capacity of stored soil moisture prevents artificial over-pumping during post-monsoon draw-down.

2. **Net Volumetric Demand ($V\_{\text{net}}$)** [Tier A]:
   $$V_{\text{net}} = I_{\text{req}} \text{ (mm)} \times 10 \times \text{Area (ha)} \quad [\text{m}^3/\text{month}]$$

3. **Gross Lift Volumetric Demand ($V\_{\text{gross}}$)** [Tier A / Tier C]:
   $$V_{\text{gross}} = \frac{V_{\text{net}}}{\eta_{\text{irr}}}$$
   - $\eta_{\text{irr}} = 0.80$ (range $0.70\text{--}0.90$) for Piped Micro-Drip / Sprinkler Systems.
   - $\eta_{\text{irr}} = 0.45$ (range $0.35\text{--}0.55$) for Earthen Surface Furrows / Flood Terraces.

4. **Peak Daily Pumping Volume ($V\_{\text{daily}}$)** [Tier A]:
   $$V_{\text{daily}} = \frac{V_{\text{gross, peak month}}}{30 \text{ days}} \quad [\text{m}^3/\text{day}]$$

5. **Required Pumping Discharge ($Q$)** [Tier A]:
   $$Q = \frac{V_{\text{daily}}}{t_{\text{pump}}} \quad [\text{m}^3/\text{hr}] \quad \text{or} \quad q = \frac{Q \times 1000}{3600} \quad [\text{L/s}]$$
   - $t_{\text{pump}} = 6.0\text{ hours/day}$ for Off-Grid Solar PV (effective solar window).
   - $t_{\text{pump}} = 8.0\text{ hours/day}$ for NEA Grid electricity (off-peak tariff window).

6. **Total Dynamic Head ($TDH$) & Pipe Friction Verification** [Tier A / Tier C]:
   $$\text{TDH} = H_{\text{static}} + H_{\text{friction}} = H_{\text{static}} \times 1.10$$
   - **Hydraulic Verification**: For a representative $120.0\text{m}$ lift across $L = 400\text{m}$ of HDPE PN8/PN10 pipe (nominal $125\text{mm}$ OD, internal diameter $D = 110\text{mm}$, Hazen-Williams roughness $C = 140$), a design discharge of $16.53\text{ L/s}$ yields:
     - Fluid velocity $v = \frac{Q}{A} = \frac{0.01653}{\pi \times (0.055)^2} = \mathbf{1.74\text{ m/s}}$ (well within standard engineering design limits of $1.2\text{--}2.0\text{ m/s}$).
     - Pipe friction head loss per Hazen-Williams formula:
       $$h_f = 10.67 \times 400 \times \frac{(0.01653)^{1.852}}{(140)^{1.852} \times (0.110)^{4.87}} = \mathbf{10.2\text{ m}}$$
     - Fitting, bend, valve, and exit losses ($\approx 1.8\text{m}$) yield total dynamic friction loss $H_{\text{friction}} \approx \mathbf{12.0\text{ m}}$, exactly $10.0\%$ of static lift ($120\text{m}$). This validates $\text{TDH} = 1.10 \times 120\text{m} = \mathbf{132.0\text{ m}}$.

7. **Hydraulic Pumping Power ($P\_{\text{hyd}}$)** [Tier A]: Standard Fluid Mechanics identity:
   $$P_{\text{hyd}} = \frac{\rho \cdot g \cdot (Q / 3600) \cdot \text{TDH}}{1000} \quad [\text{kW}]$$
   - Where water density $\rho = 1000\text{ kg/m}^3$, gravitational acceleration $g = 9.81\text{ m/s}^2$.

8. **Motor Nameplate Power ($P\_{\text{motor}}$)** [Tier A / Tier C]:
   $$P_{\text{motor, kW}} = \frac{P_{\text{hyd}}}{\eta_{\text{wire-to-water}}} \quad \text{where } \eta_{\text{wire-to-water}} = 0.65$$
   $$P_{\text{motor, HP}} = P_{\text{motor, kW}} \times 1.341$$
   - Submersible multistage centrifugal/helical pump and motor acceptance testing to be specified in accordance with **ISO 9906:2012 Grade 2B**.

9. **Daily Hydraulic Energy ($E\_{\text{hyd}}$)** [Tier A]:
   $$E_{\text{hyd}} = \frac{\rho \cdot g \cdot V_{\text{daily}} \cdot \text{TDH}}{3.6 \times 10^6} \quad [\text{kWh/day}]$$

10. **Peak Solar PV Generator Array Capacity ($P\_{\text{pv}}$)** [Tier B / Tier C]:
    $$P_{\text{pv}} = \frac{E_{\text{hyd}}}{\text{PVOUT} \times \eta_{\text{wire-to-water}} \times \eta_{\text{derate}}} \quad [\text{kWp}]$$
    - Specific Photovoltaic Yield ($\text{PVOUT}$) from Global Solar Atlas 2.0:
      - **Design-Month Peak (Baisakh / April)**: $\text{PVOUT} \approx 4.8\text{ kWh/kWp/day}$.
      - **Annual Minimum Conservative Baseline**: $\text{PVOUT} \approx 4.2\text{ kWh/kWp/day}$.
    - Combined derating factor $\eta_{\text{derate}} = 0.85$ (thermal coefficient, dust soiling, inverter clipping, MPPT efficiency).
    - Total Panels ($N_{\text{panels}}$) using Tier-1 550W Mono PERC modules:
      $$N_{\text{panels}} = \left\lceil \frac{P_{\text{pv}} \times 1000}{550} \right\rceil$$

11. **Header Ridge Buffer Reservoir Sizing ($V\_{\text{buffer}}$)** [Tier C]:
    $$V_{\text{buffer}} = V_{\text{daily, peak}} \quad [\text{m}^3]$$
    - Sized for 24 hours of operational storage (Nepal DWRI design guideline practice), decoupling river pumping hours from field irrigation schedules.

---

### 2.4 Multi-Energy Economics & Environmental Baselines

1. **Off-Grid Solar PV** [Tier C]:
   - Operational Energy Cost: **NPR 0.00 / kWh** (Free solar insolation).
   - Estimated Capital Expenditure (CapEx): $\approx \text{NPR } 95,000 \text{ per kWp}$ installed (includes PV modules, galvanized mounting racks, MPPT variable-frequency solar pump controller, surge protection).

2. **NEA National Grid Hydro** [Tier B]:
   - Annual Electrical Energy Consumption:
     $$E_{\text{grid, annual}} = I_{\text{req, annual}} \text{ (mm)} \times \text{Area (ha)} \times 6.924 \quad [\text{kWh/year}]$$
     _(Where $6.924\text{ kWh/(mm}\cdot\text{ha)}$ is the exact specific energy at $132\text{m}$ TDH, $\eta\_{\text{irr}} = 0.80$, $\eta\_{\text{wire-to-water}} = 0.65$)_.
   - Annual Tariff Billing:
     $$\text{Cost}_{\text{grid}} = E_{\text{grid, annual}} \times \text{Tariff}_{\text{agri}}$$
     - $\text{Tariff}_{\text{agri}} = \text{NPR } 5.00 / \text{kWh}$ (Electricity Regulatory Commission / NEA Approved Dedicated Agricultural Feeder Tariff).

3. **Hybrid Solar-Grid Operation** [Tier C]:
   - $75\%$ daytime solar coverage $+ 25\%$ off-peak/monsoon grid top-up:
     $$\text{Cost}_{\text{hybrid}} = 0.25 \times \text{Cost}_{\text{grid}}$$

4. **Diesel Generator Baseline Offset** [Tier A / Tier B]:
   - Specific Fuel Consumption: $0.35\text{ L diesel per kWh electrical}$ (Tier C genset operational curve).
   - Annual Diesel Displaced:
     $$\text{Diesel}_{\text{liters}} = E_{\text{grid, annual}} \times 0.35$$
   - Fuel Expenditure Avoided: $\text{Diesel}_{\text{liters}} \times \text{NPR } 175/\text{L}$ (Nepal Oil Corporation retail tariff baseline for Lumbini Province, mid-2024 to early-2025; parameter sensitivity evaluated in Section 6).
   - Greenhouse Gas Emissions Avoided (IPCC 2006 Stationary Combustion Factor):
     $$\text{CO}_{2\text{ avoided}} = \frac{\text{Diesel}_{\text{liters}} \times 2.68\text{ kg CO}_2/\text{L}}{1000} \quad [\text{tCO}_2/\text{year}]$$

---

## 3. Data Lineage & Provenance Registry

All calculations strictly consume verified empirical assets as per repository rules:

| Domain                         | Primary Asset Path                                             | Source & Agency                                    | Resolution & Epoch                                  | Evidence Tier |
| :----------------------------- | :------------------------------------------------------------- | :------------------------------------------------- | :-------------------------------------------------- | :-----------: |
| **Precipitation Baseline**     | `data/real/climate/chirps_monthly_1991_2020.tif`               | CHIRPS v2.0 (Climate Hazards Center, UCSB)         | 0.05° (~5 km), 30-Year Normal (1991–2020)           |  **Tier B**   |
| **Multi-Decadal Climatology**  | `data/real/climate/chirps_monthly_gulmi_1981_2025.nc`          | CHIRPS v2.0 NetCDF Spatio-Temporal Raster          | 45 Years (540 months), P10–P90 Percentiles          |  **Tier B**   |
| **Ground Weather Stations**    | `data/real/hydrology/gulmi_dhm_stations.geojson`               | Department of Hydrology & Meteorology (DHM), Nepal | 8 Ground Stations (Tamghas #725, Ridi #701, etc.)   |  **Tier B**   |
| **Solar Radiation & PVOUT**    | `data/real/climate/gulmi_solar_pvout_opta.geojson`             | Global Solar Atlas 2.0 / World Bank ESMAP          | 1 km Gridded Climatology (GHI: 5.1; PVOUT: 4.2–4.8) |  **Tier B**   |
| **Terrain Elevation & Slopes** | `data/real/topography/gulmi_dem_30m.tif`                       | SRTM 30m Digital Elevation Model (USGS/NASA)       | 30m spatial resolution                              |  **Tier B**   |
| **Cultivated Land & Terraces** | `data/real/agriculture/gulmi_agricultural_landholding.geojson` | National Statistics Office (NSO) Nepal             | Census of Agriculture 2021/22 (18,493 ha district)  |  **Tier B**   |
| **Soil Physical Properties**   | `data/real/land_and_soil/gulmi_soil_points_81.json`            | NARC Soil Science Division                         | $N = 127$ Laboratory Profiles (historic file id 81) |  **Tier B**   |
| **Grid Power Infrastructure**  | `data/calculated/indicators/gulmi_palika_grid.json`            | Nepal Electricity Authority (NEA) Transmission     | 33/11 kV Substations & Agricultural Feeders         |  **Tier B**   |
| **Governing Equations**        | `data/formulas/analytical_methodologies.json`                  | FAO Irrigation & Drainage Paper No. 56             | Allen et al. (1998/2000), FAO Rome                  |  **Tier A**   |

---

## 4. Empirical Case Study: Resunga Palika Verification

To enable exact cross-examination, here is the verified benchmark for **Resunga Municipality** extracted directly from [`gulmi_palika_agro_hydrology.json`](file:///Users/prabeshgouli/PrabeshProjects/Projects/WEFE_NEXUS_NEPAL_GULMI/WEFES_NEXUS_NEPAL_GULMI/data/calculated/indicators/gulmi_palika_agro_hydrology.json):

### 4.1 Biophysical Baseline

- **Mean Elevation**: $1,530\text{ m}$ ASL.
- **Cultivated Area**: $1,288.6\text{ ha}$ ($19.4\%$ Khet, $80.6\%$ Bari; NSO Census 2021/22).
- **Soil Profile**: Resunga Forest & Terrace Colluvial Loam; $Z_r = 0.75\text{ m}$; $\text{AWC} = 0.145\text{ m}^3/\text{m}^3$.
- **Total Available Water ($TAW$)**: $108.7\text{ mm}$ (FAO-56 Eq. 82: $1000 \times 0.145 \times 0.75$).
- **Readily Available Water ($RAW$)**: $54.4\text{ mm}$ (FAO-56 Eq. 83: $p = 0.50$).
- **Moisture Stress Storage Threshold**: $S_{\text{threshold}} = TAW - RAW = \mathbf{54.35\text{ mm}}$.

### 4.2 Complete Monthly Agro-Hydrology Breakdown (Machine Ground Truth)

All metrics are machine-extracted from `gulmi_palika_agro_hydrology.json` (Resunga object):

| Month      | Nepali  | Rain $P$ (mm) | $P_{\text{eff}}$ (mm) | $ET_0$ (mm) | $K_c$ | $ET_c$ (mm) | Climatic Deficit (mm) | Soil $S_{\text{start}}$ (mm) | Soil $S_{\text{end}}$ (mm) | Net Irr $I_{\text{req}}$ (mm) | Deep Perc $DP$ (mm) | Unretained Runoff (mm) | Operational Advisory         |
| :--------- | :------ | ------------: | --------------------: | ----------: | ----: | ----------: | --------------------: | ---------------------------: | -------------------------: | ----------------------------: | ------------------: | ---------------------: | :--------------------------- |
| **Jan**    | माघ     |          18.5 |                  17.9 |        63.7 |  1.05 |        66.9 |                  49.0 |                         21.0 |                        0.0 |                      **49.0** |                 0.0 |                    0.5 | Critical Water Deficit       |
| **Feb**    | फागुन   |          26.9 |                  25.7 |        76.3 |  0.80 |        61.0 |                  35.3 |                          0.0 |                        0.0 |                      **35.3** |                 0.0 |                    1.2 | Critical Water Deficit       |
| **Mar**    | चैत     |          33.2 |                  31.5 |       121.4 |  0.70 |        85.0 |                  53.6 |                          0.0 |                        0.0 |                      **53.6** |                 0.0 |                    1.8 | Critical Water Deficit       |
| **Apr**    | वैशाख   |          67.2 |                  60.0 |       153.4 |  0.95 |       145.7 |                  85.7 |                          0.0 |                        0.0 |                      **85.7** |                 0.0 |                    7.2 | **Peak Deficit Window**      |
| **May**    | जेठ     |         138.9 |                 108.1 |       160.0 |  1.10 |       176.0 |                  67.9 |                          0.0 |                        0.0 |                      **67.9** |                 0.0 |                   30.9 | Critical Water Deficit       |
| **Jun**    | असार    |         324.5 |                 157.5 |       125.7 |  0.90 |       113.1 |                   0.0 |                          0.0 |                       44.3 |                       **0.0** |                 0.0 |                  167.1 | Moderate Stress / Recharge   |
| **Jul**    | साउन    |         494.1 |                 174.4 |        89.4 |  1.15 |       102.8 |                   0.0 |                         44.3 |                      108.7 |                       **0.0** |                 7.2 |                  319.7 | Full Saturation / Surplus    |
| **Aug**    | भदौ     |         371.6 |                 162.2 |        85.4 |  1.10 |        94.0 |                   0.0 |                        108.7 |                      108.7 |                       **0.0** |                68.2 |                  209.4 | Full Saturation / Surplus    |
| **Sep**    | असोज    |         213.7 |                 140.6 |        81.1 |  0.95 |        77.0 |                   0.0 |                        108.7 |                      108.7 |                       **0.0** |                63.6 |                   73.1 | Full Saturation / Surplus    |
| **Oct**    | कात्तिक |          58.2 |                  52.8 |        85.0 |  0.70 |        59.5 |                   6.7 |                        108.7 |                      101.9 |                       **0.0** |                 0.0 |                    5.4 | Residual Soil Carryover      |
| **Nov**    | मंसिर   |           3.4 |                   3.4 |        68.6 |  0.65 |        44.6 |                  41.2 |                        101.9 |                       60.7 |                       **0.0** |                 0.0 |                    0.0 | Soil Storage Depletion       |
| **Dec**    | पुस     |          12.9 |                  12.7 |        61.6 |  0.85 |        52.4 |                  39.7 |                         60.7 |                       21.0 |                      **33.3** |                 0.0 |                    0.3 | Winter Irrigation Triggered  |
| **ANNUAL** | —       |   **1,763.1** |             **946.8** | **1,171.6** |     — | **1,078.0** |             **379.1** |                            — |                          — |                     **324.8** |           **139.0** |              **816.3** | **6 Pumping Deficit Months** |

#### Crucial Scientific Insights Revealed by the Machine Table:

1. **Gross Deficit (8 Months) vs. Pumping Demand (6 Months)**: While potential evapotranspiration exceeds rainfall for 8 months (Oct–May, sum = $379.1\text{ mm}$), the soil moisture buffer carries over from the monsoon, leaving $101.9\text{ mm}$ in October and $60.7\text{ mm}$ in November (both well above the $54.35\text{ mm}$ stress threshold). This satisfies crop demand naturally, so **zero pumping is required until Poush (December)**.
2. **Deep Percolation Timing**: Ground-water recharge occurs strictly during active monsoon saturation in July ($7.2\text{ mm}$), August ($68.2\text{ mm}$), and September ($63.6\text{ mm}$), totaling **$139.0\text{ mm}$** of spring aquifer replenishment.

---

### 4.3 Engineering Sizing for a 10-Hectare Command Cluster

- **Command Area**: $10.0\text{ ha}$ ($0.10\text{ km}^2$).
- **Static Lift**: $120.0\text{ m}$ (Mid-Hill Terraces) $\rightarrow$ **TDH: $132.0\text{ m}$** ($+10\%$ friction allowance validated for 125mm HDPE pipe).
- **Peak Design Deficit (Baisakh / April)**: $85.7\text{ mm/month}$.
- **Net Peak Volume ($V\_{\text{net}}$)**: $85.7\text{ mm} \times 10 \times 10\text{ ha} = 8,570\text{ m}^3/\text{month}$.
- **Gross Peak Volume ($\eta\_{\text{irr}} = 0.80$ Drip/Sprinkler)**: $10,712.5\text{ m}^3/\text{month}$.
- **Peak Daily Pumping Volume ($V\_{\text{daily}}$)**: $357.1\text{ m}^3/\text{day}$.
- **Required Flow Rate ($6.0\text{ hr/day}$ solar window)**: $59.5\text{ m}^3/\text{hr} = \mathbf{16.53\text{ L/s}}$.
- **Hydraulic Power ($P\_{\text{hyd}}$)**:
  $$P_{\text{hyd}} = \frac{9.81 \times (59.5 / 3600) \times 132.0}{1} = \mathbf{21.4\text{ kW}}$$
- **Connected Motor Power ($\eta\_{\text{wire-to-water}} = 0.65$)**:
  $$P_{\text{motor}} = \frac{21.4\text{ kW}}{0.65} = \mathbf{32.9\text{ kW}} \approx \mathbf{44.1\text{ HP}}$$
- **Solar PV Generator Rating**:
  - Peak Daily Hydraulic Energy:
    $$E_{\text{hyd}} = \frac{9.81 \times 357.1 \times 132.0}{3600} = 128.4\text{ kWh/day}$$
  - PV Generator Capacity (using April design-month insolation $\text{PVOUT} = 4.8\text{ kWh/kWp/d}$, $\eta_{\text{derate}} = 0.85$):
    $$P_{\text{pv}} = \frac{128.4}{4.8 \times 0.65 \times 0.85} = \mathbf{48.43\text{ kWp}}$$
  - Module Count using Tier-1 550W Mono PERC modules:
    $$N_{\text{panels}} = \left\lceil \frac{48.43 \times 1000}{550} \right\rceil = \lceil 88.05 \rceil = \mathbf{89\text{ panels}} \quad (48.95\text{ kWp installed})$$
  - _(If using conservative annual minimum $\text{PVOUT} = 4.2\text{ kWh/kWp/d}$: $55.3\text{ kWp}$, $101$ modules)_.
- **Ridge Header Buffer Reservoir**: Sized for $357\text{ m}^3$ (24-hour peak storage buffer).
- **Annual Electricity Demand ($10\text{ ha} \times 324.8\text{ mm}$)**:
  - Specific Energy per mm per ha:
    $$e = \frac{9.81 \times 10\text{ m}^3 \times 132.0\text{ m}}{3600 \times 0.65 \times 0.80} = 6.924\text{ kWh/(mm}\cdot\text{ha)}$$
  - Total Annual Consumption:
    $$E_{\text{annual}} = 324.8\text{ mm} \times 10\text{ ha} \times 6.924\text{ kWh/(mm}\cdot\text{ha)} = \mathbf{22,489\text{ kWh/year}}$$
- **Annual NEA Grid Electricity Bill (@ NPR 5.00/kWh)**: $\mathbf{\text{NPR } 112,445/\text{year}}$.
- **Diesel Generator Offset Baseline**:
  - Annual Diesel Consumption (@ $0.35\text{ L/kWh}$): $\mathbf{7,871\text{ L/year}}$.
  - Annual Fuel Expenditure Saved (@ NPR 175/L): $\mathbf{\text{NPR } 1,377,425/\text{year}}$.
  - Carbon Emissions Avoided (@ $2.68\text{ kg CO}_2/\text{L}$): $\mathbf{21.1\text{ tCO}_2/\text{year}}$.

---

## 5. Automated Rule Invariant Verification

To guarantee that no synthetic numbers or broken calculations enter the system, the automated verification script [`scripts/verify_data_integrity.py`](file:///Users/prabeshgouli/PrabeshProjects/Projects/WEFE_NEXUS_NEPAL_GULMI/WEFES_NEXUS_NEPAL_GULMI/scripts/verify_data_integrity.py) enforces **7 mandatory platform rules**:

```bash
# Execute Automated Verification Suite
python3 scripts/verify_data_integrity.py
```

### The 7 Platform Verification Invariants:

1. **Rule 1 (Zero-Synthesis in `data/real/`)**: Confirms all raw files originate strictly from official government records or peer-reviewed portals.
2. **Rule 2 (Physical Disk Existence)**: Validates that every file cited in code and provenance registries physically exists on disk.
3. **Rule 3 (Engine Isolation)**: Ensures headless engines contain zero imports from frontend UI apps.
4. **Rule 4 (Data Provenance Declarations)**: Enforces `// [DATA PROVENANCE]` headers on all consuming data modules.
5. **Rule 5 (Legend Contract Alignment)**: Verifies that map layer subfilters correspond to type-safe legend contracts.
6. **Rule 6 (District Palika Harmonization)**: Enforces consistent naming across all 12 Local Government Palikas of Gulmi.
7. **Rule 7 (Numerical Invariants & Mass Balance Closure)**:
   - $\sum P_{\text{monthly}} = P_{\text{annual}}$ ($\pm 0.5\text{ mm}$).
   - $\sum P_{\text{eff, monthly}} = P_{\text{eff, annual}}$ ($\pm 0.5\text{ mm}$).
   - $\sum ET_{c, \text{monthly}} = ET_{c, \text{annual}}$ ($\pm 0.5\text{ mm}$).
   - $\sum I_{\text{req, monthly}} = I_{\text{req, annual}}$ ($\pm 0.5\text{ mm}$).
   - $\sum DP_{\text{monthly}} = DP_{\text{annual}}$ ($\pm 0.5\text{ mm}$).
   - $TAW = 1000 \cdot Z_r \cdot \text{AWC}$ for all 12 Palikas.
   - Monthly net deficit count strictly matches annual summary counter.

**Status**: **All 12 Palikas pass all 7 rules with zero mass-balance errors.**

---

## 6. Scientific Uncertainty & Sensitivity Analysis (OAT Matrix)

To satisfy academic peer review, all **Tier C** assumptions are subjected to a One-At-A-Time (OAT) parameter sensitivity analysis for the Resunga 10-ha design benchmark:

| Parameter                                        |    Baseline Value    |                  Sensitivity Range                   |                     Headline Impact on Peak Discharge ($Q$)                      |                 Headline Impact on Annual Energy ($E_{\text{annual}}$)                 |               Headline Impact on Solar PV Array ($P_{\text{pv}}$)                |
| :----------------------------------------------- | :------------------: | :--------------------------------------------------: | :------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------: |
| **Irrigation Efficiency ($\eta\_{\text{irr}}$)** |     0.80 (Drip)      | 0.70 – 0.90 (Drip/Sprinkler)<br>0.45 (Surface flood) | $14.7\text{ L/s} \rightarrow 18.9\text{ L/s}$<br>($29.4\text{ L/s}$ for surface) | $19,990\text{ kWh} \rightarrow 25,700\text{ kWh}$<br>($39,980\text{ kWh}$ for surface) | $43.0\text{ kWp} \rightarrow 55.3\text{ kWp}$<br>($86.0\text{ kWp}$ for surface) |
| **Wire-to-Water Efficiency ($\eta$)**            |         0.65         |                     0.55 – 0.75                      |                        No impact on $Q$ (hydraulic flow)                         |                   $19,490\text{ kWh} \rightarrow 26,580\text{ kWh}$                    |                  $41.9\text{ kWp} \rightarrow 57.2\text{ kWp}$                   |
| **Friction Head Allowance**                      | +10% ($132\text{m}$) |      +5% – +20% ($126\text{m}$ – $144\text{m}$)      |                                 No impact on $Q$                                 |                   $21,466\text{ kWh} \rightarrow 24,533\text{ kWh}$                    |                  $46.2\text{ kWp} \rightarrow 52.8\text{ kWp}$                   |
| **Design Solar Yield ($\text{PVOUT}$)**          |     4.8 (April)      |            4.2 (Annual min) – 5.2 (Sunny)            |                     No impact on $Q$ or $E_{\text{annual}}$                      |                                       No impact                                        |                  $44.7\text{ kWp} \rightarrow 55.3\text{ kWp}$                   |
| **Allowable Depletion ($p$)**                    |         0.50         |                     0.40 – 0.60                      |                          No impact on peak April depth                           |                 Residual storage shifts by $\pm 10.8\text{ mm}$ in Dec                 |                                    No impact                                     |

---

## 7. Authoritative References & Empirical Standards

1. **Allen, R.G., Pereira, L.S., Raes, D., & Smith, M. (1998/2000)**. _Crop Evapotranspiration: Guidelines for computing crop water requirements_. FAO Irrigation and Drainage Paper No. 56, Food and Agriculture Organization of the United Nations, Rome, 326p.
   - _Eq. 6 (Penman-Monteith ET0, p. 65); Table 12 (Crop Kc coefficients, p. 110); Table 19 (Soil water retention characteristics for textural classes, p. 166); Eq. 82 (TAW, p. 162); Eq. 83 (RAW, p. 162); Table 22 (Depletion fraction p, p. 163); Eq. 84 (Transpiration reduction Ks, p. 169)._
2. **USDA Soil Conservation Service (1967)**. _Irrigation Water Requirements_. Technical Release No. 21 (TR-21), Engineering Division, Soil Conservation Service, Washington D.C. _(Source of the SCS monthly effective precipitation formula used in FAO CROPWAT 8.0)._
3. **Funk, C., et al. (2015)**. The climate hazards group infrared precipitation with stations (CHIRPS): a new environmental record for monitoring extremes. _Scientific Data_, 2, 150066. _(High-resolution multi-decadal gridded precipitation baseline)._
4. **ISO 9906:2012**. _Rotodynamic pumps — Hydraulic performance acceptance tests — Grades 1, 2 and 3_. International Organization for Standardization, Geneva, Switzerland.
5. **Global Solar Atlas 2.0 (2020)**. Solar resource data and photovoltaic potential: Solargis, ESMAP, and World Bank Group.
6. **Intergovernmental Panel on Climate Change (IPCC) (2006)**. _2006 IPCC Guidelines for National Greenhouse Gas Inventories_, Volume 2: Energy, Chapter 3: Mobile and Stationary Combustion.
7. **National Statistics Office (NSO), Nepal (2023)**. _National Census of Agriculture 2021/22: District Profile — Gulmi_. Government of Nepal, Kathmandu.
8. **Nepal Agricultural Research Council (NARC) (2021)**. _Soil Science Division Physical and Chemical Analytical Database: Gulmi District_. Khumaltar, Lalitpur, Nepal.
9. **Electricity Regulatory Commission (ERC) & Nepal Electricity Authority (NEA) (2023)**. _Approved Tariff Schedule for Dedicated Rural Agricultural Feeders and Lift Irrigation Systems_. Kathmandu, Nepal.
