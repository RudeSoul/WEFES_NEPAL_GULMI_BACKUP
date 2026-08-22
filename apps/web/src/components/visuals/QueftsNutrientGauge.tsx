import React, { useState } from 'react';

interface QueftsNutrientGaugeProps {
  districtName: string;
  cropName: string;
  nitrogenKgPerHa: number;
  phosphorusKgPerHa: number;
  potassiumKgPerHa: number;
  zincKgPerHa: number;
  boraxKgPerHa: number;
  ureaBags: number;
  dapBags: number;
  mopBags: number;
}

export const QueftsNutrientGauge: React.FC<QueftsNutrientGaugeProps> = ({
  districtName,
  cropName,
  nitrogenKgPerHa,
  phosphorusKgPerHa,
  potassiumKgPerHa,
  zincKgPerHa,
  boraxKgPerHa,
  ureaBags,
  dapBags,
  mopBags,
}) => {
  const [selectedNutrient, setSelectedNutrient] = useState<string>('nitrogen');

  const nutrients = [
    { id: 'nitrogen', name: 'Nitrogen (N)', req: nitrogenKgPerHa, supply: Math.round(nitrogenKgPerHa * 0.38), bags: `${ureaBags} Bags Urea`, color: '#10b981', desc: 'Promotes vegetative canopy growth, chlorophyll density, and protein synthesis.' },
    { id: 'phosphorus', name: 'Phosphorus (P₂O₅)', req: phosphorusKgPerHa, supply: Math.round(phosphorusKgPerHa * 0.42), bags: `${dapBags} Bags DAP`, color: '#0ea5e9', desc: 'Stimulates root elongation, early tillering, and reproductive panicle formation.' },
    { id: 'potassium', name: 'Potassium (K₂O)', req: potassiumKgPerHa, supply: Math.round(potassiumKgPerHa * 0.45), bags: `${mopBags} Bags MOP`, color: '#8b5cf6', desc: 'Regulates stomatal conductance, lodging resistance, and grain starch filling.' },
    { id: 'zinc', name: 'Zinc (ZnSO₄)', req: zincKgPerHa, supply: Math.round(zincKgPerHa * 0.30), bags: `${zincKgPerHa} kg ZnSO₄`, color: '#f59e0b', desc: 'Essential micronutrient enzyme cofactor; prevents Khaira disease and chlorosis.' },
    { id: 'boron', name: 'Borax (B)', req: boraxKgPerHa, supply: Math.round(boraxKgPerHa * 0.25), bags: `${boraxKgPerHa} kg Borax`, color: '#06b6d4', desc: 'Critical for pollen viability, spikelet fertility, and flower fertilization.' },
  ];

  const maxVal = Math.max(...nutrients.map(n => n.req), 150);
  const activeN = nutrients.find(n => n.id === selectedNutrient) || nutrients[0];

  return (
    <div className="p-5 sm:p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              QUEFTS Site-Specific Soil Nutrient Diagnostic Meter
            </span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
              NARC-NSSRC 2022 Soil Matrix · {districtName}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans">
            Click any macro or micronutrient to inspect soil indigenous supply vs target uptake and fertilizer dosing.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800">
            🧪 Soil pH: 6.2 · Sandy Loam
          </span>
        </div>
      </div>

      {/* Comparative Horizontal Nutrient Bars */}
      <div className="space-y-3 pt-1">
        {nutrients.map((n) => {
          const isSelected = selectedNutrient === n.id;
          const reqWidth = (n.req / maxVal) * 100;
          const supplyWidth = (n.supply / maxVal) * 100;

          return (
            <div
              key={n.id}
              onClick={() => setSelectedNutrient(n.id)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                isSelected ? 'bg-slate-800 border-emerald-500 shadow-xs' : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white font-outfit flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }}></span>
                  {n.name}
                </span>
                <span className="font-mono text-[11px] text-slate-300">
                  Target Dose: <strong>{n.req} kg/ha</strong> ({n.bags})
                </span>
              </div>

              {/* Progress Stack Bar */}
              <div className="w-full h-3 rounded-full bg-slate-700/80 relative overflow-hidden flex">
                <div
                  style={{ width: `${supplyWidth}%`, backgroundColor: '#64748b' }}
                  className="h-full"
                  title={`Indigenous Soil Supply: ${n.supply} kg/ha`}
                ></div>
                <div
                  style={{ width: `${reqWidth - supplyWidth}%`, backgroundColor: n.color }}
                  className="h-full"
                  title={`Prescribed Fertilizer Supplement: ${n.req - n.supply} kg/ha`}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Native Soil Reserve: {n.supply} kg/ha</span>
                <span style={{ color: n.color }}>Supplement Needed: {n.req - n.supply} kg/ha</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Nutrient Advisory Card */}
      <div className="p-4 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1 text-xs">
        <div className="flex items-center justify-between border-b border-slate-700 pb-2">
          <h5 className="font-bold text-white font-outfit text-sm">{activeN.name} Agronomic Role</h5>
          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
            {activeN.bags} / ha
          </span>
        </div>
        <p className="text-slate-300 font-sans leading-relaxed text-[11px] pt-1">
          {activeN.desc}
        </p>
      </div>
    </div>
  );
};
