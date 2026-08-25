import React, { useState, useMemo } from 'react';
import {
  WEFESOutput,
  FertilizerImpactProfile,
  District,
  Crop,
} from '@wefes/shared-types';
import {
  DISTRICTS_SEED_DATA,
  CROPS_SEED_DATA,
} from '@wefes/database';
import { DISTRICT_PALIKAS, DistrictPalika } from '../../data/districtPalikaAssets';
import { calculateFertilizerNexusImpact } from '@wefes/wefes-engine';
import {
  Truck,
  FlaskConical,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Leaf,
  Droplets,
  Fuel,
  MapPin,
  Sliders,
  Sparkles,
  ArrowRight,
  BarChart3,
  Layers,
  Scale,
} from 'lucide-react';

interface PalikaFertilizerCockpitProps {
  output: WEFESOutput;
  onOrganicSubstitutionChange?: (pct: number) => void;
}

export const PalikaFertilizerCockpit: React.FC<PalikaFertilizerCockpitProps> = ({
  output,
  onOrganicSubstitutionChange,
}) => {
  // Retrieve district & crop entities
  const district: District = useMemo(() => {
    return (
      DISTRICTS_SEED_DATA.find(
        d => d.id.toLowerCase() === output.districtId?.toLowerCase() ||
             d.name.toLowerCase() === output.districtName?.toLowerCase()
      ) ||
      DISTRICTS_SEED_DATA[0]
    );
  }, [output.districtId, output.districtName]);

  const crop: Crop = useMemo(() => {
    return (
      CROPS_SEED_DATA.find(
        c => c.id.toLowerCase() === output.cropId?.toLowerCase() ||
             c.name.toLowerCase() === output.cropName?.toLowerCase()
      ) ||
      CROPS_SEED_DATA[0]
    );
  }, [output.cropId, output.cropName]);

  // Palika list for active district
  const palikasForDistrict: DistrictPalika[] = useMemo(() => {
    const dNorm = output.districtName.toLowerCase();
    const dIdNorm = output.districtId.toLowerCase();
    return DISTRICT_PALIKAS[dNorm] || DISTRICT_PALIKAS[dIdNorm] || [];
  }, [output.districtName, output.districtId]);

  const [selectedPalikaId, setSelectedPalikaId] = useState<string>(
    palikasForDistrict.length > 0 ? palikasForDistrict[0].id : `${output.districtId}-hq`
  );

  const activePalika = useMemo(() => {
    return palikasForDistrict.find(p => p.id === selectedPalikaId) || (
      palikasForDistrict.length > 0 ? palikasForDistrict[0] : null
    );
  }, [palikasForDistrict, selectedPalikaId]);

  // Interactive Slider States
  const [organicSubstitutionPct, setOrganicSubstitutionPct] = useState<number>(0);
  const [scarcityMarkupPct, setScarcityMarkupPct] = useState<number>(0);
  const [dieselPriceNpr, setDieselPriceNpr] = useState<number>(175);
  const [freightMultiplier, setFreightMultiplier] = useState<number>(1.0);

  // Re-calculate Fertilizer Nexus Impact with live inputs
  const profile: FertilizerImpactProfile = useMemo(() => {
    return calculateFertilizerNexusImpact({
      district,
      crop,
      harvestQuantityKg: output.baseQuantity,
      palikaId: activePalika?.id || selectedPalikaId,
      palikaName: activePalika?.name || `${district.name} HQ`,
      organicSubstitutionPct,
      scarcityMarkupPct,
      dieselPriceNprPerLiter: dieselPriceNpr,
      customFreightRates: {
        terai: 5.50 * freightMultiplier,
        mountain: 14.00 * freightMultiplier,
        lastMile: 40.00 * freightMultiplier,
        transshipment: 750 * freightMultiplier,
      },
    });
  }, [district, crop, output.baseQuantity, activePalika, selectedPalikaId, organicSubstitutionPct, scarcityMarkupPct, dieselPriceNpr, freightMultiplier]);

  const { agronomic, economic, energy, ecosystem, water, bioeconomyTippingPoint, logisticsRoute } = profile;

  const handleOrganicSlider = (val: number) => {
    setOrganicSubstitutionPct(val);
    if (onOrganicSubstitutionChange) {
      onOrganicSubstitutionChange(val);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── TOP BANNER & PALIKA SELECTOR ─────────────────────────────────── */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <FlaskConical className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold font-outfit text-white tracking-tight">
                Palika Fertilizer Nexus &amp; Spatial Logistics Cockpit
              </h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700">
                March 2023 MoALD Subsidized Rates
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Calculates terrain freight physics, sovereign forex drain, GoN subsidy burden, and local circular bio-slurry tipping points across Nepal’s 753 Local Levels.
            </p>
          </div>

          {/* Palika Selection Dropdown */}
          <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
            <MapPin className="w-4 h-4 text-emerald-400 ml-2" />
            <select
              value={selectedPalikaId}
              onChange={(e) => setSelectedPalikaId(e.target.value)}
              className="bg-transparent text-xs font-mono text-white focus:outline-hidden pr-3 cursor-pointer"
            >
              {palikasForDistrict.length > 0 ? (
                palikasForDistrict.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.unitType}) — {p.elevation}m
                  </option>
                ))
              ) : (
                <option value={`${output.districtId}-hq`} className="bg-slate-900 text-white">
                  {district.name} Municipal Center
                </option>
              )}
            </select>
          </div>
        </div>

        {/* ── ROUTE PHYSICS & TRANSIT SEGMENTATION ──────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans block">Origin Customs Port:</span>
            <div className="font-bold text-sky-400 text-sm">{logisticsRoute.customsPortName.split(' ')[0]} ICP</div>
            <div className="text-[10px] text-slate-400 font-sans truncate">{logisticsRoute.customsPortName}</div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans block">Total Distance &amp; Elevation:</span>
            <div className="font-bold text-white text-sm">
              {logisticsRoute.totalDistanceKm} km <span className="text-emerald-400 text-xs">(+Δ{logisticsRoute.elevationDeltaM}m)</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              Terai: {logisticsRoute.distanceTeraiKm}km · Hill: {logisticsRoute.distanceHillKm}km · Earthen: {logisticsRoute.distanceLastMileKm}km
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans block">Freight Surcharge (Terrain):</span>
            <div className="font-bold text-amber-400 text-sm">
              +NPR {economic.freightCostPerKgNpr.toFixed(2)} / kg
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              Syndicate: {freightMultiplier.toFixed(1)}x · Fuel index: {((1.0 + 0.45 * ((dieselPriceNpr - 175) / 175))).toFixed(2)}x
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1">
            <span className="text-[11px] text-slate-400 font-sans block">Transport Diesel &amp; Fuel Spend:</span>
            <div className="font-bold text-rose-400 text-sm">
              {energy.transportDieselLiters} L <span className="text-xs text-slate-300 font-normal font-mono">(NPR {Math.round(energy.transportDieselLiters * dieselPriceNpr).toLocaleString()})</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              +{ecosystem.transportEmissionsKgCo2e} kg CO₂e @ NPR {dieselPriceNpr}/L
            </div>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE SCENARIO & SUBSTITUTION SLIDERS ───────────────────── */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-sm text-slate-900 font-outfit flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <span>Interactive Input Substitution &amp; Market Sensitivity Levers</span>
          </span>
          <span className="text-xs font-mono text-slate-500">Live Dynamic Coupling</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Slider 1: Chemical vs Bio-Slurry Substitution */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Bio-Slurry Substitution:</span>
              <span className="font-mono font-bold text-emerald-700">{organicSubstitutionPct}% Organic</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={organicSubstitutionPct}
              onChange={(e) => handleOrganicSlider(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-sans">
              <span>0% (100% Chemical)</span>
              <span>100% (Pure Bio-Slurry)</span>
            </div>
          </div>

          {/* Slider 2: Seasonal Scarcity Premium */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Peak Scarcity Premium:</span>
              <span className={`font-mono font-bold ${scarcityMarkupPct > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                +{scarcityMarkupPct}% Black Market
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="5"
              value={scarcityMarkupPct}
              onChange={(e) => setScarcityMarkupPct(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-sans">
              <span>0% (Formal Quota)</span>
              <span>+80% (Peak Shortage)</span>
            </div>
          </div>

          {/* Slider 3: Diesel Price Adjustment */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Diesel Fuel Tariff:</span>
              <span className="font-mono font-bold text-sky-700">
                NPR {dieselPriceNpr}/L <span className="text-[10px] text-slate-500 font-normal">({dieselPriceNpr > 175 ? `+${Math.round(((dieselPriceNpr - 175) / 175) * 100)}%` : dieselPriceNpr < 175 ? `${Math.round(((dieselPriceNpr - 175) / 175) * 100)}%` : 'Base'})</span>
              </span>
            </div>
            <input
              type="range"
              min="150"
              max="230"
              step="5"
              value={dieselPriceNpr}
              onChange={(e) => setDieselPriceNpr(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-sans">
              <span>NPR 150 (Subsidy)</span>
              <span>NPR 230 (Inflation)</span>
            </div>
          </div>

          {/* Slider 4: Trucking Syndicate Freight Multiplier */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Syndicate Freight Factor:</span>
              <span className="font-mono font-bold text-amber-700">
                {freightMultiplier.toFixed(1)}x <span className="text-[10px] text-slate-500 font-normal">({freightMultiplier > 1.0 ? `+${Math.round((freightMultiplier - 1.0) * 100)}% Tariff` : freightMultiplier < 1.0 ? `-${Math.round((1.0 - freightMultiplier) * 100)}% Rebate` : 'Baseline'})</span>
              </span>
            </div>
            <input
              type="range"
              min="0.8"
              max="2.0"
              step="0.1"
              value={freightMultiplier}
              onChange={(e) => setFreightMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-sans">
              <span>0.8x (Competitive)</span>
              <span>2.0x (Cartel Monopoly)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 CORE NEXUS CARDS: PRICE, MACRO DRAIN, VCR & TIPPING POINT ───── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Landed Farmgate Price per Bag */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans text-slate-500">Landed Farmgate Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            NPR {economic.landedFarmgatePriceNprPerKg.averageWeighted.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ kg</span>
          </div>
          <div className="text-[11px] text-slate-600 font-sans space-y-0.5 border-t border-slate-100 pt-2">
            <div>Urea: <strong className="text-slate-800 font-mono">NPR {economic.landedFarmgatePriceNprPerKg.urea.toFixed(2)}/kg</strong> (NPR {Math.round(economic.landedFarmgatePriceNprPerKg.urea * 50)}/bag)</div>
            <div>DAP: <strong className="text-slate-800 font-mono">NPR {economic.landedFarmgatePriceNprPerKg.dap.toFixed(2)}/kg</strong> (NPR {Math.round(economic.landedFarmgatePriceNprPerKg.dap * 50)}/bag)</div>
            <div>MOP: <strong className="text-slate-800 font-mono">NPR {economic.landedFarmgatePriceNprPerKg.mop.toFixed(2)}/kg</strong> (NPR {Math.round(economic.landedFarmgatePriceNprPerKg.mop * 50)}/bag)</div>
            <div className="text-amber-700 font-mono text-[10px] pt-1">
              Terrain &amp; Freight Surcharge: +NPR {(economic.freightCostPerKgNpr * 50).toFixed(0)}/50kg bag
            </div>
          </div>
        </div>

        {/* Card 2: Sovereign Macro Drain (Forex & Subsidy) */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans text-slate-500">Sovereign Forex &amp; Subsidy</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-700 font-mono">
            ${economic.sovereignImportForexDrainUsd.toLocaleString()} <span className="text-xs font-normal text-slate-500">USD</span>
          </div>
          <div className="text-[11px] text-slate-600 font-sans space-y-0.5 border-t border-slate-100 pt-2">
            <div>GoN Subsidy Deficit: <strong className="text-slate-800 font-mono">NPR {economic.gonSubsidyBurdenNpr.toLocaleString()}</strong></div>
            <div>Total Farmer Outlay: <strong className="text-slate-800 font-mono">NPR {economic.totalFarmerFertilizerSpendNpr.toLocaleString()}</strong></div>
            <div className="text-emerald-700 font-bold">
              {organicSubstitutionPct > 0 ? `Saved $${Math.round((economic.sovereignImportForexDrainUsd / (1 - organicSubstitutionPct / 100)) - economic.sovereignImportForexDrainUsd).toLocaleString()} USD via Bio-Slurry` : '100% Foreign Currency Outflow'}
            </div>
          </div>
        </div>

        {/* Card 3: Farmer Value-Cost Ratio (VCR) */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans text-slate-500">Value-Cost Ratio (VCR)</span>
            <Scale className="w-4 h-4 text-sky-600" />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${economic.farmerValueCostRatioVCR >= 2.0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {economic.farmerValueCostRatioVCR}x
          </div>
          <div className="text-[11px] text-slate-600 font-sans space-y-0.5 border-t border-slate-100 pt-2">
            <div className="font-medium text-slate-800">{economic.vcrStatus}</div>
            <div className="text-[10px] text-slate-500">Benchmark: VCR ≥ 2.0 required for smallholder adoption</div>
            <div>Yield Realized: <strong className="text-slate-800 font-mono">{agronomic.realizedYieldKg.toLocaleString()} kg</strong> ({agronomic.yieldGapPercent}% gap)</div>
          </div>
        </div>

        {/* Card 4: Environmental & Hydrology Impact */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sans text-slate-500">Soil Carbon &amp; Water Leaching</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${ecosystem.soilOrganicCarbonDeltaPct >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
            {ecosystem.soilOrganicCarbonDeltaPct >= 0 ? `+${ecosystem.soilOrganicCarbonDeltaPct}%` : `${ecosystem.soilOrganicCarbonDeltaPct}%`} <span className="text-xs font-normal text-slate-500">SOC/yr</span>
          </div>
          <div className="text-[11px] text-slate-600 font-sans space-y-0.5 border-t border-slate-100 pt-2">
            <div>Nitrate Leaching: <strong className="text-slate-800 font-mono">{water.nitrateLeachingKgPerHa} kg N/ha</strong></div>
            <div>Aquifer Hazard: <strong className={`${water.groundwaterEutrophicationRisk === 'Low' ? 'text-emerald-700' : 'text-rose-700'}`}>{water.groundwaterEutrophicationRisk}</strong></div>
            <div>Limiting Factor: <strong className="text-slate-800 font-mono">{agronomic.limitingNutrient} (Liebig Gate)</strong></div>
          </div>
        </div>
      </div>

      {/* ── THE CIRCULAR BIOECONOMY "ORGANIC TIPPING POINT" BANNER ─────────── */}
      <div className={`p-6 rounded-3xl border ${
        bioeconomyTippingPoint.isBioeconomySuperior
          ? 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border-emerald-700 text-white'
          : 'bg-gradient-to-r from-slate-900 to-slate-950 border-slate-800 text-white'
      } shadow-md space-y-3`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg ${
              bioeconomyTippingPoint.isBioeconomySuperior ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}>
              {bioeconomyTippingPoint.isBioeconomySuperior ? '⭐' : '⚖️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  {bioeconomyTippingPoint.isBioeconomySuperior
                    ? 'Bioeconomy Tipping Point Achieved: Organic Slurry Is Superior'
                    : 'Logistics Parity Zone: Balanced Integrated Dosing Recommended'}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                {bioeconomyTippingPoint.bioeconomyAdvantageRationale}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-sans block">Landed Chemical:</span>
              <strong className="text-rose-400">NPR {bioeconomyTippingPoint.landedChemicalCostPerHaNpr.toLocaleString()}/ha</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 font-sans block">Bio-Slurry Equiv:</span>
              <strong className="text-emerald-400">NPR {bioeconomyTippingPoint.equivalentBioSlurryCostPerHaNpr.toLocaleString()}/ha</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── NARC NSSRC 2023 RECOMMENDED DOSING SCHEDULE & COMMERCIAL BAG TABLE */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 font-outfit flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>NARC 2023 Site-Specific Dosing &amp; Commercial Bag Requirements</span>
          </h4>
          <span className="text-xs font-mono text-slate-500">{crop.name} · {district.name}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-sans block">Nitrogen (N)</span>
            <div className="text-lg font-bold text-emerald-700">{agronomic.appliedDose.nitrogenKgPerHa} kg/ha</div>
            <div className="text-[10px] text-slate-400 font-sans">{agronomic.appliedDose.ureaBags50kg} bags Urea</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-sans block">Phosphorus (P₂O₅)</span>
            <div className="text-lg font-bold text-blue-700">{agronomic.appliedDose.phosphorusP2O5KgPerHa} kg/ha</div>
            <div className="text-[10px] text-slate-400 font-sans">{agronomic.appliedDose.dapBags50kg} bags DAP</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-sans block">Potassium (K₂O)</span>
            <div className="text-lg font-bold text-purple-700">{agronomic.appliedDose.potassiumK2OKgPerHa} kg/ha</div>
            <div className="text-[10px] text-slate-400 font-sans">{agronomic.appliedDose.mopBags50kg} bags MOP</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-sans block">Zinc Sulphate</span>
            <div className="text-lg font-bold text-amber-700">{agronomic.appliedDose.zincKgPerHa} kg/ha</div>
            <div className="text-[10px] text-slate-400 font-sans">Zn deficiency prevention</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-sans block">Borax (Boron)</span>
            <div className="text-lg font-bold text-teal-700">{agronomic.appliedDose.boronKgPerHa} kg/ha</div>
            <div className="text-[10px] text-slate-400 font-sans">Pollen fertility &amp; fruit set</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-sans block">Organic Compost / Slurry</span>
            <div className="text-lg font-bold text-emerald-800">{agronomic.appliedDose.organicManureTonPerHa} t/ha</div>
            <div className="text-[10px] text-slate-400 font-sans">Soil organic carbon baseline</div>
          </div>
        </div>
      </div>
    </div>
  );
};
