import React, { useState, useRef } from 'react';
import { Swords, Upload, Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { DuelAnalysisResult } from '../types.ts';
import { DEMO_PORTRAITS } from '../data/demoPortraits.ts';
import { playScanLaser, playSuccessChime, playBeep } from '../utils/audio.ts';

export const AgeDuel: React.FC = () => {
  const [image1, setImage1] = useState<string | null>(null);
  const [image2, setImage2] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [duelResult, setDuelResult] = useState<DuelAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInput1Ref = useRef<HTMLInputElement | null>(null);
  const fileInput2Ref = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (slot === 1) setImage1(dataUrl);
      else setImage2(dataUrl);
      setDuelResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadDemoDuel = async () => {
    try {
      playBeep(550, 0.05);
      setImage1(DEMO_PORTRAITS[0].imagePath); // Elena (24)
      setImage2(DEMO_PORTRAITS[1].imagePath); // Marcus (31)
      setDuelResult(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunDuel = async () => {
    if (!image1 || !image2) {
      setErrorMessage('Please upload or select both photos to compare.');
      return;
    }

    try {
      setIsComparing(true);
      setErrorMessage(null);
      playScanLaser();

      // Convert image paths to base64 if needed
      const getBase64 = async (src: string) => {
        if (src.startsWith('data:')) return src;
        const res = await fetch(src);
        const blob = await res.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      };

      const b64_1 = await getBase64(image1);
      const b64_2 = await getBase64(image2);

      const response = await fetch('/api/duel-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image1Base64: b64_1,
          image2Base64: b64_2,
        }),
      });

      if (!response.ok) {
        throw new Error('Comparison failed');
      }

      const data: DuelAnalysisResult = await response.json();
      setDuelResult(data);
      playSuccessChime();
    } catch (err: any) {
      console.error('Duel compare error:', err);
      setErrorMessage('Could not compare faces. Ensure both photos contain visible faces.');
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    playBeep(450, 0.05);
    setImage1(null);
    setImage2(null);
    setDuelResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full max-w-md mx-auto pb-28 px-4 pt-3 space-y-4">
      <div className="text-center">
        <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center justify-center gap-2">
          <Swords className="w-5 h-5 text-teal-400" />
          <span>Face-Off Age Duel</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Compare two faces side-by-side: who appears younger and more radiant?
        </p>
      </div>

      {/* Duel Slots Container */}
      <div className="grid grid-cols-2 gap-3 relative">
        {/* Slot 1 */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-400 mb-1.5">Person 1</span>
          <div
            onClick={() => fileInput1Ref.current?.click()}
            className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 hover:border-teal-500/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer relative group transition-all"
          >
            {image1 ? (
              <img src={image1} alt="Person 1" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 block">Upload Face 1</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInput1Ref}
              onChange={(e) => handleFileUpload(e, 1)}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Central VS Badge */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-950 border border-teal-500/60 flex items-center justify-center text-teal-300 font-mono font-bold text-xs shadow-lg">
          VS
        </div>

        {/* Slot 2 */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-400 mb-1.5">Person 2</span>
          <div
            onClick={() => fileInput2Ref.current?.click()}
            className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-900 border-2 border-dashed border-slate-800 hover:border-teal-500/50 flex flex-col items-center justify-center p-3 text-center cursor-pointer relative group transition-all"
          >
            {image2 ? (
              <img src={image2} alt="Person 2" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-slate-400 block">Upload Face 2</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInput2Ref}
              onChange={(e) => handleFileUpload(e, 2)}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs text-amber-400 text-center bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
          {errorMessage}
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLoadDemoDuel}
          disabled={isComparing}
          className="min-h-[44px] px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Demo Match</span>
        </button>

        <button
          onClick={handleRunDuel}
          disabled={isComparing || !image1 || !image2}
          className="flex-1 min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-98 transition-all disabled:opacity-50"
        >
          <Swords className="w-4 h-4 stroke-[2.2]" />
          <span>{isComparing ? 'Analyzing Match...' : 'Start Face-Off'}</span>
        </button>

        {(image1 || image2 || duelResult) && (
          <button
            onClick={handleReset}
            className="min-h-[44px] px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center active:scale-95 transition-all"
            aria-label="Reset duel"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Duel Results Card */}
      {duelResult && (
        <div className="p-4 rounded-3xl bg-slate-900 border border-teal-500/30 space-y-4 shadow-2xl">
          {/* Winner Banner */}
          <div className="text-center p-3 rounded-2xl bg-gradient-to-r from-teal-950/80 to-slate-950 border border-teal-500/40">
            <div className="flex items-center justify-center gap-1.5 text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Face-Off Winner</span>
            </div>
            <p className="font-display font-extrabold text-xl text-white">
              {duelResult.youngerFace} Appears Younger!
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Margin: <span className="font-mono font-bold text-teal-300">{duelResult.ageDifference} years</span> difference
            </p>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 gap-3">
            {/* Person 1 Stats */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
              <span className="text-[11px] text-slate-400 font-semibold">Person 1</span>
              <div className="font-display font-bold text-3xl text-white">
                {duelResult.face1?.age}y
              </div>
              <div className="text-[11px] text-slate-400">
                Skin Age: <span className="font-mono text-teal-300">{duelResult.face1?.skinAge}y</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Glow: <span className="font-mono text-teal-300">{duelResult.face1?.glow}%</span>
              </div>
            </div>

            {/* Person 2 Stats */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-center">
              <span className="text-[11px] text-slate-400 font-semibold">Person 2</span>
              <div className="font-display font-bold text-3xl text-white">
                {duelResult.face2?.age}y
              </div>
              <div className="text-[11px] text-slate-400">
                Skin Age: <span className="font-mono text-teal-300">{duelResult.face2?.skinAge}y</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Glow: <span className="font-mono text-teal-300">{duelResult.face2?.glow}%</span>
              </div>
            </div>
          </div>

          {/* AI Verdict */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 leading-relaxed text-center">
            <span className="font-semibold text-teal-400 block mb-0.5">AI Biometric Verdict</span>
            {duelResult.verdict}
          </div>
        </div>
      )}
    </div>
  );
};
