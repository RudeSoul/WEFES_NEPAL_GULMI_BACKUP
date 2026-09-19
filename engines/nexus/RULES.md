# Rules for Nexus Simulation Engine (`engines/nexus/`)

## 1. Browser & Node Compatibility
- The engine core MUST remain browser-compatible.
- DO NOT use Node-only APIs (`fs`, `child_process`, `os`, `net`) inside `src/`.
- All algorithms must be pure functions with zero global side effects.

## 2. Unit Conversions
- All internal calculations MUST be performed in standard SI units (meters, kilograms, hectares).
- Conversion to Nepali local units (Ropani, Bigha) must occur only via `src/conversions.ts`.

## 3. Adding New Crop Models
- Crop parameters must be added to `src/models/` and include citations to NARC (Nepal Agricultural Research Council) or FAO ECOCROP databases.
- Hardcoded constants without documentation are strictly prohibited.

## 4. Testing
- Every public function must have corresponding unit tests in `src/__tests__/` verifying boundary conditions.
