import React from 'react';
import { Droplets, Zap, Sprout, Trees, Coins } from 'lucide-react';
import { WEFESPillar } from '@wefes/shared-types';

interface PillarFilterProps {
  selectedPillar: WEFESPillar;
  onSelectPillar: (pillar: WEFESPillar) => void;
}

interface PillarConfig {
  id: WEFESPillar;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
  iconColor: string;
}

export const PillarFilter: React.FC<PillarFilterProps> = ({
  selectedPillar,
  onSelectPillar
}) => {
  const pillars: PillarConfig[] = [
    {
      id: 'water',
      label: 'Water',
      icon: <Droplets className="w-4 h-4" />,
      activeClass: 'bg-white text-sky-950 border-sky-300 shadow-2xs font-bold ring-2 ring-sky-500/20',
      iconColor: 'text-sky-600',
    },
    {
      id: 'energy',
      label: 'Energy',
      icon: <Zap className="w-4 h-4" />,
      activeClass: 'bg-white text-amber-950 border-amber-300 shadow-2xs font-bold ring-2 ring-amber-500/20',
      iconColor: 'text-amber-600',
    },
    {
      id: 'food',
      label: 'Food',
      icon: <Sprout className="w-4 h-4" />,
      activeClass: 'bg-white text-emerald-950 border-emerald-300 shadow-2xs font-bold ring-2 ring-emerald-500/20',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'ecosystem',
      label: 'Ecosystem',
      icon: <Trees className="w-4 h-4" />,
      activeClass: 'bg-white text-teal-950 border-teal-300 shadow-2xs font-bold ring-2 ring-teal-500/20',
      iconColor: 'text-teal-600',
    },
    {
      id: 'socioeconomics',
      label: 'Socioeconomics',
      icon: <Coins className="w-4 h-4" />,
      activeClass: 'bg-white text-purple-950 border-purple-300 shadow-2xs font-bold ring-2 ring-purple-500/20',
      iconColor: 'text-purple-600',
    }
  ];

  return (
    <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto max-w-full">
      {pillars.map((pillar) => {
        const isSelected = selectedPillar === pillar.id;
        return (
          <button
            key={pillar.id}
            onClick={() => onSelectPillar(pillar.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-outfit font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap border select-none ${
              isSelected
                ? pillar.activeClass
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span className={`flex items-center justify-center shrink-0 ${isSelected ? pillar.iconColor : 'text-slate-400'}`}>
              {pillar.icon}
            </span>
            <span>{pillar.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PillarFilter;

