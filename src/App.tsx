import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Project, TimelineClip, AspectRatio, TextClipData } from './types/editor';
import {
  getSavedProjects,
  saveProject,
  duplicateProject,
  deleteProject,
  importProjectFromJson,
} from './utils/storage';
import {
  DEFAULT_COLOR_GRADE,
  DEFAULT_EFFECTS,
  DEFAULT_MASK,
  DEFAULT_CHROMA_KEY,
  DEFAULT_CARTOON,
  DEFAULT_AUDIO,
  createInitialDemoProject,
} from './constants/presets';
import { startPlaybackAudio, stopPlaybackAudio, setAudioDucking } from './utils/audioEngine';

// Components
import { ProjectDashboard } from './components/Dashboard/ProjectDashboard';
import { StudioHeader } from './components/Header/StudioHeader';
import { VideoPreview } from './components/Preview/VideoPreview';
import { Timeline } from './components/Timeline/Timeline';
import { Toolbar, ActiveStudio } from './components/Toolbar/Toolbar';
import { ColorGradingPanel } from './components/Panels/ColorGradingPanel';
import { EffectsPanel } from './components/Panels/EffectsPanel';
import { AudioStudioPanel } from './components/Panels/AudioStudioPanel';
import { TextStudioPanel } from './components/Panels/TextStudioPanel';
import { AiStudioPanel } from './components/Panels/AiStudioPanel';
import { TransformPanel } from './components/Panels/TransformPanel';
import { BlenderStudioModal } from './components/Panels/BlenderStudioModal';
import { ExportModal } from './components/Panels/ExportModal';
import { HelpTutorialsModal } from './components/Panels/HelpTutorialsModal';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('editor');
  const [projects, setProjects] = useState<Project[]>([]);
  const [project, setProject] = useState<Project>(createInitialDemoProject());

  // Editor states
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>('clip-1');
  const [activeStudio, setActiveStudio] = useState<ActiveStudio>('color');
  const [splitCompare, setSplitCompare] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);

  // Modals
  const [showBlenderModal, setShowBlenderModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Undo / Redo history
  const [undoStack, setUndoStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  // Canvas Reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load projects from storage on mount
  useEffect(() => {
    const list = getSavedProjects();
    setProjects(list);
    if (list.length > 0) {
      setProject(list[0]);
    }
  }, []);

  // Save current project debounced
  const pushUndo = useCallback((currentProj: Project) => {
    setUndoStack((prev) => [...prev.slice(-20), currentProj]);
    setRedoStack([]);
  }, []);

  const updateProject = useCallback(
    (newProject: Project, saveHistory = true) => {
      if (saveHistory) {
        pushUndo(project);
      }
      setProject(newProject);
      saveProject(newProject);
      setProjects(getSavedProjects());
    },
    [project, pushUndo]
  );

  // Undo / Redo handlers
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, project]);
    setUndoStack((prev) => prev.slice(0, -1));
    setProject(previous);
    saveProject(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, project]);
    setRedoStack((prev) => prev.slice(0, -1));
    setProject(next);
    saveProject(next);
  };

  // Playback loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp: number | null = null;

    if (isPlaying) {
      const activeVoice = project.clips.some(
        (c) => c.type === 'audio' && c.name.toLowerCase().includes('voice') && currentTime >= c.start && currentTime < c.start + c.duration
      );
      startPlaybackAudio(activeVoice);

      const loop = (ts: number) => {
        if (lastTimestamp !== null) {
          const delta = (ts - lastTimestamp) / 1000;
          setCurrentTime((prev) => {
            let next = prev + delta;
            if (next >= project.duration) {
              next = 0; // Loop or pause
            }
            return next;
          });
        }
        lastTimestamp = ts;
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    } else {
      stopPlaybackAudio();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      stopPlaybackAudio();
    };
  }, [isPlaying, project.duration, project.clips]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  // Aspect Ratio change
  const handleAspectRatioChange = (ratio: AspectRatio) => {
    updateProject({ ...project, aspectRatio: ratio });
  };

  // Selected clip helper
  const selectedClip = project.clips.find((c) => c.id === selectedClipId);

  const handleUpdateClip = (updatedClip: TimelineClip) => {
    const updatedClips = project.clips.map((c) => (c.id === updatedClip.id ? updatedClip : c));
    updateProject({ ...project, clips: updatedClips });
  };

  // Timeline Cut / Split
  const handleSplitClip = () => {
    if (!selectedClip) return;
    if (currentTime <= selectedClip.start || currentTime >= selectedClip.start + selectedClip.duration) {
      return;
    }

    const firstDuration = currentTime - selectedClip.start;
    const secondDuration = selectedClip.duration - firstDuration;

    const firstClip: TimelineClip = {
      ...selectedClip,
      duration: firstDuration,
    };

    const secondClip: TimelineClip = {
      ...selectedClip,
      id: 'clip-' + Date.now(),
      name: `${selectedClip.name} (Part 2)`,
      start: currentTime,
      duration: secondDuration,
      sourceOffset: selectedClip.sourceOffset + firstDuration,
    };

    const newClips = project.clips
      .map((c) => (c.id === selectedClip.id ? firstClip : c))
      .concat(secondClip);

    updateProject({ ...project, clips: newClips });
    setSelectedClipId(secondClip.id);
  };

  // Timeline Duplicate
  const handleDuplicateClip = () => {
    if (!selectedClip) return;
    const cloned: TimelineClip = {
      ...selectedClip,
      id: 'clip-copy-' + Date.now(),
      name: `${selectedClip.name} (Copy)`,
      start: selectedClip.start + selectedClip.duration + 0.2,
    };
    updateProject({ ...project, clips: [...project.clips, cloned] });
    setSelectedClipId(cloned.id);
  };

  // Timeline Delete
  const handleDeleteClip = () => {
    if (!selectedClip) return;
    const newClips = project.clips.filter((c) => c.id !== selectedClip.id);
    updateProject({ ...project, clips: newClips });
    setSelectedClipId(newClips[0]?.id || null);
  };

  // Track toggles
  const handleToggleTrackMute = (trackId: string) => {
    const tracks = project.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t));
    updateProject({ ...project, tracks }, false);
  };

  const handleToggleTrackHide = (trackId: string) => {
    const tracks = project.tracks.map((t) => (t.id === trackId ? { ...t, hidden: !t.hidden } : t));
    updateProject({ ...project, tracks }, false);
  };

  const handleToggleTrackLock = (trackId: string) => {
    const tracks = project.tracks.map((t) => (t.id === trackId ? { ...t, locked: !t.locked } : t));
    updateProject({ ...project, tracks }, false);
  };

  // Blender 3D insertion
  const handleInsert3DClip = (clip: TimelineClip) => {
    updateProject({ ...project, clips: [...project.clips, clip] });
    setSelectedClipId(clip.id);
    setActiveStudio('transform');
  };

  // AI Auto Captions generator
  const handleGenerateAiCaptions = async (language: 'en' | 'bn') => {
    setIsGeneratingCaptions(true);
    try {
      const res = await fetch('/api/ai/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: project.name,
          duration: project.duration,
          language,
        }),
      });
      const data = await res.json();
      if (data.captions && Array.isArray(data.captions)) {
        // Remove existing text clips
        const otherClips = project.clips.filter((c) => c.trackId !== 'track-text');
        const newTextClips: TimelineClip[] = data.captions.map((cap: any, idx: number) => ({
          id: `caption-${Date.now()}-${idx}`,
          trackId: 'track-text',
          name: `Subtitle: ${cap.text.slice(0, 16)}...`,
          type: 'text',
          start: cap.start,
          duration: Math.max(1, cap.end - cap.start),
          sourceOffset: 0,
          sourceDuration: cap.end - cap.start,
          mediaUrl: '',
          x: 0,
          y: 35,
          scale: 0.9,
          rotation: 0,
          opacity: 1,
          blendMode: 'normal',
          flipH: false,
          flipV: false,
          speed: 1,
          colorGrade: { ...DEFAULT_COLOR_GRADE },
          effects: { ...DEFAULT_EFFECTS },
          mask: { ...DEFAULT_MASK },
          chromaKey: { ...DEFAULT_CHROMA_KEY },
          cartoon: { ...DEFAULT_CARTOON },
          audio: { ...DEFAULT_AUDIO },
          textData: {
            text: cap.text,
            fontFamily: 'Plus Jakarta Sans',
            fontSize: 28,
            textColor: '#FFFFFF',
            isGradient: false,
            gradientColors: ['#00CFFF', '#FFFFFF'],
            strokeWidth: 2,
            strokeColor: '#000000',
            hasShadow: true,
            shadowColor: 'rgba(0,0,0,0.8)',
            shadowBlur: 10,
            hasBackground: true,
            backgroundColor: 'rgba(8, 11, 20, 0.85)',
            backgroundPadding: 10,
            backgroundRadius: 6,
            animation: 'fadeIn',
            textAlign: 'center',
            letterSpacing: 1.5,
            lineHeight: 1.2,
            isBengali: language === 'bn',
          },
        }));

        updateProject({ ...project, clips: [...otherClips, ...newTextClips] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime((prev) => Math.max(0, prev - 1 / 30));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime((prev) => Math.min(project.duration, prev + 1 / 30));
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (selectedClipId) {
          handleDeleteClip();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project.duration, selectedClipId]);

  // Dashboard handlers
  const handleOpenProject = (id: string) => {
    const target = projects.find((p) => p.id === id);
    if (target) {
      setProject(target);
      setCurrentTime(0);
      setCurrentView('editor');
    }
  };

  const handleCreateProject = (name: string, ratio: AspectRatio) => {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      name,
      aspectRatio: ratio,
      duration: 15.0,
      fps: 30,
      tracks: createInitialDemoProject().tracks,
      clips: createInitialDemoProject().clips,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateProject(newProj);
    setCurrentView('editor');
  };

  const handleDuplicateProject = (id: string) => {
    duplicateProject(id);
    setProjects(getSavedProjects());
  };

  const handleDeleteProject = (id: string) => {
    const updated = deleteProject(id);
    setProjects(updated);
  };

  const handleImportProjectJson = (jsonStr: string) => {
    const imported = importProjectFromJson(jsonStr);
    setProjects(getSavedProjects());
    setProject(imported);
    setCurrentView('editor');
  };

  // If viewing Dashboard
  if (currentView === 'dashboard') {
    return (
      <ProjectDashboard
        projects={projects}
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onImportProjectJson={handleImportProjectJson}
        onOpenHelp={() => setShowHelpModal(true)}
        onOpenBlenderDirect={() => {
          setCurrentView('editor');
          setShowBlenderModal(true);
        }}
      />
    );
  }

  // Active clip fallbacks for editors
  const activeColorGrade = selectedClip ? selectedClip.colorGrade : DEFAULT_COLOR_GRADE;
  const activeEffects = selectedClip ? selectedClip.effects : DEFAULT_EFFECTS;
  const activeAudio = selectedClip ? selectedClip.audio : DEFAULT_AUDIO;
  const activeChromaKey = selectedClip ? selectedClip.chromaKey : DEFAULT_CHROMA_KEY;
  const activeCartoon = selectedClip ? selectedClip.cartoon : DEFAULT_CARTOON;
  const activeTextData: TextClipData = selectedClip?.textData || {
    text: 'Cinematic Studio Title',
    fontFamily: 'Plus Jakarta Sans',
    fontSize: 36,
    textColor: '#FFFFFF',
    isGradient: false,
    gradientColors: ['#00CFFF', '#3B82F6'],
    strokeWidth: 2,
    strokeColor: '#000000',
    hasShadow: true,
    shadowColor: 'rgba(0, 207, 255, 0.6)',
    shadowBlur: 15,
    hasBackground: false,
    backgroundColor: 'rgba(8, 11, 20, 0.8)',
    backgroundPadding: 12,
    backgroundRadius: 8,
    animation: 'fadeIn',
    textAlign: 'center',
    letterSpacing: 2,
    lineHeight: 1.2,
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080B14] text-white overflow-hidden select-none">
      {/* Studio Header (Top Bar Contract) */}
      <StudioHeader
        projectName={project.name}
        aspectRatio={project.aspectRatio}
        onAspectRatioChange={handleAspectRatioChange}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenDashboard={() => setCurrentView('dashboard')}
        onOpenExport={() => setShowExportModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden">
        {/* Left / Upper: Video Preview Viewport */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-[#05070D] border-b md:border-b-0 md:border-r border-slate-800/80 overflow-hidden">
          <VideoPreview
            project={project}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            splitCompare={splitCompare}
            onToggleSplitCompare={() => setSplitCompare(!splitCompare)}
            canvasRef={canvasRef}
          />
        </div>

        {/* Right / Side Drawer: Contextual Studio Panels */}
        <div className="md:col-span-5 lg:col-span-4 flex flex-col bg-[#080B14] overflow-y-auto p-3 sm:p-4 border-b border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              {activeStudio === 'transform'
                ? 'Clip Transform & Speed'
                : activeStudio === 'color'
                ? 'Color Grading & Scopes'
                : activeStudio === 'effects'
                ? 'Visual Effects & Filters'
                : activeStudio === 'audio'
                ? 'Audio Studio & EQ'
                : activeStudio === 'text'
                ? 'Typography & Subtitles'
                : 'AI Creative Studio'}
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {selectedClip ? selectedClip.name : 'No Clip Selected'}
            </span>
          </div>

          {/* Contextual Sub-Panels */}
          {activeStudio === 'transform' && selectedClip && (
            <TransformPanel
              clip={selectedClip}
              onChange={handleUpdateClip}
              onSplit={handleSplitClip}
              onDuplicate={handleDuplicateClip}
              onDelete={handleDeleteClip}
            />
          )}

          {activeStudio === 'color' && (
            <ColorGradingPanel
              colorGrade={activeColorGrade}
              onChange={(updated) => {
                if (selectedClip) {
                  handleUpdateClip({ ...selectedClip, colorGrade: updated });
                }
              }}
              canvasRef={canvasRef}
              splitCompare={splitCompare}
              onToggleSplitCompare={() => setSplitCompare(!splitCompare)}
            />
          )}

          {activeStudio === 'effects' && (
            <EffectsPanel
              effects={activeEffects}
              onChange={(updated) => {
                if (selectedClip) {
                  handleUpdateClip({ ...selectedClip, effects: updated });
                }
              }}
            />
          )}

          {activeStudio === 'audio' && (
            <AudioStudioPanel
              audio={activeAudio}
              onChange={(updated) => {
                if (selectedClip) {
                  handleUpdateClip({ ...selectedClip, audio: updated });
                }
              }}
            />
          )}

          {activeStudio === 'text' && (
            <TextStudioPanel
              textData={activeTextData}
              onChange={(updated) => {
                if (selectedClip) {
                  handleUpdateClip({ ...selectedClip, textData: updated });
                }
              }}
              onGenerateAiCaptions={handleGenerateAiCaptions}
              isGeneratingCaptions={isGeneratingCaptions}
            />
          )}

          {activeStudio === 'ai' && (
            <AiStudioPanel
              chromaKey={activeChromaKey}
              onChromaKeyChange={(updated) => {
                if (selectedClip) {
                  handleUpdateClip({ ...selectedClip, chromaKey: updated });
                }
              }}
              cartoon={activeCartoon}
              onCartoonChange={(updated) => {
                if (selectedClip) {
                  handleUpdateClip({ ...selectedClip, cartoon: updated });
                }
              }}
              currentAspectRatio={project.aspectRatio}
              onAutoReframe={handleAspectRatioChange}
              onDetectScenes={handleSplitClip}
            />
          )}
        </div>
      </div>

      {/* Multi-Track Timeline (Bottom Section) */}
      <Timeline
        project={project}
        currentTime={currentTime}
        onSeek={handleSeek}
        selectedClipId={selectedClipId}
        onSelectClip={(id) => {
          setSelectedClipId(id);
          if (id) {
            const clip = project.clips.find((c) => c.id === id);
            if (clip?.type === 'text') {
              setActiveStudio('text');
            } else if (clip?.type === 'audio') {
              setActiveStudio('audio');
            }
          }
        }}
        onUpdateClip={handleUpdateClip}
        onSplitClip={handleSplitClip}
        onDuplicateClip={handleDuplicateClip}
        onDeleteClip={handleDeleteClip}
        onToggleTrackMute={handleToggleTrackMute}
        onToggleTrackHide={handleToggleTrackHide}
        onToggleTrackLock={handleToggleTrackLock}
      />

      {/* Bottom Contextual Studio Switcher Toolbar */}
      <Toolbar
        activeStudio={activeStudio}
        onSelectStudio={setActiveStudio}
        onOpenBlenderStudio={() => setShowBlenderModal(true)}
        hasSelectedClip={!!selectedClip}
      />

      {/* Blender 3D Studio Modal */}
      <BlenderStudioModal
        isOpen={showBlenderModal}
        onClose={() => setShowBlenderModal(false)}
        onInsertToTimeline={handleInsert3DClip}
        currentTime={currentTime}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        project={project}
      />

      {/* Help & Learning Center Modal */}
      <HelpTutorialsModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
}
