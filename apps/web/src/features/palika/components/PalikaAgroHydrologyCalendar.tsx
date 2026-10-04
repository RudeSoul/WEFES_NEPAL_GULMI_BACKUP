// [DATA PROVENANCE]
// Data Source: data/calculated/indicators/gulmi_palika_agro_hydrology.json, data/calculated/indicators/gulmi_palika_landholding.json, data/calculated/indicators/gulmi_palika_ghi.json, data/calculated/indicators/gulmi_palika_grid.json, data/calculated/indicators/gulmi_palika_soil.json
// Classification: CALCULATED EMPIRICAL (1991–2020 CHIRPS Climatological Baseline, NSO Census 2021/22, Global Solar Atlas 2.0, NEA Substation Network, NARC 100m Soil Grid)
// Citations: CHIRPS v2.0 (1981–2025), FAO-56 Penman-Monteith, FAO Irrigation Training Manual No. 4, NARC Soil Science Division, National Statistics Office (NSO), World Bank ESMAP Global Solar Atlas, Nepal Electricity Authority (NEA) Tariff Schedule 2024–2026
import React, { useMemo, useState } from 'react';

import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Coins,
  Droplets,
  Fuel,
  Gauge,
  Info,
  Layers,
  Power,
  ShieldCheck,
  Sliders,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ClimateDataset } from '@wefes/shared-types';

import {
  MonthAgroHydrology,
  PALIKA_AGRO_HYDROLOGY_DATA,
  PALIKA_GHI_DATA,
  PALIKA_GRID_DATA,
  PALIKA_LANDHOLDING_DATA,
  PALIKA_SOIL_DATA,
  PalikaAgroHydrologyProfile,
} from '@/data/districtIndicatorAssets';
import { DistrictPalika } from '@/data/districtPalikaAssets';

interface SeasonalAgroHydrologyProps {
  activePalika: DistrictPalika;
  climateDataset?: ClimateDataset | null;
  onOpenSoilModal?: () => void;
}

export type AgroHydrologyTab = 'balance' | 'soil' | 'solar_sizing';
export type CommandAreaMode = 'cluster10' | 'scheme50' | 'khet' | 'arable' | 'custom';
export type LiftHeadMode = 'valley40' | 'terrace120' | 'ridge220' | 'custom';
export type PowerSourceMode = 'solar' | 'grid' | 'hybrid';
export type IrrigationEfficiencyMode = 'drip' | 'furrow';

// Smart Engineering Unit Formatters (prevents layout breakage & e+48 overflow)
function formatCompactNumber(val: number, precision: number = 1): string {
  if (!isFinite(val) || isNaN(val)) return '0';
  if (val >= 1e9) return `${(val / 1e9).toFixed(precision)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(precision)}M`;
  if (val >= 1e3) return `${(val / 1e3).toFixed(precision)}k`;
  return val.toLocaleString();
}

function formatWaterVolume(m3: number): { value: string; unit: string } {
  if (!isFinite(m3) || isNaN(m3) || m3 <= 0) return { value: '0', unit: 'm³' };
  if (m3 >= 1e9) return { value: (m3 / 1e9).toFixed(2), unit: 'B m³' };
  if (m3 >= 1e6) return { value: (m3 / 1e6).toFixed(2), unit: 'M m³' };
  if (m3 >= 1e3) return { value: (m3 / 1e3).toFixed(1), unit: 'k m³' };
  return { value: Math.round(m3).toLocaleString(), unit: 'm³' };
}

function formatPower(kw: number): { value: string; unit: string } {
  if (!isFinite(kw) || isNaN(kw) || kw <= 0) return { value: '0', unit: 'kW' };
  if (kw >= 1e6) return { value: (kw / 1e6).toFixed(2), unit: 'GW' };
  if (kw >= 1e3) return { value: (kw / 1e3).toFixed(2), unit: 'MW' };
  return { value: kw >= 10 ? Math.round(kw).toLocaleString() : kw.toFixed(1), unit: 'kW' };
}

function formatSolarArray(kwp: number): { value: string; unit: string } {
  if (!isFinite(kwp) || isNaN(kwp) || kwp <= 0) return { value: '0', unit: 'kWp' };
  if (kwp >= 1e6) return { value: (kwp / 1e6).toFixed(2), unit: 'GWp' };
  if (kwp >= 1e3) return { value: (kwp / 1e3).toFixed(2), unit: 'MWp' };
  return { value: kwp >= 10 ? Math.round(kwp).toLocaleString() : kwp.toFixed(1), unit: 'kWp' };
}

function formatFlowRate(lps: number): { value: string; unit: string } {
  if (!isFinite(lps) || isNaN(lps) || lps <= 0) return { value: '0', unit: 'L/s' };
  if (lps >= 1000) return { value: (lps / 1000).toFixed(2), unit: 'm³/s' };
  return { value: lps >= 10 ? Math.round(lps).toLocaleString() : lps.toFixed(1), unit: 'L/s' };
}

export const PalikaAgroHydrologyCalendar: React.FC<SeasonalAgroHydrologyProps> = ({
  activePalika,
  onOpenSoilModal,
}) => {
  const [activeTab, setActiveTab] = useState<AgroHydrologyTab>('balance');
  const [commandAreaMode, setCommandAreaMode] = useState<CommandAreaMode>('cluster10');
  const [customAreaHa, setCustomAreaHa] = useState<number>(25);

  const [headMode, setHeadMode] = useState<LiftHeadMode>('terrace120');
  const [customHeadM, setCustomHeadM] = useState<number>(120);

  // WEFE Multi-Energy & Irrigation Efficiency Selectors
  const [powerSource, setPowerSource] = useState<PowerSourceMode>('solar');
  const [irrigationTech, setIrrigationTech] = useState<IrrigationEfficiencyMode>('drip');

  const [showEngineeringDrawer, setShowEngineeringDrawer] = useState<boolean>(false);

  // Load canonical agro-hydrological indicators for this palika
  const palikaData: PalikaAgroHydrologyProfile | undefined = useMemo(() => {
    return PALIKA_AGRO_HYDROLOGY_DATA.palikas[activePalika.name];
  }, [activePalika.name]);

  // Load NARC 100m empirical soil profile for this palika
  const soilProfile = useMemo(() => {
    return PALIKA_SOIL_DATA.palikas[activePalika.name];
  }, [activePalika.name]);

  // Load official NSO Census 2021/22 agricultural landholding data
  const landholding = useMemo(() => {
    return PALIKA_LANDHOLDING_DATA.palikas[activePalika.name];
  }, [activePalika.name]);

  const khetHa: number = Number(landholding?.khetLandHa ?? 250);
  const arableHa: number = Number(landholding?.arableLandHa ?? 1200);
  const totalAgriLandHa: number = Number(landholding?.totalAgriLandHa ?? 2500);

  // Load World Bank / ESMAP Global Solar Atlas PVOUT yield and tilt
  const solarData = useMemo(() => {
    return PALIKA_GHI_DATA.palikas[activePalika.name];
  }, [activePalika.name]);

  const pvoutKwhPerKwp: number = Number(solarData?.mean ?? 4.18); // Specific yield (kWh/kWp/day)
  const optaTilt: number = Number(solarData?.opta ?? 29.0); // Optimal tilt angle (degrees)

  // Load NEA Substation and Grid Electrification infrastructure for this palika
  const gridProfile = useMemo(() => {
    return PALIKA_GRID_DATA.palikas[activePalika.name];
  }, [activePalika.name]);

  const substationInfo = useMemo(() => {
    if (!gridProfile?.nearestSubstation) return null;
    return PALIKA_GRID_DATA.substations[gridProfile.nearestSubstation] || null;
  }, [gridProfile]);

  // Target command area in hectares (Sanitized & Clamped to max 50,000 ha to prevent integer overflow)
  const targetAreaHa: number = useMemo((): number => {
    if (commandAreaMode === 'khet') return khetHa;
    if (commandAreaMode === 'scheme50') return 50;
    if (commandAreaMode === 'arable') return arableHa;
    if (commandAreaMode === 'custom') {
      const val = Number(customAreaHa);
      if (isNaN(val) || val <= 0) return 10;
      return Math.min(50000, val);
    }
    return 10; // cluster10 default
  }, [commandAreaMode, khetHa, arableHa, customAreaHa]);

  // Static Lift Head (m) - Clamped between 5m and 1000m
  const staticLiftHeadM: number = useMemo(() => {
    if (headMode === 'valley40') return 40;
    if (headMode === 'terrace120') return 120;
    if (headMode === 'ridge220') return 220;
    const val = Number(customHeadM);
    if (isNaN(val) || val <= 0) return 120;
    return Math.min(1000, Math.max(5, val));
  }, [headMode, customHeadM]);

  // Total Dynamic Head (TDH): static lift head + 10% friction & fittings allowance
  const frictionLossM = useMemo(() => {
    return Number((staticLiftHeadM * 0.1).toFixed(1));
  }, [staticLiftHeadM]);

  const totalDynamicHeadM = useMemo(() => {
    return Number((staticLiftHeadM + frictionLossM).toFixed(1));
  }, [staticLiftHeadM, frictionLossM]);

  // Field Irrigation Application Efficiency (FAO-56 Table 21 & FAO Irrigation Training Manual 4)
  const fieldEfficiency = useMemo(() => {
    return irrigationTech === 'drip' ? 0.8 : 0.45;
  }, [irrigationTech]);

  // Sizing indicators computed per month
  const sizingMonthlyData = useMemo(() => {
    if (!palikaData) return [];

    // Daily pumping schedule: 6 hours for solar window; 8 hours for grid/hybrid (off-peak schedule)
    const PUMPING_HOURS_PER_DAY = powerSource === 'solar' ? 6.0 : 8.0;
    const WIRE_TO_WATER_EFF = 0.65; // High-efficiency submersible helical/centrifugal pump & motor (to be specified per ISO 9906:2012 Grade 2B)
    const SYSTEM_DERATE = 0.85; // Dirt, cable drop, inverter, and cell thermal derating
    const NEA_AGRI_TARIFF_PER_KWH = 5.0; // NPR 5.00 / kWh official NEA ERC Agricultural Tariff

    return palikaData.months.map((m) => {
      // Net irrigation requirement volume (1 mm over 1 ha = 10 m³)
      const volNetDeficitM3 = Math.round(m.net_irrigation_req_mm * targetAreaHa * 10);

      // Gross lifted water volume applying field efficiency (Vgross = Vnet / eta_field)
      const volGrossLiftM3 = Math.round(volNetDeficitM3 / fieldEfficiency);
      const volGrossThousandM3 = Number((volGrossLiftM3 / 1000).toFixed(1));
      const volNetThousandM3 = Number((volNetDeficitM3 / 1000).toFixed(1));

      // Daily gross pumping demand (m³/day)
      const dailyGrossM3 = Math.round(volGrossLiftM3 / 30);

      // Pumping flow rates during operational window
      const flowRateM3Hr = Number((dailyGrossM3 / PUMPING_HOURS_PER_DAY).toFixed(1));
      const flowRateLps = Number(((flowRateM3Hr * 1000) / 3600).toFixed(1));

      // Daily hydraulic energy (kWh/day): E = (rho * g * V * H) / 3.6e6
      const dailyHydraulicKwh = (1000 * 9.81 * dailyGrossM3 * totalDynamicHeadM) / 3.6e6;

      // Required Solar PV Array capacity (kWp) - sized for peak daily hydraulic energy
      const requiredSolarKwp =
        dailyGrossM3 > 0
          ? Number((dailyHydraulicKwh / (pvoutKwhPerKwp * WIRE_TO_WATER_EFF * SYSTEM_DERATE)).toFixed(1))
          : 0;

      // Tier-1 550W Mono PERC panel count
      const panelCount = requiredSolarKwp > 0 ? Math.ceil((requiredSolarKwp * 1000) / 550) : 0;

      // Pump motor power rating (kW and HP)
      const motorPowerKw =
        flowRateM3Hr > 0
          ? Number(((9.81 * (flowRateM3Hr / 3600) * totalDynamicHeadM) / WIRE_TO_WATER_EFF).toFixed(1))
          : 0;
      const motorPowerHp = Number((motorPowerKw * 1.341).toFixed(1));

      // Monthly electrical energy consumption (kWh/month)
      const monthlyElectricalKwh = (dailyHydraulicKwh * 30) / WIRE_TO_WATER_EFF;

      // NEA Grid electricity billing (NPR/month)
      const monthlyGridCostNpr =
        powerSource === 'grid'
          ? Math.round(monthlyElectricalKwh * NEA_AGRI_TARIFF_PER_KWH)
          : powerSource === 'hybrid'
            ? Math.round(monthlyElectricalKwh * 0.25 * NEA_AGRI_TARIFF_PER_KWH) // 75% solar displacement
            : 0;

      // Diesel displacement estimate: ~0.35 L diesel per kWh electrical in small rural generators
      const monthlyDieselLiters = Math.round(monthlyElectricalKwh * 0.35);

      return {
        ...m,
        volNetDeficitM3,
        volNetThousandM3,
        volGrossLiftM3,
        volGrossThousandM3,
        dailyGrossM3,
        dailyM3: dailyGrossM3, // backward compatibility
        flowRateM3Hr,
        flowRateLps,
        dailyHydraulicKwh: Number(dailyHydraulicKwh.toFixed(1)),
        monthlyElectricalKwh: Math.round(monthlyElectricalKwh),
        monthlyGridCostNpr,
        requiredSolarKwp,
        motorPowerKw,
        motorPowerHp,
        panelCount,
        monthlyDieselLiters,
      };
    });
  }, [palikaData, targetAreaHa, totalDynamicHeadM, pvoutKwhPerKwp, fieldEfficiency, powerSource]);

  // Annual and peak aggregations
  const sizingSummary = useMemo(() => {
    if (!sizingMonthlyData.length) return null;

    const annualNetVolM3 = sizingMonthlyData.reduce((sum, d) => sum + d.volNetDeficitM3, 0);
    const annualNetVolThousandM3 = Number((annualNetVolM3 / 1000).toFixed(1));

    const annualGrossVolM3 = sizingMonthlyData.reduce((sum, d) => sum + d.volGrossLiftM3, 0);
    const annualGrossVolThousandM3 = Number((annualGrossVolM3 / 1000).toFixed(1));

    const peakMonth = sizingMonthlyData.reduce(
      (max, d) => (d.volGrossLiftM3 > max.volGrossLiftM3 ? d : max),
      sizingMonthlyData[0]
    );

    const peakPanelCount = peakMonth.panelCount;
    // Exactly reconcile installed array rating with panel count: panels * 550W
    const peakInstalledKwp = Number(((peakPanelCount * 550) / 1000).toFixed(1));

    const peakMotorKw = peakMonth.motorPowerKw;
    const peakMotorHp = peakMonth.motorPowerHp;

    const annualElectricityKwh = sizingMonthlyData.reduce((sum, d) => sum + d.monthlyElectricalKwh, 0);
    const annualGridCostNpr = sizingMonthlyData.reduce((sum, d) => sum + d.monthlyGridCostNpr, 0);

    // Capital expenditure benchmark (~NPR 95,000 / kWp for rural mountain solar lift array)
    const estimatedSolarCapexNpr = Math.round(peakInstalledKwp * 95000);

    // Storage Buffer Reservoir Sizing (DWRI Mountain Standards: 24h peak carry-over buffer)
    const peakDailyBufferTankM3 = Math.round(peakMonth.dailyGrossM3 * 1.0);

    const annualDieselLiters = sizingMonthlyData.reduce((sum, d) => sum + d.monthlyDieselLiters, 0);
    const annualCo2Tons = Number(((annualDieselLiters * 2.68) / 1000).toFixed(1));
    const annualDieselCostNpr = annualDieselLiters * 175; // NPR 175/L retail diesel benchmark

    // Monsoon surplus energy generation (June-September = 122 days where irrigation demand is 0)
    const monsoonSurplusKwh = Math.round(peakInstalledKwp * pvoutKwhPerKwp * 122);
    const annualSolarGenKwh = Math.round(peakInstalledKwp * pvoutKwhPerKwp * 365);

    // Recommended pipe diameter (flow velocity v ~ 1.2 m/s)
    const qM3s = (peakMonth.flowRateM3Hr || 1) / 3600;
    const dMeters = Math.sqrt((4 * qM3s) / (Math.PI * 1.2));
    const dMm = Math.round(dMeters * 1000);
    const standardSizes = [
      32, 40, 50, 63, 75, 90, 110, 125, 140, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1200, 1400, 1600,
    ];
    const recommendedPipeMm = standardSizes.find((s) => s >= dMm) || dMm;

    return {
      annualNetVolM3,
      annualNetVolThousandM3,
      annualGrossVolM3,
      annualGrossVolThousandM3,
      annualVolM3: annualGrossVolM3, // backward compatibility
      peakMonth,
      peakSolarKwp: peakMonth.requiredSolarKwp,
      peakPanelCount,
      peakInstalledKwp,
      peakMotorKw,
      peakMotorHp,
      peakFlowLps: peakMonth.flowRateLps,
      peakFlowM3Hr: peakMonth.flowRateM3Hr,
      annualElectricityKwh,
      annualGridCostNpr,
      estimatedSolarCapexNpr,
      peakDailyBufferTankM3,
      annualDieselLiters,
      annualCo2Tons,
      annualDieselCostNpr,
      monsoonSurplusKwh,
      annualSolarGenKwh,
      recommendedPipeMm,
      gridProfile,
      substationInfo,
    };
  }, [sizingMonthlyData, pvoutKwhPerKwp, gridProfile, substationInfo]);

  if (!palikaData) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 italic">
        No agro-hydrological climatology record found for {activePalika.name}.
      </div>
    );
  }

  const { annual_summary: summary, months, taw_mm, raw_mm, soil_lithology, elevation_m } = palikaData;

  // Formatted display values
  const annualVolFormatted = sizingSummary
    ? formatWaterVolume(sizingSummary.annualGrossVolM3)
    : { value: '0', unit: 'm³' };
  const annualNetVolFormatted = sizingSummary
    ? formatWaterVolume(sizingSummary.annualNetVolM3)
    : { value: '0', unit: 'm³' };
  const peakMonthVolFormatted = sizingSummary
    ? formatWaterVolume(sizingSummary.peakMonth.volGrossLiftM3)
    : { value: '0', unit: 'm³' };
  const dailyPeakFormatted = sizingSummary
    ? formatWaterVolume(sizingSummary.peakMonth.dailyGrossM3)
    : { value: '0', unit: 'm³' };
  const bufferTankFormatted = sizingSummary
    ? formatWaterVolume(sizingSummary.peakDailyBufferTankM3)
    : { value: '0', unit: 'm³' };
  const peakFlowFormatted = sizingSummary ? formatFlowRate(sizingSummary.peakFlowLps) : { value: '0', unit: 'L/s' };
  const peakSolarFormatted = sizingSummary
    ? formatSolarArray(sizingSummary.peakInstalledKwp)
    : { value: '0', unit: 'kWp' };
  const peakMotorFormatted = sizingSummary ? formatPower(sizingSummary.peakMotorKw) : { value: '0', unit: 'kW' };

  return (
    <div className="p-5 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-xs space-y-4 animate-fade-in glass-panel">
      {/* Header and Lineage Badges */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-1.5">
              <span>📅 12-Month Agro-Hydrological Calendar</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-300">
              CHIRPS 5km Baseline (1991–2020)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-300">
              FAO-56 Penman-Monteith ET₀ & Composite ETc
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300"
              title={`TAW = 1000 × (θ_FC - θ_WP) × Zr (FAO-56 Eq. 82) = 1000 × ${palikaData.awc_volumetric} m³/m³ × ${palikaData.root_zone_depth_m}m`}
            >
              Estimated TAW: {taw_mm}mm (Zr: {palikaData.root_zone_depth_m}m · AWC: {palikaData.awc_volumetric} · FAO-56
              Eq. 82)
            </span>
            {soilProfile && (
              <button
                type="button"
                onClick={onOpenSoilModal}
                className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs group"
                title="Click to inspect NARC 100m empirical soil diagnostic dossier"
              >
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>
                  NARC Soil: pH {soilProfile.ph} ({soilProfile.texture}, {soilProfile.organicMatterPct}% SOM)
                </span>
                <span className="text-[9px] font-sans font-medium text-emerald-700 underline group-hover:text-emerald-950 flex items-center gap-0.5">
                  <span>Dossier</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </span>
              </button>
            )}
            {activeTab === 'solar_sizing' && (
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1">
                <Zap className="w-3 h-3 text-rose-600" />
                <span>WEFE Nexus River-Lift Sizing</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'solar_sizing' ? (
              <>
                <strong>Stage 3:</strong> Multi-energy river-lift pump sizing, monthly gross water demand ($m^3$), and
                energy optimization for <strong>{activePalika.name}</strong> ({elevation_m}m ASL · PVOUT:{' '}
                {pvoutKwhPerKwp} kWh/kWp/day · Grid: {sizingSummary?.gridProfile?.electrificationRatePct ?? 90}%).
              </>
            ) : activeTab === 'soil' ? (
              <>
                <strong>Stage 2:</strong> Sequential root-zone soil water balance, moisture carry-over ($S_t$), and
                allowable depletion threshold for <strong>{activePalika.name}</strong> ({elevation_m}m ASL ·{' '}
                {soil_lithology}).
              </>
            ) : (
              <>
                <strong>Stage 1:</strong> Area-weighted precipitation baseline ($P$), representative composite crop
                evapotranspiration ($ET_c$), and net irrigation requirement for <strong>{activePalika.name}</strong> (
                {elevation_m}m ASL · {soil_lithology}).
              </>
            )}
          </p>
        </div>

        {/* 3-Stage Pipeline View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('balance')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'balance'
                  ? 'bg-white shadow-xs text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Water Demand & Deficit
            </button>
            <button
              onClick={() => setActiveTab('soil')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                activeTab === 'soil'
                  ? 'bg-white shadow-xs text-emerald-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Root-Zone Soil Dynamics
            </button>
            <button
              onClick={() => setActiveTab('solar_sizing')}
              className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'solar_sizing'
                  ? 'bg-amber-500 shadow-xs text-white font-semibold'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>3. Volumetric & Energy Lift</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Sizing Control Bar (Visible when activeTab === 'solar_sizing') */}
      {activeTab === 'solar_sizing' && (
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-3 text-xs animate-fade-in">
          {/* Row 1: Target Command Area & Static Lift Head */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Command Area Selection */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Command Area:</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setCommandAreaMode('cluster10')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    commandAreaMode === 'cluster10'
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  10 ha Pilot
                </button>
                <button
                  onClick={() => setCommandAreaMode('scheme50')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    commandAreaMode === 'scheme50'
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  50 ha Scheme
                </button>
                <button
                  onClick={() => setCommandAreaMode('khet')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    commandAreaMode === 'khet'
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Official 2021 NSO Agricultural Census Khet Area"
                >
                  Priority Khet ({khetHa.toFixed(0)} ha)
                </button>
                <button
                  onClick={() => setCommandAreaMode('arable')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    commandAreaMode === 'arable'
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Total Arable Land (NSO Census 2021/22)"
                >
                  Total Arable ({arableHa.toFixed(0)} ha)
                </button>
              </div>
              {commandAreaMode === 'custom' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0.1"
                    max="50000"
                    step="any"
                    value={customAreaHa}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomAreaHa(isNaN(val) ? 1 : Math.min(50000, Math.max(0.1, val)));
                    }}
                    className="w-20 px-2 py-0.5 rounded border border-slate-300 text-xs font-mono font-semibold"
                    title="Command Area in hectares (Clamped to max 50,000 ha)"
                  />
                  <span className="text-[11px] text-slate-500 font-mono">ha</span>
                </div>
              ) : (
                <button
                  onClick={() => setCommandAreaMode('custom')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-1"
                >
                  Custom ha
                </button>
              )}
              {targetAreaHa > totalAgriLandHa && (
                <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Regional Watershed Scale ({formatCompactNumber(targetAreaHa)} ha &gt; {activePalika.name} Agri:{' '}
                  {totalAgriLandHa} ha)
                </span>
              )}
            </div>

            {/* Static Lift Head Selection & TDH with Custom Input */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-sky-600" />
                <span>Static Lift Head:</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setHeadMode('valley40')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    headMode === 'valley40'
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="River Corridor / Alluvial fan"
                >
                  40m (Valley)
                </button>
                <button
                  onClick={() => setHeadMode('terrace120')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    headMode === 'terrace120'
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Typical Gulmi Mid-Hill Terraces"
                >
                  120m (Terrace Lift)
                </button>
                <button
                  onClick={() => setHeadMode('ridge220')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    headMode === 'ridge220'
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="High Ridge / Settlement Lift"
                >
                  220m (High Ridge)
                </button>
              </div>
              {headMode === 'custom' ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={customHeadM}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomHeadM(isNaN(val) ? 5 : Math.min(1000, Math.max(1, val)));
                    }}
                    className="w-16 px-2 py-0.5 rounded border border-slate-300 text-xs font-mono font-semibold"
                    title="Static lift head in meters (Clamped between 5m and 1000m)"
                  />
                  <span className="text-[11px] text-slate-500 font-mono">m</span>
                </div>
              ) : (
                <button
                  onClick={() => setHeadMode('custom')}
                  className="text-[11px] text-slate-500 hover:text-slate-800 underline underline-offset-2 ml-1"
                >
                  Custom m
                </button>
              )}
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                TDH: {totalDynamicHeadM.toFixed(0)}m (+{frictionLossM}m friction)
              </span>
            </div>
          </div>

          {/* Row 2: Multi-Energy Power Source & Irrigation Application Efficiency */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80">
            {/* Power Source Selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Power Source Alternative:</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setPowerSource('solar')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                    powerSource === 'solar'
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Off-Grid Solar PV lift (Zero operational energy bills)"
                >
                  <Sun className="w-3 h-3 text-amber-600" />
                  <span>Off-Grid Solar PV</span>
                </button>
                <button
                  onClick={() => setPowerSource('grid')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                    powerSource === 'grid'
                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="NEA National Grid (Official Agricultural Tariff ~Rs 5.00/kWh)"
                >
                  <Power className="w-3 h-3 text-emerald-600" />
                  <span>NEA Grid Hydro</span>
                </button>
                <button
                  onClick={() => setPowerSource('hybrid')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${
                    powerSource === 'hybrid'
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Solar primary daytime + NEA Grid off-peak supplement"
                >
                  <Layers className="w-3 h-3 text-sky-600" />
                  <span>Hybrid Solar-Grid</span>
                </button>
              </div>
            </div>

            {/* Field Application Method (Efficiency Factor) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Field Application:</span>
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setIrrigationTech('drip')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    irrigationTech === 'drip'
                      ? 'bg-blue-100 text-blue-900 font-bold border border-blue-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Piped Drip or Micro-Sprinkler (80% application efficiency, FAO-56 Standard)"
                >
                  Piped Drip / Sprinkler (80% η)
                </button>
                <button
                  onClick={() => setIrrigationTech('furrow')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    irrigationTech === 'furrow'
                      ? 'bg-rose-100 text-rose-900 font-bold border border-rose-300 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Traditional unlined furrow/basin flood (45% application efficiency, FAO-24 Standard)"
                >
                  Furrow / Flood (45% η)
                </button>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 hidden lg:inline-block">
                FAO-56 Field Multiplier: {irrigationTech === 'drip' ? '1.25×' : '2.22× gross lift'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Aggregate Indicators Strip */}
      {activeTab === 'solar_sizing' && sizingSummary ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono animate-fade-in">
          {/* Card 1: Gross Lift Volume */}
          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 min-w-0 overflow-hidden">
            <div className="text-[10px] text-rose-700 uppercase font-sans font-semibold truncate">
              Gross Lift Volume (Vgross)
            </div>
            <div className="text-base font-extrabold text-rose-950 mt-0.5 truncate flex items-baseline gap-1">
              <span>{annualVolFormatted.value}</span>
              <span className="text-[10px] font-normal text-slate-500">{annualVolFormatted.unit}/yr</span>
            </div>
            <div className="text-[10px] text-slate-500 font-sans truncate">
              {irrigationTech === 'drip' ? 'Piped Drip (80% η)' : 'Furrow Flood (45% η)'} · Net:{' '}
              {annualNetVolFormatted.value} {annualNetVolFormatted.unit}
            </div>
          </div>

          {/* Card 2: Peak Month & Buffer Reservoir */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 min-w-0 overflow-hidden">
            <div className="text-[10px] text-amber-700 uppercase font-sans font-semibold truncate">
              Peak Month ({sizingSummary.peakMonth.month_en})
            </div>
            <div className="text-base font-extrabold text-amber-950 mt-0.5 truncate flex items-baseline gap-1">
              <span>{peakMonthVolFormatted.value}</span>
              <span className="text-[10px] font-normal text-slate-500">{peakMonthVolFormatted.unit}/mo</span>
            </div>
            <div className="text-[10px] text-slate-500 font-sans truncate">
              Daily: {dailyPeakFormatted.value} {dailyPeakFormatted.unit}/d · Buffer Tank: {bufferTankFormatted.value}{' '}
              {bufferTankFormatted.unit}
            </div>
          </div>

          {/* Card 3: Energy Rating / Motor / Array */}
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 min-w-0 overflow-hidden">
            <div className="text-[10px] text-sky-700 uppercase font-sans font-semibold truncate">
              {powerSource === 'solar'
                ? 'Installed Solar PV Array'
                : powerSource === 'grid'
                  ? '3-Phase Grid Connected Load'
                  : 'Hybrid Solar-Grid Rating'}
            </div>
            <div className="text-base font-extrabold text-sky-950 mt-0.5 truncate flex items-baseline gap-1">
              {powerSource === 'solar' ? (
                <>
                  <span>{peakSolarFormatted.value}</span>
                  <span className="text-[10px] font-normal text-slate-500">{peakSolarFormatted.unit}</span>
                </>
              ) : powerSource === 'grid' ? (
                <>
                  <span>{peakMotorFormatted.value}</span>
                  <span className="text-[10px] font-normal text-slate-500">{peakMotorFormatted.unit} Motor</span>
                </>
              ) : (
                <>
                  <span>{peakSolarFormatted.value}</span>
                  <span className="text-[10px] font-normal text-slate-500">{peakSolarFormatted.unit} + Grid</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-sans truncate">
              {powerSource === 'solar'
                ? `${formatCompactNumber(sizingSummary.peakPanelCount)} × 550W panels · OpEx: NPR 0`
                : powerSource === 'grid'
                  ? `~${sizingSummary.peakMotorHp >= 1000 ? formatCompactNumber(sizingSummary.peakMotorHp) : sizingSummary.peakMotorHp.toFixed(1)} HP · Bill: ~NPR ${formatCompactNumber(sizingSummary.annualGridCostNpr)}/yr`
                  : `Solar 75% + Grid · Bill: ~NPR ${formatCompactNumber(sizingSummary.annualGridCostNpr)}/yr`}
            </div>
          </div>

          {/* Card 4: Infrastructure / Co-Benefits */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 min-w-0 overflow-hidden">
            <div className="text-[10px] text-emerald-700 uppercase font-sans font-semibold truncate">
              {powerSource === 'solar' ? 'Fossil Fuel Displaced' : 'NEA Substation Link'}
            </div>
            <div className="text-base font-extrabold text-emerald-950 mt-0.5 truncate flex items-baseline gap-1">
              {powerSource === 'solar' ? (
                <>
                  <span>{formatCompactNumber(sizingSummary.annualDieselLiters)}</span>
                  <span className="text-[10px] font-normal text-slate-500">L/yr diesel</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold truncate">
                    {sizingSummary.gridProfile?.substationName ||
                      sizingSummary.substationInfo?.name ||
                      'Tamghas Substation'}
                  </span>
                </>
              )}
            </div>
            <div className="text-[10px] text-slate-500 font-sans truncate">
              {powerSource === 'solar'
                ? `${formatCompactNumber(sizingSummary.annualCo2Tons)} tCO₂ avoided; ~NPR ${formatCompactNumber(sizingSummary.annualDieselCostNpr)} saved`
                : `Distance: ${sizingSummary.gridProfile?.feederDistanceKm ?? 8.5} km · ${activePalika.name} Grid: ${sizingSummary.gridProfile?.electrificationRatePct ?? 90}%`}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-sky-700 uppercase font-sans font-semibold">Annual Precipitation (P)</div>
              <div className="text-base font-extrabold text-sky-950 mt-0.5">
                {summary.precipitation_wmo_normal_mm}{' '}
                <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-1 leading-snug">
              Peff: {summary.effective_precipitation_mm} mm + Unretained: {summary.unretained_rainfall_mm} mm
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-amber-700 uppercase font-sans font-semibold">
                Composite Crop Demand (ETc)
              </div>
              <div className="text-base font-extrabold text-amber-950 mt-0.5">
                {summary.etc_crop_demand_mm} <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-1 leading-snug">
              Mixed terrace rotation (Reference ET₀: {summary.et0_reference_mm} mm)
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-rose-700 uppercase font-sans font-semibold">
                Net Irrigation Requirement (Ireq)
              </div>
              <div className="text-base font-extrabold text-rose-950 mt-0.5">
                {summary.net_irrigation_requirement_mm}{' '}
                <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-1 leading-snug">
              {summary.irrigation_deficit_months} deficit months ({summary.critical_stress_window})
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-emerald-700 uppercase font-sans font-semibold">
                Unretained Precipitation (P - Peff)
              </div>
              <div className="text-base font-extrabold text-emerald-950 mt-0.5">
                {summary.unretained_rainfall_mm} <span className="text-[10px] font-normal text-slate-500">mm/yr</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-sans mt-1 leading-snug">
              Surface runoff & canopy loss · Percolation: {summary.deep_percolation_mm ?? 0} mm
            </div>
          </div>
        </div>
      )}

      {/* Seasonality Explainer Note */}
      {activeTab === 'balance' && (
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
          <div>
            <strong>Hydrological Seasonality Note:</strong> While total precipitation (
            {summary.precipitation_wmo_normal_mm} mm) exceeds annual crop demand ({summary.etc_crop_demand_mm} mm), ~80%
            falls in June–September as unretained terrace runoff ({summary.unretained_rainfall_mm} mm). Consequently, a
            root-zone deficit emerges across the 6 dry winter/spring months ({summary.critical_stress_window}),
            requiring <strong>{summary.net_irrigation_requirement_mm} mm</strong> of supplemental irrigation.
          </div>
        </div>
      )}

      {/* Stage 2 Soil Health Diagnosis & Liming Advisory */}
      {activeTab === 'soil' && (
        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🧪</span>
            <div>
              <div className="font-bold font-outfit text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-2">
                <span>NARC Soil Health Diagnosis for {activePalika.name}</span>
                <span className="text-[9px] font-mono font-normal text-emerald-700 lowercase">
                  (100m empirical grid)
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                Benchmark Soil:{' '}
                <strong className="font-mono">pH {soilProfile?.ph ?? activePalika.soilPh ?? '—'}</strong>
                {soilProfile ? ` (${soilProfile.texture}, ${soilProfile.organicMatterPct}% SOM)` : ''} •{' '}
                {(soilProfile?.ph ?? activePalika.soilPh ?? 7) < 6.0
                  ? 'Acidic Hill Slope (Moderate Lime Required)'
                  : 'Near-Neutral Balanced Soil (Optimal Micronutrient Availability)'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 font-semibold font-mono text-[11px]">
              {(soilProfile?.ph ?? activePalika.soilPh ?? 7) < 6.0
                ? 'Advisory: Apply 1.5–2.0 t/ha Agri-Lime'
                : 'Advisory: Standard N-P-K Organic Compost'}
            </div>
            {onOpenSoilModal && (
              <button
                type="button"
                onClick={onOpenSoilModal}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                title="Inspect detailed NARC 100m soil chemical analysis"
              >
                <span>Inspect Dossier</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Agro-Hydrology Chart */}
      <div className="h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'solar_sizing' ? (
            <ComposedChart data={sizingMonthlyData} margin={{ top: 10, right: 30, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month_en"
                tickFormatter={(val, idx) => `${val} (${months[idx]?.month_np || ''})`}
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(val) => {
                  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}B`;
                  if (val >= 1e3) return `${(val / 1e3).toFixed(0)}M`;
                  return `${val}k`;
                }}
                unit=" m³"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: '#d97706' }}
                axisLine={{ stroke: '#f59e0b' }}
                tickFormatter={(val) => {
                  if (val >= 1e6) return `${(val / 1e6).toFixed(1)}GWp`;
                  if (val >= 1e3) return `${(val / 1e3).toFixed(1)}MWp`;
                  return `${val}kWp`;
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    const vGross = formatWaterVolume(d.volGrossLiftM3);
                    const vNet = formatWaterVolume(d.volNetDeficitM3);
                    const vDaily = formatWaterVolume(d.dailyGrossM3);
                    const vFlow = formatFlowRate(d.flowRateLps);
                    const vSolar = formatSolarArray(d.requiredSolarKwp);
                    const vMotor = formatPower(d.motorPowerKw);
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 font-sans max-w-xs">
                        <div className="font-bold border-b border-slate-700 pb-1 text-amber-300 flex items-center justify-between">
                          <span>
                            {d.month_en} ({d.month_np}) · {d.agro_season}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {formatCompactNumber(targetAreaHa)} ha Command
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                          <span className="text-slate-400">Net Crop Deficit:</span>
                          <strong className="text-rose-400">
                            {d.net_irrigation_req_mm} mm ({vNet.value} {vNet.unit})
                          </strong>
                          <span className="text-slate-400">
                            Gross Lift ({irrigationTech === 'drip' ? '80%' : '45%'} η):
                          </span>
                          <strong className="text-sky-300">
                            {vGross.value} {vGross.unit}
                          </strong>
                          <span className="text-slate-400">Daily Gross Lift:</span>
                          <span className="text-slate-200">
                            {vDaily.value} {vDaily.unit}/d
                          </span>
                          <span className="text-slate-400">Pumping Flow:</span>
                          <strong className="text-sky-400">
                            {vFlow.value} {vFlow.unit} ({formatCompactNumber(d.flowRateM3Hr)} m³/h)
                          </strong>
                          <span className="text-slate-400">Static / TDH:</span>
                          <span className="text-slate-300">
                            {staticLiftHeadM}m / {totalDynamicHeadM.toFixed(0)}m
                          </span>
                          <span className="text-slate-400">Hydraulic Energy:</span>
                          <span className="text-amber-200">{formatCompactNumber(d.dailyHydraulicKwh)} kWh/d</span>
                          {powerSource === 'solar' ? (
                            <>
                              <span className="text-slate-400">Required Solar PV:</span>
                              <strong className="text-amber-400">
                                {vSolar.value} {vSolar.unit}
                              </strong>
                              <span className="text-slate-400">550W Panels:</span>
                              <span className="text-amber-300">{formatCompactNumber(d.panelCount)} modules</span>
                            </>
                          ) : powerSource === 'grid' ? (
                            <>
                              <span className="text-slate-400">Motor Power:</span>
                              <strong className="text-emerald-400">
                                {vMotor.value} {vMotor.unit} ({d.motorPowerHp} HP)
                              </strong>
                              <span className="text-slate-400">NEA Grid Bill:</span>
                              <span className="text-emerald-300">
                                ~NPR {formatCompactNumber(d.monthlyGridCostNpr)}/mo
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-slate-400">Solar Array:</span>
                              <strong className="text-amber-400">
                                {vSolar.value} {vSolar.unit}
                              </strong>
                              <span className="text-slate-400">Grid Top-up Bill:</span>
                              <span className="text-emerald-300">
                                ~NPR {formatCompactNumber(d.monthlyGridCostNpr)}/mo
                              </span>
                            </>
                          )}
                          <span className="text-slate-400">Diesel Displaced:</span>
                          <span className="text-emerald-400">~{formatCompactNumber(d.monthlyDieselLiters)} L/mo</span>
                        </div>
                        <div className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800 leading-snug">
                          {d.advisory}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
              <ReferenceLine yAxisId="left" y={0} stroke="#94a3b8" />
              <Bar
                yAxisId="left"
                dataKey="volGrossThousandM3"
                name={`Gross Lift Volume (k m³ · ${irrigationTech === 'drip' ? '80%' : '45%'} η)`}
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="left"
                dataKey="volNetThousandM3"
                name="Net Crop Deficit (k m³)"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
              {powerSource === 'grid' ? (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="motorPowerKw"
                  name="Required Motor Load (kW)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              ) : (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="requiredSolarKwp"
                  name="Required Solar PV Array (kWp)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              )}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="flowRateLps"
                name={`Pumping Flow Rate (L/s @ ${powerSource === 'solar' ? '6h' : '8h'})`}
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 2.5 }}
              />
            </ComposedChart>
          ) : activeTab === 'balance' ? (
            <ComposedChart data={months} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month_en"
                tickFormatter={(val, idx) => `${val} (${months[idx]?.month_np || ''})`}
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={{ stroke: '#cbd5e1' }} unit=" mm" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d: MonthAgroHydrology = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 font-sans max-w-xs">
                        <div className="font-bold border-b border-slate-700 pb-1 text-sky-300 flex items-center justify-between">
                          <span>
                            {d.month_en} ({d.month_np}) · {d.agro_season}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Composite Kc: {d.crop_kc}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                          <span className="text-slate-400">CHIRPS Baseline (P):</span>
                          <strong className="text-sky-400">{d.precip_wmo_normal_mm} mm</strong>
                          <span className="text-slate-400">Effective Rain (Peff):</span>
                          <strong className="text-sky-300">{d.effective_precip_mm} mm</strong>
                          <span className="text-slate-400">Unretained (P - Peff):</span>
                          <span className="text-slate-300">{d.unretained_rainfall_mm ?? 0} mm</span>
                          <span className="text-slate-400">Reference ET₀:</span>
                          <span className="text-amber-300">{d.et0_reference_mm} mm</span>
                          <span className="text-slate-400">Composite Crop ETc:</span>
                          <strong className="text-amber-400">{d.etc_crop_demand_mm} mm</strong>
                          <span className="text-slate-400">Net Irrigation Req (Ireq):</span>
                          <strong className={d.net_irrigation_req_mm > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                            {d.net_irrigation_req_mm} mm
                          </strong>
                          <span className="text-slate-400">Soil Storage:</span>
                          <span className="text-emerald-300">
                            {d.soil_storage_end_mm} / {taw_mm} mm ({d.soil_depletion_pct}% depleted)
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800 leading-snug">
                          {d.advisory}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
              <ReferenceLine y={0} stroke="#94a3b8" />
              <Area
                type="monotone"
                dataKey="precip_p90_mm"
                name="Historical P90 Rainfall"
                stroke="none"
                fill="#38bdf8"
                fillOpacity={0.12}
              />
              <Bar
                dataKey="precip_wmo_normal_mm"
                name="Precipitation Baseline (mm)"
                fill="#0284c7"
                radius={[4, 4, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="et0_reference_mm"
                name="Reference ET₀ (mm)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2.5 }}
              />
              <Line
                type="monotone"
                dataKey="etc_crop_demand_mm"
                name="Composite Crop Demand ETc (mm)"
                stroke="#d97706"
                strokeWidth={2.5}
                strokeDasharray="4 3"
                dot={{ r: 3 }}
              />
              <Bar
                dataKey="net_irrigation_req_mm"
                name="Net Irrigation Requirement (mm)"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={months} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="month_en"
                tickFormatter={(val, idx) => `${val} (${months[idx]?.month_np || ''})`}
                tick={{ fontSize: 10, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                yAxisId="storage"
                tick={{ fontSize: 10, fill: '#059669' }}
                axisLine={{ stroke: '#10b981' }}
                unit=" mm"
                domain={[0, Math.ceil(taw_mm * 1.25)]}
              />
              <YAxis
                yAxisId="runoff"
                orientation="right"
                tick={{ fontSize: 10, fill: '#0284c7' }}
                axisLine={{ stroke: '#0ea5e9' }}
                unit=" mm"
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d: MonthAgroHydrology = payload[0].payload;
                    return (
                      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 font-sans max-w-xs">
                        <div className="font-bold border-b border-slate-700 pb-1 text-emerald-300">
                          {d.month_en} ({d.month_np}) · Root-Zone Storage Dynamics
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[11px]">
                          <span className="text-slate-400">Total Rainfall (P):</span>
                          <span className="text-sky-400">{d.precip_wmo_normal_mm} mm</span>
                          <span className="text-slate-400">Effective Rain (Peff):</span>
                          <span className="text-sky-300">{d.effective_precip_mm} mm</span>
                          <span className="text-slate-400">Crop Demand (ETc):</span>
                          <span className="text-amber-400">{d.etc_crop_demand_mm} mm</span>
                          <span className="text-slate-400">Start Storage (S_start):</span>
                          <span className="text-slate-300">{d.soil_storage_start_mm} mm</span>
                          <span className="text-slate-400">End Storage (S_end):</span>
                          <strong className="text-emerald-400">{d.soil_storage_end_mm} mm</strong>
                          <span className="text-slate-400">Readily Available (RAW):</span>
                          <span className="text-amber-300">{raw_mm} mm</span>
                          <span className="text-slate-400">Storage Depletion:</span>
                          <strong className={d.soil_depletion_pct > 50 ? 'text-rose-400' : 'text-emerald-400'}>
                            {d.soil_depletion_pct}% ({Math.round(taw_mm - d.soil_storage_end_mm)} mm gap)
                          </strong>
                          <span className="text-slate-400">Irrigation Req (Ireq):</span>
                          <strong className={d.net_irrigation_req_mm > 0 ? 'text-rose-400' : 'text-slate-400'}>
                            {d.net_irrigation_req_mm} mm
                          </strong>
                          <span className="text-slate-400">Unretained Runoff:</span>
                          <span className="text-sky-300">{d.unretained_rainfall_mm ?? 0} mm</span>
                        </div>
                        <div className="text-[10px] text-slate-300 pt-1.5 border-t border-slate-800 leading-snug">
                          {d.advisory}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} iconType="circle" />
              <ReferenceLine
                yAxisId="storage"
                y={taw_mm}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: `TAW (${taw_mm} mm)`, fontSize: 10, fill: '#059669', position: 'top' }}
              />
              <ReferenceLine
                yAxisId="storage"
                y={taw_mm - raw_mm}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{
                  value: `Stress Threshold [Dr > RAW] (${Math.round(taw_mm - raw_mm)} mm)`,
                  fontSize: 10,
                  fill: '#d97706',
                  position: 'bottom',
                }}
              />
              <Area
                yAxisId="storage"
                type="monotone"
                dataKey="soil_storage_end_mm"
                name="Root-Zone Storage St (mm)"
                fill="#10b981"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={0.25}
              />
              <Bar
                yAxisId="runoff"
                dataKey="unretained_rainfall_mm"
                name="Unretained Runoff (mm) [Right Axis]"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Seasonal Action Cards & Engineering Specifications */}
      {activeTab === 'solar_sizing' && sizingSummary ? (
        <div className="space-y-3 pt-1 animate-fade-in">
          {/* Action Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* Card 1: Peak Monthly Demand & Storage Buffer */}
            <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 text-rose-900 font-bold uppercase text-[10px] truncate">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">Peak Lift & Storage Buffer</span>
              </div>
              <div className="text-base font-extrabold text-rose-950 font-mono mt-1 truncate">
                {peakMonthVolFormatted.value}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  {peakMonthVolFormatted.unit} ({sizingSummary.peakMonth.month_en})
                </span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                Recommended 24h Header Reservoir:{' '}
                <strong>
                  {bufferTankFormatted.value} {bufferTankFormatted.unit}
                </strong>{' '}
                masonry/plastic pond at ridge crest.
              </div>
            </div>

            {/* Card 2: Energy Specification */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold uppercase text-[10px] truncate">
                {powerSource === 'solar' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : powerSource === 'grid' ? (
                  <Power className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                )}
                <span className="truncate">
                  {powerSource === 'solar'
                    ? 'Solar PV Array'
                    : powerSource === 'grid'
                      ? 'NEA Motor Load'
                      : 'Hybrid System'}
                </span>
              </div>
              <div className="text-base font-extrabold text-amber-950 font-mono mt-1 truncate">
                {powerSource === 'solar' ? (
                  <>
                    {peakSolarFormatted.value}{' '}
                    <span className="text-[10px] font-normal text-slate-500">{peakSolarFormatted.unit} Installed</span>
                  </>
                ) : powerSource === 'grid' ? (
                  <>
                    {peakMotorFormatted.value} {peakMotorFormatted.unit}{' '}
                    <span className="text-[10px] font-normal text-slate-500">
                      (~
                      {sizingSummary.peakMotorHp >= 1000
                        ? formatCompactNumber(sizingSummary.peakMotorHp)
                        : sizingSummary.peakMotorHp.toFixed(1)}{' '}
                      HP)
                    </span>
                  </>
                ) : (
                  <>
                    {peakSolarFormatted.value} {peakSolarFormatted.unit}{' '}
                    <span className="text-[10px] font-normal text-slate-500">+ Grid Backup</span>
                  </>
                )}
              </div>
              <div className="text-[10px] text-slate-600 mt-1 leading-snug">
                {powerSource === 'solar'
                  ? `${formatCompactNumber(sizingSummary.peakPanelCount)} × 550W Tier-1 panels @ ${optaTilt}° tilt (CapEx: ~NPR ${formatCompactNumber(sizingSummary.estimatedSolarCapexNpr)})`
                  : powerSource === 'grid'
                    ? `Annual Energy: ~${formatCompactNumber(sizingSummary.annualElectricityKwh)} kWh · Bill: ~NPR ${formatCompactNumber(sizingSummary.annualGridCostNpr)}/yr (@ Rs 5.00/unit)`
                    : `75% solar displacement; grid off-peak top-up ~NPR ${formatCompactNumber(sizingSummary.annualGridCostNpr)}/yr`}
              </div>
            </div>

            {/* Card 3: Hydraulic Pump & Pipeline */}
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 min-w-0">
              <div className="flex items-center gap-1.5 text-sky-900 font-bold uppercase text-[10px]">
                <Gauge className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Hydraulic Pump & Pipeline</span>
              </div>
              <div className="text-base font-extrabold text-sky-950 font-mono mt-1">
                {peakFlowFormatted.value} {peakFlowFormatted.unit}{' '}
                <span className="text-[10px] font-normal text-slate-500">
                  ({formatCompactNumber(sizingSummary.peakFlowM3Hr)} m³/h)
                </span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                Total Lift: {totalDynamicHeadM.toFixed(0)}m TDH · Rising Main: DN{sizingSummary.recommendedPipeMm} (PN16
                HDPE).
              </div>
            </div>

            {/* Card 4: Economic & Environmental Impact */}
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold uppercase text-[10px]">
                <Fuel className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nexus Co-Benefits</span>
              </div>
              <div className="text-base font-extrabold text-emerald-950 font-mono mt-1">
                {formatCompactNumber(sizingSummary.annualDieselLiters)}{' '}
                <span className="text-[10px] font-normal text-slate-500">L diesel offset/yr</span>
              </div>
              <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">
                {formatCompactNumber(sizingSummary.annualCo2Tons)} tCO₂/yr avoided; ~NPR{' '}
                {formatCompactNumber(sizingSummary.annualDieselCostNpr)} diesel saved.
              </div>
            </div>
          </div>

          {/* Multi-Energy Comparative Trade-Off Matrix */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
            <div className="bg-slate-100/90 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-outfit uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Multi-Energy Technology & Trade-Off Comparison (Gulmi Mid-Hills)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Command: {formatCompactNumber(targetAreaHa)} ha · Lift: {totalDynamicHeadM.toFixed(0)}m TDH ·
                Efficiency: {irrigationTech === 'drip' ? '80% (Drip)' : '45% (Furrow)'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Power Alternative</th>
                    <th className="p-2.5">CapEx Investment</th>
                    <th className="p-2.5">Annual Energy Bill (OpEx)</th>
                    <th className="p-2.5">Dry-Season Reliability (Chaitra)</th>
                    <th className="p-2.5">Carbon & Environmental Impact</th>
                    <th className="p-2.5">Gulmi Local Feasibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr className={powerSource === 'solar' ? 'bg-amber-50/50 font-medium' : ''}>
                    <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-600" />
                      <span>Off-Grid Solar PV</span>
                      {powerSource === 'solar' && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded font-bold">Selected</span>
                      )}
                    </td>
                    <td className="p-2.5 text-rose-700 font-mono font-semibold">
                      High (~NPR {formatCompactNumber(sizingSummary.estimatedSolarCapexNpr)})
                    </td>
                    <td className="p-2.5 text-emerald-700 font-mono font-bold">NPR 0 / yr (Free Sun)</td>
                    <td className="p-2.5 text-emerald-700">
                      Highest (Directly coincides with 6.2 kWh/m²/day peak irradiance)
                    </td>
                    <td className="p-2.5 text-emerald-700">
                      Zero direct emissions; ~{formatCompactNumber(sizingSummary.annualCo2Tons)} tCO₂ offset
                    </td>
                    <td className="p-2.5 text-slate-700">
                      Universal on south-facing sunny terraces; requires array land
                    </td>
                  </tr>
                  <tr className={powerSource === 'grid' ? 'bg-emerald-50/50 font-medium' : ''}>
                    <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Power className="w-3.5 h-3.5 text-emerald-600" />
                      <span>NEA Grid Hydro</span>
                      {powerSource === 'grid' && (
                        <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1 rounded font-bold">
                          Selected
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-emerald-700 font-mono">Moderate (Motor + 11kV line drop)</td>
                    <td className="p-2.5 text-amber-700 font-mono font-semibold">
                      ~NPR {formatCompactNumber(sizingSummary.annualGridCostNpr)} / yr (@ Rs 5.00/unit)
                    </td>
                    <td className="p-2.5 text-amber-700">
                      Moderate (Dry-season run-of-river drops & rural 11kV line voltage sags)
                    </td>
                    <td className="p-2.5 text-emerald-600">Clean national hydropower grid; minimal emissions</td>
                    <td className="p-2.5 text-slate-700">
                      Feasible within 1–2 km of 11kV lines ({sizingSummary.gridProfile?.substationName ?? 'Tamghas'} ~
                      {sizingSummary.gridProfile?.feederDistanceKm ?? 8}km)
                    </td>
                  </tr>
                  <tr className={powerSource === 'hybrid' ? 'bg-sky-50/50 font-medium' : ''}>
                    <td className="p-2.5 font-semibold text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-600" />
                      <span>Hybrid Solar-Grid</span>
                      {powerSource === 'hybrid' && (
                        <span className="text-[9px] bg-sky-200 text-sky-900 px-1 rounded font-bold">Selected</span>
                      )}
                    </td>
                    <td className="p-2.5 text-rose-700 font-mono">
                      High (~NPR {formatCompactNumber(sizingSummary.estimatedSolarCapexNpr)})
                    </td>
                    <td className="p-2.5 text-emerald-700 font-mono font-semibold">
                      ~NPR {formatCompactNumber(sizingSummary.annualGridCostNpr)} / yr (75% savings)
                    </td>
                    <td className="p-2.5 text-emerald-700">
                      Optimal (Solar primary daytime + Grid morning/cloudy top-up)
                    </td>
                    <td className="p-2.5 text-emerald-700">
                      Monsoon solar surplus (~{formatCompactNumber(sizingSummary.monsoonSurplusKwh)} kWh) can net-meter
                      to NEA
                    </td>
                    <td className="p-2.5 text-slate-700">Best long-term commercial model for farmer cooperatives</td>
                  </tr>
                  <tr className="bg-slate-50/40 text-slate-500">
                    <td className="p-2.5 font-semibold text-slate-700 flex items-center gap-1.5">
                      <Fuel className="w-3.5 h-3.5 text-slate-500" />
                      <span>Diesel Generator</span>
                    </td>
                    <td className="p-2.5 text-emerald-700 font-mono">Low (Engine purchase)</td>
                    <td className="p-2.5 text-rose-700 font-mono font-bold">
                      ~NPR {formatCompactNumber(sizingSummary.annualDieselCostNpr)} / yr (@ Rs 175/L)
                    </td>
                    <td className="p-2.5 text-rose-700">
                      High operational friction (Fuel transport to remote mountain terraces)
                    </td>
                    <td className="p-2.5 text-rose-700">
                      {formatCompactNumber(sizingSummary.annualCo2Tons)} tCO₂/yr emitted + local particulate soot
                    </td>
                    <td className="p-2.5 text-slate-500">
                      Emergency fallback only; economically unsustainable for hill farmers
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Expandable Engineering Design Drawer */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/70">
            <button
              onClick={() => setShowEngineeringDrawer(!showEngineeringDrawer)}
              className="w-full p-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-600" />
                <span>Engineering Design Specifications, Loss Chain & Scientific Provenance</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-normal">
                <span>{showEngineeringDrawer ? 'Hide Technical Details' : 'Show Technical Details'}</span>
                {showEngineeringDrawer ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {showEngineeringDrawer && (
              <div className="p-4 pt-2 border-t border-slate-200 text-xs text-slate-600 space-y-3 font-sans animate-fade-in bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Hydraulic & Sizing Derivations */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-1">
                      <span>⚙️ Hydraulic Sizing Formulation & Pumping Schedule</span>
                    </h4>
                    <ul className="space-y-1 text-[11px] font-mono leading-relaxed">
                      <li>
                        • <strong>Irrigation Efficiency (FAO-56):</strong> Net Crop Deficit:{' '}
                        <strong>
                          {annualNetVolFormatted.value} {annualNetVolFormatted.unit}
                        </strong>{' '}
                        → Gross Lift:{' '}
                        <strong>
                          {annualVolFormatted.value} {annualVolFormatted.unit}
                        </strong>{' '}
                        ({irrigationTech === 'drip' ? 'η = 80% Piped Drip' : 'η = 45% Earthen Furrow'}).
                      </li>
                      <li>
                        • <strong>Pumping Schedule:</strong> {dailyPeakFormatted.value} {dailyPeakFormatted.unit}/day
                        pumped over{' '}
                        <strong>
                          {powerSource === 'solar'
                            ? '6.0 hours/day (solar window)'
                            : '8.0 hours/day (off-peak grid shift)'}
                        </strong>
                        .
                      </li>
                      <li>
                        • <strong>Required Flow Rate:</strong> Q = {formatCompactNumber(sizingSummary.peakFlowM3Hr)}{' '}
                        m³/hr ={' '}
                        <strong>
                          {peakFlowFormatted.value} {peakFlowFormatted.unit}
                        </strong>
                        .
                      </li>
                      <li>
                        • <strong>Head Breakdown:</strong> Static Lift ({staticLiftHeadM}m) + Friction/Fittings (+10% /{' '}
                        {frictionLossM}m) = <strong>Total Dynamic Head (TDH): {totalDynamicHeadM.toFixed(1)}m</strong>.
                      </li>
                      <li>
                        • <strong>Hydraulic Power:</strong> P_hyd = (ρ·g·Q·TDH)/1000 ={' '}
                        <strong>
                          {formatPower(9.81 * (sizingSummary.peakFlowM3Hr / 3600) * totalDynamicHeadM).value}{' '}
                          {formatPower(9.81 * (sizingSummary.peakFlowM3Hr / 3600) * totalDynamicHeadM).unit}
                        </strong>{' '}
                        (Fluid Mechanics identity).
                      </li>
                      <li>
                        • <strong>Wire-to-Water Efficiency:</strong> η = <strong>65%</strong> (submersible multistage
                        pump/motor specified per ISO 9906:2012 Grade 2B). Connected Motor Rating:{' '}
                        <strong>
                          {peakMotorFormatted.value} {peakMotorFormatted.unit} (~
                          {sizingSummary.peakMotorHp >= 1000
                            ? formatCompactNumber(sizingSummary.peakMotorHp)
                            : sizingSummary.peakMotorHp.toFixed(1)}{' '}
                          HP)
                        </strong>
                        .
                      </li>
                      <li>
                        • <strong>Ridge Header Buffer Reservoir (DWRI Standard):</strong> Sized for 24-hour peak storage
                        ={' '}
                        <strong>
                          {bufferTankFormatted.value} {bufferTankFormatted.unit}
                        </strong>{' '}
                        polythene/masonry pond at terrace crest.
                      </li>
                    </ul>
                  </div>

                  {/* Right Column: Solar Generator & Economic Baseline */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs border-b border-slate-200 pb-1">
                      <span>☀️ Energy Lineage, NEA Tariffs & Scientific Provenance</span>
                    </h4>
                    <ul className="space-y-1 text-[11px] font-mono leading-relaxed">
                      <li>
                        • <strong>Solar Design Sizing Logic:</strong> Sized for{' '}
                        <strong>peak-day dry season deficit</strong> in {sizingSummary.peakMonth.month_en} (
                        {sizingSummary.peakMonth.month_np}), not annual average energy.
                      </li>
                      <li>
                        • <strong>Array Capacity (ESMAP):</strong> Daily Hydraulic Energy (
                        {formatCompactNumber(sizingSummary.peakMonth.dailyHydraulicKwh)} kWh) / (PVOUT {pvoutKwhPerKwp}{' '}
                        × η_pump 0.65 × η_derate 0.85) ={' '}
                        <strong>
                          {formatSolarArray(sizingSummary.peakSolarKwp).value}{' '}
                          {formatSolarArray(sizingSummary.peakSolarKwp).unit}
                        </strong>
                        .
                      </li>
                      <li>
                        • <strong>Installed Generator:</strong> {formatCompactNumber(sizingSummary.peakPanelCount)} ×
                        550W Tier-1 Mono PERC panels ={' '}
                        <strong>
                          {peakSolarFormatted.value} {peakSolarFormatted.unit}
                        </strong>{' '}
                        at {optaTilt}° South tilt.
                      </li>
                      <li>
                        • <strong>NEA Agricultural Tariff (ERC Approved):</strong> <strong>NPR 5.00 / kWh</strong>{' '}
                        applied for agricultural irrigation pumping across rural feeder networks.
                      </li>
                      <li>
                        • <strong>Monsoon Energy Dividend:</strong> Jun–Sep irrigation demand = 0 mm. Sized PV array
                        generates <strong>~{formatCompactNumber(sizingSummary.monsoonSurplusKwh)} kWh</strong> surplus
                        power for local mini-grid or agro-processing.
                      </li>
                      <li>
                        • <strong>Diesel Offset Baseline:</strong> Rural generator fuel consumption:{' '}
                        <strong>0.35 L/kWh</strong>; Emission factor: <strong>2.68 kg CO₂/L</strong>; Retail tariff:{' '}
                        <strong>NPR 175/L</strong> (NOC).
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Third Section: Formal Peer-Reviewed Scientific Provenance (FAO-56 Equations) */}
                <div className="pt-2.5 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs mb-2">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Peer-Reviewed Scientific Provenance & FAO-56 Governing Equations</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] font-mono">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-800 mb-1">
                        1. Evaporative Demand (Ch. 2 & 6)
                      </span>
                      <div className="text-slate-600 space-y-0.5">
                        <div>
                          • <strong>ET₀:</strong> FAO Penman-Monteith (Eq. 6)
                        </div>
                        <div>
                          • <strong>ETc:</strong> Kc · ET₀ (Table 12, Fig. 25)
                        </div>
                        <div>
                          • <strong>P_eff:</strong> USDA-SCS / FAO Method
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase text-emerald-800 mb-1">
                        2. Soil Water Bucket (Ch. 8)
                      </span>
                      <div className="text-slate-600 space-y-0.5">
                        <div>
                          • <strong>TAW:</strong> 1000 · (θ_FC - θ_WP) · Zr (Eq. 82)
                        </div>
                        <div>
                          • <strong>RAW:</strong> p · TAW (p = 0.35–0.55, Eq. 83)
                        </div>
                        <div>
                          • <strong>Percolation:</strong> S_t &gt; TAW (Fig. 43)
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[10px] uppercase text-amber-800 mb-1">
                        3. Stress & Lift Power (Ch. 8)
                      </span>
                      <div className="text-slate-600 space-y-0.5">
                        <div>
                          • <strong>Ks:</strong> (TAW - Dr) / ((1-p)TAW) (Eq. 84)
                        </div>
                        <div>
                          • <strong>Gross Lift:</strong> NIR / η_field (Annex 8)
                        </div>
                        <div>
                          • <strong>P_hyd:</strong> (ρ·g·Q·TDH)/1000 (Fluid Mechanics)
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 italic mt-2 font-sans leading-relaxed">
                    Primary Reference: Allen, R.G., Pereira, L.S., Raes, D., &amp; Smith, M. (1998/2000).{' '}
                    <em>Crop Evapotranspiration: Guidelines for computing crop water requirements</em>. FAO Irrigation
                    and Drainage Paper No. 56, Food and Agriculture Organization of the United Nations, Rome, 326p.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-rose-900 font-bold uppercase text-[10px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Dry-Season Deficit Peak</span>
              </div>
              <div className="text-base font-extrabold text-rose-950 font-mono mt-1">
                {summary.net_irrigation_requirement_mm}{' '}
                <span className="text-[10px] font-normal text-slate-500">mm cumulative</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              Peak: <strong>{summary.peak_deficit_window || 'Chaitra–Baisakh'}</strong>. Root-zone depletion exceeds RAW
              threshold (Dr &gt; p·TAW) across {summary.irrigation_deficit_months} months (
              {summary.critical_stress_window}).
            </div>
          </div>

          <div
            onClick={() => setActiveTab('solar_sizing')}
            className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-all group min-w-0 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-amber-900 font-bold uppercase text-[10px]">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Solar Pumping Window</span>
                </div>
                <span className="text-[9px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded font-semibold group-hover:bg-amber-300/80 transition-colors flex items-center gap-0.5 shrink-0 ml-1">
                  <span>View Sizing</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="text-base font-extrabold text-amber-950 font-mono mt-1">
                5.8 – 6.2 <span className="text-[10px] font-normal text-slate-500">kWh/m²/day</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              Maximum solar irradiance coincides directly with peak root-zone depletion. Click to model river-lift pump
              & array sizing.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-sky-900 font-bold uppercase text-[10px]">
                <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Monsoon Unretained Moisture</span>
              </div>
              <div className="text-base font-extrabold text-sky-950 font-mono mt-1">
                {summary.unretained_rainfall_mm}{' '}
                <span className="text-[10px] font-normal text-slate-500">mm (P - Peff)</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              Precipitation not retained in root zone generates terrace runoff and deep aquifer recharge (
              {summary.deep_percolation_mm ?? 0} mm).
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold uppercase text-[10px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Post-Monsoon Carry-Over (Kartik)</span>
              </div>
              <div className="text-xs font-bold text-emerald-950 font-mono mt-1">
                Storage: {months[9]?.soil_storage_end_mm || 0} mm (
                {Math.round(((months[9]?.soil_storage_end_mm || 0) / taw_mm) * 100)}% of TAW)
              </div>
            </div>
            <div className="text-[10px] text-slate-600 mt-2 leading-relaxed">
              Under sequential water balance, October monsoon carry-over buffers soil moisture into November (Mangsir),
              allowing winter crop sowing before irrigation begins.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
