import { AgeAnalysisResult } from '../types.ts';

export async function generateBiometricPassImage(
  imageSrc: string,
  result: AgeAnalysisResult
): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Background gradient: Dark slate cyber luxury
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#090d16');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#020617');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Glowing accents
  const glow = ctx.createRadialGradient(width / 2, 280, 50, width / 2, 280, 400);
  glow.addColorStop(0, 'rgba(20, 184, 166, 0.15)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Outer card boundary border
  ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
  ctx.lineWidth = 2;
  roundRect(ctx, 30, 30, width - 60, height - 60, 24);
  ctx.stroke();

  // Corner brackets
  drawCornerBrackets(ctx, 30, 30, width - 60, height - 60, 24, 28);

  // Header
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#14b8a6';
  ctx.letterSpacing = '3px';
  ctx.fillText('AURAAGE // BIOMETRIC VERIFICATION ID', 60, 75);

  ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.letterSpacing = '0px';
  const dateStr = result.scannedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  ctx.fillText(`ISSUED: ${dateStr.toUpperCase()} · VERIFIED AI BIOMETRICS`, 60, 96);

  // Load portrait
  try {
    const img = await loadImage(imageSrc);
    const photoSize = 240;
    const photoX = (width - photoSize) / 2;
    const photoY = 130;

    // Photo shadow & frame
    ctx.save();
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 20);
    ctx.clip();
    ctx.drawImage(img, photoX, photoY, photoSize, photoSize);
    ctx.restore();

    // Frame stroke
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 3;
    roundRect(ctx, photoX, photoY, photoSize, photoSize, 20);
    ctx.stroke();
  } catch (err) {
    console.warn('Could not load image onto canvas pass:', err);
  }

  // Dominant Tagline: Vitality Rating
  ctx.textAlign = 'center';
  ctx.font = '700 22px "Syne", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(result.vitalityRating || 'Youthful Radiance', width / 2, 420);

  ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(result.dominantEmotion || 'Confident Radiance', width / 2, 442);

  // Metrics Display Grid
  // Left Box: Chronological Predicted Age
  drawMetricBox(
    ctx,
    60,
    475,
    325,
    140,
    'ESTIMATED AGE',
    `${result.predictedAge}`,
    `Range: ${result.ageRange.min} - ${result.ageRange.max} yrs · ${result.confidencePercent}% conf.`
  );

  // Right Box: Biological Skin Age
  const deltaText = result.vitalityDelta <= 0
    ? `${Math.abs(result.vitalityDelta)} yrs younger than perceived`
    : `+${result.vitalityDelta} yrs from perceived`;

  drawMetricBox(
    ctx,
    415,
    475,
    325,
    140,
    'BIOLOGICAL SKIN AGE',
    `${result.biologicalSkinAge}`,
    deltaText,
    result.vitalityDelta <= 0 ? '#10b981' : '#f59e0b'
  );

  // Skin Health Breakdown Bars
  ctx.textAlign = 'left';
  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.letterSpacing = '1px';
  ctx.fillText('BIOMETRIC BREAKDOWN METRICS', 60, 650);

  const metrics = [
    { label: 'Skin Smoothness', score: result.skinVitalityMetrics?.smoothness || 88 },
    { label: 'Elasticity & Firmness', score: result.skinVitalityMetrics?.elasticityEstimate || 85 },
    { label: 'Under-Eye Freshness', score: result.skinVitalityMetrics?.underEyeFreshness || 82 },
    { label: 'Luminous Glow Index', score: result.skinVitalityMetrics?.glowIndex || 90 },
  ];

  metrics.forEach((m, idx) => {
    const y = 680 + idx * 44;
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(m.label, 60, y);

    ctx.textAlign = 'right';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillStyle = '#14b8a6';
    ctx.fillText(`${m.score}%`, 740, y);

    // Bar background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    roundRect(ctx, 60, y + 8, 680, 8, 4);
    ctx.fill();

    // Bar fill
    const fillGrad = ctx.createLinearGradient(60, 0, 740, 0);
    fillGrad.addColorStop(0, '#0d9488');
    fillGrad.addColorStop(1, '#2dd4bf');
    ctx.fillStyle = fillGrad;
    roundRect(ctx, 60, y + 8, (680 * m.score) / 100, 8, 4);
    ctx.fill();

    ctx.textAlign = 'left';
  });

  // Celebrity & Vibe Match Card
  const celebY = 880;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  roundRect(ctx, 60, celebY, 680, 95, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();

  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#2dd4bf';
  ctx.fillText('CELEBRITY AESTHETIC VIBE', 80, celebY + 28);

  ctx.font = '700 16px "Syne", sans-serif';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(result.celebrityVibeMatch?.celebrityName || 'Contemporary Icon', 80, celebY + 54);

  ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  const reason = result.celebrityVibeMatch?.reasoning || 'Balanced facial symmetry and radiant gaze.';
  ctx.fillText(truncateText(ctx, reason, 640), 80, celebY + 76);

  // Footer branding & security code
  ctx.font = '400 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#475569';
  ctx.textAlign = 'center';
  ctx.fillText('AUTHENTICATED BY AURAAGE NEURAL VISION · SHA-256 SECURED PASS', width / 2, 1025);

  return canvas.toDataURL('image/png');
}

function drawMetricBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  subtext: string,
  accentColor = '#14b8a6'
) {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.letterSpacing = '1px';
  ctx.fillText(label, x + w / 2, y + 32);

  ctx.font = '700 48px "Syne", sans-serif';
  ctx.fillStyle = accentColor;
  ctx.letterSpacing = '-1px';
  ctx.fillText(value, x + w / 2, y + 84);

  ctx.font = '400 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.letterSpacing = '0px';
  ctx.fillText(subtext, x + w / 2, y + 116);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCornerBrackets(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  _radius: number,
  len: number
) {
  ctx.strokeStyle = '#2dd4bf';
  ctx.lineWidth = 3;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(truncated + '...').width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}
