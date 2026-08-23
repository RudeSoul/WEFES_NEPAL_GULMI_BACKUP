import React, { useState } from 'react';
import { DistrictPalika, DISTRICT_PALIKAS } from '../data/districtPalikaAssets';
import { GitCompare, ArrowRight, CheckCircle2, TrendingUp, Mountain, CloudRain, Thermometer, Sparkles, Scale } from 'lucide-react';

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

const GULMI_DISTRICT_AVERAGE: Partial<DistrictPalika> = {
  name: 'Gulmi District Benchmark',
  elevation: 1450,
  avgTempC: 17.8,
  rainfallMm: 1750,
  soilPh: 6.5,
  feasibleCropsCount: 7,
};

export const PalikaBenchmarkingWidget: React.FC<PalikaBenchmarkingWidgetProps> = ({
  currentPalika,
  lang = 'en'
}) => {
  const allPalikas = DISTRICT_PALIKAS['gulmi'] || [];
  const [compareTargetId, setCompareTargetId] = useState<string>('average');

  const targetPalika: Partial<DistrictPalika> = compareTargetId === 'average'
    ? GULMI_DISTRICT_AVERAGE
    : (allPalikas.find(p => p.name === compareTargetId) || GULMI_DISTRICT_AVERAGE);

  const elevDelta = (currentPalika.elevation || 0) - (targetPalika.elevation || 0);
  const rainDelta = (currentPalika.rainfallMm || 0) - (targetPalika.rainfallMm || 0);
  const tempDelta = Number(((currentPalika.avgTempC || 0) - (targetPalika.avgTempC || 0)).toFixed(1));
  const phDelta = Number(((currentPalika.soilPh || 0) - (targetPalika.soilPh || 0)).toFixed(2));

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-200/90 shadow-sm bg-white/95 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-outfit flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600" />
            <span>{lang === 'np' ? 'पालिका तुलनात्मक मूल्याङ्कन' : 'Head-to-Head Palika Benchmark'}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'np'
              ? `${currentPalika.name} (${GULMI_PALIKA_NEPALI[currentPalika.name] || ''}) लाई अन्य स्थानीय तह वा जिल्ला औषतसँग तुलना गर्नुहोस्।`
              : `Compare ${currentPalika.name} directly with other local bodies or the district average.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Compare with:</span>
          <select
            value={compareTargetId}
            onChange={(e) => setCompareTargetId(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="average">📊 Gulmi District Average (औषत)</option>
            {allPalikas.filter(p => p.name !== currentPalika.name).map(p => (
              <option key={p.name} value={p.name}>
                {p.name} ({GULMI_PALIKA_NEPALI[p.name] || p.unitType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Scoreboard Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Elevation Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <Mountain className="w-3.5 h-3.5 text-slate-600" />
              Elevation
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              elevDelta > 0 ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {elevDelta >= 0 ? `+${elevDelta}m` : `${elevDelta}m`}
            </span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">{currentPalika.elevation}m</div>
            <div className="text-[11px] text-slate-500 font-sans">Target: {targetPalika.elevation}m</div>
          </div>
        </div>

        {/* Rainfall Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <CloudRain className="w-3.5 h-3.5 text-sky-600" />
              Precipitation
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              rainDelta > 0 ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {rainDelta >= 0 ? `+${rainDelta}mm` : `${rainDelta}mm`}
            </span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-sky-950 font-mono">{currentPalika.rainfallMm} <span className="text-xs font-normal">mm/yr</span></div>
            <div className="text-[11px] text-slate-500 font-sans">Target: {targetPalika.rainfallMm} mm</div>
          </div>
        </div>

        {/* Temperature Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              Avg Temp
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              tempDelta > 0 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {tempDelta >= 0 ? `+${tempDelta}°C` : `${tempDelta}°C`}
            </span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-950 font-mono">{currentPalika.avgTempC}°C</div>
            <div className="text-[11px] text-slate-500 font-sans">Target: {targetPalika.avgTempC}°C</div>
          </div>
        </div>

        {/* Soil pH Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Soil pH
            </span>
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              phDelta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {phDelta >= 0 ? `+${phDelta}` : `${phDelta}`}
            </span>
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-950 font-mono">pH {currentPalika.soilPh}</div>
            <div className="text-[11px] text-slate-500 font-sans">Target: pH {targetPalika.soilPh}</div>
          </div>
        </div>
      </div>

      {/* Comparative Key Takeaways Banner */}
      <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1.5">
        <div className="font-bold flex items-center gap-1.5 text-indigo-900 font-outfit uppercase tracking-wider text-[11px]">
          <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          Comparative Strategic Insights:
        </div>
        <p className="leading-relaxed">
          {currentPalika.elevation > (targetPalika.elevation || 1450)
            ? `• ${currentPalika.name} sits at higher mountain altitude (${currentPalika.elevation}m vs ${targetPalika.elevation}m), creating superior micro-climatic conditions for temperate crops such as Seed Potato and High-Mountain Buckwheat, with lower pest pressure.`
            : `• ${currentPalika.name} lies at warmer mid-hill/valley elevation (${currentPalika.elevation}m vs ${targetPalika.elevation}m), offering longer growing degree days ideal for specialty Arabica Coffee, Mandarin Orange, and Double/Triple Cropping.`}
        </p>
        <p className="leading-relaxed">
          {currentPalika.soilPh < 6.2
            ? `• Soil is slightly more acidic (pH ${currentPalika.soilPh}); strategic application of agricultural lime (कृषि चुन) will unlock optimal nutrient uptake.`
            : `• Soil pH (${currentPalika.soilPh}) is in the optimal near-neutral buffer range for diverse cash crop cultivation.`}
        </p>
      </div>
    </div>
  );
};
