// [DATA PROVENANCE]
// Data Source: data/real/agriculture/narc_crop_varieties.json
// Classification: OBSERVED REAL (NARC Approved Seed Release Catalog 2024/2025)
// Citations: National Agronomy Research Centre (NARC), Khumaltar; MoALD Seed Quality Control Centre (SQCC)

import rawVarieties from '../../../../../data/real/agriculture/narc_crop_varieties.json';

export interface NARCSeedVariety {
  id: string;
  name: string;
  commodity: 'Rice' | 'Maize' | 'Wheat' | 'Cardamom' | 'Potato' | 'Ginger' | 'Tea' | 'Coffee' | 'Apple' | 'Mustard' | 'Lentil' | 'Tomato' | 'Citrus';
  releaseYear: number;
  pedigreeLineage: string;
  maturityDays: number;
  potentialYieldTonPerHa: number;
  averageFarmgateYieldTonPerHa: number;
  recommendedEcoDomain: string;
  optimalAltitudeRange: string;
  specialTraits: string[];
  diseasePestResistance: {
    vector: string;
    resistanceLevel: 'High Resistance' | 'Moderate Tolerance' | 'Susceptible';
  }[];
  nutritionalProfile: {
    zincPpm?: number;
    ironPpm?: number;
    proteinPercent?: number;
    oilPercent?: number;
    specialAttributes?: string;
  };
  seedSourceContact: string;
  packageOfPracticesUrl: string;
}

export const NARC_VARIETAL_DATABASE: NARCSeedVariety[] = rawVarieties as NARCSeedVariety[];

export function getVarietiesByCrop(commodityName: string): NARCSeedVariety[] {
  const norm = commodityName.toLowerCase();
  return NARC_VARIETAL_DATABASE.filter(v => {
    const c = v.commodity.toLowerCase();
    return norm.includes(c) || c.includes(norm) || (norm.includes('paddy') && c === 'rice');
  });
}

