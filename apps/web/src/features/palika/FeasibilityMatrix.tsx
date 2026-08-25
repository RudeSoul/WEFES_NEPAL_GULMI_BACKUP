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
    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/90 space-y-4 shadow-xs">
      {/* Header: Title & Overall Fit Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-100/70 text-emerald-800 border border-emerald-200/80 shadow-2xs shrink-0">
            <Layers className="w-4 h-4 text-emerald-700" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-outfit">
              FAO Land Evaluation & AHP Matrix
            </h4>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Parametric agro-ecological suitability in <strong className="text-slate-800">{district.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
          <span className="text-xs text-slate-500 font-medium font-sans">Overall Fit:</span>
          <span className={`text-base font-extrabold font-mono ${displayScore >= 75 ? 'text-emerald-700' : displayScore >= 50 ? 'text-amber-700' : 'text-rose-700'}`}>
            {displayScore}%
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getScoreBadge(displayScore).badgeClass}`}>
            {getScoreBadge(displayScore).label}
          </span>
        </div>
      </div>

      {/* Criteria Breakdown Rows */}
      <div className="space-y-3">
        {criteria.map((c) => {
          const badge = getScoreBadge(c.score);
          return (
            <div key={c.label} className="bg-white hover:bg-slate-50/70 rounded-xl p-3.5 border border-slate-200/90 transition-colors space-y-2.5 shadow-2xs">
              {/* Row 1: Criterion Label, Icon, Weight & Parameter Values */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 shadow-2xs shrink-0">
                    {c.icon}
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900 font-sans">{c.label}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      wt {c.weight}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    {c.value}
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                    (ideal: {c.ideal})
                  </span>
                </div>
              </div>

              {/* Row 2: Smooth Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${badge.barClass}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>

              {/* Row 3: Description on left, Score & Badge on right */}
              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className="text-slate-500 truncate mr-2">
                  {c.description}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`font-mono font-bold ${badge.color}`}>
                    {c.score}/100
                  </span>
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${badge.badgeClass}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAO Framework Classification & Formulation Explainer */}
      <div className="pt-2.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 text-[11px] text-slate-500 font-sans">
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
        <div className="font-mono text-slate-700 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
          AHP Base: {evalResult.ahpWeightedBase}% &rarr; Overall: {displayScore}%
        </div>
      </div>
    </div>
  );
};
