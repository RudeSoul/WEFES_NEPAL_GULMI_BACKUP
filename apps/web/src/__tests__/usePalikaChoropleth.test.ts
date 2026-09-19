// [DATA PROVENANCE]
// Data Source: apps/web/src/hooks/usePalikaChoropleth.ts, apps/web/src/hooks/choroplethUtils.ts
// Classification: UNIT TEST (Dynamic Palika Choropleth Joining & Normalization)
// Citations: MoFAGA Nepal Local Levels Catalog, CBS 2021 Census

import { describe, it, expect } from 'vitest';
import {
  normalizePalikaName,
  computeGradientColor,
  CHOROPLETH_RAMPS,
} from '../hooks/choroplethUtils';
import { DISTRICT_PALIKAS } from '../data/districtPalikaAssets';

describe('Track B: Dynamic Palika Attribute Joining (choroplethUtils)', () => {
  describe('normalizePalikaName', () => {
    it('normalizes palika names by lowercasing and stripping whitespace and punctuation', () => {
      expect(normalizePalikaName('Resunga')).toBe('resunga');
      expect(normalizePalikaName('Gulmidarbar Gaunpalika')).toBe('gulmidarbargaunpalika');
      expect(normalizePalikaName('Kali Gandaki')).toBe('kaligandaki');
      expect(normalizePalikaName('Ruru-Kshetra')).toBe('rurukshetra');
      expect(normalizePalikaName('Chandrakot (चन्द्रकोट)')).toBe('chandrakot');
    });

    it('handles empty or undefined strings gracefully', () => {
      expect(normalizePalikaName('')).toBe('');
      expect(normalizePalikaName(null as unknown as string)).toBe('');
      expect(normalizePalikaName(undefined as unknown as string)).toBe('');
    });
  });

  describe('computeGradientColor', () => {
    it('returns exact boundary colors for minimum and maximum values', () => {
      const palette = CHOROPLETH_RAMPS.ylgn;
      const minColor = computeGradientColor(0, 0, 100, palette);
      const maxColor = computeGradientColor(100, 0, 100, palette);

      expect(minColor).toContain('rgb(');
      expect(maxColor).toContain('rgb(');
      expect(minColor).not.toBe(maxColor);
    });

    it('clamps values beyond specified domain range', () => {
      const palette = CHOROPLETH_RAMPS.rdylgn;
      const atMin = computeGradientColor(40, 40, 95, palette);
      const belowMin = computeGradientColor(10, 40, 95, palette);
      expect(belowMin).toBe(atMin);

      const atMax = computeGradientColor(95, 40, 95, palette);
      const aboveMax = computeGradientColor(120, 40, 95, palette);
      expect(aboveMax).toBe(atMax);
    });

    it('falls back to neutral slate for NaN or null values', () => {
      expect(computeGradientColor(NaN, 0, 100, CHOROPLETH_RAMPS.blues)).toBe('#94a3b8');
      expect(computeGradientColor(null as unknown as number, 0, 100, CHOROPLETH_RAMPS.blues)).toBe('#94a3b8');
    });
  });

  describe('Palika Inventory Verification', () => {
    it('verifies all 12 Gulmi local levels are present in municipal dataset', () => {
      const gulmiPalikas = DISTRICT_PALIKAS['gulmi'] || [];
      expect(gulmiPalikas.length).toBe(12);

      const expectedPalikas = [
        'chandrakot',
        'chatrakot',
        'dhurkot',
        'gulmidarbar',
        'isma',
        'kaligandaki',
        'madane',
        'malika',
        'musikot',
        'resunga',
        'ruru',
        'satyawati',
      ];

      const actualNormalized = gulmiPalikas.map((p) => normalizePalikaName(p.name));
      for (const exp of expectedPalikas) {
        expect(actualNormalized).toContain(exp);
      }
    });
  });

  describe('Multi-Pillar SubFilter Dynamic Choropleth Joining', () => {
    // Mock GeoJson features for Gulmi Palikas
    const mockGeoJson = {
      type: 'FeatureCollection',
      features: [
        { properties: { name: 'Resunga', nepaliName: 'रेसुङ्गा', type: 'Nagarpalika', areaSqKm: 83.77 } },
        { properties: { name: 'Kaligandaki', nepaliName: 'कालीगण्डकी', type: 'Gaunpalika', areaSqKm: 101.01 } },
        { properties: { name: 'Chandrakot', nepaliName: 'चन्द्रकोट', type: 'Gaunpalika', areaSqKm: 105.72 } },
      ],
    };

    // Test runner executing computePalikaChoropleth directly
    async function evaluateChoropleth(params: any) {
      const { computePalikaChoropleth } = await import('../hooks/usePalikaChoropleth');
      return computePalikaChoropleth(params);
    }

    it('updates metric config and palika values when food mode changes to barkhe_summer', async () => {
      const resSingle = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'food',
        subFilters: { foodMode: 'single_crop', crop: 'coffee' },
      });

      expect(resSingle.metricConfig.pillar).toBe('food');
      expect(resSingle.metricConfig.metricKey).toContain('crop_');

      // Switch to barkhe summer
      const resBarkhe = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'food',
        subFilters: { foodMode: 'barkhe_summer' },
      });

      expect(resBarkhe.metricConfig.metricKey).toBe('barkhe_summer');
      expect(resBarkhe.metricConfig.label).toContain('Barkhe');
      expect(resBarkhe.joinedData['Resunga']?.value).toBeGreaterThan(0);
      expect(resBarkhe.joinedData['Kaligandaki']?.value).toBeGreaterThan(0);
    });

    it('updates metric config and palika values when water subfilter changes to irrigation_potential', async () => {
      const resRain = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'water',
        subFilters: { waterSubFilter: 'merra_rainfall' },
      });
      expect(resRain.metricConfig.metricKey).toBe('downscaled_rainfall');

      const resIrrig = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'water',
        subFilters: { waterSubFilter: 'irrigation_potential' },
      });

      expect(resIrrig.metricConfig.metricKey).toBe('irrigation_potential');
      expect(resIrrig.joinedData['Kaligandaki']?.value).toBe(88); // Riverbed alluvial flat
    });

    it('updates metric config when ecosystem subfilter changes to soil_nitrogen and elevation_zones', async () => {
      const resN = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'ecosystem',
        subFilters: { ecoSubFilter: 'soil_nitrogen' },
      });

      expect(resN.metricConfig.metricKey).toBe('soil_nitrogen');
      expect(resN.joinedData['Chandrakot']?.value).toBe(0.172);

      const resElev = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'ecosystem',
        subFilters: { ecoSubFilter: 'elevation_zones' },
      });

      expect(resElev.metricConfig.metricKey).toBe('elevation_zones');
      expect(resElev.joinedData['Chandrakot']?.value).toBe(1603);
    });

    it('updates metric config when energy subfilter changes to solar_irradiance and grid_electrification', async () => {
      const resSolar = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'energy',
        subFilters: { energySubFilter: 'solar_irradiance' },
      });

      expect(resSolar.metricConfig.metricKey).toBe('solar_irradiance');
      expect(resSolar.joinedData['Resunga']?.formattedValue).toContain('kWh/kWp/d');

      const resGrid = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'energy',
        subFilters: { energySubFilter: 'grid_electrification' },
      });

      expect(resGrid.metricConfig.metricKey).toBe('grid_reach');
      expect(resGrid.joinedData['Resunga']?.formattedValue).toContain('Tamghas Substation (Unaichaur)');
    });

    it('updates metric config when socioeconomics subfilter changes to hq_market_proximity and agri_landholding', async () => {
      const resRoad = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'socioeconomics',
        subFilters: { socioSubFilter: 'hq_market_proximity' },
      });

      expect(resRoad.metricConfig.metricKey).toBe('road_access');
      expect(resRoad.joinedData['Resunga']?.value).toBe(0.3);

      const resLand = await evaluateChoropleth({
        rawGeoJson: mockGeoJson,
        selectedPillar: 'socioeconomics',
        subFilters: { socioSubFilter: 'agri_landholding' },
      });

      expect(resLand.metricConfig.metricKey).toBe('landholding');
      expect(resLand.joinedData['Kaligandaki']?.value).toBe(6.37);
    });
  });
});

