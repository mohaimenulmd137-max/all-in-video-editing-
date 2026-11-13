import React from 'react';
import { TimelineClip, BlendMode } from '../../types/editor';
import { RotateCw, FlipHorizontal, FlipVertical, Move, Gauge, Layers, Trash2, Copy, Scissors } from 'lucide-react';

interface TransformPanelProps {
  clip: TimelineClip;
  onChange: (updated: TimelineClip) => void;
  onSplit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const TransformPanel: React.FC<TransformPanelProps> = ({
  clip,
  onChange,
  onSplit,
  onDuplicate,
  onDelete,
}) => {
  const handleBlendModeChange = (mode: BlendMode) => {
    onChange({ ...clip, blendMode: mode });
  };

  const handleSpeedPreset = (spd: number) => {
    onChange({ ...clip, speed: spd });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Quick Action Strip: Split, Duplicate, Delete */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={onSplit}
          className="p-2 rounded-xl bg-[#111827] border border-slate-800 hover:border-[#00CFFF] text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Scissors className="w-3.5 h-3.5 text-[#00CFFF]" />
          <span>Split Cut</span>
        </button>
        <button
          onClick={onDuplicate}
          className="p-2 rounded-xl bg-[#111827] border border-slate-800 hover:border-[#00CFFF] text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>Duplicate</span>
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl bg-red-950/30 border border-red-800/40 hover:bg-red-900/40 text-red-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      {/* Speed Control */}
      <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#00CFFF]" /> Clip Speed & Motion Ramping
          </span>
          <span className="font-mono text-cyan-400 font-bold">{clip.speed}x</span>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {[0.25, 0.5, 1.0, 2.0, 4.0].map((s) => (
            <button
              key={s}
              onClick={() => handleSpeedPreset(s)}
              className={`py-1 rounded-lg text-[10px] font-mono border transition-all ${
                clip.speed === s
                  ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF] font-bold'
                  : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Transform Coordinates & Scale */}
      <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
        <span className="text-slate-300 font-semibold block">Position & Scale Geometry</span>

        {/* Scale */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Scale / Zoom</span>
            <span className="font-mono text-cyan-400">{Math.round(clip.scale * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.05"
            value={clip.scale}
            onChange={(e) => onChange({ ...clip, scale: parseFloat(e.target.value) })}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Rotation */}
        <div>
          <div className="flex justify-between text-slate-400 mb-1">
            <span>Rotation Angle</span>
            <span className="font-mono text-cyan-400">{clip.rotation}°</span>
          </div>
          <input
            type="range"
            min="-180"
            max="180"
            step="5"
            value={clip.rotation}
            onChange={(e) => onChange({ ...clip, rotation: parseInt(e.target.value) })}
            className="w-full accent-[#00CFFF]"
          />
        </div>

        {/* Flip Controls */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onChange({ ...clip, flipH: !clip.flipH })}
            className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-colors ${
              clip.flipH ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]' : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip H</span>
          </button>
          <button
            onClick={() => onChange({ ...clip, flipV: !clip.flipV })}
            className={`flex-1 py-1.5 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-colors ${
              clip.flipV ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]' : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Flip V</span>
          </button>
        </div>
      </div>

      {/* Layer Opacity & Blend Mode */}
      <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-300 font-semibold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00CFFF]" /> Opacity & Blend Mode
          </span>
          <span className="font-mono text-cyan-400">{Math.round(clip.opacity * 100)}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={clip.opacity}
          onChange={(e) => onChange({ ...clip, opacity: parseFloat(e.target.value) })}
          className="w-full accent-[#00CFFF]"
        />

        <div className="grid grid-cols-3 gap-1 pt-1">
          {(['normal', 'screen', 'multiply', 'overlay', 'add', 'soft-light'] as BlendMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleBlendModeChange(mode)}
              className={`py-1 text-[10px] rounded-lg border capitalize transition-colors ${
                clip.blendMode === mode
                  ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF] font-semibold'
                  : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
