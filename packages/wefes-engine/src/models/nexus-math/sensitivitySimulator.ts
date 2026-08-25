import { WEFESOutput } from '@wefes/shared-types';
import { SensitivitySimulationResult } from './nexusMathTypes';

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
