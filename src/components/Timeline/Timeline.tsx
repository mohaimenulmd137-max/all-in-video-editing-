import React, { useRef, useState } from 'react';
import { Project, TimelineClip, Track } from '../../types/editor';
import { generateWaveformData } from '../../utils/audioEngine';
import {
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Magnet,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Type,
  Video,
  Music,
  Box,
} from 'lucide-react';

interface TimelineProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (clipId: string | null) => void;
  onUpdateClip: (updated: TimelineClip) => void;
  onSplitClip: () => void;
  onDuplicateClip: () => void;
  onDeleteClip: () => void;
  onToggleTrackMute: (trackId: string) => void;
  onToggleTrackHide: (trackId: string) => void;
  onToggleTrackLock: (trackId: string) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  project,
  currentTime,
  onSeek,
  selectedClipId,
  onSelectClip,
  onUpdateClip,
  onSplitClip,
  onDuplicateClip,
  onDeleteClip,
  onToggleTrackMute,
  onToggleTrackHide,
  onToggleTrackLock,
}) => {
  const [zoom, setZoom] = useState(48); // pixels per second
  const [magneticSnap, setMagneticSnap] = useState(true);
  const timelineBodyRef = useRef<HTMLDivElement | null>(null);

  // Dragging states
  const [draggingClipId, setDraggingClipId] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragClipStartOriginal, setDragClipStartOriginal] = useState(0);

  // Trimming states
  const [trimmingHandle, setTrimmingHandle] = useState<'left' | 'right' | null>(null);
  const [trimmingClipId, setTrimmingClipId] = useState<string | null>(null);

  const selectedClip = project.clips.find((c) => c.id === selectedClipId);

  // Ruler time marks
  const totalSeconds = Math.ceil(project.duration);
  const rulerMarks = [];
  for (let s = 0; s <= totalSeconds; s++) {
    rulerMarks.push(s);
  }

  // Handle timeline ruler click / scrub
  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineBodyRef.current) return;
    const rect = timelineBodyRef.current.getBoundingClientRect();
    const scrollLeft = timelineBodyRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const time = Math.max(0, Math.min(project.duration, clickX / zoom));
    onSeek(time);
  };

  // Clip Drag Start
  const handleClipMouseDown = (e: React.MouseEvent, clip: TimelineClip) => {
    e.stopPropagation();
    onSelectClip(clip.id);
    setDraggingClipId(clip.id);
    setDragStartX(e.clientX);
    setDragClipStartOriginal(clip.start);
  };

  // Trimming Drag Start
  const handleTrimMouseDown = (e: React.MouseEvent, clip: TimelineClip, handle: 'left' | 'right') => {
    e.stopPropagation();
    onSelectClip(clip.id);
    setTrimmingClipId(clip.id);
    setTrimmingHandle(handle);
    setDragStartX(e.clientX);
  };

  // Window-level mouse move / up for fluid dragging and trimming
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingClipId) {
      const clip = project.clips.find((c) => c.id === draggingClipId);
      if (!clip) return;

      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / zoom;
      let newStart = Math.max(0, dragClipStartOriginal + deltaTime);

      // Magnetic snap
      if (magneticSnap) {
        if (Math.abs(newStart - currentTime) < 0.2) {
          newStart = currentTime;
        } else if (Math.abs(newStart) < 0.2) {
          newStart = 0;
        }
      }

      onUpdateClip({ ...clip, start: newStart });
    } else if (trimmingClipId && trimmingHandle) {
      const clip = project.clips.find((c) => c.id === trimmingClipId);
      if (!clip) return;

      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / zoom;

      if (trimmingHandle === 'left') {
        const nextStart = Math.max(0, clip.start + deltaTime);
        const nextDuration = Math.max(0.5, clip.duration - deltaTime);
        onUpdateClip({ ...clip, start: nextStart, duration: nextDuration });
      } else {
        const nextDuration = Math.max(0.5, clip.duration + deltaTime);
        onUpdateClip({ ...clip, duration: nextDuration });
      }
      setDragStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setDraggingClipId(null);
    setTrimmingClipId(null);
    setTrimmingHandle(null);
  };

  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-3.5 h-3.5 text-[#00CFFF]" />;
      case 'overlay':
        return <Box className="w-3.5 h-3.5 text-purple-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-emerald-400" />;
      case 'text':
        return <Type className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="flex flex-col bg-[#080B14] border-t border-slate-800 select-none overflow-hidden"
    >
      {/* Timeline Controls Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 bg-[#0B0F19] text-xs">
        {/* Left Actions: Split, Duplicate, Delete */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSplitClip}
            disabled={!selectedClip}
            title="Split Clip at Playhead"
            className="p-1.5 rounded-lg border border-slate-800 bg-[#111827] text-slate-300 hover:text-white hover:border-[#00CFFF] disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Scissors className="w-3.5 h-3.5 text-[#00CFFF]" />
            <span className="hidden sm:inline text-[11px]">Split</span>
          </button>
          <button
            onClick={onDuplicateClip}
            disabled={!selectedClip}
            title="Duplicate Clip"
            className="p-1.5 rounded-lg border border-slate-800 bg-[#111827] text-slate-300 hover:text-white hover:border-[#3B82F6] disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="hidden sm:inline text-[11px]">Duplicate</span>
          </button>
          <button
            onClick={onDeleteClip}
            disabled={!selectedClip}
            title="Delete Selected Clip"
            className="p-1.5 rounded-lg border border-red-950/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Delete</span>
          </button>
        </div>

        {/* Center: Selected Clip Name Indicator */}
        <div className="text-[11px] text-slate-400 truncate max-w-[200px] text-center hidden md:block">
          {selectedClip ? (
            <span className="text-[#00CFFF] font-medium">{selectedClip.name}</span>
          ) : (
            <span>Tap any clip to edit</span>
          )}
        </div>

        {/* Right: Magnetic Snap & Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMagneticSnap(!magneticSnap)}
            title="Magnetic Snap Alignment"
            className={`p-1.5 rounded-lg border transition-colors ${
              magneticSnap
                ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF]'
                : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
            }`}
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5 bg-[#111827] p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setZoom(Math.max(20, zoom - 8))}
              title="Zoom Out Timeline"
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(Math.min(120, zoom + 8))}
              title="Zoom In Timeline"
              className="p-1 text-slate-400 hover:text-white"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tracks & Ruler Container */}
      <div className="flex relative h-56 sm:h-64 overflow-hidden">
        {/* Left Track Headers (Pinned) */}
        <div className="w-24 sm:w-32 shrink-0 bg-[#060810] border-r border-slate-800 flex flex-col z-20 shadow-lg">
          {/* Ruler Corner */}
          <div className="h-6 border-b border-slate-800 bg-[#0B0F19] flex items-center px-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            TRACKS
          </div>

          {/* Track Header Items */}
          <div className="flex-1 overflow-hidden flex flex-col justify-start">
            {project.tracks.map((track) => (
              <div
                key={track.id}
                className="h-10 border-b border-slate-800/80 px-2 flex items-center justify-between bg-[#080B14]"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {getTrackIcon(track.type)}
                  <span className="text-[10px] font-semibold text-slate-300 truncate">
                    {track.name.split(' ')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {track.type === 'audio' ? (
                    <button
                      onClick={() => onToggleTrackMute(track.id)}
                      className={`p-0.5 rounded ${track.muted ? 'text-red-400' : 'text-slate-500 hover:text-white'}`}
                    >
                      {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleTrackHide(track.id)}
                      className={`p-0.5 rounded ${track.hidden ? 'text-amber-400' : 'text-slate-500 hover:text-white'}`}
                    >
                      {track.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  )}
                  <button
                    onClick={() => onToggleTrackLock(track.id)}
                    className={`p-0.5 rounded ${track.locked ? 'text-[#00CFFF]' : 'text-slate-500 hover:text-white'}`}
                  >
                    {track.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline Area with Ruler, Needle, and Clips */}
        <div
          ref={timelineBodyRef}
          onClick={handleRulerClick}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-[#05070D] cursor-pointer"
        >
          {/* Inner Canvas Width Container */}
          <div
            style={{ width: `${Math.max(800, (project.duration + 4) * zoom)}px` }}
            className="h-full relative"
          >
            {/* Timeline Ruler */}
            <div className="h-6 border-b border-slate-800/90 bg-[#080B14] relative">
              {rulerMarks.map((s) => (
                <div
                  key={s}
                  style={{ left: `${s * zoom}px` }}
                  className="absolute top-0 bottom-0 border-l border-slate-700/80 text-[9px] font-mono text-slate-400 pl-1 pt-0.5"
                >
                  {s}s
                </div>
              ))}
            </div>

            {/* Playhead Red Needle Line */}
            <div
              style={{ left: `${currentTime * zoom}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-[#00CFFF] z-30 pointer-events-none shadow-[0_0_8px_#00CFFF]"
            >
              {/* Playhead Top Diamond */}
              <div className="w-3 h-3 bg-[#00CFFF] rotate-45 -ml-[5px] -mt-1 shadow-md" />
            </div>

            {/* Tracks Body */}
            <div className="flex flex-col">
              {project.tracks.map((track) => {
                const trackClips = project.clips.filter((c) => c.trackId === track.id);

                return (
                  <div
                    key={track.id}
                    className="h-10 border-b border-slate-800/60 relative bg-[#070A12]/40"
                  >
                    {trackClips.map((clip) => {
                      const isSelected = clip.id === selectedClipId;
                      const clipLeft = clip.start * zoom;
                      const clipWidth = clip.duration * zoom;

                      // Theme colors by clip type
                      let badgeColor = 'bg-[#1E293B] border-slate-700 text-slate-200';
                      if (clip.type === 'video') {
                        badgeColor = isSelected
                          ? 'bg-cyan-950/80 border-[#00CFFF] text-white shadow-lg shadow-[#00CFFF]/20'
                          : 'bg-[#0F172A] border-slate-700 text-slate-200 hover:border-slate-500';
                      } else if (clip.type === '3d') {
                        badgeColor = isSelected
                          ? 'bg-purple-950/80 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                          : 'bg-[#1E112A] border-purple-900/60 text-purple-200';
                      } else if (clip.type === 'audio') {
                        badgeColor = isSelected
                          ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                          : 'bg-[#062419] border-emerald-900/60 text-emerald-200';
                      } else if (clip.type === 'text') {
                        badgeColor = isSelected
                          ? 'bg-amber-950/80 border-amber-400 text-white shadow-lg shadow-amber-500/20'
                          : 'bg-[#261705] border-amber-900/60 text-amber-200';
                      }

                      return (
                        <div
                          key={clip.id}
                          onMouseDown={(e) => handleClipMouseDown(e, clip)}
                          style={{
                            left: `${clipLeft}px`,
                            width: `${clipWidth}px`,
                          }}
                          className={`absolute top-1 bottom-1 rounded-md border flex items-center justify-between px-2 cursor-grab active:cursor-grabbing overflow-hidden transition-shadow ${badgeColor}`}
                        >
                          {/* Left Trim Handle */}
                          <div
                            onMouseDown={(e) => handleTrimMouseDown(e, clip, 'left')}
                            className="absolute left-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-[#00CFFF] cursor-ew-resize transition-all"
                          />

                          {/* Content / Waveform */}
                          <div className="flex items-center gap-1.5 truncate pointer-events-none w-full">
                            {clip.type === 'audio' ? (
                              <div className="flex items-center gap-0.5 h-4 opacity-75">
                                {generateWaveformData(clip.duration, 16).map((val, idx) => (
                                  <div
                                    key={idx}
                                    style={{ height: `${val * 100}%` }}
                                    className="w-1 bg-emerald-400 rounded-sm"
                                  />
                                ))}
                              </div>
                            ) : clip.type === '3d' ? (
                              <Box className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            ) : clip.type === 'text' ? (
                              <Type className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : null}
                            <span className="text-[10px] font-semibold truncate tracking-tight">
                              {clip.name}
                            </span>
                          </div>

                          {/* Right Trim Handle */}
                          <div
                            onMouseDown={(e) => handleTrimMouseDown(e, clip, 'right')}
                            className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-[#00CFFF] cursor-ew-resize transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
