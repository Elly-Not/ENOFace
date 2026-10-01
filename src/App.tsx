import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { FaceScanner } from './components/FaceScanner.tsx';
import { AnalysisDashboard } from './components/AnalysisDashboard.tsx';
import { AgeDuel } from './components/AgeDuel.tsx';
import { ScanHistory } from './components/ScanHistory.tsx';
import { VitalityGuide } from './components/VitalityGuide.tsx';
import { AgeAnalysisResult, ScanHistoryItem } from './types.ts';
import { playSuccessChime, playBeep } from './utils/audio.ts';
import { AlertCircle, X } from 'lucide-react';

const STORAGE_KEY = 'auraage_scan_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'duel' | 'history' | 'guide'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<AgeAnalysisResult | null>(null);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Save history to localStorage
  const saveHistoryItem = (result: AgeAnalysisResult, imageData: string, claimedAge?: number) => {
    const newItem: ScanHistoryItem = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      dateFormatted: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      imageData,
      result: {
        ...result,
        scannedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        userClaimedAge: claimedAge,
      },
      userClaimedAge: claimedAge,
    };

    const updated = [newItem, ...history].slice(0, 30); // keep up to 30 items
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage quota exceeded, could not persist image');
    }
  };

  // Run Age Analysis
  const handleAnalyze = async (imageBase64: string, userClaimedAge?: number) => {
    try {
      setIsAnalyzing(true);
      setErrorMessage(null);

      const response = await fetch('/api/analyze-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          userClaimedAge,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze portrait');
      }

      const data: AgeAnalysisResult = await response.json();

      if (!data.detectedFace) {
        setErrorMessage(data.errorMessage || 'No clear human face was detected in this photo. Please position your face or a well-lit portrait in the center!');
        playBeep(300, 0.2, 'sawtooth');
        return;
      }

      setCurrentImageSrc(imageBase64);
      setCurrentResult({
        ...data,
        userClaimedAge,
      });

      saveHistoryItem(data, imageBase64, userClaimedAge);
      playSuccessChime();
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Biometric analysis encountered an error. Please try again with clear lighting.');
      playBeep(300, 0.2, 'sawtooth');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScanAnother = () => {
    playBeep(500, 0.05);
    setCurrentResult(null);
    setCurrentImageSrc(null);
    setActiveTab('scan');
  };

  const handleSelectHistoryItem = (item: ScanHistoryItem) => {
    playBeep(600, 0.05);
    setCurrentImageSrc(item.imageData);
    setCurrentResult(item.result);
    setActiveTab('scan');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center font-sans antialiased">
      {/* Mobile-constrained canvas container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-slate-950 relative shadow-2xl border-x border-slate-900">
        {/* Top App Bar */}
        <TopBar
          activeTab={activeTab}
          historyCount={history.length}
          onOpenHistory={() => {
            playBeep(520, 0.04);
            setCurrentResult(null);
            setActiveTab('history');
          }}
        />

        {/* Global Error Banner if face not found or network glitch */}
        {errorMessage && (
          <div className="m-3 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start justify-between gap-2 z-20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 leading-snug">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white p-1"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Tab Content */}
        <main className="flex-1 w-full overflow-y-auto">
          {activeTab === 'scan' && (
            <>
              {currentResult && currentImageSrc ? (
                <AnalysisDashboard
                  result={currentResult}
                  imageSrc={currentImageSrc}
                  onScanAnother={handleScanAnother}
                  onOpenDuel={() => {
                    playBeep(550, 0.05);
                    setActiveTab('duel');
                  }}
                />
              ) : (
                <FaceScanner onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
              )}
            </>
          )}

          {activeTab === 'duel' && <AgeDuel />}

          {activeTab === 'history' && (
            <ScanHistory
              history={history}
              onSelectScan={handleSelectHistoryItem}
              onDeleteScan={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              onStartNewScan={() => {
                setCurrentResult(null);
                setActiveTab('scan');
              }}
            />
          )}

          {activeTab === 'guide' && <VitalityGuide />}
        </main>

        {/* Fixed Mobile Bottom Navigation Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            // If switching to scan when we already have a result, we can keep it or clear depending on preference
            setActiveTab(tab);
          }}
        />
      </div>
    </div>
  );
}
