import React, { useState } from 'react';
import { Mountain, Users, Layers, Sprout, Search, Info, ChevronDown, ChevronUp, Globe, Sparkles } from 'lucide-react';
import { DISTRICT_PALIKAS } from '../../data/districtPalikaAssets';

interface ExecutiveHeroBannerProps {
  onSearchSelect: (type: 'palika' | 'filter' | 'crop', value: string) => void;
  lang: 'en' | 'np';
  onToggleLang: () => void;
  activePalikaName?: string | null;
}

export const ExecutiveHeroBanner: React.FC<ExecutiveHeroBannerProps> = ({
  onSearchSelect,
  lang,
  onToggleLang,
  activePalikaName
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const palikas = DISTRICT_PALIKAS['gulmi'] || [];

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

  const searchOptions = [
    // Palikas
    ...palikas.map(p => ({
      type: 'palika' as const,
      label: `${p.name} (${GULMI_PALIKA_NEPALI[p.name] || p.name})`,
      value: p.name,
      category: 'Palika'
    })),
    // Signature Crops
    { type: 'crop' as const, label: '☕ Arabica Coffee (कफी)', value: 'coffee', category: 'Crop' },
    { type: 'crop' as const, label: '🍊 Mandarin Orange (सुन्तला)', value: 'orange', category: 'Crop' },
    { type: 'crop' as const, label: '🫚 Ginger & Turmeric (अदुवा)', value: 'ginger', category: 'Crop' },
    { type: 'crop' as const, label: '🥔 Seed Potato (उच्च पहाडी आलु)', value: 'potato', category: 'Crop' },
    { type: 'crop' as const, label: '🌾 Buckwheat & Wheat (फापर/गहुँ)', value: 'buckwheat', category: 'Crop' },
    { type: 'crop' as const, label: '🌾 Monsoon Paddy (धान)', value: 'rice', category: 'Crop' },
    { type: 'crop' as const, label: '🌿 Large Cardamom (अलैंची)', value: 'cardamom', category: 'Crop' },
    // Key Filters
    { type: 'filter' as const, label: '🌊 Kali Gandaki & River Basins', value: 'river_basins', category: 'Water' },
    { type: 'filter' as const, label: '💧 Ridge Spring Vulnerability (मुहान सुक्ने)', value: 'spring_vulnerability', category: 'Water' },
    { type: 'filter' as const, label: '🧪 Soil pH & Agricultural Lime', value: 'soil_ph', category: 'Soil' },
    { type: 'filter' as const, label: '⚡ Run-of-River Hydropower Corridors', value: 'hydro_corridor', category: 'Energy' },
    { type: 'filter' as const, label: '☀️ Ridge Solar Irradiance (NASA POWER)', value: 'solar_irradiance', category: 'Energy' },
    { type: 'filter' as const, label: '🏛️ Local Governance (2 Municipalities + 10 Rural)', value: 'local_governance', category: 'Governance' },
    { type: 'filter' as const, label: '🛣️ Road Proximity to Tamghas HQ', value: 'hq_market_proximity', category: 'Transport' },
  ];

  const filteredOptions = searchQuery.trim()
    ? searchOptions.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()) || o.value.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="space-y-3">
      {/* Top Banner Card */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Main Title & Subtext */}
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {lang === 'np' ? 'गुल्मी जिल्ला विशेष इन्टेलिजेन्स' : 'Gulmi District Spatial Intelligence'}
              </span>
              <span className="text-slate-400 text-xs font-mono">Lumbini Province • 12 Palikas</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-outfit">
              {lang === 'np' ? 'गुल्मी जल-ऊर्जा-खाद्य-पारिस्थितिकी (WEFES) नेक्सस प्रणाली' : 'Gulmi Water–Energy–Food–Ecosystem (WEFES) Nexus Platform'}
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'np'
                ? 'कालीगण्डकी नदी किनारदेखि रेसुङ्गा र मदाने लेकसम्म फैलिएको १२ स्थानीय तहको वैज्ञानिक जलस्रोत, कृषि उत्पादन, माटो परीक्षण र नवीकरणीय ऊर्जा निर्णय समर्थन प्रणाली।'
                : 'Scientific decision support bridging micro-watersheds, agro-ecological crop zoning, NARC soil chemistry, and renewable energy across 12 local governments.'}
            </p>
          </div>

          {/* Quick Search & Lang Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            {/* Search Input with dropdown */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder={lang === 'np' ? 'खोज्नुहोस् (उदा: रुरु, कफी, माटो pH)...' : 'Search Palika, Crop, Soil pH, Basin…'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans shadow-inner"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {isSearchFocused && filteredOptions.length > 0 && (
                <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800 text-xs">
                  {filteredOptions.map((opt, idx) => (
                    <button
                      key={`${opt.type}-${opt.value}-${idx}`}
                      onMouseDown={() => {
                        onSearchSelect(opt.type, opt.value);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-600/30 flex items-center justify-between text-slate-200 hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{opt.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language & Overview Drawer Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleLang}
                className="px-2.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Toggle English / Nepali Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono">{lang === 'np' ? 'EN' : 'नेपाली'}</span>
              </button>

              <button
                onClick={() => setIsDrawerOpen(prev => !prev)}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{lang === 'np' ? 'नेक्सस परिचय' : 'About WEFES'}</span>
                {isDrawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Live KPI Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                {lang === 'np' ? 'स्थानीय तह' : 'Local Bodies'}
              </div>
              <div className="text-sm font-bold text-white font-outfit">12 Palikas</div>
              <div className="text-[9px] text-emerald-300">2 Muni. + 10 Rural</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Mountain className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                {lang === 'np' ? 'भौगोलिक उचाइ' : 'Elevation Gradient'}
              </div>
              <div className="text-sm font-bold text-white font-outfit">465m – 2,690m</div>
              <div className="text-[9px] text-sky-300">Kali Gandaki to Resunga</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                {lang === 'np' ? 'प्रमुख नगदे बाली' : 'Signature Hub'}
              </div>
              <div className="text-sm font-bold text-white font-outfit">Arabica Coffee</div>
              <div className="text-[9px] text-amber-300">Origin of Coffee in Nepal (1938)</div>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                {lang === 'np' ? 'क्षेत्रफल र जनसङ्ख्या' : 'Area & Demographics'}
              </div>
              <div className="text-sm font-bold text-white font-outfit">1,333 km²</div>
              <div className="text-[9px] text-purple-300">246,835 Population</div>
            </div>
          </div>
        </div>

        {/* Collapsible Scientific Nexus Drawer */}
        {isDrawerOpen && (
          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-200 space-y-3 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>{lang === 'np' ? 'कृषि तथा खाद्य सुरक्षा' : 'Food & Agro-Ecological Zoning'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Gulmi’s steep terrain supports multi-tier cropping: subtropical fruits and river paddy (&lt;1150m), specialty Arabica coffee and citrus (1150–1550m), and seed potato/buckwheat on high ridges (&gt;1550m).
                </p>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Mountain className="w-3.5 h-3.5" />
                  <span>{lang === 'np' ? 'जलस्रोत तथा मुहान संरक्षण' : 'Water & Micro-Catchments'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Perennial flows in the Kali Gandaki and Badigad contrast with high ridge spring vulnerability during dry winters (March–May), requiring lift irrigation and recharge ponds.
                </p>
              </div>

              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/50 space-y-1">
                <div className="font-bold text-purple-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'np' ? 'ऊर्जा र बजार पहुँच' : 'Clean Energy & Economic Corridors'}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  High solar irradiance on south-facing ridges (&gt;5.0 kWh/m²/d) enables solar lift irrigation to pump valley water up to productive mid-hill terraces.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
