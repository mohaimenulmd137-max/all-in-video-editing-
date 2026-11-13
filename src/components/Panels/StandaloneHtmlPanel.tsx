import React, { useEffect, useState } from 'react';
import {
  fetchStandaloneHtmlText,
  downloadHtmlViaBlob,
  canShareHtmlFile,
  shareHtmlFileMobile,
  copyTextReliably,
  splitTextIntoChunks,
} from '../../utils/htmlExportHelper';
import {
  Download,
  Copy,
  Check,
  Share2,
  Code,
  AlertCircle,
  Loader2,
  FileCode2,
} from 'lucide-react';

export const StandaloneHtmlPanel: React.FC = () => {
  const [htmlText, setHtmlText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [copiedChunkIdx, setCopiedChunkIdx] = useState<number | null>(null);
  const [showChunkedCopy, setShowChunkedCopy] = useState(false);

  const shareSupported = canShareHtmlFile();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setLoadError(null);
    fetchStandaloneHtmlText()
      .then((text) => {
        if (!active) return;
        setHtmlText(text);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!active) return;
        setLoadError(err?.message || 'Could not load HTML file.');
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDownloadBlob = () => {
    if (!htmlText) return;
    const ok = downloadHtmlViaBlob(htmlText, 'cinematic_studio_standalone.html');
    if (ok) {
      setStatusMsg({
        type: 'success',
        text: 'Download started (cinematic_studio_standalone.html). যদি iframe-এ ডাউনলোড ব্লক হয়, নিচের "Save / Share" অথবা "Copy" ব্যবহার করুন।',
      });
    } else {
      setStatusMsg({
        type: 'error',
        text: 'Direct download blocked by browser. Please use Share / Save or Copy in Parts.',
      });
    }
  };

  const handleShareMobile = async () => {
    if (!htmlText) return;
    const res = await shareHtmlFileMobile(htmlText, 'cinematic_studio_standalone.html');
    if (res.ok) {
      setStatusMsg({ type: 'success', text: 'File shared / saved successfully!' });
    } else if (res.error) {
      setStatusMsg({ type: 'info', text: res.error });
    }
  };

  const handleCopyFull = async () => {
    if (!htmlText) return;
    const res = await copyTextReliably(htmlText);
    if (res.ok) {
      setCopiedFull(true);
      setStatusMsg({
        type: 'success',
        text: `100% HTML Code (${(htmlText.length / 1024).toFixed(0)} KB) copied to clipboard!`,
      });
      setTimeout(() => setCopiedFull(false), 3000);
    } else {
      setShowChunkedCopy(true);
      setStatusMsg({
        type: 'error',
        text: 'আপনার মোবাইল ব্রাউজার/ক্লিপবোর্ড একসাথে ১ MB কপি ব্লক করেছে। নিচের Part 1, Part 2, Part 3, Part 4 থেকে সহজে কপি করুন!',
      });
    }
  };

  const chunks = splitTextIntoChunks(htmlText, 240000);

  const handleCopyChunk = async (chunkText: string, idx: number) => {
    const res = await copyTextReliably(chunkText);
    if (res.ok) {
      setCopiedChunkIdx(idx);
      setStatusMsg({
        type: 'success',
        text: `Part ${idx + 1} of ${chunks.length} copied! (${(chunkText.length / 1024).toFixed(0)} KB)`,
      });
      setTimeout(() => setCopiedChunkIdx(null), 2500);
    } else {
      setStatusMsg({
        type: 'error',
        text: res.reason || 'Copy failed on this browser.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-cyan-400 font-mono">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading complete standalone HTML bundle...</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 shrink-0" />
        <span>{loadError}</span>
      </div>
    );
  }

  const sizeKb = (htmlText.length / 1024).toFixed(1);

  return (
    <div className="flex flex-col gap-3 text-xs">
      {/* Info Box */}
      <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <FileCode2 className="w-5 h-5 text-[#00CFFF] shrink-0" />
          <div>
            <div className="font-bold text-white">cinematic_studio_standalone.html</div>
            <div className="text-[11px] text-slate-400">
              {sizeKb} KB · Complete offline single-file HTML app
            </div>
          </div>
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
              : statusMsg.type === 'error'
              ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-300'
          }`}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Primary Action Buttons (Download + Share + Copy) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={handleDownloadBlob}
          className="py-2.5 px-3 rounded-xl bg-[#00CFFF] hover:bg-[#38bdf8] text-black font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download .html ({sizeKb} KB)</span>
        </button>

        <button
          onClick={handleCopyFull}
          className="py-2.5 px-3 rounded-xl bg-[#111827] hover:bg-slate-800 border border-cyan-800/60 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          {copiedFull ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copiedFull ? 'Copied Full Code!' : 'Copy Full HTML Code'}</span>
        </button>
      </div>

      {/* Mobile Share / Direct Link Fallback */}
      <div className="flex flex-wrap items-center gap-2">
        {shareSupported && (
          <button
            onClick={handleShareMobile}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Save / Share File (Mobile)</span>
          </button>
        )}

        <a
          href="/api/download-standalone-html"
          download="cinematic_studio_standalone.html"
          className="flex-1 py-2 px-3 rounded-xl bg-[#111827] hover:bg-slate-800 border border-slate-800 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#00CFFF]" />
          <span>Direct Server Download</span>
        </a>
      </div>

      {/* Chunked Copy Section (Guaranteed to work on Android/iOS clipboard limits) */}
      <div className="p-3 rounded-xl bg-[#080B14] border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-[#00CFFF]" />
            Mobile Safe Copy ({chunks.length} Parts)
          </span>
          <button
            onClick={() => setShowChunkedCopy(!showChunkedCopy)}
            className="text-[11px] text-cyan-400 hover:underline"
          >
            {showChunkedCopy ? 'Hide Parts' : 'Show Parts'}
          </button>
        </div>

        {(showChunkedCopy || chunks.length > 1) && (
          <>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              ফোনের ক্লিপবোর্ডে একসাথে পুরো কোড কপি না হলে নিচের Part 1 থেকে Part {chunks.length} পরপর কপি করে ফাইলে পেস্ট করুন:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {chunks.map((chunk, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyChunk(chunk, idx)}
                  className={`py-2 px-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all ${
                    copiedChunkIdx === idx
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                      : 'border-slate-800 bg-[#111827] hover:border-[#00CFFF] text-slate-300'
                  }`}
                >
                  {copiedChunkIdx === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-[#00CFFF]" />}
                  <span>
                    Part {idx + 1}/{chunks.length} ({(chunk.length / 1024).toFixed(0)}KB)
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Preview Box */}
      <textarea
        readOnly
        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        value={
          htmlText.length > 60000
            ? `${htmlText.slice(0, 60000)}\n\n... [Showing first 60 KB preview out of ${sizeKb} KB — use "Download .html" or "Copy Part 1..${chunks.length}" above]`
            : htmlText
        }
        className="w-full h-36 p-2.5 rounded-xl bg-[#05070D] border border-slate-800 text-[10px] font-mono text-slate-400 focus:outline-none resize-none"
      />
    </div>
  );
};
