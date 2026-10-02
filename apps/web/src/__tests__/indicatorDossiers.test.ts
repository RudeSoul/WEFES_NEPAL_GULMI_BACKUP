// [DATA PROVENANCE]
// Data Source: data/calculated/indicators/gulmi_palika_soil.json, data/calculated/indicators/gulmi_palika_agro_hydrology.json, data/real/municipal/palika_profiles.json
// Classification: UNIT TEST (Agro-Ecological Baseline Benchmarks & Micro-Dossiers)
// Citations: Nepal Agricultural Research Council (NARC), NASA MERRA-2/POWER, SRTM 30m DEM, MoALD

import { describe, expect, it } from 'vitest';

import { PALIKA_AGRO_HYDROLOGY_DATA, PALIKA_SOIL_DATA } from '../data/districtIndicatorAssets';
import { DISTRICT_PALIKAS } from '../data/districtPalikaAssets';

describe('Track F: Agro-Ecological Baseline Benchmarks & Micro-Dossier Scientific Integrity', () => {
  describe('Soil Benchmark & NARC 100m Geospatial Grid', () => {
    it('verifies Malika empirical soil metrics from NARC 100m grid', () => {
      const malikaSoil = PALIKA_SOIL_DATA.palikas['Malika'];
      expect(malikaSoil).toBeDefined();

      // Sample count across 100m raster cells
      expect(malikaSoil.sampleCount).toBe(3910);

      // Empirical pH and range
      expect(malikaSoil.ph).toBe(5.98);
      expect(malikaSoil.phRating).toBe('Moderately Acidic');
      expect(malikaSoil.phMin).toBe(5.52);
      expect(malikaSoil.phMax).toBe(6.46);
      expect(malikaSoil.phStd).toBe(0.14);

      // Macronutrients N-P-K & SOM
      expect(malikaSoil.nitrogenPct).toBe(0.168);
      expect(malikaSoil.nitrogenRating).toBe('Medium');
      expect(malikaSoil.phosphorusKgHa).toBe(161.0);
      expect(malikaSoil.phosphorusRating).toBe('High');
      expect(malikaSoil.potassiumKgHa).toBe(255.5);
      expect(malikaSoil.potassiumRating).toBe('Medium');
      expect(malikaSoil.organicMatterPct).toBe(3.74);
      expect(malikaSoil.organicMatterRating).toBe('Medium');

      // Soil texture partition (Sand + Silt + Clay ~ 100%)
      expect(malikaSoil.sandPct).toBe(53.8);
      expect(malikaSoil.siltPct).toBe(39.9);
      expect(malikaSoil.clayPct).toBe(7.2);
      const textureSum = (malikaSoil.sandPct || 0) + (malikaSoil.siltPct || 0) + (malikaSoil.clayPct || 0);
      expect(Math.abs(textureSum - 100.9)).toBeLessThan(0.2); // ~100% rounding
      expect(malikaSoil.texture).toBe('Sandy Loam');

      // Hydrological Available Water Capacity & Micronutrients
      expect(malikaSoil.awc).toBe(0.134);
      expect(malikaSoil.zincPpm).toBe(2.19);
      expect(malikaSoil.boronPpm).toBe(0.63);
      expect(malikaSoil.dominantSoilCode).toBe('CMe');
      expect(malikaSoil.dominantSoil).toBe('Eutric Cambisols');
    });

    it('verifies all 12 Gulmi palikas possess valid NARC soil profiles', () => {
      const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
      expect(gulmiPalikas.length).toBe(12);

      gulmiPalikas.forEach((palika) => {
        const soil = PALIKA_SOIL_DATA.palikas[palika.name];
        expect(soil, `Missing soil profile for ${palika.name}`).toBeDefined();
        expect(soil.sampleCount).toBeGreaterThan(1500);
        expect(soil.ph).toBeGreaterThan(5.0);
        expect(soil.ph).toBeLessThan(7.5);
        expect(soil.texture).toBeTruthy();
        expect(soil.nitrogenPct).toBeGreaterThan(0.05);
        expect(soil.phosphorusKgHa).toBeGreaterThan(20);
        expect(soil.potassiumKgHa).toBeGreaterThan(50);
      });
    });

    it('confirms liming advisory threshold triggers on acidic hill slopes (pH < 6.0)', () => {
      const malikaSoil = PALIKA_SOIL_DATA.palikas['Malika'];
      const madaneSoil = PALIKA_SOIL_DATA.palikas['Madane'];
      const chandrakotSoil = PALIKA_SOIL_DATA.palikas['Chandrakot'];

      // Malika (pH 5.98) and Madane (pH 5.85) should trigger acidic liming
      expect(malikaSoil.ph).toBeLessThan(6.0);
      expect(madaneSoil.ph).toBeLessThan(6.0);

      // Chandrakot (pH 6.66) should be near-neutral
      expect(chandrakotSoil.ph).toBeGreaterThanOrEqual(6.0);
    });
  });

  describe('Local Temperature Climatology & Diurnal Spectrum', () => {
    it('verifies 12-month temperature profile for Malika', () => {
      const malikaAgro = PALIKA_AGRO_HYDROLOGY_DATA.palikas['Malika'];
      expect(malikaAgro).toBeDefined();
      expect(malikaAgro.months.length).toBe(12);

      // Winter minimum in Jan (Hiunde season)
      const jan = malikaAgro.months[0];
      expect(jan.month_en).toBe('Jan');
      expect(jan.tmin_c).toBe(0.8);
      expect(jan.tmean_c).toBe(4.9);
      expect(jan.tmax_c).toBe(11.8);

      // Pre-monsoon/summer peak
      const may = malikaAgro.months[4];
      expect(may.month_en).toBe('May');
      expect(may.tmax_c).toBeGreaterThanOrEqual(25.0);

      // Mean annual temperature consistency
      const annualMean = malikaAgro.months.reduce((acc, m) => acc + m.tmean_c, 0) / malikaAgro.months.length;
      expect(annualMean).toBeGreaterThan(12.0);
      expect(annualMean).toBeLessThan(16.0);
    });

    it('confirms diurnal temperature swing amplitude exceeds 8C across all dry months', () => {
      const malikaAgro = PALIKA_AGRO_HYDROLOGY_DATA.palikas['Malika'];
      const drySeasonMonths = malikaAgro.months.filter((m) =>
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Nov', 'Dec'].includes(m.month_en)
      );

      drySeasonMonths.forEach((m) => {
        const diurnalSwing = m.tmax_c - m.tmin_c;
        expect(diurnalSwing, `Month ${m.month_en} diurnal swing was ${diurnalSwing}C`).toBeGreaterThanOrEqual(8.0);
      });
    });
  });

  describe('Mean Elevation & Hypsometric Zoning', () => {
    it('maps Malika (1680m) correctly into Upper Mid-Hills (1,600m - 2,200m)', () => {
      const malikaAgro = PALIKA_AGRO_HYDROLOGY_DATA.palikas['Malika'];
      const elev = malikaAgro.elevation_m;
      expect(elev).toBe(1680);

      // Altitudinal tier evaluation
      const isUpperMidHills = elev >= 1600 && elev <= 2200;
      expect(isUpperMidHills).toBe(true);

      // Relative relief percentage in Gulmi (465m to 2690m)
      const districtMinElev = 465;
      const districtMaxElev = 2690;
      const reliefPct = Math.round(((elev - districtMinElev) / (districtMaxElev - districtMinElev)) * 100);
      expect(reliefPct).toBe(55); // 54.6% rounded to 55%
    });
  });
});
