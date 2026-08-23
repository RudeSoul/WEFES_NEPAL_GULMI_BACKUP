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
  docked?: boolean;
  onClose?: () => void;
}

export const PalikaQuickMatrix: React.FC<PalikaQuickMatrixProps> = ({
  onSelectPalika,
  hoveredPalikaName,
  onHoverPalika,
  selectedPillar,
  selectedCropId,
  subFilters,
  lang,
  docked = false,
  onClose,
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

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredPalikas = palikas.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const np = GULMI_PALIKA_NEPALI[p.name] || '';
    return p.name.toLowerCase().includes(q) || np.includes(q);
  });

  if (docked) {
    return (
      <div className="h-full w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-slate-200/90 flex flex-col overflow-hidden p-3.5 sm:p-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200/80">
          <div>
            <h3 className="text-xs font-bold text-slate-900 font-outfit flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lang === 'np' ? '१२ स्थानीय तह म्याट्रिक्स (साइड डक)' : '12 Palikas Spatial Matrix (Side Dock)'}</span>
            </h3>
            <p className="text-[10px] text-slate-500">
              {lang === 'np' ? 'होभर गर्दा नक्सामा हेर्नुहोस् (नक्सा नछोपी)' : 'Hover row to highlight on map • 100% visible map'}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              title="Close Matrix Dock"
            >
              ✕ {lang === 'np' ? 'बन्द' : 'Close'}
            </button>
          )}
        </div>

        {/* Search filter for Palikas */}
        <div className="mb-2">
          <input
            type="text"
            placeholder={lang === 'np' ? '🔍 पालिका खोज्नुहोस्...' : '🔍 Search Palika (e.g. Resunga, Dhurkot)...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-200 bg-slate-50/80 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
          {filteredPalikas.map(p => {
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
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                  isHovered
                    ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-400 scale-[1.01]'
                    : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-emerald-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 truncate">
                      {p.name}
                    </span>
                    <span className="text-[10px] text-slate-500">({GULMI_PALIKA_NEPALI[p.name] || p.name})</span>
                    <span
                      className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ${
                        isMuni ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isMuni ? 'Muni' : 'Rural'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-0.5">
                      <Mountain className="w-2.5 h-2.5 text-slate-400" />
                      {p.elevation}m
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <CloudRain className="w-2.5 h-2.5 text-sky-400" />
                      {p.rainfallMm}mm
                    </span>
                    {cropMatch && (
                      <>
                        <span>•</span>
                        <span className="truncate">{cropMatch.emoji} {cropMatch.cropName.split('(')[0]}</span>
                      </>
                    )}
                  </div>
                </div>

                {cropMatch && (
                  <span
                    className={`font-bold font-mono px-2 py-1 rounded-md text-[10px] shrink-0 shadow-2xs ${
                      cropMatch.score >= 80
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : cropMatch.score >= 60
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {cropMatch.score}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

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
