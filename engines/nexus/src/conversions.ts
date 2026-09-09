import { CropUnit } from '@wefes/shared-types';

export const UNIT_CONVERSIONS: Record<CropUnit, { baseUnit: 'kg' | 'm3'; multiplier: number; label: string }> = {
  kg: { baseUnit: 'kg', multiplier: 1, label: 'Kilograms (kg)' },
  metric_ton: { baseUnit: 'kg', multiplier: 1000, label: 'Metric Tons (MT)' },
  bag: { baseUnit: 'kg', multiplier: 50, label: 'Bags (50 kg standard)' },
  m3: { baseUnit: 'm3', multiplier: 1, label: 'Cubic Meters (m³)' },
  cubic_feet: { baseUnit: 'm3', multiplier: 0.0283168, label: 'Cubic Feet (cft)' }
};

export function convertToBaseUnit(quantity: number, unit: CropUnit): { baseQuantity: number; baseUnit: 'kg' | 'm3' } {
  const conversion = UNIT_CONVERSIONS[unit] || UNIT_CONVERSIONS.kg;
  return {
    baseQuantity: quantity * conversion.multiplier,
    baseUnit: conversion.baseUnit
  };
}

export function formatUnitName(unit: CropUnit): string {
  return UNIT_CONVERSIONS[unit]?.label || unit;
}
