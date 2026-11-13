import React from 'react';
import { VisualEffects } from '../../types/editor';
import { Sparkles, Film, Tv, Sun, Eye, Zap } from 'lucide-react';

interface EffectsPanelProps {
  effects: VisualEffects;
  onChange: (updated: VisualEffects) => void;
}

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  effects,
  onChange,
}) => {
  const handleSliderChange = (key: keyof VisualEffects, val: number) => {
    onChange({ ...effects, [key]: val });
  };

  const handleResetEffects = () => {
    onChange({
      motionBlur: 0,
      gaussianBlur: 0,
      filmGrain: 0,
      lensFlare: 0,
      lightLeak: 0,
      glitch: 0,
      vhs: 0,
      rgbSplit: 0,
      sharpen: 0,
      cameraShake: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Header Reset */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Visual FX & Cinematic Overlays
        </span>
        <button
          onClick={handleResetEffects}
          className="text-slate-400 hover:text-white text-[11px] font-medium"
        >
          Reset Effects
        </button>
      </div>

      {/* Quick Cinematic FX Presets */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '35mm Film Grain', apply: () => onChange({ ...effects, filmGrain: 0.35 }) },
          { label: 'Sci-Fi Glitch', apply: () => onChange({ ...effects, glitch: 0.45, rgbSplit: 6 }) },
          { label: 'Golden Flare', apply: () => onChange({ ...effects, lensFlare: 0.5, lightLeak: 0.3 }) },
        ].map((p, i) => (
          <button
            key={i}
            onClick={p.apply}
            className="p-2 rounded-xl bg-[#111827] border border-slate-800 hover:border-[#00CFFF] text-slate-300 hover:text-white text-[11px] transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Effects Sliders */}
      <div className="space-y-3 bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
        {/* Film Grain */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5 text-[#00CFFF]" /> 35mm Film Grain</span>
            <span className="font-mono text-cyan-400">{(effects.filmGrain * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effects.filmGrain}
            onChange={(e) => handleSliderChange('filmGrain', parseFloat(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Glitch Scanlines */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-pink-400" /> Digital Glitch Artifacts</span>
            <span className="font-mono text-pink-400">{(effects.glitch * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effects.glitch}
            onChange={(e) => handleSliderChange('glitch', parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* Lens Flare */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Anamorphic Lens Flare</span>
            <span className="font-mono text-amber-400">{(effects.lensFlare * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effects.lensFlare}
            onChange={(e) => handleSliderChange('lensFlare', parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Light Leak */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-orange-400" /> Warm Light Leak</span>
            <span className="font-mono text-orange-400">{(effects.lightLeak * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={effects.lightLeak}
            onChange={(e) => handleSliderChange('lightLeak', parseFloat(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      </div>
    </div>
  );
};
