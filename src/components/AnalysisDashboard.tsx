import React, { useState } from 'react';
import {
  Download,
  Share2,
  RotateCcw,
  Sparkles,
  Heart,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Award,
} from 'lucide-react';
import { AgeAnalysisResult } from '../types.ts';
import { generateBiometricPassImage } from '../utils/idCardGenerator.ts';
import { playBeep, playSuccessChime } from '../utils/audio.ts';

interface AnalysisDashboardProps {
  result: AgeAnalysisResult;
  imageSrc: string;
  onScanAnother: () => void;
  onOpenDuel: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({
  result,
  imageSrc,
  onScanAnother,
  onOpenDuel,
}) => {
  const [selectedMilestoneIdx, setSelectedMilestoneIdx] = useState<number>(1); // default 'Current'
  const [isGeneratingPass, setIsGeneratingPass] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const delta = result.vitalityDelta;
  const isSkinYounger = delta < 0;

  const handleDownloadPass = async () => {
    try {
      setIsGeneratingPass(true);
      playBeep(600, 0.06);
      const passDataUrl = await generateBiometricPassImage(imageSrc, result);

      const link = document.createElement('a');
      link.href = passDataUrl;
      link.download = `AuraAge_BiometricPass_${result.predictedAge}yo.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      playSuccessChime();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate pass:', err);
    } finally {
      setIsGeneratingPass(false);
    }
  };

  const handleShare = async () => {
    playBeep(520, 0.05);
    const textToShare = `My AuraAge AI scan estimated my age as ${result.predictedAge} (Skin Age: ${result.biologicalSkinAge}) with a "${result.vitalityRating}" vibe! ✨`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AuraAge Biometric Scan',
          text: textToShare,
          url: window.location.href,
        });
      } catch {
        // user cancelled share
      }
    } else {
      navigator.clipboard?.writeText(textToShare);
      alert('Result copied to clipboard!');
    }
  };

  const currentMilestone = result.timeProgression?.[selectedMilestoneIdx] || {
    label: 'Current',
    simulatedAge: result.predictedAge,
    description: 'Balanced dermal structure and radiant vitality.',
  };

  return (
    <div className="w-full max-w-md mx-auto pb-28 px-4 pt-3 space-y-4">
      {/* Top Controls: Scan Another & Share */}
      <div className="flex items-center justify-between">
        <button
          onClick={onScanAnother}
          className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>New Scan</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="min-h-[44px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all"
            aria-label="Share result"
          >
            <Share2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Share</span>
          </button>

          <button
            onClick={handleDownloadPass}
            disabled={isGeneratingPass}
            className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingPass ? 'Rendering...' : 'Save Pass'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Age Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-5 shadow-2xl">
        {/* Glowing backdrop accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4">
          {/* Portrait Thumbnail */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-teal-500/50 shadow-md shrink-0">
            <img
              src={imageSrc}
              alt="Analyzed portrait"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/80 text-center py-0.5">
              <span className="text-[9px] font-mono text-teal-300 font-bold">VERIFIED</span>
            </div>
          </div>

          {/* Main Predicted Age Stat */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Perceived Chronological Age</span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-display font-extrabold text-5xl text-white tracking-tight leading-none">
                {result.predictedAge}
              </span>
              <span className="text-sm font-medium text-slate-400">years old</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-mono text-slate-300">
                Range {result.ageRange.min}–{result.ageRange.max}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-teal-400 font-semibold">
                {result.confidencePercent}% confidence
              </span>
            </div>
          </div>
        </div>

        {/* Biological Skin Age & Vitality Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col">
            <span className="text-[11px] text-slate-400 font-medium">Biological Skin Age</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-display font-bold text-2xl text-teal-300">
                {result.biologicalSkinAge}
              </span>
              <span className="text-xs text-slate-400">years</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-[11px]">
              {isSkinYounger ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">
                    {Math.abs(delta)}y younger than perceived!
                  </span>
                </>
              ) : delta === 0 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-teal-400 font-medium">Exact age alignment</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-400 font-medium">+{delta}y skin maturity</span>
                </>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-medium">Vitality Rating</span>
              <p className="font-display font-bold text-sm text-white mt-0.5 leading-snug">
                {result.vitalityRating}
              </p>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-teal-400 font-medium mt-1">
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{result.dominantEmotion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Claimed Age Comparison if provided */}
      {result.userClaimedAge && (
        <div className="p-3 rounded-2xl bg-teal-950/30 border border-teal-800/40 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-300 font-medium">Your Actual Age: </span>
            <span className="font-mono font-bold text-white">{result.userClaimedAge} years</span>
          </div>
          <div className="text-right">
            {result.predictedAge < result.userClaimedAge ? (
              <span className="text-emerald-400 font-semibold">
                You look {result.userClaimedAge - result.predictedAge} years younger than actual! 🎉
              </span>
            ) : result.predictedAge === result.userClaimedAge ? (
              <span className="text-teal-300 font-semibold">Spot-on prediction! 🎯</span>
            ) : (
              <span className="text-slate-300 font-medium">
                Predicted {result.predictedAge - result.userClaimedAge}y mature appearance
              </span>
            )}
          </div>
        </div>
      )}

      {/* Time Machine Aging Progression Slider / Milestones */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-display font-bold text-white">
              Time Machine Aging Projection
            </h2>
          </div>
          <span className="text-[11px] font-mono text-teal-400 font-semibold">
            {currentMilestone.simulatedAge} yrs
          </span>
        </div>

        {/* Milestone Buttons */}
        <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800/80">
          {result.timeProgression?.map((item, idx) => {
            const isActive = selectedMilestoneIdx === idx;
            return (
              <button
                key={item.label}
                onClick={() => {
                  playBeep(450 + idx * 80, 0.04);
                  setSelectedMilestoneIdx(idx);
                }}
                className={`py-2 px-1 rounded-xl text-center transition-all ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[10px] uppercase tracking-tight">{item.label}</div>
                <div className={`text-xs font-mono mt-0.5 ${isActive ? 'text-slate-950 font-extrabold' : 'text-slate-300'}`}>
                  {item.simulatedAge}y
                </div>
              </button>
            );
          })}
        </div>

        {/* Milestone Description Box */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-teal-300 mr-1.5">
            {currentMilestone.label} ({currentMilestone.simulatedAge} years):
          </span>
          {currentMilestone.description}
        </div>
      </div>

      {/* Skin Health & Dermal Metrics Breakdown */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-display font-bold text-white">Dermal Health Metrics</h2>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">0 - 100 AI INDEX</span>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'Skin Smoothness & Texture', score: result.skinVitalityMetrics?.smoothness || 85 },
            { label: 'Firmness & Elasticity', score: result.skinVitalityMetrics?.elasticityEstimate || 80 },
            { label: 'Under-Eye Freshness', score: result.skinVitalityMetrics?.underEyeFreshness || 82 },
            { label: 'Natural Dermal Glow', score: result.skinVitalityMetrics?.glowIndex || 88 },
            { label: 'Photo-Aging Resilience', score: 100 - (result.skinVitalityMetrics?.sunExposureIndex || 20) },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{item.label}</span>
                <span className="font-mono text-teal-400 font-semibold">{item.score}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, item.score))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Radiance Breakdown */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-teal-400" />
            <h2 className="text-sm font-display font-bold text-white">Emotional Aura & Expression</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">{result.dominantEmotion}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {result.emotionBreakdown?.map((emo) => (
            <div
              key={emo.label}
              className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between"
            >
              <span className="text-xs text-slate-300 truncate mr-2">{emo.label}</span>
              <span className="font-mono font-bold text-xs text-teal-400">{emo.score}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Facial Features & Aesthetic Match */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-sm font-display font-bold text-white">Facial Architecture & Style DNA</h2>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Face Geometry</span>
            <span className="font-medium text-slate-200 mt-0.5 block">{result.facialFeatures?.faceShape}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Eye Expression</span>
            <span className="font-medium text-slate-200 mt-0.5 block">{result.facialFeatures?.eyeShape}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Style Persona</span>
            <span className="font-medium text-teal-300 mt-0.5 block">{result.styleAndVibe?.stylePersona}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Era Aesthetic</span>
            <span className="font-medium text-teal-300 mt-0.5 block">{result.styleAndVibe?.vibeEra}</span>
          </div>
        </div>

        {/* Celebrity Lookalike Match */}
        {result.celebrityVibeMatch && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-teal-400 font-semibold uppercase">
                Celebrity Vibe Match
              </span>
              <span className="text-[10px] text-slate-500">
                {result.celebrityVibeMatch.matchEraOrAge}
              </span>
            </div>
            <p className="font-display font-bold text-sm text-white mt-1">
              {result.celebrityVibeMatch.celebrityName}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {result.celebrityVibeMatch.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Personalized Longevity Action Plan */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-display font-bold text-white">Longevity & Skincare Protocol</h2>
        </div>

        <div className="space-y-2">
          {result.longevityTips?.map((tip, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800/70 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed"
            >
              <div className="w-5 h-5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                0{idx + 1}
              </div>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charismatic Compliment Card */}
      {result.funFactOrCompliment && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-teal-950/40 to-slate-900 border border-teal-800/30 text-center">
          <p className="text-xs italic text-teal-200">
            "{result.funFactOrCompliment}"
          </p>
        </div>
      )}

      {/* Bottom Sticky Action Bar: Download Pass / Duel */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          onClick={handleDownloadPass}
          disabled={isGeneratingPass}
          className="w-full min-h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 active:scale-98 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4 stroke-[2.2]" />
          <span>{isGeneratingPass ? 'Generating High-Res Pass...' : 'Download Biometric ID Pass'}</span>
        </button>

        <button
          onClick={onOpenDuel}
          className="w-full min-h-[44px] rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
        >
          <span>Try Face-Off Age Duel (Compare 2 Photos)</span>
        </button>
      </div>
    </div>
  );
};
