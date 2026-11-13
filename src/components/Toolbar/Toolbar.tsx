import React from 'react';
import {
  Scissors,
  Sliders,
  Sparkles,
  Music,
  Type,
  Box,
  Palette,
  Wand2,
} from 'lucide-react';

export type ActiveStudio = 'transform' | 'color' | 'effects' | 'audio' | 'text' | 'ai';

interface ToolbarProps {
  activeStudio: ActiveStudio;
  onSelectStudio: (studio: ActiveStudio) => void;
  onOpenBlenderStudio: () => void;
  hasSelectedClip: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeStudio,
  onSelectStudio,
  onOpenBlenderStudio,
  hasSelectedClip,
}) => {
  const tools = [
    { id: 'transform', label: 'Transform', icon: Scissors },
    { id: 'color', label: 'Color Grade', icon: Palette },
    { id: 'effects', label: 'Visual FX', icon: Sparkles },
    { id: 'audio', label: 'Audio Studio', icon: Music },
    { id: 'text', label: 'Text & Titles', icon: Type },
    { id: 'ai', label: 'AI Studio', icon: Wand2 },
  ];

  return (
    <div className="bg-[#0B0F19] border-t border-slate-800 px-2 py-1 flex items-center justify-between sm:justify-center sm:gap-2 overflow-x-auto no-scrollbar">
      {tools.map((t) => {
        const Icon = t.icon;
        const isActive = activeStudio === t.id;

        return (
          <button
            key={t.id}
            onClick={() => onSelectStudio(t.id as ActiveStudio)}
            className={`min-h-[44px] min-w-[56px] sm:min-w-[72px] px-2 py-1 rounded-xl flex flex-col items-center justify-center transition-all ${
              isActive
                ? 'bg-[#00CFFF]/15 text-[#00CFFF] font-semibold border border-[#00CFFF]/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">{t.label}</span>
          </button>
        );
      })}

      {/* Special Blender 3D Studio Button */}
      <button
        onClick={onOpenBlenderStudio}
        className="min-h-[44px] min-w-[64px] sm:min-w-[80px] px-2.5 py-1 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-[#EA7600]/20 to-purple-600/20 border border-[#EA7600]/40 text-[#EA7600] hover:scale-105 active:scale-95 transition-all shadow-sm"
      >
        <Box className="w-4 h-4" />
        <span className="text-[10px] font-bold tracking-tight mt-0.5 whitespace-nowrap">Blender 3D</span>
      </button>
    </div>
  );
};
