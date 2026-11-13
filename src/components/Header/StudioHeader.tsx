import React from 'react';
import { AspectRatio } from '../../types/editor';
import {
  Download,
  RotateCcw,
  RotateCw,
  LayoutGrid,
  ChevronDown,
  Sparkles,
  HelpCircle,
  FolderOpen,
} from 'lucide-react';

interface StudioHeaderProps {
  projectName: string;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenDashboard: () => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
}

export const StudioHeader: React.FC<StudioHeaderProps> = ({
  projectName,
  aspectRatio,
  onAspectRatioChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenDashboard,
  onOpenExport,
  onOpenHelp,
}) => {
  return (
    <header className="h-14 bg-[#080B14] border-b border-slate-800 px-2.5 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 z-40 select-none">
      {/* Zone 1: Brand Wordmark & Dashboard Back */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenDashboard}
          title="Back to Project Dashboard"
          className="flex items-center gap-1.5 p-1.5 -ml-1 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00CFFF] to-[#3B82F6] flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#00CFFF]/20">
            C
          </div>
          <span className="text-xs font-bold tracking-tight text-white sm:hidden">
            Projects
          </span>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:inline whitespace-nowrap">
            CINEMATIC STUDIO
          </span>
        </button>

        <span className="text-slate-700 hidden md:inline">|</span>

        <span className="text-xs text-slate-400 font-medium truncate max-w-[140px] lg:max-w-[180px] hidden md:inline">
          {projectName}
        </span>
      </div>

      {/* Zone 2: Navigation & Undo/Redo & Aspect Ratio */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-[#111827] p-0.5 sm:p-1 rounded-xl border border-slate-800">
          {(['16:9', '9:16', '1:1', '21:9'] as AspectRatio[]).map((r) => (
            <button
              key={r}
              onClick={() => onAspectRatioChange(r)}
              className={`px-1.5 sm:px-2 py-1 text-[10px] font-mono rounded-lg transition-colors whitespace-nowrap ${
                r === '21:9' ? 'hidden sm:inline-block' : ''
              } ${
                aspectRatio === r
                  ? 'bg-[#00CFFF] text-black font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Help Tutorials */}
        <button
          onClick={onOpenHelp}
          title="Help & Guides"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Zone 3: 1 Primary Action (Export Video) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenExport}
          className="px-4 py-2 text-xs font-bold text-black bg-[#00CFFF] hover:bg-[#38bdf8] rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#00CFFF]/25 active:scale-95 transition-all whitespace-nowrap shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
