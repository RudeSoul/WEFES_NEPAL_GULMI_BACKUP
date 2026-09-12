import { WEFESOutput } from '@wefes/shared-types';
import { SensitivitySimulationResult, PortfolioBlendResult } from './nexusMathTypes';

export function simulateSensitivity(
  output: WEFESOutput,
  shifts: {
    rainfallShiftPct: number;
    wageShiftPct: number;
    tariffShiftPct: number;
    solarAdoptionShiftPct: number;
  }
): SensitivitySimulationResult {
  const baseWaterStress = output.water.waterStressIndex;
  const waterStressShift = Math.max(5, Math.min(100, Math.round(baseWaterStress * (1 - shifts.rainfallShiftPct / 100) * (1 - shifts.solarAdoptionShiftPct / 200))));

  const baseLaborDays = output.socioeconomics.laborDays;
  const distWage = 760;
  const baseWage = distWage * (1 + shifts.wageShiftPct / 100);
  const laborCost = baseLaborDays * baseWage;

  const baseEnergyKwh = output.energy.loadKwh;
  const tariff = 10.5 * (1 + shifts.tariffShiftPct / 100);
  const solarShare = Math.min(0.9, (100 - output.energy.fossilSharePercent + shifts.solarAdoptionShiftPct) / 100);
  const gridKwh = baseEnergyKwh * (1 - solarShare);
  const energyCost = gridKwh * tariff;

  const grossRevenue = output.socioeconomics.grossRevenueNpr;
  const netRevenue = Math.max(0, grossRevenue - laborCost - energyCost);
  const simulatedNetMarginPct = Math.round((netRevenue / Math.max(1, grossRevenue)) * 100);

  const rawDelta =
    (shifts.rainfallShiftPct * 0.18) -
    (shifts.wageShiftPct * 0.22) -
    (shifts.tariffShiftPct * 0.12) +
    (shifts.solarAdoptionShiftPct * 0.35);

  const scoreDelta = Number(rawDelta.toFixed(1));
  const simulatedScore = Math.max(5, Math.min(100, Math.round(output.nexusBalanceIndex + scoreDelta)));
  const mrtsWaterToCapital = Number(((1250 / Math.max(1, laborCost + energyCost)) * 1000).toFixed(2));

  return {
    simulatedScore,
    scoreDelta,
    simulatedWaterStress: waterStressShift,
    simulatedNetMarginPct,
    mrtsWaterToCapital,
  };
}

export function computePortfolioMix(
  output: WEFESOutput,
  allocations: {
    primaryPct: number;
    secondaryPct: number;
    tertiaryPct: number;
  }
): PortfolioBlendResult {
  const normPrimary = allocations.primaryPct / 100;
  const normSecondary = allocations.secondaryPct / 100;
  const normTertiary = allocations.tertiaryPct / 100;

  const blendedWaterFootprintM3 = Math.round(
    output.water.consumptionM3 * (normPrimary * 1.0 + normSecondary * 0.65 + normTertiary * 0.8)
  );

  const blendedRevenueNpr = Math.round(
    output.socioeconomics.grossRevenueNpr * (normPrimary * 1.0 + normSecondary * 0.75 + normTertiary * 1.65)
  );

  const dietaryDiversityScore = Math.min(100, Math.round(55 + (normSecondary * 25) + (normTertiary * 20)));
  const incomeStabilityIndex = Math.min(100, Math.round(50 + (1 - Math.abs(normPrimary - 0.5)) * 40));
  const riskReductionPct = Math.round(normSecondary * 22 + normTertiary * 28);

  const blendedNexusScore = Math.min(
    100,
    Math.round(
      output.nexusBalanceIndex * normPrimary +
      (output.nexusBalanceIndex + 14) * normSecondary +
      (output.nexusBalanceIndex + 18) * normTertiary
    )
  );

  return {
    blendedNexusScore,
    blendedWaterFootprintM3,
    blendedRevenueNpr,
    dietaryDiversityScore,
    incomeStabilityIndex,
    riskReductionPct,
  };
}

