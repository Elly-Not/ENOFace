export interface EmotionMetric {
  label: string;
  score: number;
}

export interface SkinVitalityMetrics {
  smoothness: number;
  elasticityEstimate: number;
  underEyeFreshness: number;
  glowIndex: number;
  sunExposureIndex: number;
}

export interface FacialFeatures {
  faceShape: string;
  eyeShape: string;
  keyHighlight: string;
  distinctiveFeature: string;
}

export interface StyleAndVibe {
  vibeEra: string;
  stylePersona: string;
  colorTone: string;
}

export interface CelebrityVibeMatch {
  celebrityName: string;
  matchEraOrAge: string;
  reasoning: string;
}

export interface TimeProgressionMilestone {
  label: string;
  simulatedAge: number;
  description: string;
}

export interface AgeAnalysisResult {
  detectedFace: boolean;
  errorMessage?: string;
  predictedAge: number;
  ageRange: {
    min: number;
    max: number;
  };
  confidencePercent: number;
  biologicalSkinAge: number;
  vitalityDelta: number;
  vitalityRating: string;
  perceivedGender: string;
  dominantEmotion: string;
  emotionBreakdown: EmotionMetric[];
  skinVitalityMetrics: SkinVitalityMetrics;
  facialFeatures: FacialFeatures;
  styleAndVibe: StyleAndVibe;
  celebrityVibeMatch: CelebrityVibeMatch;
  timeProgression: TimeProgressionMilestone[];
  longevityTips: string[];
  funFactOrCompliment: string;
  scannedAt?: string;
  imageUrl?: string;
  userClaimedAge?: number;
}

export interface DuelAnalysisResult {
  face1: {
    age: number;
    skinAge: number;
    glow: number;
  };
  face2: {
    age: number;
    skinAge: number;
    glow: number;
  };
  youngerFace: string;
  ageDifference: number;
  verdict: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: number;
  dateFormatted: string;
  imageData: string;
  result: AgeAnalysisResult;
  userClaimedAge?: number;
}

export interface DemoPortrait {
  id: string;
  name: string;
  estimatedAge: number;
  imagePath: string;
  tagline: string;
}
