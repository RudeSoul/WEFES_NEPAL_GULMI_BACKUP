import React from 'react';
import { SubFilterLegendConfig } from '@wefes/shared-types';
import { Info, ShieldCheck, Cpu, AlertTriangle } from 'lucide-react';

interface DynamicLegendProps {
  config: SubFilterLegendConfig;
  className?: string;
}

export const DynamicLegend: React.FC<DynamicLegendProps> = ({ config, className = '' }) => {
  const renderConfidenceBadge = () => {
    switch (config.confidence) {
      case 'REAL':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            OBSERVED REAL
          </span>
        );
      case 'CALCULATED':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Cpu className="w-3 h-3 text-sky-600" />
            CALCULATED
          </span>
        );
      case 'PROXY':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            PROXY ESTIMATE
          </span>
        );
    }
  };

  return (
    <div className={`flex flex-col glass-panel px-4 py-3 rounded-xl text-xs border border-slate-200 shadow-sm bg-white/95 backdrop-blur-md gap-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
        <div className="flex flex-col">
          <span className="text-slate-800 font-bold uppercase tracking-wider text-xs">
            {config.title}
          </span>
          {config.subtitle && (
            <span className="text-slate-500 text-[10px] font-medium">
              {config.subtitle}
            </span>
          )}
        </div>
        {renderConfidenceBadge()}
      </div>

      {/* Body: Continuous Gradient */}
      {config.legendType === 'continuous_gradient' && config.gradient && (
        <div className="flex flex-col gap-1.5 py-1">
          <div
            className="h-3 rounded-md w-full border border-slate-200 shadow-inner"
            style={{
              background: `linear-gradient(to right, ${config.gradient.minColor}, ${config.gradient.midColor || '#38bdf8'}, ${config.gradient.maxColor})`
            }}
          />
          <div className="flex justify-between text-[11px] text-slate-600 font-medium px-0.5">
            <span>{config.gradient.minLabel}</span>
            <span>{config.gradient.maxLabel}</span>
          </div>
        </div>
      )}

      {/* Body: Domain Thresholds */}
      {config.legendType === 'domain_thresholds' && config.thresholds && (
        <div className="flex flex-wrap items-center gap-2.5 py-0.5">
          {config.thresholds.map((t, idx) => (
            <div key={idx} className="flex items-center gap-1.5 group relative">
              <span
                className="w-3.5 h-3.5 rounded-sm inline-block border border-slate-300 shadow-xs shrink-0"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-slate-700 font-medium text-xs">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Body: Categorical */}
      {config.legendType === 'categorical' && config.categories && (
        <div className="flex flex-wrap items-center gap-2.5 py-0.5">
          {config.categories.map((c) => (
            <div key={c.key} className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-3.5 rounded-sm inline-block border border-slate-300 shadow-xs shrink-0"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-slate-700 font-medium text-xs">
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Footer: Data Lineage Provenance Citation */}
      <div className="flex items-center gap-1 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
        <Info className="w-3 h-3 shrink-0 text-slate-400" />
        <span className="truncate" title={config.dataSourceCitation}>
          Source: {config.dataSourceCitation}
        </span>
      </div>
    </div>
  );
};
