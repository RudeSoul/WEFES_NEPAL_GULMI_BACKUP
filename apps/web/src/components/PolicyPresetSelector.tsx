import React from 'react';
import { Sprout, Droplets, Zap, Sparkles, Coins, Compass } from 'lucide-react';
import { WEFESPillar } from '@wefes/shared-types';

interface PolicyPresetSelectorProps {
  onApplyPreset: (pillar: WEFESPillar, subFilters: Record<string, string>, cropId?: string) => void;
  activePillar: WEFESPillar;
  lang: 'en' | 'np';
}

interface PresetItem {
  id: string;
  pillar: WEFESPillar;
  icon: any;
  color: string;
  title: string;
  desc: string;
  subFilters: Record<string, string>;
  cropId?: string;
}

export const PolicyPresetSelector: React.FC<PolicyPresetSelectorProps> = ({
  onApplyPreset,
  activePillar,
  lang
}) => {
  const presets: PresetItem[] = [
    {
      id: 'coffee_expansion',
      pillar: 'food' as WEFESPillar,
      icon: Sprout,
      color: 'emerald',
      title: lang === 'np' ? '☕ कफी पकेट विस्तार' : '☕ Coffee Expansion Zone',
      desc: lang === 'np' ? 'रुरु, सत्यवती र छत्रकोटमा उपयुक्तता' : 'Target Ruru, Satyawati & Chatrakot',
      subFilters: { foodMode: 'single_crop', crop: 'coffee' },
      cropId: 'coffee'
    },
    {
      id: 'spring_scarcity',
      pillar: 'water' as WEFESPillar,
      icon: Droplets,
      color: 'sky',
      title: lang === 'np' ? '💧 हिउँदे मुहान सुक्ने जोखिम' : '💧 Spring Drying Vulnerability',
      desc: lang === 'np' ? 'उच्च डाँडाका मुहान संरक्षण र रिचार्ज' : 'High ridge recharge & pond conservation',
      subFilters: { waterSubFilter: 'spring_vulnerability' }
    },
    {
      id: 'solar_lift',
      pillar: 'water' as WEFESPillar,
      icon: Zap,
      color: 'amber',
      title: lang === 'np' ? '⚡ सौर्य लिफ्ट सिँचाइ' : '⚡ Solar Lift Irrigation',
      desc: lang === 'np' ? 'नदी किनारबाट डाँडाको टारी खेतसम्म' : 'Pumping riverbeds to terrace farmland',
      subFilters: { waterSubFilter: 'irrigation_potential' }
    },
    {
      id: 'soil_liming',
      pillar: 'ecosystem' as WEFESPillar,
      icon: Sparkles,
      color: 'teal',
      title: lang === 'np' ? '🧪 माटो अम्लीयता र चुन' : '🧪 Soil pH & Liming Need',
      desc: lang === 'np' ? 'मदाने, मालिका र रेसुङ्गा ढलानमा उपचार' : 'Liming priority in acidic forest slopes',
      subFilters: { ecoSubFilter: 'soil_ph' }
    },
    {
      id: 'market_proximity',
      pillar: 'socioeconomics' as WEFESPillar,
      icon: Coins,
      color: 'indigo',
      title: lang === 'np' ? '🏛️ तम्घास बजार पहुँच' : '🏛️ Tamghas Market Access',
      desc: lang === 'np' ? 'सदरमुकामसम्मको सडक दूरी र ढुवानी' : 'Transport distance to commercial HQ',
      subFilters: { socioSubFilter: 'hq_market_proximity' }
    }
  ];

  return (
    <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs bg-white/95 space-y-2.5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-slate-800 font-bold uppercase tracking-wider flex items-center gap-1.5 text-xs font-outfit">
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          {lang === 'np' ? '१-क्लिक नीति तथा अनुसन्धान परिदृश्यहरू:' : '1-Click Policy & Research Scenarios:'}
        </span>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
          {lang === 'np' ? 'द्रुत निर्णय समर्थन' : 'Quick Decision Presets'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {presets.map(p => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => onApplyPreset(p.pillar, p.subFilters, p.cropId)}
              className="p-2.5 rounded-xl border text-left transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between gap-1.5 bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 truncate">
                  {p.title}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
