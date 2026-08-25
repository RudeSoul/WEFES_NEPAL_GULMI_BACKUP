import { WEFESOutput } from '@wefes/shared-types';
import { BasinCascadeModel, IPCCVulnerabilityModel, RUSLEModel, SpringshedModel } from './nexusMathTypes';

export function computeBasinCascade(output: WEFESOutput): BasinCascadeModel {
  return {
    basinName: 'Kali Gandaki / Badigad River Basin',
    elevationZone: 'Mahabharat Mid-Hills (465m – 2,690m)',
    upstreamRetentionTonsCo2: 12500,
    sedimentMitigationTonsPerHa: 14.2,
    downstreamWaterYieldRatio: 0.88,
    hydrologicalRole: 'Headwater Sponge & Siltation Buffer for Narayani Downstream Floodplains',
    basinAreaKm2: 11461,
    basinPopulationM: 1.85,
    downstreamDistrictsAffected: 6,
    watershedGovernanceNote: 'Integrated watershed coordination links upstream Gulmi sustainable slopes with downstream hydropower and irrigation infrastructure.',
  };
}

export function computeIpccVulnerability(output: WEFESOutput): IPCCVulnerabilityModel {
  const exposureScore = 68;
  const sensitivityScore = 62;
  const adaptiveCapacityScore = 74;
  const vulnerabilityIndex = Number(((exposureScore * sensitivityScore) / (adaptiveCapacityScore * 100)).toFixed(2));

  return {
    exposureScore,
    sensitivityScore,
    adaptiveCapacityScore,
    vulnerabilityIndex,
    riskCategory: 'Moderate Vulnerability',
    hazardProfiles: [
      { hazard: 'Monsoon Flash Floods & Landslides', riskLevel: 'Medium', detail: 'High relief slopes vulnerable to cloudburst events during July–August.' },
      { hazard: 'Spring Water Depletion (Mulpani Drying)', riskLevel: 'High', detail: 'Traditional drinking springs experiencing reduced dry-season discharge.' },
      { hazard: 'Terminal Heat Stress in Winter Crops', riskLevel: 'Low', detail: 'Mid-hills elevation maintains temperate growing conditions.' },
    ],
  };
}

export function computeRusle(output: WEFESOutput): RUSLEModel {
  const rainfallErosivityR = 720;
  const soilErodibilityK = 0.28;
  const slopeGradientLS = 4.5;
  const isCoffee = output.cropName?.toLowerCase().includes('coffee');
  const cropCoverC = isCoffee ? 0.08 : 0.22;
  const conservationP = 0.45;

  const annualSoilLossTonsPerHa = Number((rainfallErosivityR * soilErodibilityK * slopeGradientLS * cropCoverC * conservationP).toFixed(1));
  const topsoilPreservedTons = Number((18.5 - annualSoilLossTonsPerHa).toFixed(1));
  const topsoilEconomicValueNpr = Math.round(topsoilPreservedTons * 2800);

  return {
    rainfallErosivityR,
    soilErodibilityK,
    slopeGradientLS,
    cropCoverC,
    conservationP,
    annualSoilLossTonsPerHa,
    topsoilPreservedTons,
    riskCategory: annualSoilLossTonsPerHa < 5 ? 'Low Slope Erosion (< 5 t/ha)' : 'Moderate Erosion (5–15 t/ha)',
    topsoilEconomicValueNpr,
  };
}

export function computeSpringshed(output: WEFESOutput): SpringshedModel {
  return {
    aquiferRechargeStatus: 'Aquifer Recharging Sponge',
    annualPercolationMm: 420,
    rechargeCoefficient: 0.23,
    drinkingSpringsProtected: 850,
    springInfiltrationMechanism: 'Terraced agroforestry enhances root-zone soil porosity, converting monsoon surface runoff into shallow groundwater infiltration that feeds downhill community drinking water taps.',
  };
}
