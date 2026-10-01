import React from 'react';
import { ScanFace, Swords, History, BookOpen } from 'lucide-react';
import { playBeep } from '../utils/audio.ts';

interface BottomNavProps {
  activeTab: 'scan' | 'duel' | 'history' | 'guide';
  onChangeTab: (tab: 'scan' | 'duel' | 'history' | 'guide') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'scan' as const, label: 'Scan Face', icon: ScanFace },
    { id: 'duel' as const, label: 'Age Duel', icon: Swords },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'guide' as const, label: 'Longevity', icon: BookOpen },
  ];

  const handleTabClick = (tabId: 'scan' | 'duel' | 'history' | 'guide') => {
    playBeep(520, 0.04);
    onChangeTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-slate-800/80 px-2 pb-safe max-w-md mx-auto">
      <div className="grid grid-cols-4 items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
                isActive ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-teal-500/10' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
              </div>
              <span className={`text-[11px] font-medium tracking-tight mt-0.5 ${isActive ? 'font-semibold text-teal-300' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
