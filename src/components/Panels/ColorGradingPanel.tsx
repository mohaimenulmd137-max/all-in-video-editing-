import React, { useState } from 'react';
import { ColorGrade } from '../../types/editor';
import { LUT_PRESETS, DEFAULT_COLOR_GRADE } from '../../constants/presets';
import { ScopeMonitor } from './ScopeMonitor';
import { Sliders, RotateCcw, Sparkles, Eye, Columns } from 'lucide-react';

interface ColorGradingPanelProps {
  colorGrade: ColorGrade;
  onChange: (updated: ColorGrade) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  splitCompare: boolean;
  onToggleSplitCompare: () => void;
}

export const ColorGradingPanel: React.FC<ColorGradingPanelProps> = ({
  colorGrade,
  onChange,
  canvasRef,
  splitCompare,
  onToggleSplitCompare,
}) => {
  const [activeScope, setActiveScope] = useState<'waveform' | 'histogram' | 'vectorscope'>('waveform');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const handleSliderChange = (key: keyof ColorGrade, val: number) => {
    onChange({ ...colorGrade, [key]: val });
  };

  const handleLutChange = (lutId: string) => {
    const preset = LUT_PRESETS.find((l) => l.id === lutId);
    if (preset) {
      onChange({ ...colorGrade, ...preset.grade, lut: lutId });
    }
  };

  const handleReset = () => {
    onChange({ ...DEFAULT_COLOR_GRADE });
    setAiTip(null);
  };

  const handleAiAutoGrade = async () => {
    setIsAiLoading(true);
    setAiTip(null);
    try {
      let gradeAdjustments: Partial<ColorGrade> | null = null;
      let lookName = 'Teal & Orange Hollywood Classic';

      try {
        const res = await fetch('/api/ai/scene-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clipName: 'Active Clip', mood: 'cinematic', currentGrading: colorGrade }),
        });
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (data.gradeAdjustments) {
            gradeAdjustments = data.gradeAdjustments;
            lookName = data.recommendedLook || lookName;
          }
        }
      } catch {
        // Fallback to local rule below
      }

      if (!gradeAdjustments) {
        gradeAdjustments = {
          exposure: 0.05,
          contrast: 1.15,
          saturation: 1.1,
          temperature: -5,
          tint: 2,
          highlights: -10,
          shadows: 8,
          vignette: 0.35,
        };
      }

      onChange({
        ...colorGrade,
        ...gradeAdjustments,
      });
      setAiTip(lookName);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Top Controls: Scopes, Split View & AI Assistant */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSplitCompare}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors ${
              splitCompare
                ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]'
                : 'border-slate-800 text-slate-300 hover:text-white bg-[#111827]'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{splitCompare ? 'Split View Active' : 'Before / After'}</span>
          </button>
          <button
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-[#111827] text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <button
          onClick={handleAiAutoGrade}
          disabled={isAiLoading}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-[#00CFFF] hover:bg-cyan-500/30 flex items-center gap-1.5 font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00CFFF]" />
          <span>{isAiLoading ? 'Analyzing...' : 'AI Auto Grade'}</span>
        </button>
      </div>

      {aiTip && (
        <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 text-[11px] flex items-center justify-between">
          <span>AI Applied: {aiTip}</span>
          <button onClick={() => setAiTip(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Real-time Scope Monitor */}
      <ScopeMonitor
        canvasRef={canvasRef}
        activeScope={activeScope}
        onScopeChange={setActiveScope}
      />

      {/* Cinematic LUT Presets */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Cinematic LUT 3D Color Profiles
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {LUT_PRESETS.map((lut) => (
            <button
              key={lut.id}
              onClick={() => handleLutChange(lut.id)}
              className={`p-2 rounded-lg text-left border text-[11px] transition-all truncate ${
                colorGrade.lut === lut.id
                  ? 'border-[#00CFFF] bg-[#00CFFF]/15 text-white font-medium'
                  : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {lut.name}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Tone Wheels & Grading Sliders */}
      <div className="space-y-3 bg-[#0B0F19] p-3 rounded-xl border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          Primary Tone Controls
        </span>

        {/* Exposure */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Exposure (EV)</span>
            <span className="font-mono text-cyan-400">{colorGrade.exposure > 0 ? `+${colorGrade.exposure.toFixed(2)}` : colorGrade.exposure.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={colorGrade.exposure}
            onChange={(e) => handleSliderChange('exposure', parseFloat(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Contrast</span>
            <span className="font-mono text-cyan-400">{colorGrade.contrast.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={colorGrade.contrast}
            onChange={(e) => handleSliderChange('contrast', parseFloat(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Saturation</span>
            <span className="font-mono text-cyan-400">{(colorGrade.saturation * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={colorGrade.saturation}
            onChange={(e) => handleSliderChange('saturation', parseFloat(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Temperature */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>White Balance (Color Temp)</span>
            <span className="font-mono text-amber-400">
              {colorGrade.temperature > 0 ? `+${colorGrade.temperature}` : colorGrade.temperature}
            </span>
          </div>
          <input
            type="range"
            min="-40"
            max="40"
            step="1"
            value={colorGrade.temperature}
            onChange={(e) => handleSliderChange('temperature', parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Tint */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Tint (Green / Magenta)</span>
            <span className="font-mono text-pink-400">
              {colorGrade.tint > 0 ? `+${colorGrade.tint}` : colorGrade.tint}
            </span>
          </div>
          <input
            type="range"
            min="-30"
            max="30"
            step="1"
            value={colorGrade.tint}
            onChange={(e) => handleSliderChange('tint', parseFloat(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        {/* Vignette */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Cinematic Vignette</span>
            <span className="font-mono text-cyan-400">{(colorGrade.vignette * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.8"
            step="0.05"
            value={colorGrade.vignette}
            onChange={(e) => handleSliderChange('vignette', parseFloat(e.target.value))}
            className="w-full accent-[#00CFFF]"
          />
        </div>
      </div>
    </div>
  );
};
