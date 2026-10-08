// [DATA PROVENANCE]
// Data Source: engines/nexus/src/conversions.ts
// Classification: UNIT TEST (Nexus Engine Metric System Validation)
// Citations: FAO Agronomic Standards & CBS Nepal Agricultural Unit Metrics

import { describe, it, expect } from 'vitest';
import { convertToBaseUnit, formatUnitName, UNIT_CONVERSIONS } from '../conversions';

describe('Nexus Engine Metric Conversions', () => {
  it('correctly converts kilograms to base unit', () => {
    const result = convertToBaseUnit(100, 'kg');
    expect(result.baseQuantity).toBe(100);
    expect(result.baseUnit).toBe('kg');
  });

  it('correctly converts metric tons to kg base unit', () => {
    const result = convertToBaseUnit(2.5, 'metric_ton');
    expect(result.baseQuantity).toBe(2500);
    expect(result.baseUnit).toBe('kg');
  });

  it('correctly converts 50kg standard bags to kg base unit', () => {
    const result = convertToBaseUnit(10, 'bag');
    expect(result.baseQuantity).toBe(500);
    expect(result.baseUnit).toBe('kg');
  });

  it('correctly converts volume m3 to base unit', () => {
    const result = convertToBaseUnit(50, 'm3');
    expect(result.baseQuantity).toBe(50);
    expect(result.baseUnit).toBe('m3');
  });

  it('returns human-readable formatted unit names', () => {
    expect(formatUnitName('kg')).toBe('Kilograms (kg)');
    expect(formatUnitName('metric_ton')).toBe('Metric Tons (MT)');
    expect(formatUnitName('bag')).toBe('Bags (50 kg standard)');
    expect(formatUnitName('m3')).toBe('Cubic Meters (m³)');
  });

  it('defines valid conversion factors for all supported units', () => {
    expect(UNIT_CONVERSIONS.kg.multiplier).toBe(1);
    expect(UNIT_CONVERSIONS.metric_ton.multiplier).toBe(1000);
    expect(UNIT_CONVERSIONS.bag.multiplier).toBe(50);
    expect(UNIT_CONVERSIONS.m3.multiplier).toBe(1);
    expect(UNIT_CONVERSIONS.cubic_feet.multiplier).toBeCloseTo(0.0283, 3);
  });
});
