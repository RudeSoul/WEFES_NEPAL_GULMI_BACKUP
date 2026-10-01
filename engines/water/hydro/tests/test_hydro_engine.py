#!/usr/bin/env python3
# [DATA PROVENANCE]
# Data Source: Synthetic DEM and hydraulic test fixtures
# Classification: UNIT TEST SUITE FOR HYDRO-ENGINE
# Citations: Python standard library unittest; BHA/IHA hydraulic equations

"""
test_hydro_engine.py
=====================
Automated unit tests for the WEFES Hydro Engine:
1. Test Plane Slope & Flow Accumulation (Acyclic DAG verification)
2. Test Depression Filling (Wang & Liu priority-flood behavior)
3. Test NoData Dirichlet-Laplace Smoothing
4. Test Curvilinear Path Distance vs Cell Count
5. Test Net Head & Environmental Flow Power Equation (P = 9.81 * Q_turb * H_net * eta)
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path
import numpy as np
from rasterio.transform import Affine

ENGINE_DIR = Path(__file__).resolve().parent.parent
if str(ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(ENGINE_DIR))

from src.step1_dem_io import clean_nodata_values
from src.step2_depression_filling import fill_sinks_wang_liu
from src.step3_flow_routing import compute_d8_flow_direction, compute_d8_flow_accumulation
from src.step4_stream_network import segment_reaches_and_extract_head_tail
from src.step5_power_calculation import calculate_hydropower_potential


class TestHydroEngine(unittest.TestCase):

    def test_01_planar_slope_flow_accumulation(self):
        """Tests that a uniform tilted planar DEM flows downhill and forms an acyclic DAG."""
        # 10x10 tilted plane draining towards (9, 9)
        r, c = np.indices((10, 10))
        dem = 1000.0 - 10.0 * r - 10.0 * c  # Highest at (0,0), lowest at (9,9)
        dem = dem.astype(np.float32)

        fdir, rr, rc, fdir_qa = compute_d8_flow_direction(dem, pix_w=30.0, pix_h=30.0)
        # All cells drain towards (9,9), with (9,9) being the terminal basin outlet
        self.assertEqual(fdir_qa["boundary_outlet_cells"], 1)
        self.assertEqual(fdir_qa["active_draining_cells"], 99)

        acc_cells, acc_km2, acc_qa = compute_d8_flow_accumulation(rr, rc, pix_w=30.0, pix_h=30.0)
        self.assertTrue(acc_qa["is_acyclic_dag"])
        self.assertEqual(acc_qa["unresolved_cells"], 0)
        self.assertEqual(acc_cells[0, 0], 1.0)  # Ridge top
        self.assertGreater(acc_cells[9, 9], 1.0) # Drains full surface

    def test_02_depression_filling(self):
        """Tests priority-flood depression filling on a bowl terrain with an internal pit."""
        # Create a 7x7 bowl: outer rim at 200m, sloping down to 150m, with a center sink pit at 50m
        r, c = np.indices((7, 7))
        dist_from_center = np.maximum(np.abs(r - 3), np.abs(c - 3))
        dem = (150.0 + dist_from_center * 10.0).astype(np.float32)
        # Inject artificial sink at center (3,3)
        dem[3, 3] = 50.0

        filled, qa_stats = fill_sinks_wang_liu(dem, min_slope_deg=0.01, pix_w=30.0, pix_h=30.0)
        
        # Center pit should be raised up to at least the surrounding slope level (>140m)
        self.assertGreaterEqual(filled[3, 3], 150.0)
        self.assertGreaterEqual(qa_stats["filled_cells"], 1)
        self.assertAlmostEqual(qa_stats["max_elevation_lift_m"], 130.0, delta=2.0)

    def test_03_nodata_dirichlet_laplace(self):
        """Tests that NoData voids are smoothly filled without NaNs or cliffs."""
        dem = np.full((10, 10), 500.0, dtype=np.float32)
        # Inject NoData void in center
        dem[4:6, 4:6] = -9999.0
        profile = {"nodata": -9999.0}

        cleaned, qa = clean_nodata_values(dem, profile)
        self.assertEqual(qa["void_cells"], 4)
        self.assertTrue(np.all(np.isfinite(cleaned)))
        self.assertTrue(np.all(cleaned >= 499.0))
        self.assertTrue(np.all(cleaned <= 501.0))

    def test_04_curvilinear_path_distance(self):
        """Tests that reach segmentation measures actual euclidean distance in meters."""
        dem = np.zeros((20, 20), dtype=np.float32)
        for i in range(20):
            dem[i, i] = 500.0 - i * 10.0
            
        stream_mask = np.zeros((20, 20), dtype=np.uint8)
        receiver_r = np.full((20, 20), -1, dtype=np.int32)
        receiver_c = np.full((20, 20), -1, dtype=np.int32)
        acc_km2 = np.ones((20, 20), dtype=np.float64) * 5.0

        for i in range(19):
            stream_mask[i, i] = 1
            receiver_r[i, i] = i + 1
            receiver_c[i, i] = i + 1
        stream_mask[19, 19] = 1

        transform = Affine(30.0, 0.0, 83.0, 0.0, -30.0, 28.0)
        reaches, qa = segment_reaches_and_extract_head_tail(
            filled_dem=dem,
            stream_mask=stream_mask,
            receiver_r=receiver_r,
            receiver_c=receiver_c,
            acc_km2=acc_km2,
            transform=transform,
            pix_w=30.0,
            pix_h=30.0,
            target_reach_len_m=200.0,  # Each diagonal step is sqrt(30^2+30^2) = 42.42m
            district="TestDistrict"
        )
        self.assertGreater(len(reaches), 1)
        for r in reaches:
            self.assertGreater(r["length_m"], 0.0)
            self.assertIn("upstream_z_m", r)
            self.assertIn("downstream_z_m", r)

    def test_05_power_equation_net_head_and_env_flow(self):
        """
        Tests the BHA/IHA power calculation:
        Gross Head = 100m, Head Loss Factor = 0.90 -> Net Head = 90m
        Catchment = 10 km², Specific Discharge = 0.032 -> Q_gross = 0.32 m³/s
        Env Reserve = 10% -> Q_env = 0.032 m³/s -> Q_turb = 0.288 m³/s
        P = 9.81 * 0.288 * 90.0 * 0.70 = 178.026 kW
        """
        synthetic_reaches = [{
            "reach_id": 1,
            "district": "Gulmi",
            "upstream_x": 83.1,
            "upstream_y": 28.1,
            "upstream_z_m": 500.0,
            "downstream_x": 83.11,
            "downstream_y": 28.11,
            "downstream_z_m": 400.0,  # 100m gross head
            "catchment_km2": 10.0,
            "length_m": 500.0,
            "slope_pct": 20.0,
            "line_coords": [[83.1, 28.1], [83.11, 28.11]]
        }]

        enriched, qa = calculate_hydropower_potential(
            synthetic_reaches,
            specific_discharge=0.032,
            efficiency=0.70,
            head_loss_factor=0.90,
            capacity_factor=0.60,
            env_flow_fraction=0.10
        )

        r = enriched[0]
        self.assertEqual(r["gross_head_m"], 100.0)
        self.assertEqual(r["net_head_m"], 90.0)
        self.assertEqual(r["discharge_gross_m3s"], 0.32)
        self.assertEqual(r["discharge_turbined_m3s"], 0.288)

        expected_power_kw = 9.81 * 0.288 * 90.0 * 0.70
        self.assertAlmostEqual(r["power_potential_kw"], expected_power_kw, places=2)
        self.assertAlmostEqual(r["power_potential_mw"], expected_power_kw / 1000.0, places=3)


if __name__ == "__main__":
    unittest.main()
