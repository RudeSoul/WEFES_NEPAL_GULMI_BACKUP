import React from 'react';
import {
  Droplets, Zap, Sprout, Trees, Coins, MapPin, Mountain,
  Layers, Landmark, ArrowRight, CheckCircle2, Globe2, FlaskConical
} from 'lucide-react';
import { WEFESPillar } from '@wefes/shared-types';

interface HeaderProps {
  activeScreen: number;
  setActiveScreen: (screen: number) => void;
  selectedPillar?: WEFESPillar;
  setSelectedPillar?: (pillar: WEFESPillar) => void;
  selectedDistrictName?: string;
  selectedCropName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  setActiveScreen,
  selectedPillar,
  setSelectedPillar,
  selectedDistrictName = 'Gulmi',
  selectedCropName,
}) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/90 px-4 lg:px-8 py-2.5 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">

        {/* Logo & Platform Title */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveScreen(1)}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border border-emerald-500/40 flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
            <Mountain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-outfit">
                WEFES NEXUS · GULMI
              </h1>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                गुल्मी जिल्ला
              </span>
              <span className="hidden sm:inline-flex bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                Lumbini Province • Hill Zone
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              Integrated WEFES Nexus & Sustainable Agro-Ecological Decision Support System
            </p>
          </div>
        </div>

        {/* Journey Step Navigation Pills */}
        <div className="flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto max-w-full">
          {/* Step 1: Map */}
          <button
            onClick={() => setActiveScreen(1)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeScreen === 1
                ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Gulmi Map</span>
          </button>

          {/* Step 2: District */}
          <button
            onClick={() => setActiveScreen(2)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeScreen === 2
                ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <span>2. Gulmi Detail</span>
          </button>

          {/* Step 3: Analysis */}
          <button
            onClick={() => selectedCropName && setActiveScreen(4)}
            disabled={!selectedCropName}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeScreen === 4
                ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80'
                : selectedCropName
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer'
                  : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>3. {selectedCropName ? `${selectedCropName} Report` : 'Analysis'}</span>
          </button>

          {/* Step 4: Simulator */}
          <button
            onClick={() => selectedCropName && setActiveScreen(5)}
            disabled={!selectedCropName}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeScreen === 5
                ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/80'
                : selectedCropName
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer'
                  : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
          >
            <span>4. Simulator</span>
          </button>

          {/* Step 5: Sovereign Dossier */}
          <button
            onClick={() => selectedCropName && setActiveScreen(6)}
            disabled={!selectedCropName}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${activeScreen === 6
                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                : selectedCropName
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 font-semibold cursor-pointer'
                  : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>5. Sovereign Dossier</span>
          </button>
        </div>

      </div>
    </header>
  );
};
