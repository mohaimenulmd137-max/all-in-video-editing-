import React, { useRef, useEffect, useState } from 'react';
import { Project } from '../../types/editor';
import { renderFrame } from '../../utils/canvasRenderer';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Grid,
  Columns,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface VideoPreviewProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  splitCompare: boolean;
  onToggleSplitCompare: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  project,
  currentTime,
  isPlaying,
  onPlayPause,
  onSeek,
  splitCompare,
  onToggleSplitCompare,
  canvasRef,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showSafeAreas, setShowSafeAreas] = useState(false);
  const [quality, setQuality] = useState<'full' | 'half'>('full');

  // Compute aspect ratio dimensions
  const getAspectRatioPadding = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16] max-h-[46vh]';
      case '1:1':
        return 'aspect-square max-h-[44vh]';
      case '4:5':
        return 'aspect-[4/5] max-h-[46vh]';
      case '21:9':
        return 'aspect-[21/9] max-h-[40vh]';
      default:
        return 'aspect-video max-h-[44vh]';
    }
  };

  // Render on canvas whenever currentTime, project, or options change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Use responsive canvas dimensions
    const scale = quality === 'full' ? 1 : 0.5;
    const baseW = 1280 * scale;
    const baseH = 720 * scale;

    let targetW = baseW;
    let targetH = baseH;

    if (project.aspectRatio === '9:16') {
      targetW = 720 * scale;
      targetH = 1280 * scale;
    } else if (project.aspectRatio === '1:1') {
      targetW = 720 * scale;
      targetH = 720 * scale;
    } else if (project.aspectRatio === '21:9') {
      targetW = 1680 * scale;
      targetH = 720 * scale;
    }

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    renderFrame(ctx, project, currentTime, targetW, targetH, {
      showSafeAreas,
      splitCompare,
      quality,
    });
  }, [project, currentTime, showSafeAreas, splitCompare, quality, canvasRef]);

  // Frame jog (1 frame forward / back)
  const dt = 1 / (project.fps || 30);
  const stepFrame = (direction: -1 | 1) => {
    const next = Math.max(0, Math.min(project.duration, currentTime + direction * dt));
    onSeek(next);
  };

  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = Math.floor((sec % 1) * 30);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${f.toString().padStart(2, '0')}`;
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center bg-[#05070D] border-b border-slate-800/80 p-2 sm:p-3 relative select-none"
    >
      {/* Top Floating Mini Controls */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums text-white bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
            {formatTimecode(currentTime)}
          </span>
          <span className="text-slate-600">/</span>
          <span className="font-mono tabular-nums text-slate-400">
            {formatTimecode(project.duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Margins */}
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            title="Toggle Safe Margins"
            className={`p-1 rounded hover:text-white transition-colors ${
              showSafeAreas ? 'text-[#00CFFF]' : 'text-slate-400'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>

          {/* Split Compare */}
          <button
            onClick={onToggleSplitCompare}
            title="Before / After Color Grade Compare"
            className={`p-1 rounded hover:text-white transition-colors ${
              splitCompare ? 'text-[#00CFFF]' : 'text-slate-400'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            title="Fullscreen Preview"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Viewport Canvas */}
      <div
        className={`relative ${getAspectRatioPadding()} w-auto max-w-full rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-2xl`}
      >
        <canvas
          ref={canvasRef}
          onClick={onPlayPause}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Center Play Overlay Icon when Paused */}
        {!isPlaying && (
          <button
            onClick={onPlayPause}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 border border-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all shadow-xl pointer-events-none"
          >
            <Play className="w-5 h-5 ml-0.5 text-[#00CFFF]" />
          </button>
        )}
      </div>

      {/* Player Navigation Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-6 mt-2.5">
        <button
          onClick={() => stepFrame(-1)}
          title="Previous Frame (1/30s)"
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onPlayPause}
          className="w-10 h-10 rounded-full bg-[#00CFFF] hover:bg-[#38bdf8] text-black flex items-center justify-center shadow-lg shadow-[#00CFFF]/20 active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={() => stepFrame(1)}
          title="Next Frame (1/30s)"
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
