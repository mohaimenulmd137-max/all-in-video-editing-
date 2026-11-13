import React, { useState } from 'react';
import { X, BookOpen, Video, Scissors, Palette, Music, Wand2, Box, Download } from 'lucide-react';

interface HelpTutorialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpTutorialsModal: React.FC<HelpTutorialsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<'getting_started' | 'timeline' | 'color' | 'audio' | 'ai' | 'blender'>('getting_started');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#080B14]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#00CFFF]" />
            <h3 className="text-sm font-bold text-white tracking-wide">HELP & TUTORIALS CENTER</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 sm:grid-cols-12 flex-1 overflow-y-auto">
          {/* Nav */}
          <div className="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-slate-800 p-2 flex sm:flex-col gap-1 bg-[#080B14] overflow-x-auto">
            {[
              { id: 'getting_started', label: 'Quick Start', icon: Video },
              { id: 'timeline', label: 'Timeline & Cut', icon: Scissors },
              { id: 'color', label: 'Color Grading', icon: Palette },
              { id: 'audio', label: 'Audio Studio', icon: Music },
              { id: 'ai', label: 'AI Features', icon: Wand2 },
              { id: 'blender', label: 'Blender 3D', icon: Box },
            ].map((sec) => {
              const Icon = sec.icon;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`p-2 rounded-xl text-left text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeSection === sec.id
                      ? 'bg-[#00CFFF]/15 text-[#00CFFF] font-semibold border border-[#00CFFF]/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* Guide Details */}
          <div className="sm:col-span-8 p-5 text-xs text-slate-300 space-y-4 overflow-y-auto bg-[#0B0F19]">
            {activeSection === 'getting_started' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Getting Started with Cinematic Studio</h4>
                <p className="text-slate-400 leading-relaxed">
                  Cinematic Editor Studio is a mobile-first professional video editing workstation. You can import media, trim clips, apply real-time Hollywood color grading, mix voice and ambient audio, generate AI captions, and export directly to your device.
                </p>
                <div className="p-3 rounded-xl bg-[#111827] border border-slate-800 space-y-1.5">
                  <div className="font-semibold text-[#00CFFF]">Core Workflow:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Select a clip on the multi-track timeline to reveal contextual tools.</li>
                    <li>Use the bottom toolbar to adjust color grading, audio, text, or AI cartoon effects.</li>
                    <li>Hit the Play button or scrub the timeline to inspect changes in real time.</li>
                    <li>Tap the cyan Export button to render and download your video.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeSection === 'timeline' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Multi-track Timeline Mastery</h4>
                <p className="text-slate-400 leading-relaxed">
                  The timeline supports up to 10 video and audio tracks with magnetic snap alignment.
                </p>
                <ul className="space-y-2 text-[11px] text-slate-400">
                  <li><strong className="text-white">Trimming:</strong> Drag the left or right edges of any clip to non-destructively trim its in/out points.</li>
                  <li><strong className="text-white">Splitting:</strong> Move the playhead to any frame and tap the Split button to slice the clip into two segments.</li>
                  <li><strong className="text-white">Re-ordering:</strong> Drag any clip horizontally along the track. Magnetic snap will align it with adjacent cuts.</li>
                </ul>
              </div>
            )}

            {activeSection === 'color' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Color Grading & Scopes</h4>
                <p className="text-slate-400 leading-relaxed">
                  Color grade like a colorist using the live 10-bit RGB Waveform, Vectorscope, and Histogram. Apply blockbuster LUTs like Teal & Orange, Golden Hour, or Cyberpunk Neon with one tap.
                </p>
              </div>
            )}

            {activeSection === 'audio' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Audio Studio & Voice Presets</h4>
                <p className="text-slate-400 leading-relaxed">
                  Enhance spoken dialogue with natural acoustic presets (Documentary Voice, Deep Cinematic, Radio Voice). Enable Smart Audio Ducking to automatically dip background music whenever dialogue is active.
                </p>
              </div>
            )}

            {activeSection === 'blender' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Blender 3D Studio Integration</h4>
                <p className="text-slate-400 leading-relaxed">
                  Design 3D titles and holographic assets in the real-time Three.js viewport. Customize lighting, roughness, metallic sheen, and orbit speed. Click "Insert into Video Timeline" to embed the 3D scene directly into Track V2 as a screen overlay!
                </p>
              </div>
            )}

            {activeSection === 'ai' && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">AI Background Remover & Cartoon Studio</h4>
                <p className="text-slate-400 leading-relaxed">
                  Convert live videos into stylized 3D Cartoon, Anime, or Comic Book aesthetics. Use Chroma Key to cut out green screens or segment people cleanly.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#080B14] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
