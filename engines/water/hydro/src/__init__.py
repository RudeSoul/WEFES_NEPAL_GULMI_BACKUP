"""
wefes_hydro_engine
==================
Modular Python Engine for Topographic, Hydrologic, and Hydropower Nexus Modeling.
Works with any standard DEM GeoTIFF (Copernicus 30m, ALOS 30m, SRTM, etc.) and
administrative boundary GeoJSON across Nepal or other mountainous regions.

Modules:
  - step1_topography: Priority-Flood sink filling, D8 direction/accumulation, and reach delineation
  - step2_hydrology: WECS/NEA empirical regionalization (ungauged) and gauge-transfer scaling
  - step3_constraints: Environmental flow (DOED E-flow) reservation and design flow allocation
  - step4_energy: Head loss deduction, installed capacity (kW), and 12-month energy yield (MWh)
  - step5_screening: Administrative clipping, boundary apportionment, and slope viability filters
  - step6_verification: AEPC / DOED ground-truth benchmarking and GeoJSON export
"""

from .step1_topography import run_topographic_analysis
from .step2_hydrology import run_hydrological_estimation
from .step3_constraints import apply_environmental_flows
from .step4_energy import simulate_energy_yield
from .step5_screening import apply_spatial_screening
from .step6_verification import verify_and_export

__all__ = [
    "run_topographic_analysis",
    "run_hydrological_estimation",
    "apply_environmental_flows",
    "simulate_energy_yield",
    "apply_spatial_screening",
    "verify_and_export",
]
