import React, { useState } from 'react';
import { Project, AspectRatio } from '../../types/editor';
import {
  Plus,
  Video,
  FolderOpen,
  Copy,
  Trash2,
  Download,
  Upload,
  Box,
  Wand2,
  Music,
  HelpCircle,
  Clock,
  Code,
  X,
} from 'lucide-react';
import { StandaloneHtmlPanel } from '../Panels/StandaloneHtmlPanel';

interface ProjectDashboardProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onCreateProject: (name: string, ratio: AspectRatio) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onImportProjectJson: (json: string) => void;
  onOpenHelp: () => void;
  onOpenBlenderDirect: () => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  projects,
  onOpenProject,
  onCreateProject,
  onDuplicateProject,
  onDeleteProject,
  onImportProjectJson,
  onOpenHelp,
  onOpenBlenderDirect,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('My Cinematic Movie');
  const [newProjectRatio, setNewProjectRatio] = useState<AspectRatio>('16:9');
  const [showHtmlModal, setShowHtmlModal] = useState(false);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim(), newProjectRatio);
    setShowNewModal(false);
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          try {
            onImportProjectJson(text);
          } catch (err: any) {
            alert(err.message || 'Failed to import project');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-white flex flex-col p-4 sm:p-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00CFFF] to-[#3B82F6] flex items-center justify-center font-black text-black text-xl shadow-xl shadow-[#00CFFF]/20">
            C
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              CINEMATIC EDITOR STUDIO
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              One Studio. Complete Creative Control. Mobile-first Pro Video & AI Studio.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download / Copy Standalone HTML */}
          <button
            onClick={() => setShowHtmlModal(true)}
            title="Download or Copy complete standalone single-file HTML"
            className="px-3 py-2 rounded-xl border border-cyan-800/60 bg-[#111827] hover:bg-slate-800 text-xs text-cyan-400 font-medium flex items-center gap-1.5 transition-colors"
          >
            <Code className="w-4 h-4 text-[#00CFFF]" />
            <span>HTML File & Code</span>
          </button>

          {/* Import JSON */}
          <label className="px-3 py-2 rounded-xl border border-slate-800 bg-[#111827] hover:bg-slate-800 text-xs text-slate-300 font-medium flex items-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-[#00CFFF]" />
            <span>Import Project</span>
            <input type="file" accept=".cinematic,.json" onChange={handleJsonUpload} className="hidden" />
          </label>

          {/* New Project CTA */}
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-[#00CFFF] hover:bg-[#38bdf8] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#00CFFF]/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Quick Studio Workspaces Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <div
          onClick={() => onOpenProject(projects[0]?.id || '')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F19] border border-slate-800 hover:border-[#00CFFF]/50 cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-[#00CFFF] mb-2.5 group-hover:scale-105 transition-transform">
            <Video className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Video Editor</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Multi-track timeline & cut</div>
        </div>

        <div
          onClick={() => onOpenProject(projects[0]?.id || '')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F19] border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-105 transition-transform">
            <Music className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Audio Studio</div>
          <div className="text-[11px] text-slate-400 mt-0.5">EQ, Voice presets & ducking</div>
        </div>

        <div
          onClick={() => onOpenProject(projects[0]?.id || '')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F19] border border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 mb-2.5 group-hover:scale-105 transition-transform">
            <Wand2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">AI Studio</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Cartoonize, BG Remover & captions</div>
        </div>

        <div
          onClick={onOpenBlenderDirect}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0B0F19] border border-slate-800 hover:border-[#EA7600]/50 cursor-pointer transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-[#EA7600] mb-2.5 group-hover:scale-105 transition-transform">
            <Box className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-white">Blender 3D</div>
          <div className="text-[11px] text-slate-400 mt-0.5">3D models & camera overlay</div>
        </div>
      </div>

      {/* Recent Projects Grid */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#00CFFF]" /> Recent Projects ({projects.length})
          </h2>
          <span className="text-xs text-slate-500">Auto-saved to device</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#0B0F19] border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col group shadow-lg"
            >
              {/* Project Card Header Thumbnail */}
              <div
                onClick={() => onOpenProject(proj.id)}
                className="h-36 bg-gradient-to-br from-[#060814] via-[#111827] to-[#080B14] p-4 flex flex-col justify-between cursor-pointer relative overflow-hidden group-hover:brightness-110 transition-all"
              >
                <div className="flex items-center justify-between z-10">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-black/60 border border-slate-800 text-cyan-400">
                    {proj.aspectRatio}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {proj.duration.toFixed(1)}s
                  </span>
                </div>

                <div className="z-10">
                  <h3 className="text-sm font-bold text-white group-hover:text-[#00CFFF] transition-colors truncate">
                    {proj.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {proj.clips.length} clips · {proj.tracks.length} tracks
                  </p>
                </div>

                {/* Decorative Subtle Grid Lines */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00CFFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              </div>

              {/* Card Bottom Actions */}
              <div className="p-3 border-t border-slate-800/80 bg-[#080B14] flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenProject(proj.id)}
                  className="px-3 py-1.5 rounded-lg bg-[#00CFFF]/10 text-[#00CFFF] hover:bg-[#00CFFF]/20 font-semibold transition-colors"
                >
                  Open Editor
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    title="Duplicate Project"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteProject(proj.id)}
                    title="Delete Project"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleCreateSubmit}
            className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4"
          >
            <h3 className="text-sm font-bold text-white">Create New Cinematic Project</h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Project Title</label>
              <input
                type="text"
                autoFocus
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#080B14] border border-slate-800 text-white focus:outline-none focus:border-[#00CFFF] text-sm"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">Aspect Ratio Canvas</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '16:9', label: '16:9 Cinema' },
                  { id: '9:16', label: '9:16 Mobile' },
                  { id: '1:1', label: '1:1 Square' },
                  { id: '21:9', label: '21:9 Ultrawide' },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setNewProjectRatio(r.id as AspectRatio)}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                      newProjectRatio === r.id
                        ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-white font-bold'
                        : 'border-slate-800 bg-[#080B14] text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#00CFFF] hover:bg-[#38bdf8] text-black font-bold text-xs"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full HTML Code Viewer & Download Modal */}
      {showHtmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#080B14]">
              <div className="flex items-center gap-2.5">
                <Code className="w-4 h-4 text-[#00CFFF]" />
                <div>
                  <h3 className="text-sm font-bold text-white">Standalone HTML File & Code</h3>
                  <p className="text-[11px] text-slate-400">
                    Download .html, share on mobile, or copy code in safe chunks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHtmlModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <StandaloneHtmlPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
