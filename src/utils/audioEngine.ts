import { AudioProperties } from '../types/editor';

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let bassFilter: BiquadFilterNode | null = null;
let midFilter: BiquadFilterNode | null = null;
let trebleFilter: BiquadFilterNode | null = null;
let isPlaying = false;
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.8;

    // 3-Band Equalizer Setup
    bassFilter = audioCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 250;

    midFilter = audioCtx.createBiquadFilter();
    midFilter.type = 'peaking';
    midFilter.frequency.value = 1500;
    midFilter.Q.value = 1.0;

    trebleFilter = audioCtx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 4000;

    // Chain: EQ -> Master Gain -> Destination
    bassFilter.connect(midFilter);
    midFilter.connect(trebleFilter);
    trebleFilter.connect(masterGain);
    masterGain.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return audioCtx;
}

export function updateEqualizer(bass: number, mid: number, treble: number) {
  if (!bassFilter || !midFilter || !trebleFilter) return;
  bassFilter.gain.value = bass; // in dB (-12 to 12)
  midFilter.gain.value = mid;
  trebleFilter.gain.value = treble;
}

export function applyVoicePreset(preset: AudioProperties['voicePreset']) {
  if (!audioCtx) return;

  switch (preset) {
    case 'Documentary Voice':
      updateEqualizer(2, 4, 3);
      break;
    case 'Deep Cinematic':
      updateEqualizer(6, 1, 2);
      break;
    case 'Warm Natural':
      updateEqualizer(3, 2, 0);
      break;
    case 'Radio Voice':
      updateEqualizer(4, 5, 1);
      break;
    case 'Studio Voice':
      updateEqualizer(1, 3, 4);
      break;
    default:
      updateEqualizer(0, 0, 0);
      break;
  }
}

// Interactive sound effects generator (whoosh, hit, shutter, beep)
export function playSoundEffect(type: 'whoosh' | 'hit' | 'shutter' | 'beep') {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  if (type === 'whoosh') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } else if (type === 'hit') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.6);
  } else if (type === 'shutter') {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

// Synthesizes a real-time warm cinematic pad while playback is active
export function startPlaybackAudio(hasActiveVoice: boolean) {
  const ctx = getAudioContext();
  if (isPlaying) return;
  isPlaying = true;

  const now = ctx.currentTime;

  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(hasActiveVoice ? 0.08 : 0.22, now); // Automatic audio ducking!

  ambientOsc1 = ctx.createOscillator();
  ambientOsc1.type = 'sine';
  ambientOsc1.frequency.setValueAtTime(110, now); // A2 fundamental

  ambientOsc2 = ctx.createOscillator();
  ambientOsc2.type = 'triangle';
  ambientOsc2.frequency.setValueAtTime(164.81, now); // E3 fifth

  ambientOsc1.connect(ambientGain);
  ambientOsc2.connect(ambientGain);

  if (bassFilter) {
    ambientGain.connect(bassFilter);
  } else {
    ambientGain.connect(ctx.destination);
  }

  ambientOsc1.start();
  ambientOsc2.start();
}

export function stopPlaybackAudio() {
  if (!isPlaying) return;
  isPlaying = false;

  try {
    if (ambientOsc1) ambientOsc1.stop();
    if (ambientOsc2) ambientOsc2.stop();
    ambientOsc1 = null;
    ambientOsc2 = null;
  } catch (e) {
    // Ignore already stopped
  }
}

export function setAudioDucking(active: boolean) {
  if (!ambientGain || !audioCtx) return;
  const now = audioCtx.currentTime;
  ambientGain.gain.cancelScheduledValues(now);
  ambientGain.gain.linearRampToValueAtTime(active ? 0.06 : 0.22, now + 0.3);
}

// Generate stylized waveform points for timeline audio track preview
export function generateWaveformData(duration: number, samples: number = 60): number[] {
  const result: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * duration;
    // Harmonic variation with pauses
    const v = Math.abs(Math.sin(t * 4.2) * 0.45 + Math.sin(t * 8.7) * 0.35 + Math.cos(t * 1.8) * 0.2);
    result.push(Math.max(0.1, Math.min(1.0, v)));
  }
  return result;
}
