export interface BioenergyCircularProfile {
  districtName: string;
  aepcNationalProgramContext: {
    totalBiogasPlantsInstalledNepal: '400,000+ Domestic Fixed-Dome Plants (AEPC)';
    nationalRenewableEnergyProgramBudget: '$171 Million USD (NRREP Framework)';
    standardGovernmentSubsidyNpr: 25000;
  };
  householdBiogasPlantModel: {
    recommendedDigesterSizeM3: '4 m³ Fixed-Dome GGC-2047 Model' | '6 m³ Model';
    dailyCattleManureInputKg: number;
    dailyBiogasYieldM3: number;
    annualBiogasProductionM3: number;
    thermalEnergyKwhEquivalent: number;
    lpgCylindersSubstitutedPerYear: number;
    annualHouseholdFuelSavingsNpr: number;
  };
  bioSlurryOrganicFertilizerDividend: {
    annualSlurryProductionTons: number;
    nitrogenNPKContentKg: {
      nitrogenN: number;
      phosphorusP2O5: number;
      potassiumK2O: number;
    };
    chemicalFertilizerBagsSavedPerYear: {
      ureaBags50kg: number;
      dapBags50kg: number;
    };
    annualFertilizerCostSavedNpr: number;
    soilOrganicMatterEnhancementDividend: '+0.45% Soil Organic Carbon (SOC) over 3 years';
  };
  chillingCenterMiniGridPotential: {
    cooperativeMiniGridCompatibility: 'Solar + Biogas Hybrid Microgrid (25 kW)';
    milkChillingCapacityLitersPerDay: 2000;
    dieselGeneratorFuelDisplacedLitersPerYr: 1800;
  };
  calibrationProvenance: string;
}

export function computeBioenergyModel(
  districtName: string,
  herdSize: number = 3
): BioenergyCircularProfile {
  const dailyDung = herdSize * 15; // 15 kg dung/day per adult cattle/buffalo
  const dailyBiogas = Number((dailyDung * 0.042).toFixed(2)); // ~0.042 m³ biogas per kg fresh dung
  const annualBiogas = Math.round(dailyBiogas * 365);
  const lpgCylinders = Number(((annualBiogas * 0.45) / 14.2).toFixed(1)); // 1 m³ biogas = 0.45 kg LPG
  const fuelSavings = Math.round(lpgCylinders * 2150); // NPR 2,150 per cylinder

  const annualSlurryTons = Number((herdSize * 4.5).toFixed(1));
  const ureaBagsSaved = Number((herdSize * 2.4).toFixed(1));
  const dapBagsSaved = Number((herdSize * 1.2).toFixed(1));
  // MoALD March 2023 subsidized standard: Urea = NPR 1,250/bag, DAP = NPR 2,500/bag
  const fertSavings = Math.round((ureaBagsSaved * 1250) + (dapBagsSaved * 2500));

  return {
    districtName,
    aepcNationalProgramContext: {
      totalBiogasPlantsInstalledNepal: '400,000+ Domestic Fixed-Dome Plants (AEPC)',
      nationalRenewableEnergyProgramBudget: '$171 Million USD (NRREP Framework)',
      standardGovernmentSubsidyNpr: 25000,
    },
    householdBiogasPlantModel: {
      recommendedDigesterSizeM3: herdSize > 3 ? '6 m³ Model' : '4 m³ Fixed-Dome GGC-2047 Model',
      dailyCattleManureInputKg: dailyDung,
      dailyBiogasYieldM3: dailyBiogas,
      annualBiogasProductionM3: annualBiogas,
      thermalEnergyKwhEquivalent: Math.round(annualBiogas * 2.0),
      lpgCylindersSubstitutedPerYear: lpgCylinders,
      annualHouseholdFuelSavingsNpr: fuelSavings,
    },
    bioSlurryOrganicFertilizerDividend: {
      annualSlurryProductionTons: annualSlurryTons,
      nitrogenNPKContentKg: {
        nitrogenN: Math.round(annualSlurryTons * 18),
        phosphorusP2O5: Math.round(annualSlurryTons * 12),
        potassiumK2O: Math.round(annualSlurryTons * 10),
      },
      chemicalFertilizerBagsSavedPerYear: {
        ureaBags50kg: ureaBagsSaved,
        dapBags50kg: dapBagsSaved,
      },
      annualFertilizerCostSavedNpr: fertSavings,
      soilOrganicMatterEnhancementDividend: '+0.45% Soil Organic Carbon (SOC) over 3 years',
    },
    chillingCenterMiniGridPotential: {
      cooperativeMiniGridCompatibility: 'Solar + Biogas Hybrid Microgrid (25 kW)',
      milkChillingCapacityLitersPerDay: 2000,
      dieselGeneratorFuelDisplacedLitersPerYr: 1800,
    },
    calibrationProvenance: 'Calibrated using Alternative Energy Promotion Centre (AEPC) Technical Standards & NRREP Bioenergy Guidelines 2024.',
  };
}
