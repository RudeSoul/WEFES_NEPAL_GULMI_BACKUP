import React, { useState } from 'react';
import { District, Crop } from '@wefes/shared-types';
import { Sprout, ChevronRight, GitCompare } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { FeasibilityMatrix } from '../FeasibilityMatrix';
import { CropComparativeAnalysis } from '../CropComparativeAnalysis';

interface PalikaCropSuitabilityGridProps {
  district: District;
  displayedDistrictCrops: any[];
  verifiedDistrictCrops: any[];
  allDistrictCrops: any[];
  cropSpectrumMode: 'verified' | 'all';
  setCropSpectrumMode: (mode: 'verified' | 'all') => void;
  activeHoverCrop: Crop | null;
  setActiveHoverCrop: (crop: Crop) => void;
  activeSuitability: any;
  radarData: any[];
  onSelectCrop: (crop: Crop) => void;
}

export const PalikaCropSuitabilityGrid: React.FC<PalikaCropSuitabilityGridProps> = ({
  district,
  displayedDistrictCrops,
  verifiedDistrictCrops,
  allDistrictCrops,
  cropSpectrumMode,
  setCropSpectrumMode,
  activeHoverCrop,
  setActiveHoverCrop,
  activeSuitability,
  radarData,
  onSelectCrop,
}) => {
  const [showComparison, setShowComparison] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Left 1/3 Column: Crop Suitability Matrix */}
      <div className="lg:col-span-1 space-y-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5 font-outfit">
                <Sprout className="w-5 h-5 text-emerald-600" />
                <span>Crop Suitability Matrix</span>
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {displayedDistrictCrops.length} crops
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              {cropSpectrumMode === 'verified'
                ? `Cultivars for ${district.name} (${district.climateZone || district.ecoZone}).`
                : `All crops evaluated across ${district.name}.`}
            </p>
          </div>

          {/* View Spectrum Mode Toggle & Compare */}
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
              <button
                onClick={() => setCropSpectrumMode('verified')}
                className={`py-1.5 px-2 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  cropSpectrumMode === 'verified'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⭐ सिफारिस ({verifiedDistrictCrops.length})
              </button>
              <button
                onClick={() => setCropSpectrumMode('all')}
                className={`py-1.5 px-2 rounded-lg font-semibold text-center transition-all cursor-pointer ${
                  cropSpectrumMode === 'all'
                    ? 'bg-white text-emerald-800 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🌐 सम्पूर्ण ({allDistrictCrops.length})
              </button>
            </div>

            <button
              onClick={() => setShowComparison(!showComparison)}
              className={`w-full py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                showComparison
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-emerald-600" />
              <span>{showComparison ? 'Hide Comparison Table' : 'Compare All Crops Matrix'}</span>
            </button>
          </div>

          {/* Scrollable Single-Column Crop Cards Feed */}
          <div className="max-h-[640px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {displayedDistrictCrops.map(({ crop, suitability }: any) => {
              const isSelected = activeHoverCrop?.id === crop.id;
              const score = suitability.suitabilityScore;

              let scoreBadgeClass = 'bg-rose-50 text-rose-800 border-rose-200';
              let barClass = 'bg-rose-500';
              let faoClassBadge = 'N Not Recommended';
              if (score >= 80) {
                scoreBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                barClass = 'bg-emerald-500';
                faoClassBadge = 'S1 Optimal';
              } else if (score >= 65) {
                scoreBadgeClass = 'bg-teal-50 text-teal-800 border-teal-200';
                barClass = 'bg-teal-500';
                faoClassBadge = 'S2 Moderate';
              } else if (score >= 45) {
                scoreBadgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                barClass = 'bg-amber-500';
                faoClassBadge = 'S3 Marginal';
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
                  onMouseEnter={() => setActiveHoverCrop(crop)}
                  onClick={() => setActiveHoverCrop(crop)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 group ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 font-outfit group-hover:text-emerald-700 transition-colors truncate">
                          {crop.name}
                        </span>
                        {crop.nepaliName && (
                          <span className="text-xs text-slate-500 font-serif font-medium">({crop.nepaliName})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {seasonLabel}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {crop.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-mono font-extrabold border shadow-2xs ${scoreBadgeClass}`}>
                        {score}%
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-500">
                        {faoClassBadge}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div className={`h-full rounded-full transition-all duration-300 ${barClass}`} style={{ width: `${score}%` }} />
                    </div>
                    {score < 75 && suitability.limitingFactor && suitability.limitingFactor !== 'None' && (
                      <div className="text-[10px] text-amber-700 font-mono truncate">
                        ⚠️ {suitability.limitingFactor}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-100">
                    <span className="text-slate-600 font-medium">
                      NPR {crop.marketValuePerUnit}/{crop.baseUnitName}
                    </span>
                    <span
                      className={`text-[10px] font-bold flex items-center gap-1 ${
                        isSelected ? 'text-emerald-700 font-extrabold' : 'text-slate-400 group-hover:text-emerald-600'
                      }`}
                    >
                      <span>{isSelected ? 'Active' : 'Inspect'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showComparison && (
          <div className="lg:hidden">
            <CropComparativeAnalysis
              district={district}
              crops={displayedDistrictCrops}
              selectedCropId={activeHoverCrop?.id || displayedDistrictCrops[0]?.crop.id || 'rice'}
            />
          </div>
        )}
      </div>

      {/* Right 2/3 Column: Active Crop Telemetry & FAO Evaluation */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 shadow-sm bg-white/95 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shadow-xs">
                🌱
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-900 font-outfit">
                    {activeHoverCrop?.name}
                  </h3>
                  {activeHoverCrop?.nepaliName && (
                    <span className="text-sm text-slate-600 font-serif font-semibold">
                      ({activeHoverCrop.nepaliName})
                    </span>
                  )}
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    {activeHoverCrop?.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Market Value: <strong className="text-slate-800 font-mono">NPR {activeHoverCrop?.marketValuePerUnit}/{activeHoverCrop?.baseUnitName}</strong> • Season: <strong className="text-slate-800">{activeHoverCrop?.seasonLabelNepali || activeHoverCrop?.season}</strong>
                </p>
              </div>
            </div>

            {activeSuitability && (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Suitability Score</div>
                  <div className="text-xl font-extrabold font-mono text-emerald-700">{activeSuitability.suitabilityScore}/100</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 space-y-4">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-outfit flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>WEFES 5-Pillars Radar</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">0–100 Scale</span>
                </div>

                <div className="min-h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="pillar" stroke="#475569" tick={{ fill: '#334155', fontSize: 10, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                      <Radar name="Pillar Score" dataKey="score" stroke="#0284c7" fill="#0284c7" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '0.5rem', color: '#0f172a', fontSize: 11, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {activeSuitability && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider font-outfit">
                        Pillar Telemetry
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">5 Domains</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center font-mono">
                      <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-sky-200/90 shadow-2xs flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-sky-700 leading-tight">💧 Water</span>
                        <span className="text-xs sm:text-sm font-extrabold text-sky-950 mt-0.5">{activeSuitability.pillarScores.water}</span>
                      </div>
                      <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-amber-200/90 shadow-2xs flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-700 leading-tight">⚡ Energy</span>
                        <span className="text-xs sm:text-sm font-extrabold text-amber-950 mt-0.5">{activeSuitability.pillarScores.energy}</span>
                      </div>
                      <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-emerald-200/90 shadow-2xs flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-emerald-700 leading-tight">🌾 Food</span>
                        <span className="text-xs sm:text-sm font-extrabold text-emerald-950 mt-0.5">{activeSuitability.pillarScores.food}</span>
                      </div>
                      <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-teal-200/90 shadow-2xs flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-teal-700 leading-tight">🌲 Eco</span>
                        <span className="text-xs sm:text-sm font-extrabold text-teal-950 mt-0.5">{activeSuitability.pillarScores.ecosystem}</span>
                      </div>
                      <div className="bg-white p-1.5 sm:p-2 rounded-xl border border-purple-200/90 shadow-2xs flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-purple-700 leading-tight">🏛️ Socio</span>
                        <span className="text-xs sm:text-sm font-extrabold text-purple-950 mt-0.5">{activeSuitability.pillarScores.socioeconomics}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => activeHoverCrop && onSelectCrop(activeHoverCrop)}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simulate WEFES Nexus for {activeHoverCrop?.name}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="md:col-span-7">
              {activeHoverCrop && activeSuitability && (
                <FeasibilityMatrix
                  district={district}
                  crop={activeHoverCrop}
                  suitabilityScore={activeSuitability.suitabilityScore}
                />
              )}
            </div>
          </div>
        </div>

        {showComparison && (
          <div className="hidden lg:block">
            <CropComparativeAnalysis
              district={district}
              crops={displayedDistrictCrops}
              selectedCropId={activeHoverCrop?.id || displayedDistrictCrops[0]?.crop.id || 'rice'}
            />
          </div>
        )}
      </div>
    </div>
  );
};
