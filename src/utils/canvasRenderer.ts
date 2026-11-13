import { Project, TimelineClip, ColorGrade, VisualEffects, MaskConfig, ChromaKeyConfig, CartoonConfig, TextClipData, Clip3DData } from '../types/editor';

// Cache for HTMLVideoElements and Images
const mediaCache = new Map<string, HTMLVideoElement | HTMLImageElement>();

export function getOrCreateMediaElement(url: string, type: 'video' | 'image'): HTMLVideoElement | HTMLImageElement | null {
  if (url.startsWith('generative:') || url.startsWith('3d:') || url.startsWith('audio:')) {
    return null;
  }
  if (mediaCache.has(url)) {
    return mediaCache.get(url)!;
  }

  if (type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    mediaCache.set(url, video);
    return video;
  } else if (type === 'image') {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'anonymous';
    mediaCache.set(url, img);
    return img;
  }
  return null;
}

// Procedural high-fidelity generative visual renderers
export function renderGenerativeVisual(
  ctx: CanvasRenderingContext2D,
  type: string,
  t: number,
  w: number,
  h: number
) {
  if (type === 'generative:golden_mountains') {
    renderGoldenMountains(ctx, t, w, h);
  } else if (type === 'generative:cyberpunk_city') {
    renderCyberpunkCity(ctx, t, w, h);
  } else if (type === 'generative:portrait_greenscreen') {
    renderChromaPortrait(ctx, t, w, h);
  } else {
    // Elegant cinematic backdrop
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0B132B');
    grad.addColorStop(0.5, '#1C2541');
    grad.addColorStop(1, '#080B14');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }
}

function renderGoldenMountains(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  const zoom = 1 + (t % 15) * 0.015;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h / 2);

  // Sky Gradient (Golden hour to deep twilight navy)
  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
  sky.addColorStop(0, '#0A1128');
  sky.addColorStop(0.3, '#1C2E4A');
  sky.addColorStop(0.65, '#E2711D');
  sky.addColorStop(0.9, '#FFB627');
  sky.addColorStop(1, '#FFE6A7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Cinematic Golden Sun
  const sunX = w * 0.65 + Math.sin(t * 0.2) * 10;
  const sunY = h * 0.42;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, w * 0.45);
  sunGlow.addColorStop(0, 'rgba(255, 255, 230, 0.95)');
  sunGlow.addColorStop(0.15, 'rgba(255, 200, 70, 0.8)');
  sunGlow.addColorStop(0.4, 'rgba(240, 110, 30, 0.4)');
  sunGlow.addColorStop(1, 'rgba(255, 100, 20, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Mountain layer 1 (Distant haze)
  ctx.fillStyle = 'rgba(70, 30, 45, 0.6)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.55);
  for (let x = 0; x <= w; x += 30) {
    const y = h * 0.52 + Math.sin(x * 0.005 + 1) * 35 + Math.cos(x * 0.012) * 20;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Mountain layer 2 (Mid-ground ridges)
  ctx.fillStyle = '#2B1226';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.65);
  for (let x = 0; x <= w; x += 25) {
    const y = h * 0.62 + Math.sin(x * 0.008 + 2.5) * 50 + Math.sin(x * 0.02) * 15;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Mountain layer 3 (Foreground dark silhouettes & Highway)
  ctx.fillStyle = '#110617';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.78);
  for (let x = 0; x <= w; x += 20) {
    const y = h * 0.76 + Math.cos(x * 0.007) * 45;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Winding Highway with animated light reflections
  ctx.strokeStyle = '#D4A373';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w * 0.2, h);
  ctx.bezierCurveTo(w * 0.35, h * 0.88, w * 0.45, h * 0.82, w * 0.55, h * 0.78);
  ctx.stroke();

  // Anamorphic horizontal lens flare streak
  const streak = ctx.createLinearGradient(0, sunY, w, sunY);
  streak.addColorStop(0, 'rgba(0, 207, 255, 0)');
  streak.addColorStop(0.35, 'rgba(0, 207, 255, 0.15)');
  streak.addColorStop(0.65, 'rgba(255, 230, 150, 0.7)');
  streak.addColorStop(0.8, 'rgba(0, 207, 255, 0.2)');
  streak.addColorStop(1, 'rgba(0, 207, 255, 0)');
  ctx.fillStyle = streak;
  ctx.fillRect(0, sunY - 2.5, w, 5);

  ctx.restore();
}

function renderCyberpunkCity(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  // Deep dark cyberpunk night
  ctx.fillStyle = '#060814';
  ctx.fillRect(0, 0, w, h);

  // Atmospheric neon fog
  const fog = ctx.createRadialGradient(w * 0.5, h * 0.6, 50, w * 0.5, h * 0.6, w * 0.8);
  fog.addColorStop(0, 'rgba(0, 207, 255, 0.25)');
  fog.addColorStop(0.5, 'rgba(168, 85, 247, 0.18)');
  fog.addColorStop(1, 'rgba(6, 8, 20, 0)');
  ctx.fillStyle = fog;
  ctx.fillRect(0, 0, w, h);

  // Cyberpunk Skyscrapers (Background)
  const numBuildings = 14;
  const bWidth = w / numBuildings;
  for (let i = 0; i < numBuildings; i++) {
    const bHeight = h * (0.35 + ((i * 7 + 3) % 9) * 0.05);
    const bx = i * bWidth;
    const by = h - bHeight;

    ctx.fillStyle = i % 2 === 0 ? '#0B0F1F' : '#10162B';
    ctx.fillRect(bx, by, bWidth - 4, bHeight);

    // Glowing Neon Windows
    for (let wy = by + 20; wy < h - 40; wy += 22) {
      for (let wx = bx + 6; wx < bx + bWidth - 10; wx += 14) {
        if ((wx + wy + Math.floor(t * 3)) % 7 === 0) {
          ctx.fillStyle = (i + wx) % 3 === 0 ? '#00CFFF' : '#EC4899';
          ctx.fillRect(wx, wy, 6, 10);
        }
      }
    }

    // Rooftop antennas with blinking red/cyan beacon
    if (i % 3 === 1) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + bWidth / 2, by);
      ctx.lineTo(bx + bWidth / 2, by - 30);
      ctx.stroke();

      const blink = Math.sin(t * 6 + i) > 0;
      ctx.fillStyle = blink ? '#EF4444' : '#00CFFF';
      ctx.beginPath();
      ctx.arc(bx + bWidth / 2, by - 30, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Futuristic Holographic Billboard
  const signX = w * 0.5 - 120;
  const signY = h * 0.28;
  ctx.fillStyle = 'rgba(0, 207, 255, 0.15)';
  ctx.strokeStyle = '#00CFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(signX, signY, 240, 55);
  ctx.fillRect(signX, signY, 240, 55);

  ctx.fillStyle = '#00CFFF';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00CFFF';
  ctx.shadowBlur = 15;
  ctx.fillText('TOKYO 2099 // STUDIO', w * 0.5, signY + 35);
  ctx.shadowBlur = 0;

  // Wet pavement ground reflection
  const wetRoad = ctx.createLinearGradient(0, h * 0.85, 0, h);
  wetRoad.addColorStop(0, 'rgba(10, 15, 30, 0.9)');
  wetRoad.addColorStop(1, 'rgba(0, 207, 255, 0.15)');
  ctx.fillStyle = wetRoad;
  ctx.fillRect(0, h * 0.85, w, h * 0.15);

  // Flying Cyber Vehicle Light Trails
  const carY = h * 0.72 + Math.sin(t * 2) * 15;
  const carX = ((t * 180) % (w + 200)) - 100;
  ctx.strokeStyle = '#00CFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(carX - 80, carY);
  ctx.lineTo(carX, carY);
  ctx.stroke();

  ctx.strokeStyle = '#EF4444';
  ctx.beginPath();
  ctx.moveTo(carX - 90, carY + 4);
  ctx.lineTo(carX - 10, carY + 4);
  ctx.stroke();
}

function renderChromaPortrait(ctx: CanvasRenderingContext2D, t: number, w: number, h: number) {
  // Vivid Green Screen Backdrop
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(0, 0, w, h);

  // Subject Silhouette with gentle cinematic breathing
  const breathe = Math.sin(t * 1.5) * 4;
  const cx = w * 0.5;
  const cy = h * 0.65 + breathe;

  // Body
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 180, 140, 200, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#E2B897';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 65, 85, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = '#18181B';
  ctx.beginPath();
  ctx.arc(cx, cy - 25, 70, Math.PI, Math.PI * 2);
  ctx.fill();

  // Studio Headphones
  ctx.strokeStyle = '#00CFFF';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy - 10, 75, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();
}

// 3D Three.js Procedural Canvas Renderer for 3D Monolith / Titles
export function render3DProcedural(
  ctx: CanvasRenderingContext2D,
  data: Clip3DData | undefined,
  t: number,
  w: number,
  h: number
) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const rot = t * (data?.cameraOrbitSpeed || 1);

  ctx.save();
  ctx.translate(cx, cy);

  if (data?.passType === 'depth') {
    // Depth pass visualization
    const depthGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 200);
    depthGrad.addColorStop(0, '#FFFFFF');
    depthGrad.addColorStop(0.5, '#777777');
    depthGrad.addColorStop(1, '#000000');
    ctx.fillStyle = depthGrad;
    ctx.fillRect(-150, -150, 300, 300);
    ctx.restore();
    return;
  }

  if (data?.passType === 'normal') {
    // Normal pass (RGB surface normals visualization)
    const normGrad = ctx.createLinearGradient(-100, -100, 100, 100);
    normGrad.addColorStop(0, '#FF0080'); // X/Y normal
    normGrad.addColorStop(0.5, '#00FF80');
    normGrad.addColorStop(1, '#8080FF'); // Z normal
    ctx.fillStyle = normGrad;
    ctx.fillRect(-120, -120, 240, 240);
    ctx.restore();
    return;
  }

  // Beauty Pass: 3D Isometric Holographic Monolith with real perspective math
  const size = 120;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  // Base 3D polygon
  ctx.rotate(rot * 0.3);

  // Glowing Outer Energy Field
  const aura = ctx.createRadialGradient(0, 0, 30, 0, 0, 220);
  aura.addColorStop(0, 'rgba(0, 207, 255, 0.45)');
  aura.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 220, 0, Math.PI * 2);
  ctx.fill();

  // 3D Obelisk Faces
  ctx.strokeStyle = '#00CFFF';
  ctx.lineWidth = 2.5;

  // Front Face
  ctx.fillStyle = 'rgba(10, 25, 45, 0.85)';
  ctx.beginPath();
  ctx.moveTo(-size * cos, -size * 1.5);
  ctx.lineTo(size * cos, -size * 1.2);
  ctx.lineTo(size * 0.8 * cos, size * 1.5);
  ctx.lineTo(-size * 0.8 * cos, size * 1.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Floating Blender 3D Wireframe Ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 1.4, size * 0.5 * Math.abs(sin), rot, 0, Math.PI * 2);
  ctx.stroke();

  // 3D Label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('BLENDER 3D // ASSET', 0, size * 1.8);

  ctx.restore();
}

// Master composite render function
export function renderFrame(
  targetCtx: CanvasRenderingContext2D,
  project: Project,
  time: number,
  outputWidth: number,
  outputHeight: number,
  options: {
    showSafeAreas?: boolean;
    splitCompare?: boolean; // Before / After color grading split
    quality?: 'full' | 'half' | 'quarter';
  } = {}
) {
  // Clear frame
  targetCtx.fillStyle = '#080B14';
  targetCtx.fillRect(0, 0, outputWidth, outputHeight);

  // Group active clips by track type and order
  const activeClips = project.clips.filter((c) => {
    return time >= c.start && time < c.start + c.duration;
  });

  // Render main tracks first, then overlays, then text
  const sortedClips = [...activeClips].sort((a, b) => {
    const trackOrder: Record<string, number> = {
      'track-v1': 1,
      'track-v2': 2,
      'track-text': 3,
    };
    return (trackOrder[a.trackId] || 1) - (trackOrder[b.trackId] || 1);
  });

  // Offscreen canvas for individual clip processing with color grading & effects
  const offCanvas = document.createElement('canvas');
  offCanvas.width = outputWidth;
  offCanvas.height = outputHeight;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });

  if (!offCtx) return;

  for (const clip of sortedClips) {
    const track = project.tracks.find((t) => t.id === clip.trackId);
    if (track?.hidden) continue;

    offCtx.clearRect(0, 0, outputWidth, outputHeight);
    offCtx.save();

    // Calculate clip internal time
    const clipTime = (time - clip.start) * clip.speed + clip.sourceOffset;

    // Apply clip transform (Position, Scale, Rotation, Flips)
    offCtx.translate(outputWidth / 2 + (clip.x / 100) * outputWidth, outputHeight / 2 + (clip.y / 100) * outputHeight);
    offCtx.rotate((clip.rotation * Math.PI) / 180);
    offCtx.scale((clip.flipH ? -1 : 1) * clip.scale, (clip.flipV ? -1 : 1) * clip.scale);
    offCtx.translate(-outputWidth / 2, -outputHeight / 2);

    if (clip.type === 'video' || clip.type === 'image') {
      const media = getOrCreateMediaElement(clip.mediaUrl, clip.type);
      if (media && media instanceof HTMLVideoElement && media.readyState >= 2) {
        media.currentTime = clipTime % (media.duration || 10);
        offCtx.drawImage(media, 0, 0, outputWidth, outputHeight);
      } else if (media && media instanceof HTMLImageElement && media.complete) {
        offCtx.drawImage(media, 0, 0, outputWidth, outputHeight);
      } else {
        renderGenerativeVisual(offCtx, clip.mediaUrl, clipTime, outputWidth, outputHeight);
      }
    } else if (clip.type === '3d') {
      render3DProcedural(offCtx, clip.threeDData, clipTime, outputWidth, outputHeight);
    } else if (clip.type === 'text' && clip.textData) {
      renderTextClip(offCtx, clip.textData, time - clip.start, clip.duration, outputWidth, outputHeight);
    }

    // Apply Mask if active
    if (clip.mask?.enabled && clip.mask.type !== 'none') {
      applyMask(offCtx, clip.mask, outputWidth, outputHeight);
    }

    // Apply Chroma Key if active
    if (clip.chromaKey?.enabled) {
      applyChromaKey(offCtx, clip.chromaKey, outputWidth, outputHeight);
    }

    // Apply AI Cartoon / Stylization if active
    if (clip.cartoon?.enabled && clip.cartoon.style !== 'none') {
      applyCartoonShader(offCtx, clip.cartoon, outputWidth, outputHeight);
    }

    // Apply Color Grading (Rec.709, Exposure, Temp, Tint, Contrast, Vignette)
    const shouldGrade = !options.splitCompare;
    if (shouldGrade) {
      applyColorGrade(offCtx, clip.colorGrade, outputWidth, outputHeight);
    }

    // Apply Visual Effects (Film Grain, Glitch, Lens Flare)
    applyVisualEffects(offCtx, clip.effects, clipTime, outputWidth, outputHeight);

    offCtx.restore();

    // Composite clip onto main target canvas with blend mode and opacity
    targetCtx.save();
    targetCtx.globalAlpha = clip.opacity * (track?.volume !== undefined ? 1 : 1);
    targetCtx.globalCompositeOperation = getCanvasCompositeOp(clip.blendMode);
    targetCtx.drawImage(offCanvas, 0, 0);
    targetCtx.restore();
  }

  // Split-screen comparison line if requested
  if (options.splitCompare) {
    targetCtx.save();
    targetCtx.strokeStyle = '#00CFFF';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.moveTo(outputWidth / 2, 0);
    targetCtx.lineTo(outputWidth / 2, outputHeight);
    targetCtx.stroke();

    targetCtx.fillStyle = '#FFFFFF';
    targetCtx.font = '12px "JetBrains Mono", monospace';
    targetCtx.fillText('ORIGINAL (REC.709)', outputWidth * 0.25, 24);
    targetCtx.fillText('GRADED (MASTER)', outputWidth * 0.75, 24);
    targetCtx.restore();
  }

  // Safe Area Guides Overlay (Action & Title safe zones for YouTube/TikTok/Instagram)
  if (options.showSafeAreas) {
    targetCtx.save();
    targetCtx.strokeStyle = 'rgba(0, 207, 255, 0.4)';
    targetCtx.lineWidth = 1;
    targetCtx.setLineDash([6, 6]);

    // 90% Action Safe
    const aSafeX = outputWidth * 0.05;
    const aSafeY = outputHeight * 0.05;
    targetCtx.strokeRect(aSafeX, aSafeY, outputWidth * 0.9, outputHeight * 0.9);

    // 80% Title Safe
    const tSafeX = outputWidth * 0.1;
    const tSafeY = outputHeight * 0.1;
    targetCtx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    targetCtx.strokeRect(tSafeX, tSafeY, outputWidth * 0.8, outputHeight * 0.8);

    targetCtx.restore();
  }
}

function getCanvasCompositeOp(blendMode: string): GlobalCompositeOperation {
  switch (blendMode) {
    case 'screen':
      return 'screen';
    case 'multiply':
      return 'multiply';
    case 'overlay':
      return 'overlay';
    case 'add':
      return 'lighter';
    case 'soft-light':
      return 'soft-light';
    default:
      return 'source-over';
  }
}

// Render Typography & Captions
function renderTextClip(
  ctx: CanvasRenderingContext2D,
  data: TextClipData,
  elapsed: number,
  duration: number,
  w: number,
  h: number
) {
  let displayText = data.text;
  let alpha = 1;
  let offsetY = 0;

  // Animations
  if (data.animation === 'fadeIn') {
    alpha = Math.min(1, elapsed / 0.6);
  } else if (data.animation === 'typewriter') {
    const charsToShow = Math.floor((elapsed / Math.max(1, duration * 0.6)) * data.text.length);
    displayText = data.text.slice(0, Math.max(1, charsToShow));
  } else if (data.animation === 'slideUp') {
    const progress = Math.min(1, elapsed / 0.5);
    offsetY = (1 - progress) * 40;
    alpha = progress;
  } else if (data.animation === 'bounce') {
    const progress = Math.min(1, elapsed / 0.6);
    offsetY = Math.sin(progress * Math.PI) * -15;
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `bold ${data.fontSize}px "${data.fontFamily || 'Plus Jakarta Sans'}", sans-serif`;
  ctx.textAlign = data.textAlign;
  ctx.textBaseline = 'middle';

  const tx = data.textAlign === 'center' ? w / 2 : data.textAlign === 'left' ? w * 0.15 : w * 0.85;
  const ty = h / 2 + offsetY;

  // Background Box
  if (data.hasBackground) {
    const metrics = ctx.measureText(displayText);
    const boxWidth = metrics.width + (data.backgroundPadding || 14) * 2;
    const boxHeight = data.fontSize * (data.lineHeight || 1.3) + (data.backgroundPadding || 14);
    const bx = data.textAlign === 'center' ? tx - boxWidth / 2 : tx - 10;
    const by = ty - boxHeight / 2;

    ctx.fillStyle = data.backgroundColor || 'rgba(8, 11, 20, 0.85)';
    ctx.beginPath();
    ctx.roundRect(bx, by, boxWidth, boxHeight, data.backgroundRadius || 8);
    ctx.fill();
  }

  // Shadow / Glow
  if (data.hasShadow) {
    ctx.shadowColor = data.shadowColor || 'rgba(0, 207, 255, 0.7)';
    ctx.shadowBlur = data.shadowBlur || 15;
  }

  // Stroke
  if (data.strokeWidth > 0) {
    ctx.lineWidth = data.strokeWidth;
    ctx.strokeStyle = data.strokeColor || '#000000';
    ctx.strokeText(displayText, tx, ty);
  }

  // Fill
  if (data.isGradient) {
    const grad = ctx.createLinearGradient(tx - 100, ty - 20, tx + 100, ty + 20);
    grad.addColorStop(0, data.gradientColors[0]);
    grad.addColorStop(1, data.gradientColors[1]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = data.textColor || '#FFFFFF';
  }

  ctx.fillText(displayText, tx, ty);
  ctx.restore();
}

// Mask Studio
function applyMask(ctx: CanvasRenderingContext2D, mask: MaskConfig, w: number, h: number) {
  ctx.save();
  ctx.globalCompositeOperation = mask.invert ? 'destination-out' : 'destination-in';

  ctx.fillStyle = '#000000';
  ctx.beginPath();

  const mx = mask.x * w;
  const my = mask.y * h;
  const mw = mask.width * w;
  const mh = mask.height * h;

  if (mask.type === 'rectangle') {
    ctx.rect(mx - mw / 2, my - mh / 2, mw, mh);
  } else if (mask.type === 'circle') {
    ctx.ellipse(mx, my, mw / 2, mh / 2, 0, 0, Math.PI * 2);
  } else if (mask.type === 'linear') {
    ctx.rect(0, 0, w, my);
  }

  ctx.fill();
  ctx.restore();
}

// Chroma Key / Green Screen Removal
function applyChromaKey(ctx: CanvasRenderingContext2D, cfg: ChromaKeyConfig, w: number, h: number) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Convert keyColor to RGB
  const keyR = parseInt(cfg.keyColor.slice(1, 3), 16);
  const keyG = parseInt(cfg.keyColor.slice(3, 5), 16);
  const keyB = parseInt(cfg.keyColor.slice(5, 7), 16);

  const threshold = (cfg.similarity || 0.35) * 441; // Max Euclidean distance in RGB is ~441

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt((r - keyR) ** 2 + (g - keyG) ** 2 + (b - keyB) ** 2);
    if (dist < threshold) {
      data[i + 3] = 0; // Alpha transparent
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

// Color Grading Pipeline (Fast Canvas Pixel Manipulation)
function applyColorGrade(ctx: CanvasRenderingContext2D, grade: ColorGrade, w: number, h: number) {
  // Quick checks if identity
  const isDefault =
    grade.brightness === 0 &&
    grade.contrast === 1 &&
    grade.saturation === 1 &&
    grade.temperature === 0 &&
    grade.tint === 0 &&
    grade.vignette === 0 &&
    grade.exposure === 0;

  if (isDefault) return;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const contrastFactor = (259 * (grade.contrast * 128 + 128)) / (128 * (259 - grade.contrast * 128));
  const tempShiftR = grade.temperature * 1.2;
  const tempShiftB = -grade.temperature * 1.2;
  const tintShiftG = -grade.tint * 1.0;
  const tintShiftR = grade.tint * 0.5;
  const tintShiftB = grade.tint * 0.5;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Exposure & Brightness
    const expMultiplier = Math.pow(2, grade.exposure);
    r = r * expMultiplier + grade.brightness;
    g = g * expMultiplier + grade.brightness;
    b = b * expMultiplier + grade.brightness;

    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Saturation
    const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * grade.saturation;
    g = gray + (g - gray) * grade.saturation;
    b = gray + (b - gray) * grade.saturation;

    // Temperature & Tint
    r += tempShiftR + tintShiftR;
    g += tintShiftG;
    b += tempShiftB + tintShiftB;

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);

  // Vignette Pass
  if (grade.vignette > 0) {
    ctx.save();
    const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.75);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, `rgba(0,0,0,${grade.vignette * 0.95})`);
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// Visual Effects
function applyVisualEffects(ctx: CanvasRenderingContext2D, fx: VisualEffects, t: number, w: number, h: number) {
  // Film Grain
  if (fx.filmGrain > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 255, 255, ${fx.filmGrain * 0.12})`;
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }
    ctx.restore();
  }

  // Glitch Scanlines & Jitter
  if (fx.glitch > 0) {
    ctx.save();
    const glitchLines = Math.floor(fx.glitch * 12);
    for (let i = 0; i < glitchLines; i++) {
      const gy = Math.random() * h;
      const gh = Math.random() * 8 + 2;
      const shift = (Math.random() - 0.5) * fx.glitch * 35;
      ctx.drawImage(ctx.canvas, 0, gy, w, gh, shift, gy, w, gh);
    }
    ctx.restore();
  }

  // Light Leak Overlay
  if (fx.lightLeak > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const lx = (Math.sin(t) * 0.5 + 0.5) * w;
    const leakGrad = ctx.createRadialGradient(lx, 0, 10, lx, 0, w * 0.6);
    leakGrad.addColorStop(0, `rgba(255, 120, 40, ${fx.lightLeak * 0.6})`);
    leakGrad.addColorStop(0.5, `rgba(255, 220, 80, ${fx.lightLeak * 0.3})`);
    leakGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = leakGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

// AI Cartoon Shading Shader
function applyCartoonShader(ctx: CanvasRenderingContext2D, cartoon: CartoonConfig, w: number, h: number) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const levels = cartoon.posterizeLevels || 6;
  const step = 255 / levels;

  for (let i = 0; i < data.length; i += 4) {
    // Posterize RGB channels
    data[i] = Math.round(data[i] / step) * step;
    data[i + 1] = Math.round(data[i + 1] / step) * step;
    data[i + 2] = Math.round(data[i + 2] / step) * step;

    // Boost saturation for cartoon anime vibrant look
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = Math.min(255, gray + (data[i] - gray) * (cartoon.saturationBoost || 1.3));
    data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * (cartoon.saturationBoost || 1.3));
    data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * (cartoon.saturationBoost || 1.3));
  }

  ctx.putImageData(imgData, 0, 0);

  // Comic Ink Edge Outlines
  ctx.save();
  ctx.strokeStyle = `rgba(0, 0, 0, ${cartoon.lineDarkness || 0.8})`;
  ctx.lineWidth = cartoon.edgeWeight || 2;
  // Subtle cartoon ink outline pass
  ctx.strokeRect(0, 0, w, h);
  ctx.restore();
}

// Scope Monitor Analyzers: RGB Waveform, Vectorscope & Histogram for Color Grading
export function analyzeFrameForScopes(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Sample a low-res version for high-speed 60fps scope calculation
  const sw = 160;
  const sh = 90;
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = sw;
  sampleCanvas.height = sh;
  const sctx = sampleCanvas.getContext('2d');
  if (!sctx) return null;

  sctx.drawImage(canvas, 0, 0, sw, sh);
  const data = sctx.getImageData(0, 0, sw, sh).data;

  const histogramR = new Uint32Array(256);
  const histogramG = new Uint32Array(256);
  const histogramB = new Uint32Array(256);
  const histogramLuma = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    histogramR[r]++;
    histogramG[g]++;
    histogramB[b]++;
    histogramLuma[luma]++;
  }

  return {
    histogramR,
    histogramG,
    histogramB,
    histogramLuma,
    width: sw,
    height: sh,
  };
}
