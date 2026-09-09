# Energy Pillar Engine Governance Rules

## 1. Thermodynamic & Hydraulic Rigor
- Power calculations must account for gravitational constant ($g = 9.81\text{ m/s}^2$), water density, turbine efficiency, and generator losses.
- Solar estimations must account for temperature de-rating and inverter efficiency factors.

## 2. Decoupled Autonomy
- Any standalone energy generation pipeline must be self-contained within `engines/energy/`.
- Interactive models live in `engines/nexus/src/models/energy/` and re-export via the master barrel.
