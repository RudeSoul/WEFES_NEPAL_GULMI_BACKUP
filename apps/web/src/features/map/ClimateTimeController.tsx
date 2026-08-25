import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Calendar, Clock, RotateCcw } from 'lucide-react';

interface ClimateTimeControllerProps {
  year: number;
  month: number;
  mode: 'monthly' | 'annual' | 'climatology';
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onModeChange: (mode: 'monthly' | 'annual' | 'climatology') => void;
  minYear?: number;
  maxYear?: number;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const ClimateTimeController: React.FC<ClimateTimeControllerProps> = ({
  year,
  month,
  mode,
  onYearChange,
  onMonthChange,
  onModeChange,
  minYear = 1984,
  maxYear = 2024,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(800); // 800ms per month frame

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (month >= 12) {
          onYearChange(year >= maxYear ? minYear : year + 1);
          onMonthChange(1);
        } else {
          onMonthChange(month + 1);
        }
      }, speedMs);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, year, month, speedMs, maxYear, minYear, onMonthChange, onYearChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="glass-panel p-3 rounded-xl flex flex-col gap-2.5 border border-slate-200 shadow-sm animate-fade-in-up bg-white/95">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Indicator & Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 font-outfit uppercase tracking-wider text-[11px]">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Time-Series Engine</span>
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => onModeChange('monthly')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${mode === 'monthly'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Monthly Frame
            </button>
            <button
              onClick={() => onModeChange('annual')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${mode === 'annual'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Annual Avg
            </button>
            <button
              onClick={() => onModeChange('climatology')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${mode === 'climatology'
                ? 'bg-white text-slate-900 font-semibold shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              39-Yr Climatology
            </button>
          </div>
        </div>

        {/* Right: Playback & Year Selector */}
        <div className="flex items-center gap-2 ">
          {/* Play / Pause Animation Button */}
          <button
            onClick={togglePlay}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm ${isPlaying
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
              : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            title={isPlaying ? 'Pause animation' : 'Play monthly time-series animation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current " />}
            <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
          </button>

          {/* Speed Selector */}
          <select
            value={speedMs}
            onChange={(e) => setSpeedMs(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-[11px] rounded-lg px-2 py-1 font-mono focus:outline-none shadow-sm cursor-pointer"
          >
            <option value={1200}>0.75x Speed</option>
            <option value={800}>1.0x Speed</option>
            <option value={400}>2.0x Speed</option>
            <option value={200}>4.0x Speed</option>
          </select>

          {/* Year Dropdown */}
          <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={year}
              disabled={mode === 'climatology'}
              onChange={(e) => onYearChange(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-bold font-mono text-xs focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i).map((y) => (
                <option key={y} value={y} className="bg-white text-slate-900">
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Horizon notice for post-2019 selections */}
          {year > 2019 && mode !== 'climatology' && (
            <span className="hidden sm:inline-flex text-[9px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-mono">
              MERRA-2 Series (1981–2019)
            </span>
          )}
        </div>
      </div>

      {/* Month Playhead Timeline Slider */}
      {mode !== 'annual' && (
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {MONTH_NAMES.map((name, idx) => {
            const m = idx + 1;
            const isActive = month === m;
            return (
              <button
                key={name}
                onClick={() => onMonthChange(m)}
                className={`flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all text-center cursor-pointer ${isActive
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClimateTimeController;
