import React from 'react';
import { History, Trash2, ArrowRight, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { ScanHistoryItem } from '../types.ts';
import { playBeep } from '../utils/audio.ts';

interface ScanHistoryProps {
  history: ScanHistoryItem[];
  onSelectScan: (item: ScanHistoryItem) => void;
  onDeleteScan: (id: string) => void;
  onClearHistory: () => void;
  onStartNewScan: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  history,
  onSelectScan,
  onDeleteScan,
  onClearHistory,
  onStartNewScan,
}) => {
  if (history.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto pb-28 px-4 pt-12 flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <History className="w-8 h-8 stroke-[1.8]" />
        </div>
        <div>
          <h2 className="text-base font-display font-bold text-white">No Scan History Yet</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
            Your previous face scans and age predictions will be stored here locally.
          </p>
        </div>
        <button
          onClick={onStartNewScan}
          className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Perform Your First Scan</span>
        </button>
      </div>
    );
  }

  // Calculate summary stats
  const avgAge = Math.round(
    history.reduce((acc, curr) => acc + curr.result.predictedAge, 0) / history.length
  );
  const avgSkinAge = Math.round(
    history.reduce((acc, curr) => acc + curr.result.biologicalSkinAge, 0) / history.length
  );

  return (
    <div className="w-full max-w-md mx-auto pb-28 px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-teal-400" />
            <span>Biometric History</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {history.length} saved {history.length === 1 ? 'scan' : 'scans'} in device storage
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Clear all scan history?')) {
              playBeep(400, 0.08);
              onClearHistory();
            }
          }}
          className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
          aria-label="Clear all history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Aggregate Stats Bar */}
      <div className="grid grid-cols-2 gap-3 p-3.5 rounded-3xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Average Perceived Age</span>
          <div className="font-display font-bold text-2xl text-white mt-0.5">{avgAge}y</div>
          <span className="text-[10px] text-slate-500">Across {history.length} scans</span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 font-medium">Average Skin Age</span>
          <div className="font-display font-bold text-2xl text-teal-300 mt-0.5">{avgSkinAge}y</div>
          <span className="text-[10px] text-teal-400">
            {avgAge - avgSkinAge > 0
              ? `${avgAge - avgSkinAge}y youthful margin`
              : 'Consistent dermal health'}
          </span>
        </div>
      </div>

      {/* Scans List */}
      <div className="space-y-2.5">
        {history.map((item) => {
          const delta = item.result.vitalityDelta;
          return (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center gap-3 transition-colors group"
            >
              {/* Thumbnail */}
              <div
                onClick={() => onSelectScan(item)}
                className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 cursor-pointer"
              >
                <img
                  src={item.imageData}
                  alt="Scan thumbnail"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Info */}
              <div
                onClick={() => onSelectScan(item)}
                className="flex-1 min-w-0 cursor-pointer text-left"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-display font-bold text-base text-white">
                    {item.result.predictedAge}y
                  </span>
                  <span className="text-[11px] text-teal-300 font-medium">
                    Skin {item.result.biologicalSkinAge}y
                  </span>
                  {delta < 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {Math.abs(delta)}y younger
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>{item.dateFormatted}</span>
                  <span aria-hidden="true">·</span>
                  <span className="truncate text-slate-300 font-medium">
                    {item.result.vitalityRating}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onSelectScan(item)}
                  className="min-h-[44px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors"
                  aria-label="View report"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    playBeep(450, 0.05);
                    onDeleteScan(item.id);
                  }}
                  className="min-h-[44px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-rose-400 transition-colors"
                  aria-label="Delete scan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
