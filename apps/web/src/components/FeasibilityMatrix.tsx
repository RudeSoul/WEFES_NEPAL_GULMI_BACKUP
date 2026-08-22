import React, { useMemo } from 'react';
import { District, Crop } from '@wefes/shared-types';
import { evaluateCropFeasibilityMatrix } from '@wefes/wefes-engine';
import { Layers, Sparkles, Droplets, Thermometer, Mountain, DollarSign, Award, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface FeasibilityMatrixProps {
  district: District;
  crop: Crop;
  suitabilityScore?: number;
}

interface CriterionScore {
  label: string;
  icon: React.ReactNode;
  weight: string;
  score: number;
  description: string;
  unit: string;
  value: string;
  ideal: string;
}

function getScoreBadge(score: number): { label: string; color: string; badgeClass: string; barClass: string } {
  if (score >= 75) {
    return {
      label: 'Optimal',
      color: 'text-emerald-700',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      barClass: 'bg-emerald-500'
    };
  }
  if (score >= 50) {
    return {
      label: 'Suitable',
      color: 'text-amber-700',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      barClass: 'bg-amber-500'
    };
  }
  return {
    label: 'Marginal',
    color: 'text-rose-700',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    barClass: 'bg-rose-500'
  };
}

export const FeasibilityMatrix: React.FC<FeasibilityMatrixProps> = ({ district, crop, suitabilityScore }) => {
  // Direct evaluation via FAO Land Evaluation & AHP Framework
  const evalResult = useMemo(() => {
    return evaluateCropFeasibilityMatrix(district, crop);
  }, [district, crop]);

  const displayScore = suitabilityScore ?? evalResult.finalSuitabilityScore;

  const criteria = useMemo<CriterionScore[]>(() => {
    return [
      {
        label: 'Soil Reaction (pH)',
        icon: <Sparkles className="w-3.5 h-3.5 text-emerald-600" />,
        weight: '20%',
        score: evalResult.soilScore,
        description: 'Optimal nutrient uptake and rhizosphere acidity',
        unit: 'pH',
        value: `${evalResult.dPh} pH`,
        ideal: `${evalResult.env.phOptMin}–${evalResult.env.phOptMax} pH`
      },
      {
        label: 'Thermal Envelope',
        icon: <Thermometer className="w-3.5 h-3.5 text-amber-600" />,
        weight: '25%',
        score: evalResult.thermalScore,
        description: 'Growing degree-days and temperature suitability',
        unit: '°C',
        value: `${evalResult.dTemp}°C`,
        ideal: `${evalResult.env.tempOptMin}–${evalResult.env.tempOptMax}°C`
      },
      {
        label: 'Moisture & Rainfall',
        icon: <Droplets className="w-3.5 h-3.5 text-sky-600" />,
        weight: '25%',
        score: evalResult.waterScore,
        description: 'Annual precipitation versus crop water footprint',
        unit: 'mm',
        value: `${evalResult.dRain} mm/yr`,
        ideal: `${evalResult.env.rainOptMin}–${evalResult.env.rainOptMax} mm`
      },
      {
        label: 'Elevation & Relief',
        icon: <Mountain className="w-3.5 h-3.5 text-indigo-600" />,
        weight: '15%',
        score: evalResult.elevScore,
        description: 'Altitude belt overlap across district territory',
        unit: 'm',
        value: `${evalResult.dMinElev}–${evalResult.dMaxElev}m`,
        ideal: `${evalResult.env.altOptMin}–${evalResult.env.altOptMax}m`
      },
      {
        label: 'Labor & Farmgate Margin',
        icon: <DollarSign className="w-3.5 h-3.5 text-purple-600" />,
        weight: '15%',
        score: evalResult.laborScore,
        description: 'Daily field wage versus harvest market value',
        unit: '',
        value: `NPR ${evalResult.dLabor}/d`,
        ideal: `High Margin (NPR ${crop.marketValuePerUnit}/${crop.baseUnitName})`
      }
    ];
  }, [evalResult, crop]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200 bg-white/95 space-y-4 shadow-sm animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 font-outfit">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>FAO Land Evaluation & AHP Matrix</span>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-sans font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {crop.name}
            </span>
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Parametric agro-ecological suitability in <strong className="text-slate-800">{district.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-600 font-medium font-sans">Overall Fit:</span>
          <span className={`text-lg font-extrabold font-mono ${displayScore >= 75 ? 'text-emerald-700' : displayScore >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
            {displayScore}%
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getScoreBadge(displayScore).badgeClass}`}>
            {getScoreBadge(displayScore).label}
          </span>
        </div>
      </div>

      {/* Criteria Breakdown Rows */}
      <div className="space-y-2.5">
        {criteria.map((c) => {
          const badge = getScoreBadge(c.score);
          return (
            <div key={c.label} className="bg-slate-50/70 hover:bg-slate-50 rounded-xl p-3 border border-slate-200/80 transition-colors space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0">
                    {c.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 font-sans">{c.label}</span>
                      <span className="text-[10px] font-mono font-bold bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded">
                        wt {c.weight}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 hidden sm:inline">
                      {c.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-600 font-mono font-medium hidden md:inline">
                    {c.value} <span className="text-slate-400 font-sans">({c.ideal})</span>
                  </span>
                  <span className={`text-xs font-bold font-mono ${badge.color}`}>
                    {c.score}/100
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${badge.barClass}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* FAO Framework Classification & Formulation Explainer */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-slate-500 font-sans">
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            <strong>FAO Class:</strong> <span className="text-slate-800 font-semibold">{evalResult.faoClass}</span>
            {evalResult.limitingModifier < 1.0 && (
              <span className="ml-1 text-amber-700 font-medium">
                (Liebig limiting modifier: &times;{evalResult.limitingModifier})
              </span>
            )}
          </span>
        </div>
        <div className="font-mono text-slate-700 font-bold">
          AHP Weighted Base = {evalResult.ahpWeightedBase}% &rarr; Overall = {displayScore}%
        </div>
      </div>
    </div>
  );
};
