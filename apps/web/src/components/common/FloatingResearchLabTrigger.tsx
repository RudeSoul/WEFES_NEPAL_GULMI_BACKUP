import React, { useState, useEffect } from 'react';
import { FlaskConical, ArrowRight, ArrowLeft, X, Sparkles } from 'lucide-react';

interface FloatingResearchLabTriggerProps {
  activeScreen: number;
  onOpenResearchLab: () => void;
  onExitResearchLab: () => void;
}

export const FloatingResearchLabTrigger: React.FC<FloatingResearchLabTriggerProps> = ({
  activeScreen,
  onOpenResearchLab,
  onExitResearchLab,
}) => {
  const isInsideLab = activeScreen === 7;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 blur-md transition-all duration-300 rounded-full opacity-60 hover:opacity-100 animate-pulse"></div>

      {/* Main Circular Icon Button */}
      <button
        onClick={isInsideLab ? onExitResearchLab : onOpenResearchLab}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-xl border shadow-2xl cursor-pointer hover:scale-110 ${
          isInsideLab
            ? 'bg-slate-900/95 text-purple-200 border-purple-400/60 hover:bg-slate-800 shadow-purple-900/40'
            : 'bg-slate-950/95 text-white border-purple-500/50 hover:border-purple-400 shadow-purple-900/30'
        }`}
        title={isInsideLab ? 'Exit Research Lab' : 'Research Sandbox'}
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-inner">
          {isInsideLab ? (
            <ArrowLeft className="w-4 h-4 text-white" />
          ) : (
            <FlaskConical className="w-4 h-4 text-purple-200" />
          )}
        </div>

        {!isInsideLab && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
          </span>
        )}
      </button>

      {/* Sleek Tooltip on Hover */}
      {isHovered && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-950/95 text-white border border-purple-500/40 text-xs font-outfit shadow-2xl whitespace-nowrap animate-fade-in flex items-center gap-1.5 pointer-events-none backdrop-blur-md">
          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
          <span>{isInsideLab ? 'Exit Research Lab' : 'Research Sandbox'}</span>
          <span className="text-[9px] font-mono bg-purple-500/30 text-purple-300 px-1 py-0.2 rounded border border-purple-400/30">v2.0</span>
        </div>
      )}
    </div>
  );
};
