import React, { useState } from 'react';
import { Mountain, Sprout, Droplets, Sun, ChevronRight } from 'lucide-react';

interface ElevationCrossSectionProps {
  lang: 'en' | 'np';
  onSelectCropFilter?: (cropId: string) => void;
}

export const ElevationCrossSection: React.FC<ElevationCrossSectionProps> = ({
  lang,
  onSelectCropFilter
}) => {
  const [activeTier, setActiveTier] = useState<number | null>(null);

  const tiers = [
    {
      id: 3,
      name: lang === 'np' ? 'उच्च पहाडी तथा लेकाली क्षेत्र' : 'High Mountain Ridges',
      range: '> 1,550m – 2,690m',
      peak: 'Resunga (2,348m) • Madane (2,690m) • Malika',
      climate: 'Temperate / Subalpine (Cool, High Solar Exposure)',
      crops: [
        { name: '🥔 Seed Potato', id: 'potato' },
        { name: '🌾 Buckwheat', id: 'buckwheat' },
        { name: '🥬 Winter Brassica', id: 'vegetables' }
      ],
      nexus: 'Recharge catchment for downhill springs; ideal ridge solar irradiance (5.1+ kWh/m²); community pine/oak forestry.',
      color: 'from-purple-900/40 to-indigo-900/30 border-purple-400/40 text-purple-200'
    },
    {
      id: 2,
      name: lang === 'np' ? 'मध्य पहाडी ढलान (कफी तथा सुन्तला बेल्ट)' : 'Mid-Hill Slopes (Coffee & Citrus Belt)',
      range: '1,150m – 1,550m',
      peak: 'Dhurkot • Chatrakot • Chandrakot • Gulmidarbar • Isma',
      climate: 'Subtropical to Mild Warm (Optimal Agroforestry)',
      crops: [
        { name: '☕ Arabica Coffee', id: 'coffee' },
        { name: '🍊 Mandarin Orange', id: 'orange' },
        { name: '🫚 Ginger & Turmeric', id: 'ginger' },
        { name: '🌽 Maize & Millets', id: 'maize' }
      ],
      nexus: 'Primary commercial cash-crop zone; spring-fed terrace farming; moderate limestone buffer requirement.',
      color: 'from-emerald-900/40 to-teal-900/30 border-emerald-400/40 text-emerald-200'
    },
    {
      id: 1,
      name: lang === 'np' ? 'नदी बेसी तथा उपत्यका (सिञ्चित फाँट)' : 'River Valleys & Basins (Irrigated Flats)',
      range: '465m – 1,150m',
      peak: 'Kali Gandaki Basin • Badigad Valley (Musikot) • Ruru',
      climate: 'Subtropical Lowland (High Thermal Units)',
      crops: [
        { name: '🌾 Monsoon Paddy', id: 'rice' },
        { name: '🌾 Spring Paddy (Chaite)', id: 'rice' },
        { name: '🥦 Commercial Vegetables', id: 'vegetables' },
        { name: '🌻 Mustard & Oilseeds', id: 'oilseeds' }
      ],
      nexus: 'Perennial riverbed water access; high river lift & canal potential; Run-of-River hydropower corridors.',
      color: 'from-sky-900/40 to-blue-900/30 border-sky-400/40 text-sky-200'
    }
  ];

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-outfit flex items-center gap-2">
            <Mountain className="w-4 h-4 text-emerald-600" />
            {lang === 'np' ? 'गुल्मीको भौगोलिक उचाइ प्रोफाइल र बाली बेल्ट' : 'Gulmi Hypsometric Elevation Profile & Agro-Ecological Zones'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'np'
              ? '४६५ मिटर कालीगण्डकी किनारदेखि २,६९० मिटर मदाने लेकसम्मको ३ तहगत कृषि र पारिस्थितिकी प्रणाली।'
              : 'Cross-section model from 465m riverbeds to 2,690m alpine ridges showing agricultural suitability.'}
          </p>
        </div>

        <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
          465m — 2,690m Relief
        </span>
      </div>

      {/* 3-Tier Interactive Diagram */}
      <div className="space-y-2.5">
        {tiers.map(t => {
          const isExpanded = activeTier === t.id;
          return (
            <div
              key={t.id}
              onClick={() => setActiveTier(prev => (prev === t.id ? null : t.id))}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-gradient-to-r ${t.color} text-slate-800 hover:shadow-md`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/80 text-slate-900 shadow-xs border border-slate-200">
                    {t.range}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 font-outfit">
                    {t.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-sans hidden sm:inline">{t.peak}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Crop Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {t.crops.map(c => (
                  <button
                    key={c.name}
                    onClick={e => {
                      e.stopPropagation();
                      if (onSelectCropFilter) onSelectCropFilter(c.id);
                    }}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/90 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs hover:border-emerald-400 hover:text-emerald-800 transition-colors"
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Expanded Nexus Detail */}
              {isExpanded && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-xs text-slate-700 space-y-1 animate-fade-in">
                  <div><strong>Nexus Dynamic:</strong> {t.nexus}</div>
                  <div><strong>Key Locations:</strong> {t.peak}</div>
                  <div><strong>Thermal & Moisture Regime:</strong> {t.climate}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
