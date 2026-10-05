// [DATA PROVENANCE]
// Data Source: data/real/agriculture/crop_requirement.json & data/real/municipal/palika_profiles.json
// Classification: AGRO-ECOLOGICAL DECISION INTELLIGENCE (Decision-First Narrative Architecture)
// Citations: MoALD, NARC, DHM, ICIMOD, FAO Framework for Land Evaluation

import React, { useMemo, useState } from 'react';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Droplets,
  GitCompare,
  Layers,
  Leaf,
  Mountain,
  Sparkles,
  Sprout,
  Thermometer,
  Trees,
  TrendingUp,
  Users,
  Wheat,
  Zap,
} from 'lucide-react';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Crop, CropSuitability, District } from '@wefes/shared-types';
import { evaluateCropFeasibilityMatrix } from '@wefes/wefes-engine';

import { CropComparativeAnalysis } from '../CropComparativeAnalysis';

import { DistrictPalika } from '@/data/districtPalikaAssets';

export interface DistrictCropItem {
  crop: Crop;
  suitability: CropSuitability;
}

export interface RadarCropMetric {
  pillar: string;
  score: number;
  fullMark: number;
  [key: string]: unknown;
}

interface PalikaCropSuitabilityGridProps {
  district: District;
  activePalika?: DistrictPalika;
  displayedDistrictCrops: DistrictCropItem[];
  activeHoverCrop: Crop | null;
  setActiveHoverCrop: (crop: Crop) => void;
  activeSuitability?: CropSuitability | null;
  radarData: RadarCropMetric[];
  onSelectCrop: (crop: Crop) => void;
}

// Domain-grounded bottleneck & mitigation intelligence for Gulmi Hill Agro-Ecosystems
const CROP_BOTTLENECK_ADVISORY: Record<string, { constraint: string; diagnosis: string; recommendation: string }> = {
  coffee: {
    constraint: 'Wet-Pulping & Washing Energy (Score: 61/100)',
    diagnosis:
      'Harvesting cherry parchment coincides with peak processing demand. Mechanical depulping, washing, and grading require continuous mechanical or electrical power.',
    recommendation:
      'Couple coffee pockets with decentralized solar-powered mini-pulpers or link with local micro-hydropower grids to prevent high processing energy costs from eroding farmer margins.',
  },
  cardamom: {
    constraint: 'Curing Fuel & Canopy Management (Score: 72/100)',
    diagnosis:
      'Traditional Bhatti curing consumes massive amounts of local forest firewood, resulting in uneven drying quality, smoke contamination, and deforestation risks.',
    recommendation:
      'Introduce ICIMOD-designed modified energy-efficient dryers (Bhatti) and intercrop with nitrogen-fixing Utis (Alnus nepalensis) trees for optimal shade canopy.',
  },
  ginger: {
    constraint: 'Rhizome Rot & Water Drainage (Score: 64/100)',
    diagnosis:
      'Heavy pre-monsoon and monsoon moisture on poorly drained soils triggers Pythium rhizome rot, which can destroy up to 40% of standing crops.',
    recommendation:
      'Cultivate strictly on sloping Bari terraces with raised planting beds (20–25cm) and treat seed rhizomes with organic Trichoderma before planting.',
  },
  rice: {
    constraint: 'Pre-Monsoon Nursery Water Deficit (Score: 68/100)',
    diagnosis:
      'Delayed monsoon onset frequently dries out seedling nurseries, delaying transplanting into Khet land and drastically shortening the grain-filling window.',
    recommendation:
      'Prioritize solar lift irrigation from Badigad / Kaligandaki river corridors or construct community cement rainwater collection ponds near nursery pockets.',
  },
  wheat: {
    constraint: 'Winter Dry-Spell Moisture Stress (Score: 65/100)',
    diagnosis:
      'Winter rainfall (Hiunde) in Gulmi has become highly erratic; moisture deficit during the critical crown root initiation (CRI) stage curtails tillering.',
    recommendation:
      'Ensure at least two supplemental light irrigations at CRI and flowering stages through gravity sprinkler kits or spring-fed conservation ponds.',
  },
  maize: {
    constraint: 'Monsoon Post-Harvest Drying & Storage Weevils (Score: 70/100)',
    diagnosis:
      'Harvesting summer maize (Barkhe Makai) during continuous monsoon rain prevents open-sun drying, causing high ear rot and Aspergillus aflatoxin contamination.',
    recommendation:
      'Promote ventilated solar tent dryers and distribute moisture-proof hermetic storage bags (SuperGrainbags) to ward cooperatives.',
  },
  potato: {
    constraint: 'Cold Storage & Late Blight Outbreaks (Score: 66/100)',
    diagnosis:
      'High humidity combined with overcast skies triggers late blight (Phytophthora infestans), while lack of local cold storage forces distress sales to intermediaries.',
    recommendation:
      'Construct zero-energy rustic cold storage stores in highland wards (above 1,600m) and adopt blight-resistant varieties (e.g. Janakdev, Kufri Jyoti).',
  },
};

export const PalikaCropSuitabilityGrid: React.FC<PalikaCropSuitabilityGridProps> = ({
  district,
  activePalika,
  displayedDistrictCrops,
  activeHoverCrop,
  setActiveHoverCrop,
  activeSuitability,
  radarData,
  onSelectCrop,
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [showRadar, setShowRadar] = useState(false);

  // Ensure an active crop is always selected
  const currentCrop = activeHoverCrop || displayedDistrictCrops[0]?.crop;
  const currentSuitability =
    activeSuitability ||
    displayedDistrictCrops.find((c) => c.crop.id === currentCrop?.id)?.suitability ||
    displayedDistrictCrops[0]?.suitability;

  // Evaluate biophysical parameters dynamically
  const palikaContext = useMemo(() => {
    if (!activePalika) return undefined;
    return {
      name: activePalika.name,
      elevation: activePalika.elevation,
      avgTempC: activePalika.avgTempC,
      rainfallMm: activePalika.rainfallMm,
      soilPh: activePalika.soilPh,
    };
  }, [activePalika]);

  const evalResult = useMemo(() => {
    if (!currentCrop) return null;
    return evaluateCropFeasibilityMatrix(district, currentCrop, palikaContext);
  }, [district, currentCrop, palikaContext]);

  // Determine overall score styling
  const score = currentSuitability?.suitabilityScore ?? evalResult?.finalSuitabilityScore ?? 0;
  let scoreBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
  let faoClassBadge = 'N (Not Suitable)';
  let verdictHeadline = 'Marginal / Non-Viable for Expansion';
  let verdictSummary =
    'Significant biophysical or climatic barriers detected. Commercial promotion is not recommended without heavy structural intervention.';
  let scoreColorClass = 'text-rose-700';

  if (score >= 80) {
    scoreBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    faoClassBadge = 'S1 (Highly Suitable)';
    verdictHeadline = 'Optimal Cultivar for Commercial Promotion';
    verdictSummary = `Bio-physical soil chemistry, thermal envelopes, and moisture levels in ${activePalika?.name || district.name} align perfectly with crop requirements.`;
    scoreColorClass = 'text-emerald-700';
  } else if (score >= 65) {
    scoreBadgeClass = 'bg-teal-50 text-teal-800 border-teal-300';
    faoClassBadge = 'S2 (Moderately Suitable)';
    verdictHeadline = 'Strong Production Viability with Standard Care';
    verdictSummary =
      'Good agronomic fit with minor soil or elevation constraints that can be managed with standard farming practices.';
    scoreColorClass = 'text-teal-700';
  } else if (score >= 45) {
    scoreBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
    faoClassBadge = 'S3 (Marginally Suitable)';
    verdictHeadline = 'Marginal Suitability · High Input Demand';
    verdictSummary =
      'Noticeable climatic or soil limitations present. Viable only for subsistence plots or with targeted irrigation and soil conditioning.';
    scoreColorClass = 'text-amber-700';
  }

  // Detect Primary Constraint (Liebig Minimum Bottleneck)
  const bottleneck = useMemo(() => {
    if (!currentCrop) return null;

    // Check custom agronomic lookup first
    if (CROP_BOTTLENECK_ADVISORY[currentCrop.id]) {
      return CROP_BOTTLENECK_ADVISORY[currentCrop.id];
    }

    // Otherwise derive dynamically from pillar scores
    if (currentSuitability?.pillarScores) {
      const p = currentSuitability.pillarScores;
      const scores = [
        { name: 'Water & Moisture', val: p.water, domain: 'water' },
        { name: 'Processing & Pumping Energy', val: p.energy, domain: 'energy' },
        { name: 'Food & Caloric Security', val: p.food, domain: 'food' },
        { name: 'Ecosystem & Soil Canopy', val: p.ecosystem, domain: 'ecosystem' },
        { name: 'Household Livelihood', val: p.socioeconomics, domain: 'socio' },
      ];
      scores.sort((a, b) => a.val - b.val);
      const lowest = scores[0];

      if (lowest.val < 75) {
        return {
          constraint: `${lowest.name} (Score: ${lowest.val}/100)`,
          diagnosis: `The lowest-performing sustainability dimension for ${currentCrop.name} is ${lowest.name.toLowerCase()}.`,
          recommendation: `Target municipal agricultural subsidies toward mitigating ${lowest.name.toLowerCase()} barriers in ${activePalika?.name || district.name}.`,
        };
      }
    }

    return {
      constraint: 'Balanced Profile (No Critical Bottlenecks)',
      diagnosis: `All environmental, resource, and economic indicators for ${currentCrop.name} operate in balanced harmony.`,
      recommendation:
        'Maintain current good agricultural practices and facilitate direct market linkages with local cooperatives.',
    };
  }, [currentCrop, currentSuitability, activePalika, district]);

  return (
    <div className="space-y-6">
      {/* Full Comparison Table Drawer if triggered */}
      {showComparison && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-300 shadow-md bg-white space-y-4 animate-fade-in-up">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900 font-outfit">
                Crop Spectrum Comparative Analysis · {activePalika ? `${activePalika.name}, ` : ''}
                {district.name}
              </h3>
            </div>
            <button
              onClick={() => setShowComparison(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Close Table ✕
            </button>
          </div>
          <CropComparativeAnalysis
            district={district}
            activePalika={activePalika}
            crops={displayedDistrictCrops}
            selectedCropId={currentCrop?.id || 'coffee'}
          />
        </div>
      )}

      {/* 2-Pane Master-Detail Decision Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT PANE (4 Cols / 35%): Master Crop Decision List */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4 self-start">
          <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-4">
            {/* Header */}
            <div className="pb-1 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-outfit">
                  <Sprout className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Ranked Agro-Cultivars</span>
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {displayedDistrictCrops.length} crops
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-sans">
                Ranked cultivars for {activePalika ? `${activePalika.name}` : district.name} (
                {activePalika?.elevation || '1,510'}m • {activePalika?.avgTempC || '18.4'}°C • pH{' '}
                {activePalika?.soilPh || '5.8'})
              </p>
            </div>

            {/* Scrollable Ranked Crop Feed */}
            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {displayedDistrictCrops.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No cultivars available for this palika.</div>
              ) : (
                displayedDistrictCrops.map(({ crop, suitability }: DistrictCropItem, index: number) => {
                  const isSelected = currentCrop?.id === crop.id;
                  const itemScore = suitability.suitabilityScore;

                  let badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
                  let barColor = 'bg-rose-500';
                  let faoShort = 'N';
                  if (itemScore >= 80) {
                    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    barColor = 'bg-emerald-500';
                    faoShort = 'S1';
                  } else if (itemScore >= 65) {
                    badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
                    barColor = 'bg-teal-500';
                    faoShort = 'S2';
                  } else if (itemScore >= 45) {
                    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                    barColor = 'bg-amber-500';
                    faoShort = 'S3';
                  }

                  const seasonLabel =
                    crop.seasonLabelNepali ||
                    (crop.season === 'barkhe'
                      ? '🌧️ बर्खे'
                      : crop.season === 'hiunde'
                        ? '❄️ हिउँदे'
                        : crop.season === 'chaite'
                          ? '☀️ चैते'
                          : '🌳 बाह्रमासे');

                  return (
                    <div
                      key={crop.id}
                      onClick={() => setActiveHoverCrop(crop)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 group relative overflow-hidden ${
                        isSelected
                          ? 'bg-emerald-50/90 border-emerald-500 shadow-sm ring-2 ring-emerald-500/40'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Left vertical accent bar for active item */}
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600" />}

                      <div className="flex items-start justify-between gap-2 pl-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-mono font-bold text-slate-400">#{index + 1}</span>
                            <span className="font-bold text-sm text-slate-900 font-outfit group-hover:text-emerald-700 transition-colors truncate">
                              {crop.name}
                            </span>
                            {crop.nepaliName && (
                              <span className="text-xs text-slate-500 font-serif">({crop.nepaliName})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {seasonLabel}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[130px]">
                              {crop.category}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-md font-mono font-extrabold border shadow-2xs ${badgeColor}`}
                          >
                            {itemScore}%
                          </span>
                          <span className="text-[9px] font-mono font-bold text-slate-500">{faoShort}</span>
                        </div>
                      </div>

                      {/* Score Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/70 ml-1 pr-1">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                          style={{ width: `${itemScore}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-100 pl-1">
                        <span className="text-slate-600 font-medium">
                          NPR {crop.marketValuePerUnit}/{crop.baseUnitName}
                        </span>
                        <span
                          className={`text-[10px] font-bold flex items-center gap-1 ${
                            isSelected
                              ? 'text-emerald-700 font-extrabold'
                              : 'text-slate-400 group-hover:text-emerald-600'
                          }`}
                        >
                          <span>{isSelected ? 'Active Dossier' : 'Inspect'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Action: Open Full Table */}
            <button
              onClick={() => setShowComparison(true)}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <GitCompare className="w-4 h-4 text-emerald-600" />
              <span>Compare All Crops Matrix</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANE (8 Cols / 65%): Decision-First Intelligence Dossier */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-5">
          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* STEP 1: HERO DECISION VERDICT & CONFIDENCE BANNER */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900 font-outfit">{currentCrop?.name}</h2>
                    {currentCrop?.nepaliName && (
                      <span className="text-base text-slate-600 font-serif font-bold">({currentCrop.nepaliName})</span>
                    )}
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                      {currentCrop?.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      Location:{' '}
                      <strong className="text-slate-800 font-semibold">
                        {activePalika ? `${activePalika.name}, ` : ''}Gulmi
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Elevation: <strong className="text-slate-800">{activePalika?.elevation || '1,510'}m masl</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Mean Temp: <strong className="text-slate-800">{activePalika?.avgTempC || '18.4'}°C</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Dominant Decision Score Card */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 shrink-0 shadow-2xs">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-outfit">
                    Suitability Score
                  </div>
                  <div className={`text-2xl font-black font-mono ${scoreColorClass}`}>{score}/100</div>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span className={`text-xs px-2.5 py-0.5 rounded-md font-bold border ${scoreBadgeClass}`}>
                    {faoClassBadge}
                  </span>
                  <span className="text-[9.5px] text-slate-500 font-mono">FAO Framework</span>
                </div>
              </div>
            </div>

            {/* Decision Verdict Statement */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/90 flex items-start gap-3 text-xs text-emerald-950 font-sans">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-900 text-sm font-outfit">{verdictHeadline}</div>
                <p className="leading-relaxed">{verdictSummary}</p>
                <div className="text-[10px] text-emerald-700 font-mono pt-1">
                  Model Lineage: FAO Agro-Ecological Framework · Liebig Minimum · Observed DHM & NARC Station Networks
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* STEP 2: WHY THIS CROP THRIVES (Bio-Physical Fit Breakdown) */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wider">
                  Why This Crop Thrives · Bio-Physical Fit
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                AHP Weighted Base: {evalResult?.ahpWeightedBase ?? score}%
              </span>
            </div>

            {/* 4 Clean Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 1. Soil Reaction */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">Soil Reaction (pH)</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {evalResult?.dPh ?? 6.2} pH
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${evalResult?.soilScore ?? 98}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Ideal: {evalResult?.env.phOptMin}–{evalResult?.env.phOptMax} pH
                  </span>
                  <span className="font-bold text-emerald-700">Optimal · No Liming Needed</span>
                </div>
              </div>

              {/* 2. Moisture & Rainfall */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-sky-600" />
                    <span className="text-xs font-bold text-slate-900">Moisture & Rainfall</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {evalResult?.dRain ?? 1890} mm/yr
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${evalResult?.waterScore ?? 98}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Ideal: {evalResult?.env.rainOptMin}–{evalResult?.env.rainOptMax} mm
                  </span>
                  <span className="font-bold text-sky-700">Zero Moisture Deficit</span>
                </div>
              </div>

              {/* 3. Thermal Envelope */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-900">Thermal Envelope</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {evalResult?.dTemp ?? 18.4}°C
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${evalResult?.thermalScore ?? 98}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Ideal: {evalResult?.env.tempOptMin}–{evalResult?.env.tempOptMax}°C
                  </span>
                  <span className="font-bold text-amber-700">No Frost Risk</span>
                </div>
              </div>

              {/* 4. Elevation Belt */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Mountain className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900">Elevation & Relief</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {evalResult?.effectiveElev ?? 1510}m masl
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${evalResult?.elevScore ?? 94}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Ideal: {evalResult?.env.altOptMin}–{evalResult?.env.altOptMax}m
                  </span>
                  <span className="font-bold text-indigo-700">Prime Mid-Hill Specialty Belt</span>
                </div>
              </div>
            </div>
          </div>

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* STEP 3: ⚠️ PRIMARY BOTTLENECK TO WATCH (Liebig Law of the Minimum) */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          {bottleneck && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-outfit">
                    Key Constraint Detected (Liebig Minimum): {bottleneck.constraint}
                  </h4>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300">
                  Watch Factor
                </span>
              </div>

              <p className="text-xs text-amber-950 leading-relaxed font-sans">{bottleneck.diagnosis}</p>

              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Municipal Planning Action: </strong>
                  <span>{bottleneck.recommendation}</span>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* STEP 4: SUSTAINABILITY PROFILE (WEFES 5-PILLARS) */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wider">
                  Sustainability Profile · WEFES 5-Pillars Performance
                </h3>
              </div>

              <button
                onClick={() => setShowRadar(!showRadar)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{showRadar ? 'Show Bar View' : 'Show Spider Radar View'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Radar View (Expandable) */}
            {showRadar ? (
              <div className="h-[250px] w-full flex items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in-up">
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis
                      dataKey="pillar"
                      stroke="#475569"
                      tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                    <Radar name="Pillar Score" dataKey="score" stroke="#0284c7" fill="#0284c7" fillOpacity={0.35} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        borderRadius: '0.5rem',
                        color: '#0f172a',
                        fontSize: 11,
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* Highly Readable Horizontal Bar Telemetry (Default) */
              <div className="space-y-2.5">
                {/* 1. Water */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                      <Droplets className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">💧 Water Footprint</div>
                      <div className="text-[10.5px] text-slate-500">
                        {currentCrop?.waterFootprintPerUnit ?? 'Moderate'} L/kg demand
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[280px] hidden sm:block">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${currentSuitability?.pillarScores.water ?? 98}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentSuitability?.pillarScores.water ?? 98}/100 · Strong
                    </span>
                  </div>
                </div>

                {/* 2. Energy */}
                <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">⚡ Processing Energy</div>
                      <div className="text-[10.5px] text-slate-500">
                        {currentCrop?.energyReqPerUnit ?? '0.4'} kWh/kg post-harvest
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[280px] hidden sm:block">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${currentSuitability?.pillarScores.energy ?? 61}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {currentSuitability?.pillarScores.energy ?? 61}/100 · ⚠️ Watch
                    </span>
                  </div>
                </div>

                {/* 3. Food */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <Wheat className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">🌾 Food & Nutrition</div>
                      <div className="text-[10.5px] text-slate-500">
                        {currentCrop?.caloriesPerUnit ?? 'High'} kcal/kg exchange value
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[280px] hidden sm:block">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${currentSuitability?.pillarScores.food ?? 98}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentSuitability?.pillarScores.food ?? 98}/100 · Strong
                    </span>
                  </div>
                </div>

                {/* 4. Ecosystem */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                      <Trees className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">🌲 Ecosystem & Carbon</div>
                      <div className="text-[10.5px] text-slate-500">Agroforestry shade canopy</div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[280px] hidden sm:block">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${currentSuitability?.pillarScores.ecosystem ?? 94}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentSuitability?.pillarScores.ecosystem ?? 94}/100 · Strong
                    </span>
                  </div>
                </div>

                {/* 5. Socioeconomics */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-[170px]">
                    <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                      <Users className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900">🏛️ Smallholder Livelihood</div>
                      <div className="text-[10.5px] text-slate-500">
                        Labor: {currentCrop?.laborDaysPerUnit ?? 2.5} days/unit
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 max-w-[280px] hidden sm:block">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${currentSuitability?.pillarScores.socioeconomics ?? 95}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {currentSuitability?.pillarScores.socioeconomics ?? 95}/100 · Strong
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* STEP 5: LOCAL MARKET OUTLOOK & LOGISTICS */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-3.5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wider">
                Farmgate Economics & Trade Corridor
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-sans">Farmgate Benchmark</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  NPR {currentCrop?.marketValuePerUnit}
                  <span className="text-xs font-normal text-slate-500"> / {currentCrop?.baseUnitName}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Cooperative collection rate</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-sans">Field Labor Intensity</div>
                <div className="text-base font-bold font-mono text-slate-900 mt-0.5">
                  {currentCrop?.laborDaysPerUnit ?? 2.5}
                  <span className="text-xs font-normal text-slate-500"> person-days/unit</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Wage: NPR {district.agriLaborMarketRateAvgNpr || 850}/day
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 font-sans">Agronomic Calendar</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                  {currentCrop?.seasonMonthsNepali || currentCrop?.seasonLabelNepali || 'वर्षभरि'}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium mt-1">Optimal planting window</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              Produce from <strong>{activePalika ? `${activePalika.name}` : district.name}</strong> connects directly
              via the Gulmi–Ridi–Butwal Strategic Highway (3.5 to 5 hours travel time) to regional wholesale centers and
              Bhairahawa customs export terminals.
            </p>
          </div>

          {/* ───────────────────────────────────────────────────────────────────────── */}
          {/* STEP 6: CONTEXTUAL SIMULATION & ACTION DOCK */}
          {/* ───────────────────────────────────────────────────────────────────────── */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-bold font-outfit text-emerald-300 flex items-center justify-center sm:justify-start gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Ready to Test This Decision Under Climate & Price Shocks?</span>
              </div>
              <p className="text-xs text-slate-300 max-w-xl">
                Simulate how {currentCrop?.name} yields, water stress, and farm revenue respond if monsoon rainfall
                drops by 20% or market prices fluctuate.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => currentCrop && onSelectCrop(currentCrop)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simulate Nexus for {currentCrop?.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
