import React from 'react';
import { District, WEFESPillar, Crop, CropSuitability } from '@wefes/shared-types';
import { db, isCropFeasibleInDistrict } from '@wefes/database';
import { computeCropSuitability } from '@wefes/wefes-engine';
import {
  Calendar, CloudRain, Thermometer, Wind, Gauge, Sparkles, Zap, Sun,
  Sprout, Leaf, Cherry, Wheat as WheatIcon, MapPin, CheckCircle, AlertTriangle,
  Award, TrendingUp
} from 'lucide-react';

interface DistrictHoverCardProps {
  district: District | null;
  climateDataset?: any;
  climateYear?: number;
  climateMonth?: number;
  climateMode?: 'monthly' | 'annual' | 'climatology';
  activeClimateMetric?: string;
  selectedPillar?: WEFESPillar;
  selectedCropId?: string | null;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function parseCommissionedYear(commStr?: string): number | null {
  if (!commStr) return null;
  const match = commStr.match(/\b(19\d\d|20\d\d)\b/);
  return match ? parseInt(match[1], 10) : null;
}

function getActiveHydroInfoForYear(district: District, year: number) {
  if (!district.hydroStationsList || district.hydroStationsList.length === 0) {
    return { count: 0, capacityMW: 0 };
  }
  let count = 0;
  let capacityMW = 0;
  for (const st of district.hydroStationsList) {
    const cYear = parseCommissionedYear(st.commissioned);
    if (cYear !== null && cYear <= year) {
      count++;
      capacityMW += st.capacityMW;
    }
  }
  return { count, capacityMW: Number(capacityMW.toFixed(2)) };
}

function getNarcNStatus(n?: number): { label: string; color: string } {
  if (n === undefined) return { label: 'No Data', color: 'text-slate-400' };
  if (n > 0.20) return { label: 'High', color: 'text-emerald-700' };
  if (n >= 0.10) return { label: 'Medium', color: 'text-sky-700' };
  return { label: 'Low', color: 'text-rose-700' };
}

function getNarcPStatus(p?: number): { label: string; color: string } {
  if (p === undefined) return { label: 'No Data', color: 'text-slate-400' };
  if (p > 55) return { label: 'High', color: 'text-emerald-700' };
  if (p >= 30) return { label: 'Medium', color: 'text-sky-700' };
  return { label: 'Low', color: 'text-rose-700' };
}

function getNarcKStatus(k?: number): { label: string; color: string } {
  if (k === undefined) return { label: 'No Data', color: 'text-slate-400' };
  if (k > 280) return { label: 'High', color: 'text-emerald-700' };
  if (k >= 110) return { label: 'Medium', color: 'text-purple-700' };
  return { label: 'Low', color: 'text-rose-700' };
}



export const DistrictHoverCard: React.FC<DistrictHoverCardProps> = ({
  district,
  climateDataset,
  climateYear = 2024,
  climateMonth = 12,
  climateMode = 'monthly',
  activeClimateMetric = 'prectot',
  selectedPillar,
  selectedCropId,
}) => {
  if (!district) return null;

  const hasSoilData = district.hasRealSoilData !== false && (district.soilSampleCount || 0) > 0 && district.soilNitrogen !== undefined;

  const activeHydro = getActiveHydroInfoForYear(district, climateYear);
  const yearlySolar = (district.nasaSolarYearly && district.nasaSolarYearly[climateYear])
    ? district.nasaSolarYearly[climateYear]
    : (district.nasaSolarRadiationKwh || district.solarRadiationKwh);

  const nStatus = getNarcNStatus(district.soilNitrogen);
  const pStatus = getNarcPStatus(district.soilPhosphorus);
  const kStatus = getNarcKStatus(district.soilPotassium);

  // 1. If user selected a specific crop via sub-filter:
  const activeCrop = selectedCropId ? db.getCropById(selectedCropId) : null;
  const cropSuitability = activeCrop ? computeCropSuitability(district, activeCrop) : null;
  const isSelectedCropFeasible = activeCrop
    ? isCropFeasibleInDistrict(activeCrop, district)
    : true;

  // 2. If NO specific crop is selected, find the #1 Top Optimal Crop for this district:
  const allRankedCrops = React.useMemo(() => {
    return db.getAllCrops().map(crop => {
      const suit = computeCropSuitability(district, crop);
      const isFeas = isCropFeasibleInDistrict(crop, district);
      return { crop, suit, isFeas };
    }).sort((a, b) => b.suit.suitabilityScore - a.suit.suitabilityScore);
  }, [district]);

  const topOptimal = allRankedCrops.length > 0 ? allRankedCrops[0] : null;

  const totalVarietiesCount =
    (district.feasibleCrops?.length || 0) +
    (district.feasibleVegetables?.length || 0) +
    (district.feasibleFruits?.length || 0) +
    (district.feasibleSpicesCashCrops?.length || 0);

  // Extract real monthly climate metrics for hovered district
  let climateData: any = null;
  if (climateDataset) {
    const targetYear = climateYear > 2019 ? 2019 : climateYear;
    if (climateMode === 'climatology') {
      climateData = climateDataset.climatologyMap?.[district.id]?.[climateMonth];
    } else if (climateMode === 'annual') {
      const yrMap = climateDataset.climateMap?.[district.id]?.[targetYear];
      if (yrMap) {
        let sumRain = 0, sumT = 0, sumWs = 0, sumRh = 0, count = 0;
        for (let m = 1; m <= 12; m++) {
          if (yrMap[m]) {
            sumRain += yrMap[m].prectot || 0;
            sumT += yrMap[m].t2m || 0;
            sumWs += yrMap[m].ws50m || 0;
            sumRh += yrMap[m].rh2m || 0;
            count++;
          }
        }
        if (count > 0) {
          climateData = {
            prectot: Number(sumRain.toFixed(1)),
            t2m: Number((sumT / count).toFixed(1)),
            ws50m: Number((sumWs / count).toFixed(1)),
            rh2m: Number((sumRh / count).toFixed(1)),
          };
        }
      }
    } else {
      climateData = climateDataset.climateMap?.[district.id]?.[targetYear]?.[climateMonth]
        || climateDataset.climatologyMap?.[district.id]?.[climateMonth];
    }
  }

  const isFoodPillar = selectedPillar === 'food';

  return (
    <div className="absolute top-4 right-4 z-[1000] pointer-events-none w-80 md:w-96 max-w-[calc(100%-2rem)] max-h-[calc(100%-2rem)] overflow-y-auto">
      <div className="glass-panel bg-white/95 text-slate-900 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200/90 flex flex-col gap-2 animate-fade-in-up">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="font-bold text-sm text-slate-900 font-outfit">
              {district.name}
            </span>
            {district.nepaliName && (
              <span className="text-xs text-slate-500 font-serif">
                ({district.nepaliName})
              </span>
            )}
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
              {district.province}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {district.climateZone && (
              <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded font-semibold">
                {district.climateZone}
              </span>
            )}
            <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded font-semibold uppercase">
              {district.ecoZone}
            </span>
          </div>
        </div>

        {/* ─── FOOD PILLAR DEDICATED VIEW ─── */}
        {isFoodPillar ? (
          <div className="space-y-2">
            {/* Mode A: User Selected a Specific Crop Filter */}
            {activeCrop && cropSuitability ? (
              <div className="bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs font-outfit">
                        {activeCrop.name}
                      </span>
                      {activeCrop.nepaliName && (
                        <span className="text-[10px] text-slate-500 font-serif">
                          ({activeCrop.nepaliName})
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-sans">
                      Selected Overlay • {activeCrop.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-extrabold border ${cropSuitability.suitabilityScore >= 75
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : cropSuitability.suitabilityScore >= 50
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-rose-100 text-rose-900 border-rose-300'
                      }`}>
                      {cropSuitability.suitabilityScore}/100
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1 text-[10px] font-semibold">
                    {isSelectedCropFeasible ? (
                      <span className="inline-flex items-center gap-0.5 text-emerald-700">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Feasible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-amber-700">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Unsuitable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : topOptimal ? (
              /* Mode B: General Overview -> Show District's #1 Optimal Crop */
              <div className="bg-sky-50/80 p-2.5 rounded-lg border border-sky-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-sky-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-sky-800 uppercase font-bold tracking-wider">
                        #1 Top Optimal Crop:
                      </span>
                      <span className="font-bold text-slate-900 text-xs font-outfit">
                        {topOptimal.crop.name}
                      </span>
                      {topOptimal.crop.nepaliName && (
                        <span className="text-[10px] text-slate-500 font-serif">
                          ({topOptimal.crop.nepaliName})
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-slate-600 flex items-center gap-2 font-mono mt-0.5">
                      <span className="text-sky-700">Water: {topOptimal.suit.pillarScores.water}</span>
                      <span className="text-emerald-700">Food: {topOptimal.suit.pillarScores.food}</span>
                      <span className="text-purple-700">Value: NPR {topOptimal.crop.marketValuePerUnit}/kg</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs px-2.5 py-1 rounded-md font-mono font-extrabold bg-sky-100 text-sky-900 border border-sky-300 inline-flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-sky-600" />
                    {topOptimal.suit.suitabilityScore}/100
                  </span>
                </div>
              </div>
            ) : null}

            {/* Real Coffee Production 2080 Badge (if active crop is coffee OR if district is a key coffee hub) */}
            {((activeCrop?.id === 'coffee') || (!activeCrop && topOptimal?.crop.id === 'coffee')) && district.coffeeProductionMt !== undefined && (
              <div className="bg-amber-50/90 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-amber-900 font-semibold flex items-center gap-1 font-sans">
                  ☕ MoALD 2080 Coffee Census:
                </span>
                <span className="text-amber-950 font-bold">
                  {district.coffeeProductionMt} MT • {district.coffeeAreaHa} Ha • {district.coffeeFarmersCount} Farmers ({district.coffeeYieldKgHa} kg/ha)
                </span>
              </div>
            )}

            {/* Feasibility Profile Grid */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
              <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200">
                <div className="text-[10px] text-amber-900 font-semibold uppercase flex items-center gap-1 mb-1">
                  <WheatIcon className="w-3 h-3 text-amber-700" />
                  <span>Feasible Cereals ({district.feasibleCrops?.length || 0})</span>
                </div>
                <div className="text-slate-800 text-[10px] leading-tight font-medium truncate">
                  {district.feasibleCrops && district.feasibleCrops.length > 0
                    ? district.feasibleCrops.slice(0, 4).join(', ') + (district.feasibleCrops.length > 4 ? ` +${district.feasibleCrops.length - 4}` : '')
                    : 'None documented'}
                </div>
              </div>

              <div className="bg-orange-50/60 p-2 rounded-lg border border-orange-200">
                <div className="text-[10px] text-orange-900 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Cherry className="w-3 h-3 text-orange-700" />
                  <span>Feasible Fruits ({district.feasibleFruits?.length || 0})</span>
                </div>
                <div className="text-slate-800 text-[10px] leading-tight font-medium truncate">
                  {district.feasibleFruits && district.feasibleFruits.length > 0
                    ? district.feasibleFruits.slice(0, 3).join(', ') + (district.feasibleFruits.length > 3 ? ` +${district.feasibleFruits.length - 3}` : '')
                    : 'None documented'}
                </div>
              </div>

              <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-200">
                <div className="text-[10px] text-emerald-900 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Sprout className="w-3 h-3 text-emerald-700" />
                  <span>Vegetables ({district.feasibleVegetables?.length || 0})</span>
                </div>
                <div className="text-slate-800 text-[10px] leading-tight font-medium truncate">
                  {district.feasibleVegetables && district.feasibleVegetables.length > 0
                    ? district.feasibleVegetables.slice(0, 3).join(', ') + (district.feasibleVegetables.length > 3 ? ` +${district.feasibleVegetables.length - 3}` : '')
                    : 'None documented'}
                </div>
              </div>

              <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-200">
                <div className="text-[10px] text-purple-900 font-semibold uppercase flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-purple-700" />
                  <span>Spices/Cash ({district.feasibleSpicesCashCrops?.length || 0})</span>
                </div>
                <div className="text-slate-800 text-[10px] leading-tight font-medium truncate">
                  {district.feasibleSpicesCashCrops && district.feasibleSpicesCashCrops.length > 0
                    ? district.feasibleSpicesCashCrops.slice(0, 3).join(', ') + (district.feasibleSpicesCashCrops.length > 3 ? ` +${district.feasibleSpicesCashCrops.length - 3}` : '')
                    : 'None documented'}
                </div>
              </div>
            </div>

            {/* Agronomic Reasoning Snippet */}
            {district.feasibilityReasoning && (
              <div className="text-[10px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-200 italic line-clamp-2">
                "{district.feasibilityReasoning}"
              </div>
            )}
          </div>
        ) : (
          /* ─── GENERAL / OTHER PILLARS VIEW ─── */
          <>
            {/* Real MERRA-2 Time-Series Climate Row */}
            {climateData && (
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-medium shrink-0 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {climateMode === 'climatology'
                      ? `39-Yr Avg (${MONTH_NAMES[climateMonth - 1]})`
                      : climateMode === 'annual'
                        ? `${climateYear} Annual Totals`
                        : `${MONTH_NAMES[climateMonth - 1]} ${climateYear}`}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                    <strong className="text-slate-900">{climateData.prectot} mm</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                    <strong className="text-slate-900">{climateData.t2m}°C</strong>
                  </span>
                  {climateData.ws50m !== undefined && (
                    <span className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-purple-600" />
                      <strong className="text-slate-900">{climateData.ws50m} m/s</strong>
                    </span>
                  )}
                  {climateData.rh2m !== undefined && (
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                      <strong className="text-slate-900">{climateData.rh2m}%</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Real NEA Hydropower & Solar Infrastructure Row */}
            {district.hydroStationsList && district.hydroStationsList.length > 0 && (
              <div className="text-[11px] text-slate-700 flex items-center justify-between gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono">
                <span className="text-slate-800 font-semibold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-600" />
                  Hydro ({climateYear}):
                </span>
                <span className="font-bold text-slate-900">
                  {activeHydro.count} Plants ({activeHydro.capacityMW} MW)
                </span>
                <span className="text-[10px] text-slate-600 flex items-center gap-1">
                  <Sun className="w-3 h-3 text-amber-600 inline" /> Solar: <strong className="text-slate-900">{yearlySolar} kWh/m²/d</strong>
                </span>
              </div>
            )}

            {/* NARC Soil Nutrient Breakdown */}
            {hasSoilData ? (
              <div className="text-[11px] text-slate-700 flex items-center justify-between gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[10px]">
                <span className="text-slate-800 font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1 font-sans">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Soil:
                </span>
                <span>pH: <strong className="text-slate-900">{district.baseSoilPh}</strong></span>
                <span>N: <strong className="text-slate-900">{district.soilNitrogen}%</strong> <span className={`font-semibold ${nStatus.color}`}>({nStatus.label})</span></span>
                <span>P: <strong className="text-slate-900">{district.soilPhosphorus}</strong> <span className="text-slate-500">kg/ha</span></span>
                <span>K: <strong className="text-slate-900">{district.soilPotassium}</strong> <span className="text-slate-500">kg/ha</span></span>
              </div>
            ) : null}

            {/* Water Hydrology & GLOF Indicator */}
            {selectedPillar === 'water' && ((district.hydrologyStationsCount || 0) > 0 || (district.totalLakesCount || 0) > 0) && (
              <div className="bg-sky-50/90 px-3 py-1.5 rounded-lg border border-sky-200 flex items-center justify-between text-[10px] font-mono">
                <span className="text-sky-950 font-semibold flex items-center gap-1 font-sans">
                  💧 Hydrology Network:
                </span>
                <span className="text-sky-900 font-bold">
                  {district.hydrologyStationsCount || 0} DHM Gauges • {district.totalLakesCount || 0} Lakes ({district.glofRiskLevel || 'Low'} GLOF Risk)
                </span>
              </div>
            )}

            {/* Socioeconomics Dedicated Labor, Road Density & Demographics View */}
            {selectedPillar === 'socioeconomics' && (
              <div className="space-y-1.5 font-sans">
                <div className="bg-purple-50/80 p-2.5 rounded-lg border border-purple-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 font-bold shrink-0">
                      🌾
                    </div>
                    <div>
                      <div className="font-bold text-purple-950 text-[11px]">
                        Agricultural Field Labor Daily Wage
                      </div>
                      <div className="text-[10px] text-purple-800">
                        Market Range: <strong className="font-mono">NPR {district.agriLaborRateRange || '650 - 750'}/day</strong> • {district.agriLaborEcoBelt || district.ecoZone}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-100 border border-purple-300 text-purple-900 font-bold">
                      NPR {district.laborRateNprPerDay}/day
                    </span>
                    <div className="text-[9px] text-slate-500 mt-0.5">Jilla Dar: NPR {district.agriLaborRateBaselineNpr || district.laborRateNprPerDay}</div>
                  </div>
                </div>

                {district.roadDensityKmPerKm2 !== undefined && (
                  <div className="bg-purple-50/60 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center justify-between text-[10px] font-mono text-purple-950">
                    <span>🛣️ Road Density: <strong>{district.roadDensityKmPerKm2} km/km²</strong></span>
                    <span>🛒 Market Index: <strong>{district.marketAccessIndex || 60}/100</strong></span>
                    <span>🚛 Freight: <strong>NPR {district.freightLogisticsTariffNprPerTonKm || 20}/t-km</strong></span>
                  </div>
                )}
              </div>
            )}

            {/* Agro-feasibility compact footer */}
            {totalVarietiesCount > 0 && (
              <div className="text-[10px] text-slate-600 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-600" />
                  <span>Agricultural Varieties: <strong className="text-slate-800 font-mono">{totalVarietiesCount} Feasible Species</strong></span>
                </span>
                {district.elevationRange && (
                  <span className="font-mono text-slate-500">{district.elevationRange}m</span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DistrictHoverCard;
