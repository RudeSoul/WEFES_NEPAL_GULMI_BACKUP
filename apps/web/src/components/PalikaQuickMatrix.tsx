import React from 'react';
import { DISTRICT_PALIKAS, DistrictPalika } from '../data/districtPalikaAssets';
import { Mountain, CloudRain, Sprout, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { WEFESPillar } from '@wefes/shared-types';

interface PalikaQuickMatrixProps {
  onSelectPalika: (palikaName: string) => void;
  hoveredPalikaName: string | null;
  onHoverPalika: (palikaName: string | null) => void;
  selectedPillar: WEFESPillar;
  selectedCropId?: string | null;
  subFilters: Record<string, string>;
  lang: 'en' | 'np';
}

export const PalikaQuickMatrix: React.FC<PalikaQuickMatrixProps> = ({
  onSelectPalika,
  hoveredPalikaName,
  onHoverPalika,
  selectedPillar,
  selectedCropId,
  subFilters,
  lang
}) => {
  const palikas: DistrictPalika[] = DISTRICT_PALIKAS['gulmi'] || [];

  const GULMI_PALIKA_NEPALI: Record<string, string> = {
    'Resunga': 'रेसुङ्गा',
    'Musikot': 'मुसिकोट',
    'Ruru': 'रुरुक्षेत्र',
    'Satyawati': 'सत्यवती',
    'Kaligandaki': 'कालीगण्डकी',
    'Chandrakot': 'चन्द्रकोट',
    'Chatrakot': 'छत्रकोट',
    'Gulmidarbar': 'गुल्मीदरबार',
    'Dhurkot': 'धुर्कोट',
    'Isma': 'इस्मा',
    'Malika': 'मालिका',
    'Madane': 'मदाने',
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 space-y-3.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {lang === 'np' ? 'गुल्मीका १२ स्थानीय तहहरूको तुलनात्मक झलक' : '12 Local Bodies of Gulmi at a Glance'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'np'
              ? 'कुनै पनि पालिकामा क्लिक गरी विस्तृत डसियर हेर्नुहोस् वा नक्सामा हाइलाइट गर्नुहोस्।'
              : 'Click any local body to inspect detailed agro-climatic profile or hover to highlight on map.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-600" />
          <span>Optimal (&gt;80%)</span>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400 ml-1" />
          <span>High (60–80%)</span>
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 ml-1" />
          <span>Moderate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5">
        {palikas.map(p => {
          const isHovered = hoveredPalikaName?.toLowerCase() === p.name.toLowerCase();
          const topCrop = p.feasibleCrops?.[0];
          const cropMatch = selectedCropId
            ? p.feasibleCrops?.find(c => c.cropId.toLowerCase() === selectedCropId.toLowerCase())
            : topCrop;

          const isMuni = p.unitType?.toLowerCase().includes('nagarpalika') || p.unitType?.toLowerCase().includes('municipality');

          return (
            <div
              key={p.name}
              onClick={() => onSelectPalika(p.name)}
              onMouseEnter={() => onHoverPalika(p.name)}
              onMouseLeave={() => onHoverPalika(null)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden group ${
                isHovered
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-md scale-[1.02]'
                  : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Name & Badges */}
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {p.name}
                  </div>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                      isMuni ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isMuni ? (lang === 'np' ? 'नगर' : 'Muni') : (lang === 'np' ? 'गाउँ' : 'Rural')}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  {GULMI_PALIKA_NEPALI[p.name] || p.name}
                </div>
              </div>

              {/* Middle Row: Elevation & Rain */}
              <div className="grid grid-cols-2 gap-1 py-1 border-y border-slate-200/60 text-[10px] font-mono text-slate-600">
                <div className="flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{p.elevation}m</span>
                </div>
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3 h-3 text-sky-400 shrink-0" />
                  <span>{p.rainfallMm}mm</span>
                </div>
              </div>

              {/* Bottom Row: Active Crop or Top Crop */}
              <div className="flex items-center justify-between gap-1 text-[10px]">
                {cropMatch ? (
                  <div className="flex items-center gap-1 truncate">
                    <span>{cropMatch.emoji}</span>
                    <span className="text-slate-700 font-medium truncate">{cropMatch.cropName.split('(')[0]}</span>
                  </div>
                ) : (
                  <span className="text-slate-500">pH: {p.soilPh || 6.5}</span>
                )}
                {cropMatch && (
                  <span
                    className={`font-bold font-mono px-1 py-0.5 rounded text-[9px] ${
                      cropMatch.score >= 80
                        ? 'bg-emerald-100 text-emerald-800'
                        : cropMatch.score >= 60
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cropMatch.score}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
