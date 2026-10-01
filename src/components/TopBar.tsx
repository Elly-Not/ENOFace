import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled, playBeep } from '../utils/audio.ts';

interface TopBarProps {
  activeTab: string;
  historyCount: number;
  onOpenHistory: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ historyCount, onOpenHistory }) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    setSoundEnabled(newState);
    if (newState) {
      playBeep(700, 0.08);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 h-14 flex items-center justify-between">
      {/* Brand Zone: Clean, single wordmark */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center shadow-sm shadow-teal-500/20">
          <Sparkles className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-lg tracking-tight text-white leading-none">
            AuraAge
          </span>
          <span className="text-[10px] text-teal-400 font-mono tracking-wider">
            AI BIOMETRIC VISION
          </span>
        </div>
      </div>

      {/* Right Action Zone */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleSound}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-teal-300 transition-colors"
          title={soundOn ? 'Mute audio' : 'Unmute audio'}
          aria-label={soundOn ? 'Mute audio' : 'Unmute audio'}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 opacity-50" />}
        </button>

        <button
          onClick={onOpenHistory}
          className="min-h-[44px] px-3 flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          aria-label={`View history, ${historyCount} scans`}
        >
          <span className="font-mono text-teal-400 tabular-nums font-semibold">{historyCount}</span>
          <span>Scans</span>
        </button>
      </div>
    </header>
  );
};
