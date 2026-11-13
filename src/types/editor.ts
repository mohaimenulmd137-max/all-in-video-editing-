export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export type BlendMode = 'normal' | 'screen' | 'multiply' | 'overlay' | 'add' | 'soft-light';

export interface Keyframe {
  time: number; // in seconds
  value: number;
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface ColorGrade {
  exposure: number; // -1 to 1
  brightness: number; // -100 to 100
  contrast: number; // 0 to 2
  saturation: number; // 0 to 2
  temperature: number; // -50 to 50
  tint: number; // -50 to 50
  highlights: number; // -50 to 50
  shadows: number; // -50 to 50
  whites: number; // -50 to 50
  blacks: number; // -50 to 50
  gamma: number; // 0.5 to 1.5
  vibrance: number; // -50 to 50
  hue: number; // 0 to 360
  vignette: number; // 0 to 1
  lut: string; // 'none' | 'teal_orange' | 'cinematic_warm' | 'cyberpunk' | 'vintage_noir' | 'documentary'
}

export interface VisualEffects {
  motionBlur: number; // 0 to 1
  gaussianBlur: number; // 0 to 20
  filmGrain: number; // 0 to 1
  lensFlare: number; // 0 to 1
  lightLeak: number; // 0 to 1
  glitch: number; // 0 to 1
  vhs: number; // 0 to 1
  rgbSplit: number; // 0 to 20
  sharpen: number; // 0 to 1
  cameraShake: number; // 0 to 1
}

export interface MaskConfig {
  enabled: boolean;
  type: 'none' | 'rectangle' | 'circle' | 'linear' | 'freehand';
  x: number; // 0 to 1
  y: number; // 0 to 1
  width: number; // 0 to 1
  height: number; // 0 to 1
  feather: number; // 0 to 50
  invert: boolean;
  opacity: number; // 0 to 1
}

export interface ChromaKeyConfig {
  enabled: boolean;
  keyColor: string; // hex '#00ff00'
  similarity: number; // 0 to 1
  smoothness: number; // 0 to 1
  spill: number; // 0 to 1
  bgType: 'transparent' | 'solid' | 'blur' | 'image';
  bgColor?: string;
  bgImageUrl?: string;
}

export interface CartoonConfig {
  enabled: boolean;
  style: 'none' | '3D Cartoon' | 'Anime' | 'Pixar-Inspired' | 'Comic Book' | 'Hand-Drawn';
  mode: 'whole_scene' | 'subject_only' | 'bg_only';
  edgeWeight: number; // 0.5 to 5
  posterizeLevels: number; // 3 to 16
  saturationBoost: number; // 1 to 2
  lineDarkness: number; // 0 to 1
}

export interface TextClipData {
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isGradient: boolean;
  gradientColors: [string, string];
  strokeWidth: number;
  strokeColor: string;
  hasShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  hasBackground: boolean;
  backgroundColor: string;
  backgroundPadding: number;
  backgroundRadius: number;
  animation: 'none' | 'fadeIn' | 'typewriter' | 'slideUp' | 'bounce';
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineHeight: number;
  isBengali?: boolean;
}

export interface AudioProperties {
  volume: number; // 0 to 2 (1 = 100%)
  mute: boolean;
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  equalizer: {
    bass: number; // -12 to 12 dB
    mid: number; // -12 to 12 dB
    treble: number; // -12 to 12 dB
  };
  reverb: number; // 0 to 1
  pitch: number; // 0.5 to 2
  voicePreset: 'none' | 'Documentary Voice' | 'Deep Cinematic' | 'Warm Natural' | 'Radio Voice' | 'Studio Voice';
  autoDucking: boolean;
}

export interface Clip3DData {
  sceneType: 'title_3d' | 'monolith' | 'floating_logo' | 'sci_fi_orb' | 'custom_model';
  text?: string;
  modelUrl?: string;
  cameraOrbitSpeed: number;
  lightColor: string;
  metallic: number;
  roughness: number;
  passType: 'beauty' | 'depth' | 'normal' | 'wireframe';
  rotationX: number;
  rotationY: number;
  rotationZ: number;
}

export type TrackType = 'video' | 'audio' | 'text' | 'overlay';

export interface TimelineClip {
  id: string;
  trackId: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'image' | '3d';
  start: number; // Timeline position in seconds
  duration: number; // Clip duration in seconds
  sourceOffset: number; // Trim in-point from original media in seconds
  sourceDuration: number; // Total length of media source
  mediaUrl: string; // Blob, Data URL, or generated placeholder canvas
  thumbnailUrl?: string;
  
  // Transform
  x: number; // Offset from center in % (-100 to 100)
  y: number; // Offset from center in % (-100 to 100)
  scale: number; // 0.1 to 5 (1 = 100%)
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  blendMode: BlendMode;
  flipH: boolean;
  flipV: boolean;
  speed: number; // 0.1 to 10

  // Studios
  colorGrade: ColorGrade;
  effects: VisualEffects;
  mask: MaskConfig;
  chromaKey: ChromaKeyConfig;
  cartoon: CartoonConfig;
  audio: AudioProperties;
  textData?: TextClipData;
  threeDData?: Clip3DData;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  locked: boolean;
  hidden: boolean;
  volume: number;
  height?: number;
}

export interface Project {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  duration: number; // in seconds
  fps: number; // 24, 30, 60
  tracks: Track[];
  clips: TimelineClip[];
  updatedAt: number;
  createdAt: number;
  thumbnail?: string;
}

export interface ExportSettings {
  resolution: '480p' | '720p' | '1080p' | '2K' | '4K';
  aspectRatio: AspectRatio;
  fps: number;
  format: 'webm' | 'mp4';
  quality: 'high' | 'medium' | 'fast';
  audioBitrate: number;
}
