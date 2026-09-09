# Nexus Simulation Engine (`engines/nexus/`)

High-speed TypeScript simulation engine for the agricultural, crop suitability, fertilizer balance, and circular bioeconomy dimensions of the WEFES Nexus in Nepal.

---

## Capabilities
- **Crop Suitability Scoring**: FAO ECOCROP parametric thermal/hygrometric models calibrated for Nepal agro-ecological zones (Low Valley, Mid-Hills, Lekh).
- **Fertilizer & Nutrient Balance**: N-P-K stoichiometric requirements, bio-slurry substitution, and soil acidity buffering.
- **Circular Bioeconomy**: Biogas generation potential from livestock manure and agricultural crop residues.
- **Unit Conversions**: Bidirectional conversion across Metric (hectares, kg), Imperial (acres), and Nepali local land units (Ropani-Aana-Paisa-Daam, Bigha-Katha-Dhur).

---

## Usage
Run tests:
```bash
pnpm --filter @wefes/wefes-engine test
```

Build distribution bundle:
```bash
pnpm --filter @wefes/wefes-engine build
```
