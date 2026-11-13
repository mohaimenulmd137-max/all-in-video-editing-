import React, { useState, useRef } from 'react';
import { Project, ExportSettings } from '../../types/editor';
import { VideoExportSession, ExportProgress } from '../../utils/exportEngine';
import { X, Download, CheckCircle2, Video, Loader2, Code } from 'lucide-react';
import { StandaloneHtmlPanel } from './StandaloneHtmlPanel';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'html'>('video');
  const [resolution, setResolution] = useState<ExportSettings['resolution']>('1080p');
  const [fps, setFps] = useState<number>(30);
  const [format] = useState<ExportSettings['format']>('mp4');
  const [quality, setQuality] = useState<ExportSettings['quality']>('high');
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const sessionRef = useRef<VideoExportSession | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    const settings: ExportSettings = {
      resolution,
      aspectRatio: project.aspectRatio,
      fps,
      format,
      quality,
      audioBitrate: 192000,
    };

    const session = new VideoExportSession();
    sessionRef.current = session;

    try {
      await session.exportProject(project, settings, (p) => {
        setProgress(p);
      });
    } catch (e: any) {
      if (e.message !== 'Export cancelled by user') {
        setProgress({
          percent: 0,
          currentFrame: 0,
          totalFrames: 0,
          currentTime: 0,
          status: 'error',
          errorMessage: e.message || 'Export error encountered',
        });
      }
    }
  };

  const handleCancelExport = () => {
    if (sessionRef.current) {
      sessionRef.current.cancel();
    }
    setProgress(null);
  };

  const isExporting = progress && (progress.status === 'rendering' || progress.status === 'encoding');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#080B14]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00CFFF]/20 border border-[#00CFFF]/40 flex items-center justify-center text-[#00CFFF]">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">EXPORT CINEMATIC VIDEO</h3>
              <p className="text-[11px] text-slate-400">Master rendering with all audio, overlays and color grades</p>
            </div>
          </div>
          {!isExporting && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Tabs: Video Export vs App HTML Code */}
        <div className="px-5 pt-3 bg-[#080B14] border-b border-slate-800 flex items-center gap-2 pb-3">
          <button
            onClick={() => setActiveTab('video')}
            disabled={!!isExporting}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'video'
                ? 'bg-[#00CFFF] text-black'
                : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Export Video</span>
          </button>
          <button
            onClick={() => setActiveTab('html')}
            disabled={!!isExporting}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'html'
                ? 'bg-[#00CFFF] text-black'
                : 'bg-[#111827] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>App HTML Code</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 max-h-[72vh] overflow-y-auto">
          {activeTab === 'html' ? (
            <StandaloneHtmlPanel />
          ) : !progress || progress.status === 'error' ? (
            <>
              {/* Resolution */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">Export Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '1080p', label: '1080p Full HD' },
                    { id: '720p', label: '720p HD' },
                    { id: '480p', label: '480p Standard' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setResolution(res.id as any)}
                      className={`p-2.5 rounded-xl border text-xs text-center transition-all ${
                        resolution === res.id
                          ? 'border-[#00CFFF] bg-[#00CFFF]/15 text-white font-semibold'
                          : 'border-slate-800 bg-[#111827] text-slate-400 hover:text-white'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Framerate & Format */}
              <div className="grid grid-cols-2 gap-3">
                {/* FPS */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Frame Rate (FPS)</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#111827] p-1 rounded-xl border border-slate-800">
                    {[24, 30, 60].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => setFps(rate)}
                        className={`py-1.5 text-xs rounded-lg font-mono transition-colors ${
                          fps === rate ? 'bg-[#00CFFF] text-black font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-2">Quality Bitrate</label>
                  <div className="grid grid-cols-3 gap-1 bg-[#111827] p-1 rounded-xl border border-slate-800">
                    {(['fast', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        className={`py-1.5 text-xs rounded-lg capitalize transition-colors ${
                          quality === q ? 'bg-[#00CFFF] text-black font-bold' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Summary */}
              <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800/80 text-xs text-slate-400 flex justify-between font-mono">
                <span>Duration: {project.duration.toFixed(1)}s</span>
                <span>Aspect: {project.aspectRatio}</span>
                <span>Tracks: {project.tracks.length}</span>
              </div>
            </>
          ) : progress.status === 'completed' ? (
            /* Completed Screen */
            <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Video Render Complete!</h4>
              <p className="text-xs text-slate-400">
                Your video has been rendered at {resolution} {fps} FPS with all color grades and effects. File size: {progress.blobSizeMb}
              </p>

              <a
                href={progress.downloadUrl}
                download={`${project.name.replace(/[^a-z0-9]/gi, '_')}_master.webm`}
                className="w-full mt-2 py-3 rounded-xl bg-[#00CFFF] hover:bg-[#38bdf8] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00CFFF]/25 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Video to Device</span>
              </a>
            </div>
          ) : (
            /* Exporting in progress */
            <div className="py-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-[#00CFFF] animate-spin" />
                  {progress.status === 'rendering' ? 'Rendering Master Frames...' : 'Encoding Video Container...'}
                </span>
                <span className="font-mono text-cyan-400 font-bold">{progress.percent}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#00CFFF] to-[#3B82F6] transition-all duration-150"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Frame {progress.currentFrame} / {progress.totalFrames}</span>
                <span>Time {progress.currentTime.toFixed(1)}s / {project.duration.toFixed(1)}s</span>
              </div>

              <button
                onClick={handleCancelExport}
                className="mt-2 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition-colors"
              >
                Cancel Export
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'video' && (!progress || progress.status === 'error') && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-800 bg-[#080B14]">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              className="px-5 py-2 text-xs font-semibold text-black bg-[#00CFFF] hover:bg-[#38bdf8] rounded-xl flex items-center gap-2 shadow-lg shadow-[#00CFFF]/20 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Start Export</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
