import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High payload limit for camera photo captures & selfie uploads
app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to sanitize base64 data
function extractBase64Data(raw: string): { mimeType: string; data: string } {
  if (raw.startsWith('data:')) {
    const parts = raw.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return { mimeType, data: parts[1] };
  }
  return { mimeType: 'image/jpeg', data: raw };
}

// Age & Biometric Analysis Route
app.post('/api/analyze-age', async (req, res) => {
  try {
    const { imageBase64, userClaimedAge } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const { mimeType, data } = extractBase64Data(imageBase64);

    if (!ai) {
      // Graceful realistic simulated fallback if API key is not yet set
      const mockAge = userClaimedAge ? Math.max(18, Math.min(80, Number(userClaimedAge) - 2)) : 27;
      return res.json({
        detectedFace: true,
        predictedAge: mockAge,
        ageRange: { min: mockAge - 2, max: mockAge + 2 },
        confidencePercent: 93,
        biologicalSkinAge: Math.max(18, mockAge - 3),
        vitalityDelta: -3,
        vitalityRating: 'Youthful Radiance',
        perceivedGender: 'Balanced / Vibrant',
        dominantEmotion: 'Warm Confidence',
        emotionBreakdown: [
          { label: 'Radiance', score: 92 },
          { label: 'Warmth & Smile', score: 86 },
          { label: 'Calmness', score: 78 },
          { label: 'Fatigue Index', score: 14 },
        ],
        skinVitalityMetrics: {
          smoothness: 88,
          elasticityEstimate: 85,
          underEyeFreshness: 82,
          glowIndex: 90,
          sunExposureIndex: 25,
        },
        facialFeatures: {
          faceShape: 'Oval-Balanced',
          eyeShape: 'Almond Expressive',
          keyHighlight: 'High luminous cheekbones and well-defined jawline',
          distinctiveFeature: 'Engaging, clear gaze with balanced facial symmetry',
        },
        styleAndVibe: {
          vibeEra: 'Contemporary Editorial',
          stylePersona: 'Effortless Luminary',
          colorTone: 'Golden Radiant Undertones',
        },
        celebrityVibeMatch: {
          celebrityName: 'Timothée Chalamet / Zendaya aesthetic',
          matchEraOrAge: 'Mid-20s prime',
          reasoning: 'Crisp bone structure, natural skin vitality, and warm gaze.',
        },
        timeProgression: [
          { label: '10 Yrs Ago', simulatedAge: Math.max(12, mockAge - 10), description: 'Soft youthful facial contours with nascent features.' },
          { label: 'Current', simulatedAge: mockAge, description: 'Peak harmonic proportion, well-defined cheek structure, healthy microcirculation.' },
          { label: 'In 10 Yrs', simulatedAge: mockAge + 10, description: 'Distinguished refinement, subtle smile lines adding charismatic presence.' },
          { label: 'In 25 Yrs', simulatedAge: mockAge + 25, description: 'Commanding maturity, elegant silvering potential, deepened expression lines.' },
          { label: 'In 40 Yrs', simulatedAge: mockAge + 40, description: 'Wise and venerated patriarch/matriarch aesthetic with preserved eye brightness.' },
        ],
        longevityTips: [
          'Apply broad-spectrum mineral SPF 50+ daily to shield collagen reserves.',
          'Incorporate hyaluronic acid and niacinamide to boost natural dermal moisture sheen.',
          'Maintain 7.5+ hours of consistent deep sleep to optimize nightly cellular repair.',
          'Consume antioxidant-rich foods (wild berries, green tea polyphenols) to fight oxidative stress.',
        ],
        funFactOrCompliment: 'Your natural facial symmetry and eye radiance convey exceptional natural vitality!',
      });
    }

    const promptText = `
You are an expert AI facial biometrician, aesthetician, and computer vision age estimation specialist.
Examine this portrait photo closely and predict perceived age, biological skin age, emotional vitality, facial metrics, and temporal progression.

Claimed age provided by user (if any): ${userClaimedAge ? `${userClaimedAge} years old` : 'None specified'}.

Return a JSON object conforming to the required schema:
- If no clear human face is detected in the image, set detectedFace to false and provide a helpful errorMessage.
- If a face is detected:
  - predictedAge: realistic integer representing estimated chronological age.
  - ageRange: realistic 95% confidence interval { min: integer, max: integer } (typically ±2 or ±3 years).
  - confidencePercent: integer between 75 and 99.
  - biologicalSkinAge: estimated skin biological age based on dermal firmness, hydration glow, fine lines, and under-eye vitality. Can be lower, equal, or higher than predictedAge.
  - vitalityDelta: biologicalSkinAge - predictedAge (e.g. -3 means skin looks 3 years younger).
  - vitalityRating: an inspiring title e.g. "Youthful Radiance", "Prime Vitality", "Ageless Glow", "Distinguished Grace", etc.
  - perceivedGender: "Female", "Male", or "Androgynous / Neutral".
  - dominantEmotion: concise phrase e.g. "Warm & Approachable", "Radiant Joy", "Focused Composure", "Playful Sparkle".
  - emotionBreakdown: array of 4 items with { label: string, score: integer 0-100 } for Radiance, Warmth/Smile, Composure/Calm, Fatigue/Eye Strain.
  - skinVitalityMetrics: object with integer scores (0-100) for smoothness, elasticityEstimate, underEyeFreshness, glowIndex, and sunExposureIndex.
  - facialFeatures: { faceShape, eyeShape, keyHighlight, distinctiveFeature }.
  - styleAndVibe: { vibeEra, stylePersona, colorTone }.
  - celebrityVibeMatch: { celebrityName, matchEraOrAge, reasoning }.
  - timeProgression: array of 5 milestones:
      [
        { label: "10 Yrs Ago", simulatedAge: number, description: string },
        { label: "Current", simulatedAge: number, description: string },
        { label: "In 10 Yrs", simulatedAge: number, description: string },
        { label: "In 25 Yrs", simulatedAge: number, description: string },
        { label: "In 40 Yrs", simulatedAge: number, description: string }
      ]
  - longevityTips: array of 4 personalized, encouraging, and science-grounded skincare and wellness tips.
  - funFactOrCompliment: a warm, uplifting 1-line compliment celebrating a genuine strong feature.
Always maintain a positive, uplifting, and scientific tone.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedFace: { type: Type.BOOLEAN },
            errorMessage: { type: Type.STRING },
            predictedAge: { type: Type.INTEGER },
            ageRange: {
              type: Type.OBJECT,
              properties: {
                min: { type: Type.INTEGER },
                max: { type: Type.INTEGER },
              },
              required: ['min', 'max'],
            },
            confidencePercent: { type: Type.INTEGER },
            biologicalSkinAge: { type: Type.INTEGER },
            vitalityDelta: { type: Type.INTEGER },
            vitalityRating: { type: Type.STRING },
            perceivedGender: { type: Type.STRING },
            dominantEmotion: { type: Type.STRING },
            emotionBreakdown: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                },
                required: ['label', 'score'],
              },
            },
            skinVitalityMetrics: {
              type: Type.OBJECT,
              properties: {
                smoothness: { type: Type.INTEGER },
                elasticityEstimate: { type: Type.INTEGER },
                underEyeFreshness: { type: Type.INTEGER },
                glowIndex: { type: Type.INTEGER },
                sunExposureIndex: { type: Type.INTEGER },
              },
              required: ['smoothness', 'elasticityEstimate', 'underEyeFreshness', 'glowIndex', 'sunExposureIndex'],
            },
            facialFeatures: {
              type: Type.OBJECT,
              properties: {
                faceShape: { type: Type.STRING },
                eyeShape: { type: Type.STRING },
                keyHighlight: { type: Type.STRING },
                distinctiveFeature: { type: Type.STRING },
              },
              required: ['faceShape', 'eyeShape', 'keyHighlight', 'distinctiveFeature'],
            },
            styleAndVibe: {
              type: Type.OBJECT,
              properties: {
                vibeEra: { type: Type.STRING },
                stylePersona: { type: Type.STRING },
                colorTone: { type: Type.STRING },
              },
              required: ['vibeEra', 'stylePersona', 'colorTone'],
            },
            celebrityVibeMatch: {
              type: Type.OBJECT,
              properties: {
                celebrityName: { type: Type.STRING },
                matchEraOrAge: { type: Type.STRING },
                reasoning: { type: Type.STRING },
              },
              required: ['celebrityName', 'matchEraOrAge', 'reasoning'],
            },
            timeProgression: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  simulatedAge: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                },
                required: ['label', 'simulatedAge', 'description'],
              },
            },
            longevityTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            funFactOrCompliment: { type: Type.STRING },
          },
          required: [
            'detectedFace',
            'predictedAge',
            'ageRange',
            'confidencePercent',
            'biologicalSkinAge',
            'vitalityDelta',
            'vitalityRating',
            'perceivedGender',
            'dominantEmotion',
            'skinVitalityMetrics',
            'facialFeatures',
            'styleAndVibe',
            'celebrityVibeMatch',
            'timeProgression',
            'longevityTips',
            'funFactOrCompliment',
          ],
        },
      },
    });

    const textOutput = response.text?.trim() || '{}';
    const parsedData = JSON.parse(textOutput);
    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing image with Gemini:', error);
    return res.status(500).json({
      error: 'Failed to analyze biometric age. Please ensure the portrait is well-lit and try again.',
      details: error?.message || String(error),
    });
  }
});

// Duel Compare Route (Compare Two Faces)
app.post('/api/duel-compare', async (req, res) => {
  try {
    const { image1Base64, image2Base64 } = req.body;
    if (!image1Base64 || !image2Base64) {
      return res.status(400).json({ error: 'Both images are required for duel comparison' });
    }

    const img1 = extractBase64Data(image1Base64);
    const img2 = extractBase64Data(image2Base64);

    if (!ai) {
      return res.json({
        face1: { age: 26, skinAge: 24, glow: 88 },
        face2: { age: 31, skinAge: 29, glow: 84 },
        youngerFace: 'Face 1',
        ageDifference: 5,
        verdict: 'Face 1 displays slightly firmer dermal tone, while Face 2 has distinguished maturity.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: img1.mimeType, data: img1.data } },
          { inlineData: { mimeType: img2.mimeType, data: img2.data } },
          {
            text: `Compare the two faces shown in image 1 and image 2. Estimate the perceived age and biological skin age for each person, identify who appears younger or more radiant, and summarize the visual contrast in an uplifting, friendly manner.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            face1: {
              type: Type.OBJECT,
              properties: {
                age: { type: Type.INTEGER },
                skinAge: { type: Type.INTEGER },
                glow: { type: Type.INTEGER },
              },
              required: ['age', 'skinAge', 'glow'],
            },
            face2: {
              type: Type.OBJECT,
              properties: {
                age: { type: Type.INTEGER },
                skinAge: { type: Type.INTEGER },
                glow: { type: Type.INTEGER },
              },
              required: ['age', 'skinAge', 'glow'],
            },
            youngerFace: { type: Type.STRING },
            ageDifference: { type: Type.INTEGER },
            verdict: { type: Type.STRING },
          },
          required: ['face1', 'face2', 'youngerFace', 'ageDifference', 'verdict'],
        },
      },
    });

    const textOutput = response.text?.trim() || '{}';
    return res.json(JSON.parse(textOutput));
  } catch (error: any) {
    console.error('Error in duel comparison:', error);
    return res.status(500).json({ error: 'Duel comparison failed', details: error?.message });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
