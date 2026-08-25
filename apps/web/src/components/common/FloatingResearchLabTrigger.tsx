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
  const [hasVisitedLab, setHasVisitedLab] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // When user enters the lab (screen 7), mark as visited
  useEffect(() => {
    if (activeScreen === 7) {
      setHasVisitedLab(true);
    }
  }, [activeScreen]);

  // Determine if it should be in compact circular icon mode
  // It is circular when user has visited and returned, unless hovered
  const isCollapsed = hasVisitedLab && !isInsideLab && !isHovered;

  return (
    <div
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 select-none transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Outer Aurora Pulse Glow */}
      <div className={`absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 blur-md transition-all duration-500 animate-pulse ${
        isCollapsed ? 'rounded-full opacity-70' : 'rounded-2xl opacity-60 hover:opacity-100 hover:blur-lg'
      }`}></div>

      {/* Main Glassmorphic Button (Morphs between Pill and Circle) */}
      <button
        onClick={isInsideLab ? onExitResearchLab : onOpenResearchLab}
        className={`relative flex items-center transition-all duration-300 backdrop-blur-xl border shadow-2xl cursor-pointer ${
          isInsideLab
            ? 'px-4 py-3 rounded-2xl bg-slate-900/95 text-purple-200 border-purple-400/60 hover:bg-slate-800'
            : isCollapsed
              ? 'w-13 h-13 rounded-full bg-slate-950/95 border-purple-500/50 justify-center hover:scale-110 shadow-purple-900/30'
              : 'px-4 py-3 rounded-2xl bg-slate-950/90 text-white border-purple-500/40 hover:border-purple-400 hover:scale-[1.02]'
        }`}
        title="WEFES Open Research & Formula Sandbox (v2.0 Preview)"
      >
        {/* Animated Icon & Ping Dot */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className={`rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-inner transition-all duration-300 ${
            isCollapsed ? 'w-10 h-10 rounded-full' : 'w-8 h-8'
          }`}>
            {isInsideLab ? (
              <ArrowLeft className="w-4 h-4 text-white" />
            ) : (
              <FlaskConical className="w-4 h-4 text-purple-200" />
            )}
          </div>

          {!isInsideLab && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-slate-900"></span>
            </span>
          )}
        </div>

        {/* Text Details (Hidden when in compact circular mode) */}
        {!isCollapsed && (
          <div className="text-left font-outfit ml-3 overflow-hidden whitespace-nowrap animate-fade-in">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-white">
                {isInsideLab ? 'Exit Research Lab' : 'Research Sandbox'}
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-purple-500/30 text-purple-300 border border-purple-400/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-none mt-0.5">
              {isInsideLab ? 'Return to previous view' : 'Formula Overrides & Python SDK'}
            </p>
          </div>
        )}

        {/* Action Arrow Icon (Hidden when in circular mode) */}
        {!isCollapsed && (
          <div className="pl-3 text-purple-400 hover:text-white transition-colors shrink-0">
            {isInsideLab ? (
              <X className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        )}
      </button>

      {/* Floating Tooltip when in collapsed circular mode */}
      {isCollapsed && isHovered && (
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white border border-purple-500/40 text-xs font-outfit shadow-xl whitespace-nowrap animate-fade-in flex items-center gap-1.5 pointer-events-none">
          <FlaskConical className="w-3.5 h-3.5 text-purple-400" />
          <span>Research Sandbox</span>
          <span className="text-[9px] font-mono bg-purple-500/30 text-purple-300 px-1 py-0.2 rounded">v2.0</span>
        </div>
      )}
    </div>
  );
};
