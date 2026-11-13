import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Layers, Lightbulb, Box, Camera, Check, Download, Upload, Monitor } from 'lucide-react';
import { TimelineClip } from '../../types/editor';
import { DEFAULT_COLOR_GRADE, DEFAULT_EFFECTS, DEFAULT_MASK, DEFAULT_CHROMA_KEY, DEFAULT_CARTOON, DEFAULT_AUDIO } from '../../constants/presets';

interface BlenderStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToTimeline: (clip: TimelineClip) => void;
  currentTime: number;
}

export const BlenderStudioModal: React.FC<BlenderStudioModalProps> = ({
  isOpen,
  onClose,
  onInsertToTimeline,
  currentTime,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedAsset, setSelectedAsset] = useState<'monolith' | 'floating_logo' | 'sci_fi_orb' | 'title_3d'>('monolith');
  const [titleText, setTitleText] = useState('CINEMATIC 3D');
  const [lightColor, setLightColor] = useState('#00CFFF');
  const [metallic, setMetallic] = useState(0.85);
  const [roughness, setRoughness] = useState(0.15);
  const [orbitSpeed, setOrbitSpeed] = useState(1.0);
  const [renderPass, setRenderPass] = useState<'beauty' | 'depth' | 'normal' | 'wireframe'>('beauty');
  const [processingMode, setProcessingMode] = useState<'on_device' | 'desktop_companion' | 'remote_render'>('on_device');
  const [customModelName, setCustomModelName] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 320;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = renderPass === 'beauty' ? new THREE.Color(0x080b14) : new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 4.5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    mountRef.current.replaceChildren(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(new THREE.Color(lightColor), 2.5);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const rimLight = new THREE.PointLight(0x3b82f6, 3, 10);
    rimLight.position.set(-3, -2, -3);
    scene.add(rimLight);

    // 5. Geometry / Asset
    let geom: THREE.BufferGeometry;
    if (selectedAsset === 'monolith') {
      geom = new THREE.BoxGeometry(1.2, 2.2, 0.3);
    } else if (selectedAsset === 'floating_logo') {
      geom = new THREE.TorusKnotGeometry(0.8, 0.25, 128, 32);
    } else if (selectedAsset === 'sci_fi_orb') {
      geom = new THREE.IcosahedronGeometry(1.1, 2);
    } else {
      geom = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 32);
    }

    let mat: THREE.Material;
    if (renderPass === 'normal') {
      mat = new THREE.MeshNormalMaterial({ wireframe: false });
    } else if (renderPass === 'depth') {
      mat = new THREE.MeshDepthMaterial();
    } else if (renderPass === 'wireframe') {
      mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(lightColor), wireframe: true });
    } else {
      mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x1e293b),
        metalness: metallic,
        roughness: roughness,
        emissive: new THREE.Color(lightColor),
        emissiveIntensity: 0.25,
      });
    }

    const mesh = new THREE.Mesh(geom, mat);
    scene.add(mesh);
    meshRef.current = mesh;

    // Floor grid for scale reference
    const grid = new THREE.GridHelper(8, 16, 0x00cfff, 0x1f2937);
    grid.position.y = -1.2;
    scene.add(grid);

    // 6. Animation Loop
    let angle = 0;
    const animate = () => {
      angle += 0.015 * orbitSpeed;
      if (meshRef.current) {
        meshRef.current.rotation.y = angle;
        meshRef.current.rotation.x = Math.sin(angle * 0.5) * 0.15;
      }
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      geom.dispose();
    };
  }, [isOpen, selectedAsset, lightColor, metallic, roughness, orbitSpeed, renderPass]);

  if (!isOpen) return null;

  const handleInsert = () => {
    const new3DClip: TimelineClip = {
      id: 'clip-3d-' + Date.now(),
      trackId: 'track-v2',
      name: `3D Blender: ${selectedAsset.toUpperCase()}`,
      type: '3d',
      start: currentTime,
      duration: 5.0,
      sourceOffset: 0,
      sourceDuration: 5.0,
      mediaUrl: '3d:' + selectedAsset,
      x: 0,
      y: 0,
      scale: 0.9,
      rotation: 0,
      opacity: 0.95,
      blendMode: 'screen',
      flipH: false,
      flipV: false,
      speed: 1,
      colorGrade: { ...DEFAULT_COLOR_GRADE },
      effects: { ...DEFAULT_EFFECTS },
      mask: { ...DEFAULT_MASK },
      chromaKey: { ...DEFAULT_CHROMA_KEY },
      cartoon: { ...DEFAULT_CARTOON },
      audio: { ...DEFAULT_AUDIO },
      threeDData: {
        sceneType: selectedAsset,
        text: titleText,
        cameraOrbitSpeed: orbitSpeed,
        lightColor,
        metallic,
        roughness,
        passType: renderPass,
        rotationX: 10,
        rotationY: 20,
        rotationZ: 0,
      },
    };

    onInsertToTimeline(new3DClip);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomModelName(file.name);
      setSelectedAsset('floating_logo');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#080B14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EA7600]/20 border border-[#EA7600]/40 flex items-center justify-center text-[#EA7600]">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">BLENDER 3D INTEGRATION STUDIO</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                  {processingMode === 'on_device' ? 'WebGL Active' : 'Companion Mode'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Compose 3D titles, models, and multi-pass VFX directly into your video timeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left: 3D Viewport */}
          <div className="md:col-span-7 flex flex-col border-b md:border-b-0 md:border-r border-slate-800 bg-[#060810] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#00CFFF]" /> Perspective Camera (45° FOV)
              </span>
              <div className="flex items-center gap-1 bg-[#111827] p-0.5 rounded-lg border border-slate-800">
                {(['beauty', 'wireframe', 'depth', 'normal'] as const).map((pass) => (
                  <button
                    key={pass}
                    onClick={() => setRenderPass(pass)}
                    className={`px-2 py-1 text-[10px] font-mono rounded capitalize transition-colors ${
                      renderPass === pass ? 'bg-[#00CFFF] text-black font-semibold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {pass}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Viewport Canvas container */}
            <div
              ref={mountRef}
              className="w-full h-64 md:h-80 rounded-xl bg-black border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner"
            />

            {/* Viewport Info Bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60 font-mono">
              <span>Target: Track V2 (Overlay)</span>
              <span>Blend: Screen / Add</span>
              <span>FPS: Synchronized</span>
            </div>
          </div>

          {/* Right: Controls & Parameters */}
          <div className="md:col-span-5 p-4 flex flex-col gap-4 overflow-y-auto bg-[#080B14]">
            {/* 3D Asset Selection */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">3D Asset Type</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'monolith', label: 'Cinematic Monolith' },
                  { id: 'floating_logo', label: 'Torus Hologram' },
                  { id: 'sci_fi_orb', label: 'Quantum Orb' },
                  { id: 'title_3d', label: '3D Cylinder Pillar' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedAsset(item.id as any)}
                    className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                      selectedAsset === item.id
                        ? 'border-[#00CFFF] bg-[#00CFFF]/10 text-white font-medium'
                        : 'border-slate-800 bg-[#111827] text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Material & Lighting */}
            <div className="space-y-3 p-3 rounded-xl bg-[#111827] border border-slate-800">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-[#00CFFF]" /> Lighting & Material Shading
              </span>

              {/* Light Color */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Light / Emissive Color</span>
                <div className="flex items-center gap-2">
                  {['#00CFFF', '#3B82F6', '#EC4899', '#EAB308', '#10B981', '#FFFFFF'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setLightColor(c)}
                      className={`w-5 h-5 rounded-full border ${
                        lightColor === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Metallic */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Metallic Refection</span>
                  <span className="font-mono text-slate-300">{(metallic * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={metallic}
                  onChange={(e) => setMetallic(parseFloat(e.target.value))}
                  className="w-full accent-[#00CFFF]"
                />
              </div>

              {/* Roughness */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Surface Roughness</span>
                  <span className="font-mono text-slate-300">{(roughness * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1"
                  step="0.05"
                  value={roughness}
                  onChange={(e) => setRoughness(parseFloat(e.target.value))}
                  className="w-full accent-[#00CFFF]"
                />
              </div>

              {/* Orbit Speed */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Camera Orbit Speed</span>
                  <span className="font-mono text-slate-300">{orbitSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.2"
                  value={orbitSpeed}
                  onChange={(e) => setOrbitSpeed(parseFloat(e.target.value))}
                  className="w-full accent-[#00CFFF]"
                />
              </div>
            </div>

            {/* Import Custom GLB / OBJ Model */}
            <div className="p-3 rounded-xl bg-[#111827] border border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-2">
                <span>Custom 3D Model / Asset</span>
                <span className="text-[10px] text-slate-400">GLB, GLTF, OBJ</span>
              </label>
              <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-slate-700 bg-black/40 hover:bg-black/60 cursor-pointer text-xs text-slate-300 transition-colors">
                <Upload className="w-4 h-4 text-[#00CFFF]" />
                <span>{customModelName ? customModelName : 'Upload 3D Asset File'}</span>
                <input type="file" accept=".glb,.gltf,.obj" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Workflow Mode Selector */}
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1.5">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Monitor className="w-3.5 h-3.5 text-[#00CFFF]" /> Blender Processing Pipeline
              </div>
              <div className="flex items-center gap-1">
                {(['on_device', 'desktop_companion', 'remote_render'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setProcessingMode(mode)}
                    className={`flex-1 py-1 text-[10px] rounded border transition-colors ${
                      processingMode === mode
                        ? 'border-[#00CFFF] bg-[#00CFFF]/20 text-[#00CFFF] font-medium'
                        : 'border-slate-800 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {mode === 'on_device' ? 'WebGL Live' : mode === 'desktop_companion' ? 'Desktop' : 'Remote'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#080B14]">
          <span className="text-xs text-slate-400 hidden sm:inline">
            Inserting at current playhead: <span className="font-mono text-cyan-400">{currentTime.toFixed(2)}s</span>
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="px-5 py-2 text-xs font-semibold text-black bg-[#00CFFF] hover:bg-[#38bdf8] rounded-xl flex items-center gap-2 shadow-lg shadow-[#00CFFF]/20 transition-all active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              <span>Insert into Video Timeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
