import React, { useState } from 'react';
import { TextClipData } from '../../types/editor';
import { Type, Sparkles, AlignLeft, AlignCenter, AlignRight, Palette, Layers } from 'lucide-react';

interface TextStudioPanelProps {
  textData: TextClipData;
  onChange: (updated: TextClipData) => void;
  onGenerateAiCaptions: (language: 'en' | 'bn') => Promise<void>;
  isGeneratingCaptions: boolean;
}

export const TextStudioPanel: React.FC<TextStudioPanelProps> = ({
  textData,
  onChange,
  onGenerateAiCaptions,
  isGeneratingCaptions,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'animation' | 'ai'>('content');

  const handleFieldChange = <K extends keyof TextClipData>(key: K, val: TextClipData[K]) => {
    onChange({ ...textData, [key]: val });
  };

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 p-1 bg-[#111827] rounded-xl border border-slate-800">
        {[
          { id: 'content', label: 'Text' },
          { id: 'style', label: 'Styling & Color' },
          { id: 'animation', label: 'Motion FX' },
          { id: 'ai', label: 'AI Captions' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-[#00CFFF] text-black font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'content' && (
        <div className="space-y-3">
          {/* Text Input (Bengali & English supported) */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Text & Subtitle Content (বাংলা ও English)
            </label>
            <textarea
              rows={3}
              value={textData.text}
              onChange={(e) => handleFieldChange('text', e.target.value)}
              placeholder="Enter title, caption or lyrics (বাংলা লেখা যাবে)..."
              className="w-full p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 text-white focus:outline-none focus:border-[#00CFFF] text-sm resize-none"
            />
          </div>

          {/* Quick presets for Bangla and English */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: 'সিনেমাটিক এডিটর', text: 'সিনেমাটিক এডিটর স্টুডিও' },
              { label: 'বাংলা সাবটাইটেল', text: 'আপনার গল্পকে দিন সিনেমাটিক রূপ' },
              { label: 'English Title', text: 'CINEMATIC HORIZON 4K' },
              { label: 'Lower Third', text: 'DIRECTED BY STUDIO' },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleFieldChange('text', p.text)}
                className="px-2.5 py-1 rounded-lg bg-[#111827] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-[11px]"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Alignment */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800">
            <span className="text-slate-400">Horizontal Alignment</span>
            <div className="flex items-center gap-1 bg-[#111827] p-0.5 rounded-lg border border-slate-800">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => handleFieldChange('textAlign', align)}
                  className={`p-1.5 rounded ${
                    textData.textAlign === align ? 'bg-[#00CFFF] text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {align === 'left' ? (
                    <AlignLeft className="w-3.5 h-3.5" />
                  ) : align === 'center' ? (
                    <AlignCenter className="w-3.5 h-3.5" />
                  ) : (
                    <AlignRight className="w-3.5 h-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Font Size</span>
              <span className="font-mono text-cyan-400">{textData.fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="96"
              step="2"
              value={textData.fontSize}
              onChange={(e) => handleFieldChange('fontSize', parseInt(e.target.value))}
              className="w-full accent-[#00CFFF]"
            />
          </div>
        </div>
      )}

      {activeTab === 'style' && (
        <div className="space-y-3">
          {/* Color & Gradient */}
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Gradient Fill</span>
              <button
                onClick={() => handleFieldChange('isGradient', !textData.isGradient)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                  textData.isGradient
                    ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                {textData.isGradient ? 'Gradient On' : 'Solid Color'}
              </button>
            </div>

            {textData.isGradient ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textData.gradientColors[0]}
                  onChange={(e) =>
                    handleFieldChange('gradientColors', [e.target.value, textData.gradientColors[1]])
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-500 font-mono text-[10px]">to</span>
                <input
                  type="color"
                  value={textData.gradientColors[1]}
                  onChange={(e) =>
                    handleFieldChange('gradientColors', [textData.gradientColors[0], e.target.value])
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textData.textColor}
                  onChange={(e) => handleFieldChange('textColor', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                />
                <span className="font-mono text-slate-300">{textData.textColor}</span>
              </div>
            )}
          </div>

          {/* Stroke Outline */}
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Text Stroke Outline</span>
              <span className="font-mono text-cyan-400">{textData.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={textData.strokeWidth}
              onChange={(e) => handleFieldChange('strokeWidth', parseFloat(e.target.value))}
              className="w-full accent-[#00CFFF]"
            />
          </div>

          {/* Background Rounded Box */}
          <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Background Rounded Box</span>
              <button
                onClick={() => handleFieldChange('hasBackground', !textData.hasBackground)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${
                  textData.hasBackground
                    ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                {textData.hasBackground ? 'Enabled' : 'None'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'animation' && (
        <div className="space-y-3">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Typography Entrance Animation
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'none', label: 'None (Static)' },
              { id: 'fadeIn', label: 'Smooth Fade In' },
              { id: 'typewriter', label: 'Typewriter Cursor' },
              { id: 'slideUp', label: 'Cinematic Slide Up' },
              { id: 'bounce', label: 'Dynamic Bounce' },
            ].map((anim) => (
              <button
                key={anim.id}
                onClick={() => handleFieldChange('animation', anim.id as any)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  textData.animation === anim.id
                    ? 'border-[#00CFFF] bg-[#00CFFF]/15 text-white font-semibold'
                    : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
                }`}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-3 p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00CFFF]" />
            <span className="font-semibold text-white">AI Auto Captions & Speech Generator</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automatically transcribes speech, formats timing, and populates bilingual animated captions across your timeline.
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onGenerateAiCaptions('bn')}
              disabled={isGeneratingCaptions}
              className="p-3 rounded-xl bg-gradient-to-br from-[#080B14] to-[#111827] border border-cyan-800/60 hover:border-[#00CFFF] text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span className="font-bold text-cyan-400 text-xs">বাংলা ক্যাপশন</span>
              <span className="text-[10px] text-slate-400">Generate Bengali Subtitles</span>
            </button>

            <button
              onClick={() => onGenerateAiCaptions('en')}
              disabled={isGeneratingCaptions}
              className="p-3 rounded-xl bg-gradient-to-br from-[#080B14] to-[#111827] border border-blue-800/60 hover:border-[#3B82F6] text-white flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
            >
              <span className="font-bold text-blue-400 text-xs">English Captions</span>
              <span className="text-[10px] text-slate-400">Generate English Subtitles</span>
            </button>
          </div>

          {isGeneratingCaptions && (
            <div className="text-center text-xs text-cyan-400 font-mono animate-pulse py-2">
              Generating synchronized caption timestamps...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
