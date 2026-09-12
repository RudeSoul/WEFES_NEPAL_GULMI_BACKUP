/**
 * engines/nexus/src/models/index.ts
 * =================================
 * Master Barrel Re-exporting all WEFES Domain Models across the 5 Pillars + Core.
 * Complies with Rule 1 & Rule 6 of RULESET.md.
 */

// 1. Water Pillar
export * from './water/aquaCropEngine';
export * from './water/groundwaterConjunctiveEngine';
export * from './water/rainfallForecast';

// 2. Energy Pillar
export * from './energy/bioenergyEngine';

// 3. Food Pillar
export * from './food/agronomicStandardsEngine';
export * from './food/aquacultureEngine';
export * from './food/fertilizerEngine';
export * from './food/livestockDairyEngine';
export * from './food/narcVarietalData';
export * from './food/pestSurveillanceEngine';
export * from './food/postHarvestEngine';

// 4. Ecosystems Pillar
export * from './ecosystems/circularBioeconomyEngine';
export * from './ecosystems/heatStressEngine';
export * from './ecosystems/sentinelEngine';

// 5. Socio-Economics & Governance Pillar
export * from './social/donorAlignmentEngine';
export * from './social/exportTraceabilityEngine';
export * from './social/genderBudgetData';
export * from './social/ndcTracker';
export * from './social/nepalInvestmentBenchmarks';
export * from './social/nexusReadinessEngine';

// 6. Nexus Core & Math Integration
export * from './core/dataIntegrityData';
export * from './core/nexusMath';
