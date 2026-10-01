import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, User, AlertCircle } from 'lucide-react';
import { DEMO_PORTRAITS } from '../data/demoPortraits.ts';
import { playScanLaser, playShutterSound, playBeep } from '../utils/audio.ts';

interface FaceScannerProps {
  onAnalyze: (imageBase64: string, userClaimedAge?: number) => Promise<void>;
  isAnalyzing: boolean;
}

export const FaceScanner: React.FC<FaceScannerProps> = ({ onAnalyze, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userClaimedAge, setUserClaimedAge] = useState<string>('');
  const [showAgeInput, setShowAgeInput] = useState<boolean>(false);
  const [analysisPhase, setAnalysisPhase] = useState<string>('Initializing neural scan...');

  // Cycle analysis phases during loading
  useEffect(() => {
    if (!isAnalyzing) return;
    const phases = [
      'Detecting facial landmarks & symmetry...',
      'Assessing dermal texture & micro-elasticity...',
      'Calculating chronological & biological skin age...',
      'Projecting aesthetic aura & temporal timeline...',
    ];
    let idx = 0;
    setAnalysisPhase(phases[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setAnalysisPhase(phases[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Start camera stream
  const startCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      setCameraError(null);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1080 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setSelectedImage(null);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable. You can upload any selfie or photo directly below.');
      setCameraActive(false);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Switch front/back camera
  const handleToggleFacingMode = () => {
    playBeep(650, 0.05);
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  // Capture photo from video feed
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    playShutterSound();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontally if front camera for natural mirror selfie
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setSelectedImage(dataUrl);
    stopCamera();

    // Trigger analysis
    playScanLaser();
    const claimedAgeNum = userClaimedAge ? parseInt(userClaimedAge, 10) : undefined;
    onAnalyze(dataUrl, claimedAgeNum);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);
      stopCamera();
      playScanLaser();
      const claimedAgeNum = userClaimedAge ? parseInt(userClaimedAge, 10) : undefined;
      onAnalyze(dataUrl, claimedAgeNum);
    };
    reader.readAsDataURL(file);
  };

  // Quick demo portrait select
  const handleSelectDemo = async (demoImgPath: string) => {
    playScanLaser();
    stopCamera();
    setSelectedImage(demoImgPath);

    // Convert image to base64
    try {
      const response = await fetch(demoImgPath);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const claimedAgeNum = userClaimedAge ? parseInt(userClaimedAge, 10) : undefined;
        onAnalyze(base64, claimedAgeNum);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load demo portrait:', err);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pb-24 px-4 pt-3">
      {/* Title & Guidance Header */}
      <div className="w-full max-w-sm text-center mb-3">
        <h1 className="text-xl font-display font-bold text-white tracking-tight">
          AI Biometric Age Scanner
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Scan your face to predict perceived age, biological skin age, and vitality aura.
        </p>
      </div>

      {/* Main Viewfinder / Scanner Area */}
      <div className="relative w-full max-w-[340px] aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center">
        {/* Video feed */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
          } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />

        {/* Selected Static Image Preview */}
        {!cameraActive && selectedImage && (
          <img
            src={selectedImage}
            alt="Target portrait"
            className="w-full h-full object-cover"
          />
        )}

        {/* Placeholder when no camera and no image selected */}
        {!cameraActive && !selectedImage && (
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Camera className="w-8 h-8 stroke-[1.8]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Ready to Scan Face</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[220px]">
                Turn on camera or select a photo to begin neural biometric analysis.
              </p>
            </div>
            <button
              onClick={() => startCamera('user')}
              className="min-h-[44px] px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md shadow-teal-500/20 active:scale-95 flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Enable Camera</span>
            </button>
          </div>
        )}

        {/* Biometric Framing Reticle (Always visible on active camera or during scan) */}
        {(cameraActive || isAnalyzing) && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
            {/* Oval Face Guide */}
            <div className="w-[82%] h-[90%] rounded-[50%/42%] border-2 border-dashed border-teal-400/60 relative">
              {/* Corner targeting brackets */}
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-teal-300" />
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-teal-300" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-teal-300" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-teal-300" />

              {/* Eye line crosshair */}
              <div className="absolute top-[42%] left-[15%] right-[15%] h-[1px] bg-teal-400/30" />
              <div className="absolute top-[42%] left-[32%] w-1.5 h-1.5 rounded-full bg-teal-300/80 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-[42%] right-[32%] w-1.5 h-1.5 rounded-full bg-teal-300/80 translate-x-1/2 -translate-y-1/2" />

              {/* Nose & Chin anchor points */}
              <div className="absolute top-[56%] left-1/2 w-1.5 h-1.5 rounded-full bg-teal-300/80 -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-[72%] left-1/2 w-2 h-0.5 bg-teal-300/80 -translate-x-1/2" />
            </div>

            {/* Cyber Scanning Laser Line */}
            {isAnalyzing && (
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_12px_#2dd4bf] animate-scanline" />
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-12 h-12 rounded-full border-2 border-teal-400/20 border-t-teal-400 animate-spin mb-3" />
            <span className="font-display font-bold text-sm text-white">Analyzing Biometrics</span>
            <span className="text-xs text-teal-300 font-mono mt-1 px-3 py-1 rounded bg-teal-950/60 border border-teal-800/40">
              {analysisPhase}
            </span>
          </div>
        )}

        {/* Camera top-right control: Switch camera */}
        {cameraActive && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={handleToggleFacingMode}
              className="w-10 h-10 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700/60 flex items-center justify-center text-white active:scale-95 transition-transform"
              aria-label="Switch camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Camera error notification if any */}
      {cameraError && (
        <div className="w-full max-w-[340px] mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200/90 leading-tight">{cameraError}</p>
        </div>
      )}

      {/* Main Touch Action Zone (Natural Reach Zone) */}
      <div className="w-full max-w-[340px] mt-4 flex items-center justify-center gap-4">
        {/* Upload Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => {
            playBeep(480, 0.05);
            fileInputRef.current?.click();
          }}
          disabled={isAnalyzing}
          className="min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-slate-400" />
          <span>Upload</span>
        </button>

        {/* Big Primary Shutter / Camera Toggle Button */}
        {cameraActive ? (
          <button
            onClick={handleCapturePhoto}
            disabled={isAnalyzing}
            className="w-16 h-16 rounded-full bg-teal-500 p-1 flex items-center justify-center shadow-lg shadow-teal-500/30 active:scale-95 transition-transform disabled:opacity-50"
            aria-label="Take photo"
          >
            <div className="w-13 h-13 rounded-full border-2 border-slate-950 bg-white flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-teal-500" />
            </div>
          </button>
        ) : (
          <button
            onClick={() => startCamera()}
            disabled={isAnalyzing}
            className="min-h-[48px] px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-teal-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4 stroke-[2.2]" />
            <span>Open Camera</span>
          </button>
        )}

        {/* Optional Age Input Toggle */}
        <button
          onClick={() => {
            playBeep(520, 0.04);
            setShowAgeInput(!showAgeInput);
          }}
          className={`min-h-[44px] px-3 py-2.5 rounded-2xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
            showAgeInput || userClaimedAge
              ? 'bg-teal-500/10 border-teal-500/40 text-teal-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          title="Provide actual age to test accuracy"
        >
          <User className="w-4 h-4" />
          <span>{userClaimedAge ? `${userClaimedAge}y` : 'Actual Age'}</span>
        </button>
      </div>

      {/* Expandable Actual Age Input Field */}
      {showAgeInput && (
        <div className="w-full max-w-[340px] mt-3 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-2">
          <div className="text-left">
            <p className="text-xs font-medium text-slate-200">Your Actual Age (Optional)</p>
            <p className="text-[10px] text-slate-400">Calculates precise Vitality Delta</p>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="10"
              max="110"
              value={userClaimedAge}
              onChange={(e) => setUserClaimedAge(e.target.value)}
              placeholder="e.g. 28"
              className="w-16 h-9 px-2 text-center font-mono font-semibold bg-slate-950 border border-slate-700 rounded-lg text-teal-300 focus:outline-none focus:border-teal-400 text-sm"
            />
            {userClaimedAge && (
              <button
                onClick={() => setUserClaimedAge('')}
                className="text-[10px] text-slate-500 hover:text-slate-300 px-1"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Demo Portraits Gallery: Instant 1-Tap Testing */}
      <div className="w-full max-w-[360px] mt-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-semibold text-slate-300">Instant Demo Portraits</span>
          </div>
          <span className="text-[10px] text-slate-500">Tap to test AI</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {DEMO_PORTRAITS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleSelectDemo(demo.imagePath)}
              disabled={isAnalyzing}
              className="group flex flex-col items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-teal-500/50 active:scale-95 transition-all text-left disabled:opacity-50"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-1 relative">
                <img
                  src={demo.imagePath}
                  alt={demo.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1 right-1 bg-slate-950/80 font-mono text-[9px] text-teal-300 font-semibold px-1 rounded">
                  ~{demo.estimatedAge}y
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-300 truncate w-full text-center">
                {demo.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
