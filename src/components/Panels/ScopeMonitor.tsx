import React, { useEffect, useRef } from 'react';

interface ScopeMonitorProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  activeScope: 'waveform' | 'histogram' | 'vectorscope';
  onScopeChange: (scope: 'waveform' | 'histogram' | 'vectorscope') => void;
}

export const ScopeMonitor: React.FC<ScopeMonitorProps> = ({
  canvasRef,
  activeScope,
  onScopeChange,
}) => {
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const drawScope = () => {
      const sourceCanvas = canvasRef.current;
      const scopeCanvas = scopeCanvasRef.current;
      if (!sourceCanvas || !scopeCanvas) return;

      const sctx = scopeCanvas.getContext('2d');
      if (!sctx) return;

      const sw = scopeCanvas.width;
      const sh = scopeCanvas.height;

      // Clear
      sctx.fillStyle = '#060810';
      sctx.fillRect(0, 0, sw, sh);

      // Draw subtle grid lines (IRE 0, 50, 100)
      sctx.strokeStyle = '#1F2937';
      sctx.lineWidth = 1;
      for (let y = 0; y <= sh; y += sh / 4) {
        sctx.beginPath();
        sctx.moveTo(0, y);
        sctx.lineTo(sw, y);
        sctx.stroke();
      }

      // Sample source frame
      const tempCanvas = document.createElement('canvas');
      const sampleW = 120;
      const sampleH = 68;
      tempCanvas.width = sampleW;
      tempCanvas.height = sampleH;
      const tctx = tempCanvas.getContext('2d');
      if (!tctx) return;

      try {
        tctx.drawImage(sourceCanvas, 0, 0, sampleW, sampleH);
        const imgData = tctx.getImageData(0, 0, sampleW, sampleH).data;

        if (activeScope === 'waveform') {
          // RGB Waveform Parade
          sctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          for (let x = 0; x < sampleW; x++) {
            const plotX = (x / sampleW) * (sw / 3);
            for (let y = 0; y < sampleH; y++) {
              const idx = (y * sampleW + x) * 4;
              const r = imgData[idx];
              const plotY = sh - (r / 255) * sh;
              sctx.fillRect(plotX, plotY, 1.5, 1.5);
            }
          }

          sctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          for (let x = 0; x < sampleW; x++) {
            const plotX = sw / 3 + (x / sampleW) * (sw / 3);
            for (let y = 0; y < sampleH; y++) {
              const idx = (y * sampleW + x) * 4;
              const g = imgData[idx + 1];
              const plotY = sh - (g / 255) * sh;
              sctx.fillRect(plotX, plotY, 1.5, 1.5);
            }
          }

          sctx.fillStyle = 'rgba(0, 207, 255, 0.4)';
          for (let x = 0; x < sampleW; x++) {
            const plotX = (sw / 3) * 2 + (x / sampleW) * (sw / 3);
            for (let y = 0; y < sampleH; y++) {
              const idx = (y * sampleW + x) * 4;
              const b = imgData[idx + 2];
              const plotY = sh - (b / 255) * sh;
              sctx.fillRect(plotX, plotY, 1.5, 1.5);
            }
          }

          // Labels
          sctx.fillStyle = '#EF4444';
          sctx.font = '10px "JetBrains Mono", monospace';
          sctx.fillText('R', 6, 14);
          sctx.fillStyle = '#10B981';
          sctx.fillText('G', sw / 3 + 6, 14);
          sctx.fillStyle = '#00CFFF';
          sctx.fillText('B', (sw / 3) * 2 + 6, 14);
        } else if (activeScope === 'histogram') {
          // Luma & Color Histogram
          const histL = new Uint32Array(256);
          const histR = new Uint32Array(256);
          const histG = new Uint32Array(256);
          const histB = new Uint32Array(256);

          for (let i = 0; i < imgData.length; i += 4) {
            histR[imgData[i]]++;
            histG[imgData[i + 1]]++;
            histB[imgData[i + 2]]++;
            const luma = Math.round(0.299 * imgData[i] + 0.587 * imgData[i + 1] + 0.114 * imgData[i + 2]);
            histL[luma]++;
          }

          const maxVal = Math.max(...histL, 1);
          sctx.lineWidth = 1;

          // Plot Luma
          sctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          sctx.beginPath();
          for (let i = 0; i < 256; i++) {
            const px = (i / 255) * sw;
            const py = sh - (histL[i] / maxVal) * (sh - 10);
            if (i === 0) sctx.moveTo(px, py);
            else sctx.lineTo(px, py);
          }
          sctx.stroke();

          // Plot Cyan tint
          sctx.strokeStyle = 'rgba(0, 207, 255, 0.6)';
          sctx.beginPath();
          for (let i = 0; i < 256; i++) {
            const px = (i / 255) * sw;
            const py = sh - (histB[i] / maxVal) * (sh - 10);
            if (i === 0) sctx.moveTo(px, py);
            else sctx.lineTo(px, py);
          }
          sctx.stroke();
        } else if (activeScope === 'vectorscope') {
          // Vectorscope Polar Plot
          const cx = sw / 2;
          const cy = sh / 2;
          const radius = Math.min(cx, cy) - 8;

          sctx.strokeStyle = '#1F2937';
          sctx.beginPath();
          sctx.arc(cx, cy, radius, 0, Math.PI * 2);
          sctx.stroke();

          // Color target marks
          sctx.fillStyle = '#00CFFF';
          for (let i = 0; i < imgData.length; i += 8) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];

            // YCbCr chroma extraction
            const cb = -0.168736 * r - 0.331264 * g + 0.5 * b;
            const cr = 0.5 * r - 0.418688 * g - 0.081312 * b;

            const px = cx + (cb / 128) * radius;
            const py = cy + (cr / 128) * radius;

            sctx.fillRect(px, py, 1.2, 1.2);
          }
        }
      } catch (e) {
        // Safe cross-origin / empty canvas fallback
      }

      animId = requestAnimationFrame(drawScope);
    };

    animId = requestAnimationFrame(drawScope);
    return () => cancelAnimationFrame(animId);
  }, [canvasRef, activeScope]);

  return (
    <div className="bg-[#080B14] border border-slate-800 rounded-xl p-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
          SCOPE MONITOR (10-BIT)
        </span>
        <div className="flex items-center gap-1 bg-[#111827] p-0.5 rounded-lg border border-slate-800">
          {(['waveform', 'histogram', 'vectorscope'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onScopeChange(s)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded capitalize transition-colors ${
                activeScope === s ? 'bg-[#00CFFF] text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <canvas
        ref={scopeCanvasRef}
        width={320}
        height={100}
        className="w-full h-24 rounded-lg bg-black border border-slate-800/80"
      />
    </div>
  );
};
