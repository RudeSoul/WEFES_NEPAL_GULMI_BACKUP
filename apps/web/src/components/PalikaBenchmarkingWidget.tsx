import React, { useState, useEffect, useMemo } from 'react';
import { DistrictPalika, DISTRICT_PALIKAS, PalikaFeasibleCrop } from '../data/districtPalikaAssets';
import {
  Scale, Mountain, CloudRain, Thermometer, Sparkles, TrendingUp,
  Sprout, Zap, Trees, Building2, Sun, Droplets, Wind, Cloud, CheckCircle2,
  ArrowRight, ShieldCheck, Layers, Calendar, BarChart3, Radio
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell
} from 'recharts';

interface PalikaBenchmarkingWidgetProps {
  currentPalika: DistrictPalika;
  lang?: 'en' | 'np';
}

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

const PALIKA_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Resunga': { lat: 28.0531, lng: 83.2658 },
  'Musikot': { lat: 28.1846, lng: 83.2826 },
  'Ruru': { lat: 27.9822, lng: 83.4256 },
  'Satyawati': { lat: 28.0300, lng: 83.4689 },
  'Kaligandaki': { lat: 28.0502, lng: 83.5436 },
  'Chandrakot': { lat: 28.1070, lng: 83.4208 },
  'Chatrakot': { lat: 27.9862, lng: 83.3472 },
  'Gulmidarbar': { lat: 28.0398, lng: 83.3167 },
  'Dhurkot': { lat: 28.1181, lng: 83.1408 },
  'Isma': { lat: 28.1643, lng: 83.2054 },
  'Malika': { lat: 28.2131, lng: 83.1426 },
  'Madane': { lat: 28.1750, lng: 83.0753 },
};

interface LiveWeatherTelemetry {
  temperature: number;
  apparentTemp: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  solarRadiation: number;
  cloudCover: number;
}

// Compute standard WEFES 5-Pillar indices (0-100) for any Palika
function computePalikaPillars(p: Partial<DistrictPalika>) {
  const elev = p.elevation || 1450;
  const rain = p.rainfallMm || 1750;
  const ph = p.soilPh || 6.5;
  const cropCount = p.feasibleCropsCount || p.feasibleCrops?.length || 7;
  const avgCropScore = p.feasibleCrops && p.feasibleCrops.length > 0
    ? Math.round(p.feasibleCrops.reduce((sum, c) => sum + c.score, 0) / p.feasibleCrops.length)
    : 85;

  // Water: Precipitation abundance and mountain aquifer retention
  const waterScore = Math.min(100, Math.round((rain / 2200) * 100));

  // Energy: Solar insulation + micro-hydro gradient from high head elevation
  const energyScore = Math.min(100, Math.round(65 + (elev / 2500) * 25));

  // Food: Crop suitability & arable spectrum
  const foodScore = Math.min(100, Math.round(avgCropScore * 0.7 + (cropCount / 10) * 30));

  // Eco: Soil pH buffer health & forest cover retention
  const ecoScore = Math.min(100, Math.round((1 - Math.abs(ph - 6.6) / 2.5) * 60 + 35));

  // Socio: Market connectivity and cash crop high-margin index
  const socioScore = p.name?.toLowerCase().includes('resunga') || p.name?.toLowerCase().includes('musikot')
    ? 88
    : Math.min(100, Math.round(70 + (cropCount * 2)));

  return {
    water: waterScore,
    energy: energyScore,
    food: foodScore,
    eco: ecoScore,
    socio: socioScore,
    nexusAvg: Math.round((waterScore + energyScore + foodScore + ecoScore + socioScore) / 5),
  };
}

export const PalikaBenchmarkingWidget: React.FC<PalikaBenchmarkingWidgetProps> = ({
  currentPalika,
  lang = 'en'
}) => {
  const allPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const [compareTargetName, setCompareTargetName] = useState<string>('Musikot');
  const [activeBenchmarkTab, setActiveBenchmarkTab] = useState<'crops' | 'pillars' | 'live' | 'rotations'>('crops');

  // Find target Palika or fallback to another Palika
  const targetPalika: DistrictPalika = allPalikas.find(p => p.name === compareTargetName) ||
    allPalikas.find(p => p.name !== currentPalika.name) ||
    currentPalika;

  // Live Satellite Weather for Both Palikas
  const [currentLiveWeather, setCurrentLiveWeather] = useState<LiveWeatherTelemetry | null>(null);
  const [targetLiveWeather, setTargetLiveWeather] = useState<LiveWeatherTelemetry | null>(null);
  const [liveLoading, setLiveLoading] = useState<boolean>(false);

  useEffect(() => {
    const coordA = PALIKA_COORDINATES[currentPalika.name] || { lat: 28.068, lng: 83.248 };
    const coordB = PALIKA_COORDINATES[targetPalika.name] || { lat: 28.184, lng: 83.282 };

    setLiveLoading(true);

    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordA.lat}&longitude=${coordA.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,direct_radiation,cloud_cover&timezone=Asia%2FKathmandu`).then(r => r.json()),
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coordB.lat}&longitude=${coordB.lng}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,wind_speed_10m,direct_radiation,cloud_cover&timezone=Asia%2FKathmandu`).then(r => r.json()),
    ])
      .then(([dataA, dataB]) => {
        if (dataA?.current) {
          setCurrentLiveWeather({
            temperature: Number(dataA.current.temperature_2m.toFixed(1)),
            apparentTemp: Number(dataA.current.apparent_temperature.toFixed(1)),
            humidity: Math.round(dataA.current.relative_humidity_2m),
            precipitation: Number(dataA.current.precipitation.toFixed(1)),
            windSpeed: Number((dataA.current.wind_speed_10m / 3.6).toFixed(1)),
            solarRadiation: Math.round(dataA.current.direct_radiation || 0),
            cloudCover: Math.round(dataA.current.cloud_cover || 0),
          });
        }
        if (dataB?.current) {
          setTargetLiveWeather({
            temperature: Number(dataB.current.temperature_2m.toFixed(1)),
            apparentTemp: Number(dataB.current.apparent_temperature.toFixed(1)),
            humidity: Math.round(dataB.current.relative_humidity_2m),
            precipitation: Number(dataB.current.precipitation.toFixed(1)),
            windSpeed: Number((dataB.current.wind_speed_10m / 3.6).toFixed(1)),
            solarRadiation: Math.round(dataB.current.direct_radiation || 0),
            cloudCover: Math.round(dataB.current.cloud_cover || 0),
          });
        }
        setLiveLoading(false);
      })
      .catch(() => setLiveLoading(false));
  }, [currentPalika.name, targetPalika.name]);

  // Crop Comparison Data
  const cropComparisonList = useMemo(() => {
    const mapA = new Map<string, PalikaFeasibleCrop>();
    const mapB = new Map<string, PalikaFeasibleCrop>();

    (currentPalika.feasibleCrops || []).forEach(c => mapA.set(c.cropId, c));
    (targetPalika.feasibleCrops || []).forEach(c => mapB.set(c.cropId, c));

    // Combine all unique crops
    const allCropIds = Array.from(new Set([...Array.from(mapA.keys()), ...Array.from(mapB.keys())]));

    return allCropIds.map(cropId => {
      const cropA = mapA.get(cropId);
      const cropB = mapB.get(cropId);
      const name = cropA?.cropName || cropB?.cropName || cropId;
      const nepali = cropA?.nepaliName || cropB?.nepaliName || '';
      const emoji = cropA?.emoji || cropB?.emoji || '🌱';
      const scoreA = cropA?.score || 0;
      const scoreB = cropB?.score || 0;
      const delta = scoreA - scoreB;

      return {
        cropId,
        name: `${emoji} ${name}`,
        nepali,
        emoji,
        [currentPalika.name]: scoreA,
        [targetPalika.name]: scoreB,
        scoreA,
        scoreB,
        delta,
        category: cropA?.category || cropB?.category || 'General',
      };
    }).sort((a, b) => (b.scoreA + b.scoreB) - (a.scoreA + a.scoreB));
  }, [currentPalika, targetPalika]);

  // WEFES Pillars Comparison Data
  const pillarsA = useMemo(() => computePalikaPillars(currentPalika), [currentPalika]);
  const pillarsB = useMemo(() => computePalikaPillars(targetPalika), [targetPalika]);

  const radarData = useMemo(() => [
    { pillar: '💧 Water', [currentPalika.name]: pillarsA.water, [targetPalika.name]: pillarsB.water, fullMark: 100 },
    { pillar: '⚡ Energy', [currentPalika.name]: pillarsA.energy, [targetPalika.name]: pillarsB.energy, fullMark: 100 },
    { pillar: '🌾 Food', [currentPalika.name]: pillarsA.food, [targetPalika.name]: pillarsB.food, fullMark: 100 },
    { pillar: '🌲 Eco', [currentPalika.name]: pillarsA.eco, [targetPalika.name]: pillarsB.eco, fullMark: 100 },
    { pillar: '🏛️ Socio', [currentPalika.name]: pillarsA.socio, [targetPalika.name]: pillarsB.socio, fullMark: 100 },
  ], [pillarsA, pillarsB, currentPalika.name, targetPalika.name]);

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 shadow-sm bg-white/95 space-y-4 animate-fade-in">
      {/* ─── Header & Comparison Selection ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs">
              <Scale className="w-5 h-5 text-indigo-600" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">
                {lang === 'np' ? 'हेड-टु-हेड पालिका बेन्चमार्क' : 'Head-to-Head Palika Benchmark'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'np'
                  ? `${currentPalika.name} र ${targetPalika.name} बीच कृषि-जलवायु, बाली उत्पादन तथा ५-स्तम्भ तुलना`
                  : `Direct comparative analysis between ${currentPalika.name} and ${targetPalika.name}`}
              </p>
            </div>
          </div>
        </div>

        {/* Target Palika Selector */}
        <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
          <span className="text-xs font-semibold text-slate-600 font-outfit">Compare against:</span>
          <select
            value={compareTargetName}
            onChange={(e) => setCompareTargetName(e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-2xs font-outfit"
          >
            {allPalikas.filter(p => p.name !== currentPalika.name).map(p => (
              <option key={p.name} value={p.name}>
                {p.name} ({GULMI_PALIKA_NEPALI[p.name] || p.unitType}) • {p.elevation}m
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Comparison Match-up Badges ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left Palika Pill */}
        <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <div>
              <div className="text-xs font-bold text-emerald-950 font-outfit">
                {currentPalika.name} ({GULMI_PALIKA_NEPALI[currentPalika.name] || ''})
              </div>
              <div className="text-[10px] text-emerald-800 font-mono">
                {currentPalika.elevation}m ASL • {currentPalika.rainfallMm} mm/yr • pH {currentPalika.soilPh}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-900 border border-emerald-300 font-mono">
            Nexus {pillarsA.nexusAvg}%
          </span>
        </div>

        {/* Right Palika Pill */}
        <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-xs" />
            <div>
              <div className="text-xs font-bold text-indigo-950 font-outfit">
                {targetPalika.name} ({GULMI_PALIKA_NEPALI[targetPalika.name] || ''})
              </div>
              <div className="text-[10px] text-indigo-800 font-mono">
                {targetPalika.elevation}m ASL • {targetPalika.rainfallMm} mm/yr • pH {targetPalika.soilPh}
              </div>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/70 text-indigo-900 border border-indigo-300 font-mono">
            Nexus {pillarsB.nexusAvg}%
          </span>
        </div>
      </div>

      {/* ─── Benchmark Mode Tabs ─── */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveBenchmarkTab('crops')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeBenchmarkTab === 'crops'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Sprout className="w-3.5 h-3.5" />
          <span>🌾 Crop Feasibility Match-up</span>
        </button>

        <button
          onClick={() => setActiveBenchmarkTab('pillars')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeBenchmarkTab === 'pillars'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>🌐 WEFES 5-Pillars Radar</span>
        </button>

        <button
          onClick={() => setActiveBenchmarkTab('live')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeBenchmarkTab === 'live'
              ? 'bg-sky-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>🛰️ Live Satellite Telemetry</span>
        </button>

        <button
          onClick={() => setActiveBenchmarkTab('rotations')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeBenchmarkTab === 'rotations'
              ? 'bg-amber-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>📅 4-Season Calendar</span>
        </button>
      </div>

      {/* ─── Tab Content 1: Crop Feasibility Match-up ─── */}
      {activeBenchmarkTab === 'crops' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="font-semibold">Side-by-side Suitability Index for Key Cash & Staple Crops:</span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                <strong className="text-emerald-900">{currentPalika.name}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <strong className="text-indigo-900">{targetPalika.name}</strong>
              </span>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {cropComparisonList.map((item) => {
              const advPalika = item.delta > 0 ? currentPalika.name : item.delta < 0 ? targetPalika.name : 'Tie';
              const isWinA = item.scoreA > item.scoreB;
              const isWinB = item.scoreB > item.scoreA;

              return (
                <div
                  key={item.cropId}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 hover:bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 font-outfit">{item.name}</span>
                      {item.nepali && <span className="text-[11px] text-slate-500 font-serif">({item.nepali})</span>}
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {Math.abs(item.delta) > 0 ? (
                        <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                          isWinA
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-indigo-100 text-indigo-900 border-indigo-300'
                        }`}>
                          +{Math.abs(item.delta)}% {advPalika} Advantage
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          Equal Fit (Tie)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Bar Display */}
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-24 text-[10px] text-slate-600 font-sans truncate">{currentPalika.name}:</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all"
                          style={{ width: `${item.scoreA}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-emerald-800 text-[11px]">{item.scoreA}%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-24 text-[10px] text-slate-600 font-sans truncate">{targetPalika.name}:</span>
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${item.scoreB}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-bold text-indigo-800 text-[11px]">{item.scoreB}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Tab Content 2: WEFES 5-Pillars Radar ─── */}
      {activeBenchmarkTab === 'pillars' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center animate-fade-in">
          <div className="lg:col-span-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="pillar" tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                <Radar name={currentPalika.name} dataKey={currentPalika.name} stroke="#059669" fill="#10b981" fillOpacity={0.4} />
                <Radar name={targetPalika.name} dataKey={targetPalika.name} stroke="#4f46e5" fill="#6366f1" fillOpacity={0.3} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-6 space-y-2.5 text-xs">
            <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] font-outfit">
              5-Pillar Nexus Comparative Scorecard:
            </div>

            <div className="space-y-2 font-sans">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">💧</span>
                  <div>
                    <strong className="text-slate-900">Water Availability</strong>
                    <div className="text-[10px] text-slate-500">Hydrological Inflow & Storage</div>
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-emerald-700 font-bold">{pillarsA.water}%</span> vs <span className="text-indigo-700 font-bold">{pillarsB.water}%</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <strong className="text-slate-900">Renewable Energy</strong>
                    <div className="text-[10px] text-slate-500">Micro-Hydro & Solar Potential</div>
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-emerald-700 font-bold">{pillarsA.energy}%</span> vs <span className="text-indigo-700 font-bold">{pillarsB.energy}%</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌾</span>
                  <div>
                    <strong className="text-slate-900">Food Security</strong>
                    <div className="text-[10px] text-slate-500">Arable Crop Yield Index</div>
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-emerald-700 font-bold">{pillarsA.food}%</span> vs <span className="text-indigo-700 font-bold">{pillarsB.food}%</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌲</span>
                  <div>
                    <strong className="text-slate-900">Ecosystem Health</strong>
                    <div className="text-[10px] text-slate-500">Soil pH Buffer & Forest Cover</div>
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-emerald-700 font-bold">{pillarsA.eco}%</span> vs <span className="text-indigo-700 font-bold">{pillarsB.eco}%</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🏛️</span>
                  <div>
                    <strong className="text-slate-900">Socioeconomics</strong>
                    <div className="text-[10px] text-slate-500">Market Margin & Road Infrastructure</div>
                  </div>
                </div>
                <div className="font-mono text-right">
                  <span className="text-emerald-700 font-bold">{pillarsA.socio}%</span> vs <span className="text-indigo-700 font-bold">{pillarsB.socio}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content 3: Live Satellite Weather Head-to-Head ─── */}
      {activeBenchmarkTab === 'live' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time EUMETSAT / ECMWF Satellite Assimilation Feeds</span>
            </span>
            {liveLoading && <span className="text-slate-400 italic font-mono text-[10px]">Refreshing...</span>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {/* Live Temperature */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
                <span>Air Temp</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-mono">
                {currentLiveWeather ? `${currentLiveWeather.temperature}°C` : '--'}
              </div>
              <div className="text-[10px] text-indigo-700 font-mono font-bold">
                vs {targetLiveWeather ? `${targetLiveWeather.temperature}°C` : '--'}
              </div>
            </div>

            {/* Live Precipitation */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <CloudRain className="w-3.5 h-3.5 text-sky-500" />
                <span>Rain Rate</span>
              </div>
              <div className="text-base font-extrabold text-sky-900 font-mono">
                {currentLiveWeather ? `${currentLiveWeather.precipitation} mm` : '--'}
              </div>
              <div className="text-[10px] text-indigo-700 font-mono font-bold">
                vs {targetLiveWeather ? `${targetLiveWeather.precipitation} mm` : '--'}
              </div>
            </div>

            {/* Live Relative Humidity */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Humidity</span>
              </div>
              <div className="text-base font-extrabold text-blue-900 font-mono">
                {currentLiveWeather ? `${currentLiveWeather.humidity}%` : '--'}
              </div>
              <div className="text-[10px] text-indigo-700 font-mono font-bold">
                vs {targetLiveWeather ? `${targetLiveWeather.humidity}%` : '--'}
              </div>
            </div>

            {/* Live Wind Speed */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <Wind className="w-3.5 h-3.5 text-teal-500" />
                <span>Wind Speed</span>
              </div>
              <div className="text-base font-extrabold text-teal-900 font-mono">
                {currentLiveWeather ? `${currentLiveWeather.windSpeed} m/s` : '--'}
              </div>
              <div className="text-[10px] text-indigo-700 font-mono font-bold">
                vs {targetLiveWeather ? `${targetLiveWeather.windSpeed} m/s` : '--'}
              </div>
            </div>

            {/* Live Solar Flux */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <Sun className="w-3.5 h-3.5 text-yellow-500" />
                <span>Solar Flux</span>
              </div>
              <div className="text-base font-extrabold text-amber-900 font-mono">
                {currentLiveWeather ? `${currentLiveWeather.solarRadiation} W` : '--'}
              </div>
              <div className="text-[10px] text-indigo-700 font-mono font-bold">
                vs {targetLiveWeather ? `${targetLiveWeather.solarRadiation} W` : '--'}
              </div>
            </div>

            {/* Live Cloud Cover */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500">
                <Cloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Cloud Cover</span>
              </div>
              <div className="text-base font-extrabold text-slate-900 font-mono">
                {currentLiveWeather ? `${currentLiveWeather.cloudCover}%` : '--'}
              </div>
              <div className="text-[10px] text-indigo-700 font-mono font-bold">
                vs {targetLiveWeather ? `${targetLiveWeather.cloudCover}%` : '--'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content 4: 4-Season Cropping Calendar Comparison ─── */}
      {activeBenchmarkTab === 'rotations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* Current Palika Rotations */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2.5">
            <div className="font-bold text-emerald-950 font-outfit text-xs flex items-center justify-between">
              <span>🌱 {currentPalika.name} 4-Season Cycle:</span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Active Palika</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-emerald-100 flex justify-between items-center">
                <span className="text-slate-600">🌧️ Monsoon (Barkhe):</span>
                <strong className="text-slate-900">{currentPalika.seasonalRotations?.barkhe?.cropName || 'Paddy / Maize'}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100 flex justify-between items-center">
                <span className="text-slate-600">❄️ Winter (Hiunde):</span>
                <strong className="text-slate-900">{currentPalika.seasonalRotations?.hiunde?.cropName || 'Winter Wheat / Potato'}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100 flex justify-between items-center">
                <span className="text-slate-600">☀️ Spring (Chaite):</span>
                <strong className="text-slate-900">{currentPalika.seasonalRotations?.chaite?.cropName || 'Off-Season Vegetables'}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-emerald-100 flex justify-between items-center">
                <span className="text-slate-600">☕ Perennial (Baahramase):</span>
                <strong className="text-emerald-800">{currentPalika.seasonalRotations?.baahramase?.cropName || 'Arabica Coffee / Mandarin'}</strong>
              </div>
            </div>
          </div>

          {/* Target Palika Rotations */}
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2.5">
            <div className="font-bold text-indigo-950 font-outfit text-xs flex items-center justify-between">
              <span>🌱 {targetPalika.name} 4-Season Cycle:</span>
              <span className="text-[10px] font-mono text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">Benchmark Target</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="text-slate-600">🌧️ Monsoon (Barkhe):</span>
                <strong className="text-slate-900">{targetPalika.seasonalRotations?.barkhe?.cropName || 'Paddy / Maize'}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="text-slate-600">❄️ Winter (Hiunde):</span>
                <strong className="text-slate-900">{targetPalika.seasonalRotations?.hiunde?.cropName || 'Winter Wheat / Potato'}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="text-slate-600">☀️ Spring (Chaite):</span>
                <strong className="text-slate-900">{targetPalika.seasonalRotations?.chaite?.cropName || 'Spring Maize / Veg'}</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-indigo-100 flex justify-between items-center">
                <span className="text-slate-600">☕ Perennial (Baahramase):</span>
                <strong className="text-indigo-800">{targetPalika.seasonalRotations?.baahramase?.cropName || 'Arabica Coffee / Mandarin'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Comparative Strategic Insights ─── */}
      <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-indigo-900 font-outfit uppercase tracking-wider text-[11px]">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          Comparative Strategic Synthesis:
        </div>
        <p className="leading-relaxed">
          {currentPalika.elevation > targetPalika.elevation
            ? `• ${currentPalika.name} sits at higher mountain altitude (${currentPalika.elevation}m vs ${targetPalika.elevation}m in ${targetPalika.name}), giving it an agro-climatic advantage for cooler temperate horticulture (Seed Potato, Mountain Buckwheat, Orthodox Tea) with reduced pest incubation.`
            : `• ${currentPalika.name} lies at warmer mid-hill/valley elevation (${currentPalika.elevation}m vs ${targetPalika.elevation}m in ${targetPalika.name}), providing higher thermal sum (Growing Degree Days) ideal for premium Arabica Coffee, Mandarin Orange, and Multi-Cropping.`}
        </p>
        <p className="leading-relaxed">
          {`• Precipitation differential: ${currentPalika.rainfallMm >= targetPalika.rainfallMm ? `${currentPalika.name} receives +${currentPalika.rainfallMm - targetPalika.rainfallMm} mm/yr more rainfall` : `${targetPalika.name} receives +${targetPalika.rainfallMm - currentPalika.rainfallMm} mm/yr more rainfall`}, influencing irrigation infrastructure requirements for dry season cash crops.`}
        </p>
      </div>
    </div>
  );
};
