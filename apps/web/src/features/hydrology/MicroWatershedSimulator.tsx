import React, { useState } from 'react';
import { CloudRain, Droplets, Waves, Mountain, AlertTriangle, ShieldCheck, Gauge, TrendingUp, Info } from 'lucide-react';
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface MicroWatershedSimulatorProps {
  currentRainMm?: number;
  climateMonth?: number;
  lang?: 'en' | 'np';
}

interface RiverBasinData {
  id: string;
  nameEn: string;
  nameNp: string;
  majorRiver: string;
  catchmentSqKm: number;
  palikasCovered: string[];
  baseFlowM3s: number;
  runoffCoefficient: number;
  dhmStation: string;
  springVulnerability: 'Low' | 'Moderate' | 'High' | 'Critical';
  irrigationOfftakesCount: number;
  headElevationM: number;
  confluenceElevationM: number;
}

const GULMI_RIVER_BASINS: RiverBasinData[] = [
  {
    id: 'kaligandaki',
    nameEn: 'Kali Gandaki River Basin Corridor',
    nameNp: 'कालीगण्डकी नदी जलाधार क्षेत्र',
    majorRiver: 'Kali Gandaki (कालीगण्डकी)',
    catchmentSqKm: 420,
    palikasCovered: ['Kaligandaki', 'Satyawati', 'Ruru'],
    baseFlowM3s: 280,
    runoffCoefficient: 0.72,
    dhmStation: 'DHM #410 Seti Beni (546m)',
    springVulnerability: 'Moderate',
    irrigationOfftakesCount: 14,
    headElevationM: 1850,
    confluenceElevationM: 480,
  },
  {
    id: 'badigad',
    nameEn: 'Badigad Khola Sub-Catchment',
    nameNp: 'बडिगाड खोला उप-जलाधार',
    majorRiver: 'Badigad Khola (बडिगाड खोला)',
    catchmentSqKm: 310,
    palikasCovered: ['Musikot', 'Isma', 'Dhurkot'],
    baseFlowM3s: 42,
    runoffCoefficient: 0.68,
    dhmStation: 'DHM #430 Rudrabeni (465m)',
    springVulnerability: 'High',
    irrigationOfftakesCount: 22,
    headElevationM: 2150,
    confluenceElevationM: 520,
  },
  {
    id: 'ridi',
    nameEn: 'Ridi Khola Watershed Corridor',
    nameNp: 'रुरु-रिडी खोला जलाधार क्षेत्र',
    majorRiver: 'Ridi Khola (रिडी खोला)',
    catchmentSqKm: 240,
    palikasCovered: ['Resunga', 'Gulmidarbar', 'Chatrakot', 'Chandrakot'],
    baseFlowM3s: 16,
    runoffCoefficient: 0.65,
    dhmStation: 'DHM #435 Tamghas Gauge (1480m)',
    springVulnerability: 'Critical',
    irrigationOfftakesCount: 18,
    headElevationM: 2690,
    confluenceElevationM: 450,
  },
  {
    id: 'panaha',
    nameEn: 'Panaha & Chhaldi Khola Highland Headwaters',
    nameNp: 'पनाहा तथा छल्दी खोला जलाधार',
    majorRiver: 'Panaha / Chhaldi Khola (पनाहा/छल्दी)',
    catchmentSqKm: 180,
    palikasCovered: ['Madane', 'Malika'],
    baseFlowM3s: 8.5,
    runoffCoefficient: 0.75,
    dhmStation: 'Madane Lekh Micro-Logger (1750m)',
    springVulnerability: 'Critical',
    irrigationOfftakesCount: 9,
    headElevationM: 2690,
    confluenceElevationM: 850,
  },
];

export const MicroWatershedSimulator: React.FC<MicroWatershedSimulatorProps> = ({
  currentRainMm = 150,
  climateMonth = 7,
  lang = 'en',
}) => {
  const [selectedBasinId, setSelectedBasinId] = useState<string>('kaligandaki');
  const [rainModifier, setRainModifier] = useState<number>(currentRainMm);

  const activeBasin = GULMI_RIVER_BASINS.find(b => b.id === selectedBasinId) || GULMI_RIVER_BASINS[0];

  // Dynamic Rational Streamflow Estimation: Q = C * (P / (30 days * 86400s)) * Area
  const rainIntensityMPerSec = (rainModifier / 1000) / (30 * 86400);
  const catchmentAreaSqM = activeBasin.catchmentSqKm * 1000000;
  const estimatedMonsoonRunoffM3s = Number(
    (activeBasin.baseFlowM3s + activeBasin.runoffCoefficient * rainIntensityMPerSec * catchmentAreaSqM).toFixed(1)
  );

  const sedimentTransportTonsPerDay = Math.round(estimatedMonsoonRunoffM3s * 28.5 * (rainModifier > 250 ? 2.4 : 1.0));
  const isFloodSurge = estimatedMonsoonRunoffM3s > activeBasin.baseFlowM3s * 3.5;

  return (
    <div className="glass-panel p-4 rounded-2xl border border-sky-200 bg-white/95 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sky-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-outfit uppercase tracking-wide flex items-center gap-2">
              <span>{lang === 'np' ? 'गुल्मी नदी जलाधार तथा बाढी-प्रवाह सिम्युलेटर' : 'Gulmi Micro-Watershed & River Streamflow Simulator'}</span>
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full font-mono font-bold">
                DHM Hydrology Mode
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              {lang === 'np'
                ? 'नदी बहाव, जलाधार रिचार्ज, र मुहान सुक्ने जोखिम विश्लेषण'
                : 'Hydrological streamflow discharge, spring recharge & sediment load analysis'}
            </p>
          </div>
        </div>

        {/* Month Selector Sync */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs font-mono">
          <CloudRain className="w-3.5 h-3.5 text-sky-600" />
          <span className="text-slate-600">Active Month:</span>
          <strong className="text-slate-900">{MONTH_NAMES[climateMonth - 1]}</strong>
          <span className="text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded font-bold ml-1">{rainModifier} mm/mo</span>
        </div>
      </div>

      {/* Basin Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {GULMI_RIVER_BASINS.map(basin => {
          const isSelected = basin.id === selectedBasinId;
          return (
            <button
              key={basin.id}
              onClick={() => setSelectedBasinId(basin.id)}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-sky-500 text-white border-sky-600 shadow-sm ring-1 ring-sky-400'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              }`}
            >
              <div className="text-xs font-bold font-outfit truncate">{lang === 'np' ? basin.nameNp : basin.nameEn}</div>
              <div className={`text-[10px] mt-1 flex items-center justify-between ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                <span>{basin.catchmentSqKm} km²</span>
                <span className="font-mono font-semibold">{basin.palikasCovered.length} Palikas</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Hydrology Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Metric 1: Streamflow Discharge */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/60 p-3.5 rounded-xl border border-sky-200">
          <div className="flex items-center justify-between text-xs text-sky-900 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-600" />
              Estimated Discharge ($Q$)
            </span>
            <span className="text-[10px] bg-sky-200/80 text-sky-900 px-1.5 py-0.5 rounded font-mono font-bold">
              m³/sec
            </span>
          </div>
          <div className="text-2xl font-black text-sky-950 font-mono mt-1">
            {estimatedMonsoonRunoffM3s.toLocaleString()} <span className="text-sm font-sans font-bold text-sky-700">m³/s</span>
          </div>
          <p className="text-[10px] text-sky-800 mt-1 font-sans">
            Base dry-season flow: <strong>{activeBasin.baseFlowM3s} m³/s</strong> • Runoff coefficient ($C$): <strong>{activeBasin.runoffCoefficient}</strong>
          </p>
          {isFloodSurge && (
            <div className="mt-2 text-[10px] bg-amber-100 border border-amber-300 text-amber-900 px-2 py-1 rounded-md flex items-center gap-1 font-semibold animate-pulse">
              <AlertTriangle className="w-3 h-3 text-amber-700 shrink-0" />
              <span>High Monsoon Flash-Runoff Surge Detected</span>
            </div>
          )}
        </div>

        {/* Metric 2: Spring Vulnerability & Elevation Head */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100/60 p-3.5 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-800 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <Mountain className="w-4 h-4 text-slate-600" />
              Hydraulic Relief & Springs
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              activeBasin.springVulnerability === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-800'
            }`}>
              {activeBasin.springVulnerability} Drying Risk
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {activeBasin.headElevationM - activeBasin.confluenceElevationM}m <span className="text-sm font-sans font-bold text-slate-500">Fall</span>
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            Ridge Head: <strong>{activeBasin.headElevationM}m</strong> → Confluence: <strong>{activeBasin.confluenceElevationM}m</strong>
          </p>
          <div className="mt-2 text-[10px] text-slate-700 bg-white p-1.5 rounded border border-slate-200 font-mono flex items-center justify-between">
            <span>Canal Offtakes: <strong>{activeBasin.irrigationOfftakesCount} Kulos</strong></span>
            <span>Station: <strong>{activeBasin.dhmStation.split('(')[0]}</strong></span>
          </div>
        </div>

        {/* Metric 3: Sediment Transport Load */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-3.5 rounded-xl border border-amber-200">
          <div className="flex items-center justify-between text-xs text-amber-900 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              Sediment & Erosion Yield
            </span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
              Tons/Day
            </span>
          </div>
          <div className="text-2xl font-black text-amber-950 font-mono mt-1">
            {sedimentTransportTonsPerDay.toLocaleString()} <span className="text-sm font-sans font-bold text-amber-800">t/d</span>
          </div>
          <p className="text-[10px] text-amber-800 mt-1">
            Silt load during {MONTH_NAMES[climateMonth - 1]} precipitation rate ({rainModifier} mm)
          </p>
          <div className="mt-2 text-[10px] bg-white/80 p-1.5 rounded border border-amber-200 text-slate-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Bio-engineering plantation recommended along riparian banks</span>
          </div>
        </div>
      </div>

      {/* Rainfall Surge Simulation Slider */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="font-semibold text-slate-800">
            {lang === 'np' ? 'वर्षा तीव्रता सिम्युलेसन:' : 'Precipitation Surge Simulator:'}
          </span>
          <span className="font-mono font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
            {rainModifier} mm/month
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <span className="text-[10px] text-slate-500 font-mono">10mm</span>
          <input
            type="range"
            min={10}
            max={600}
            step={10}
            value={rainModifier}
            onChange={e => setRainModifier(Number(e.target.value))}
            className="w-full accent-sky-600 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-mono">600mm</span>
          <button
            onClick={() => setRainModifier(currentRainMm)}
            className="text-[10px] text-sky-700 hover:text-sky-900 bg-white border border-slate-300 px-2 py-0.5 rounded cursor-pointer shrink-0 font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
