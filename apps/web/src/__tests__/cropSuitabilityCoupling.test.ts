// [DATA PROVENANCE]
// Data Source: apps/web/src/hooks/usePalikaChoropleth.ts, apps/web/src/utils/climateDownscaling.ts
// Classification: UNIT TEST (Biophysical Microclimate Downscaling & Crop Suitability Coupling)
// Citations: MoALD, MoFAGA Nepal, DHM Nepal, Survey Department

import { describe, it, expect } from 'vitest';
import { getPalikaMicroClimate, GULMI_PALIKA_CLIMATE_PROFILES } from '../utils/climateDownscaling';
import rawPalikaData from '../../../../data/real/municipal/palika_profiles.json';
import { DISTRICT_PALIKAS } from '../data/districtPalikaAssets';

describe('Track E: Biophysical Climate Lapse & Crop Suitability Coupling', () => {
  describe('Environmental Lapse Rate & Orographic Precipitation', () => {
    it('verifies elevation gradient from lowest gorge (Kaligandaki 890m) to highest massif (Madane 1750m)', () => {
      const lowGorge = GULMI_PALIKA_CLIMATE_PROFILES.kaligandaki;
      const highMassif = GULMI_PALIKA_CLIMATE_PROFILES.madane;

      expect(lowGorge.elevation).toBe(890);
      expect(highMassif.elevation).toBe(1750);
      expect(highMassif.elevation - lowGorge.elevation).toBe(860);
    });

    it('calculates physical adiabatic temperature lapse (-5.8C per 1,000m) accurately', () => {
      const baseTemp = 20.0;
      const baseRain = 100.0;

      const lowClimate = getPalikaMicroClimate('Kaligandaki', baseRain, baseTemp, 7);
      const highClimate = getPalikaMicroClimate('Madane', baseRain, baseTemp, 7);

      // Higher altitude must be colder
      expect(lowClimate.monthlyTempC).toBeGreaterThan(highClimate.monthlyTempC);

      // Temperature difference should align with adiabatic lapse
      const expectedDelta = (highClimate.elevation - lowClimate.elevation) * 0.0058;
      const actualDelta = lowClimate.monthlyTempC - highClimate.monthlyTempC;
      expect(Math.abs(actualDelta - expectedDelta)).toBeLessThan(0.3);
    });

    it('confirms orographic precipitation enhancement on southern/central windward ridges', () => {
      const baseRain = 200.0;
      const resungaClimate = getPalikaMicroClimate('Resunga', baseRain, 18.0, 7);
      const ruruClimate = getPalikaMicroClimate('Ruru', baseRain, 18.0, 7);

      // Resunga (cloud sanctuary) captures significantly more orographic rain than lower Ridi gorge
      expect(resungaClimate.monthlyRainMm).toBeGreaterThan(ruruClimate.monthlyRainMm);
      expect(resungaClimate.orographicFactor).toBeGreaterThan(1.1);
    });
  });

  describe('Palika Crop Feasibility & Limiting Factor Disclosure', () => {
    it('confirms coffee suitability peaks in the mid-hill belt (1,200m - 1,600m)', () => {
      const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
      expect(gulmiPalikas.length).toBe(12);

      const coffeeHotspot = gulmiPalikas.find(p => p.name.toLowerCase() === 'resunga');
      expect(coffeeHotspot).toBeDefined();

      const coffeeCrop = coffeeHotspot?.feasibleCrops.find(c => c.cropId === 'coffee');
      expect(coffeeCrop).toBeDefined();
      expect(coffeeCrop?.score).toBeGreaterThanOrEqual(85);
      expect(coffeeCrop?.rating).toMatch(/Optimal|High/);
    });

    it('identifies limiting factors when crops are pushed outside optimal agro-climatic envelopes', () => {
      const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
      const madaneHigh = gulmiPalikas.find(p => p.name.toLowerCase() === 'madane');
      expect(madaneHigh).toBeDefined();

      // High massifs have limiting factor annotations
      const constrainedCrop = madaneHigh?.feasibleCrops.find(c => c.score < 70);
      if (constrainedCrop) {
        expect(constrainedCrop.limitingFactor).toBeDefined();
        expect(typeof constrainedCrop.limitingFactor).toBe('string');
      }
    });

    it('verifies seasonal cropping rotation cycles (Barkhe and Hiunde) across all 12 Palikas', () => {
      const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];

      for (const palika of gulmiPalikas) {
        if (palika.seasonalRotations) {
          const { barkhe, hiunde } = palika.seasonalRotations;
          if (barkhe) {
            expect(barkhe.cropId).toBeDefined();
            expect(barkhe.emoji).toBeDefined();
          }
          if (hiunde) {
            expect(hiunde.cropId).toBeDefined();
            expect(hiunde.emoji).toBeDefined();
          }
        }
      }
    });
  });
});
