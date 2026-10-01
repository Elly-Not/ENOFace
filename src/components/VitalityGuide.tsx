import React from 'react';
import { BookOpen, Sun, Moon, Droplets, Heart, Sparkles, HelpCircle, Shield } from 'lucide-react';

export const VitalityGuide: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto pb-28 px-4 pt-3 space-y-4 text-left">
      <div>
        <h1 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-400" />
          <span>Facial Longevity Guide</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Understanding the science of biological skin age and longevity habits.
        </p>
      </div>

      {/* Concept Card: Chronological vs Biological */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-display font-bold text-white">
            Chronological vs. Biological Skin Age
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Chronological age</strong> is the simple number of calendar years you have lived.
          In contrast, <strong>biological skin age</strong> measures the cellular resilience, elasticity,
          hydration retention, and photo-damage profile of your dermis.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Through deliberate daily habits (sun protection, restorative REM sleep, hydration, and antioxidants),
          many individuals maintain a biological skin age 5 to 10 years younger than their calendar age!
        </p>
      </div>

      {/* The 4 Core Pillars */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
        <h2 className="text-sm font-display font-bold text-white">
          The 4 Pillars of Youthful Vitality
        </h2>

        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">1. UV Protection (SPF 50+)</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Up to 80% of visible facial aging is driven by ultraviolet photo-aging which breaks down collagen fibres. Daily broad-spectrum SPF is non-negotiable.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">2. Epidermal Barrier & Hydration</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Hyaluronic acid, ceramides, and adequate water intake preserve skin plumpness and immediately reduce the depth of fine expression lines.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">3. Glymphatic Sleep Drainage</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                During stage-3 deep sleep, human growth hormone surges and capillary microcirculation flushes under-eye toxins, eliminating chronic puffiness and dark rings.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-white">4. Anti-Glycation Nutrition</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Refined sugars bond with collagen molecules to form brittle advanced glycation end-products (AGEs). Berries, leafy greens, and polyphenols protect against this stiffening.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-teal-500/20 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-teal-400" />
          <h2 className="text-xs font-semibold text-white">Privacy & Biometric Guarantee</h2>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          AuraAge analyzes facial imagery solely in ephemeral memory to return predictions. Your photos are never stored on public servers or sold. History is stored exclusively in your own browser's local storage.
        </p>
      </div>

      {/* FAQ */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          <h2 className="text-sm font-display font-bold text-white">Tips for Maximum Accuracy</h2>
        </div>

        <div className="space-y-2 text-xs text-slate-300">
          <p>
            • <strong>Soft, even lighting:</strong> Harsh overhead light or side shadows can exaggerate wrinkles or create artificial hollows.
          </p>
          <p>
            • <strong>Neutral or gentle smile:</strong> Relaxed facial muscles allow the neural model to observe baseline dermal elasticity accurately.
          </p>
          <p>
            • <strong>Direct front angle:</strong> Looking directly into the camera ensures symmetric landmark mapping across both cheekbones and eye contours.
          </p>
        </div>
      </div>
    </div>
  );
};
