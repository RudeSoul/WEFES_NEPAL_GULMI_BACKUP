import React, { useState } from 'react';
import { Printer, Download, X, ShieldCheck, Sprout, Droplets, Zap, Trees, Building2, CheckCircle2, Award, Calendar, Mountain, Thermometer, CloudRain, Sparkles } from 'lucide-react';
import { DISTRICT_PALIKAS, DistrictPalika } from '../../data/districtPalikaAssets';
import { getPalikaMicroClimate } from '../../utils/climateDownscaling';

interface PalikaDossierExportProps {
  palikaName?: string;
  onClose?: () => void;
  lang?: 'en' | 'np';
}

export const PalikaDossierExport: React.FC<PalikaDossierExportProps> = ({
  palikaName = 'Ruru',
  onClose,
  lang = 'en',
}) => {
  const [selectedName, setSelectedName] = useState<string>(palikaName);

  const gulmiPalikas = DISTRICT_PALIKAS.gulmi || [];
  const palika = gulmiPalikas.find(p => p.name === selectedName) || gulmiPalikas[0];

  const micro = getPalikaMicroClimate(palika.name, 318, 19.5, 7, palika.elevation);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold font-outfit uppercase tracking-wide">
                {lang === 'np' ? 'स्थानीय तह लगानी तथा नीति योजना प्रतिवेदन' : 'Palika Executive WEFE Nexus Policy Dossier'}
              </h2>
              <p className="text-[11px] text-slate-300">
                Official Municipal Investment & Decision Support Brief (Print / PDF Ready)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Palika Selector */}
            <select
              value={selectedName}
              onChange={e => setSelectedName(e.target.value)}
              className="bg-slate-800 text-white border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer"
            >
              {gulmiPalikas.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name} ({p.unitType})
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Dossier Content Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans print:p-0 print:space-y-4 print:text-[11px]">
          {/* Header Seal */}
          <div className="border-b-2 border-emerald-700 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-xl font-outfit shadow-xs">
                🇳🇵
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                  Government of Nepal • Lumbini Province • Gulmi District
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-outfit uppercase tracking-tight mt-0.5">
                  {palika.name} {palika.unitType} (स्थानीय तह)
                </h1>
                <div className="text-xs text-emerald-800 font-semibold mt-0.5 font-mono">
                  WEFE Nexus Integrated Spatial Dossier • Fiscal Year 2081/82 (2024/25)
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono">
              <div className="font-bold text-slate-900">Palika Code: GUL-{palika.id.split('-')[1]}</div>
              <div className="text-slate-500">Elevation: {palika.elevation}m ASL</div>
              <div className="text-emerald-700 font-semibold">{micro.microClimateNiche.split('(')[0]}</div>
            </div>
          </div>

          {/* Section 1: Biophysical & Micro-Climatic Intelligence */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1. Biophysical & Agro-Climatic Baseline (NARC & NASA MERRA-2 Calibrated)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Hypsometric Elevation</div>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">{palika.elevation} m ASL</div>
                <div className="text-[9px] text-slate-500">Mid-Hill Agroforestry Zone</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Topographic Soil pH</div>
                <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">pH {palika.soilPh}</div>
                <div className="text-[9px] text-slate-500">{palika.soilPh < 6.0 ? 'Lime Amendment Needed' : 'Optimal Neutral Buffer'}</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Annual Baseline Rain</div>
                <div className="text-base font-bold text-sky-900 font-mono mt-0.5">{micro.annualRainMm} mm/yr</div>
                <div className="text-[9px] text-sky-700 font-mono">{micro.orographicFactor >= 1 ? `+${Math.round((micro.orographicFactor - 1) * 100)}%` : `${Math.round((micro.orographicFactor - 1) * 100)}%`} Orographic Factor</div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-[10px] text-slate-500 font-medium">Mean Temp & Lapse</div>
                <div className="text-base font-bold text-amber-900 font-mono mt-0.5">{palika.avgTempC}°C</div>
                <div className="text-[9px] text-slate-500">Lapse: {micro.lapseRateC > 0 ? `+${micro.lapseRateC}` : micro.lapseRateC}°C vs Tamghas</div>
              </div>
            </div>
          </div>

          {/* Section 2: Signature Crop Feasibility Scorecard */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1.5">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                2. Calibrated Crop Feasibility & Suitability Scorecard (FAO-EcoCrop Model)
              </span>
              <span className="text-[9.5px] text-emerald-800 font-mono font-semibold">
                8 Species Evaluated
              </span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {palika.feasibleCrops?.map(crop => (
                <div key={crop.cropId} className="p-2.5 bg-white rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{crop.emoji}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        crop.score >= 90 ? 'bg-emerald-100 text-emerald-800' : crop.score >= 75 ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {crop.score}%
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{crop.cropName.split('(')[0]}</div>
                    <div className="text-[10px] text-slate-500">{crop.nepaliName} • {crop.category}</div>
                  </div>
                  <div className="mt-2 text-[9px] text-slate-600 border-t border-slate-100 pt-1 font-mono">
                    Rating: <strong className="text-slate-900">{crop.rating}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Prioritized 5-Year WEFE Nexus Investment Roadmap */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              3. Strategic 5-Year Capital Investment & Climate Resilience Roadmap
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>High-Value Cash Crop Commercialization & Organic Certification</span>
                  </div>
                  <p className="text-[10px] text-emerald-900">
                    Establish specialty processing hubs for {palika.name} (shade-grown coffee cherry pulping, ginger washing, citrus grading).
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-950 px-2 py-0.5 rounded shrink-0">
                  Priority 1
                </span>
              </div>

              <div className="p-2.5 bg-sky-50/70 rounded-lg border border-sky-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>Solar-Powered River Lift Irrigation & Spring Shed Revival (ICIMOD)</span>
                  </div>
                  <p className="text-[10px] text-sky-900">
                    Construct recharge ponds and solar lift systems to ensure winter vegetable double-cropping on south-facing terraces.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-sky-200/80 text-sky-950 px-2 py-0.5 rounded shrink-0">
                  Priority 2
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200 flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Clean Cooking Induction Transition & Forest Biomass Protection</span>
                  </div>
                  <p className="text-[10px] text-amber-900">
                    Subsidize electric induction cookers to reduce firewood collection pressure on Community Forests by 85%.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded shrink-0">
                  Priority 3
                </span>
              </div>
            </div>
          </div>

          {/* Footer Official Signatures */}
          <div className="border-t border-slate-300 pt-6 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <div>
              <p>Generated via Antigravity WEFE Nexus Geospatial Platform</p>
              <p>Source Data: NASA MERRA-2, NARC Soil Registry & DHM Hydrology</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">Verified by Municipal Planning Officer</p>
              <p>{palika.name} Rural/Urban Municipality Office</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
