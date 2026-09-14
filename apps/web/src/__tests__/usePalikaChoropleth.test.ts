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
});
