export async function fetchStandaloneHtmlText(): Promise<string> {
  const endpoints = ['/api/standalone-html-text', '/cinematic_studio_standalone.html'];
  for (const url of endpoints) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('<!doctype html') || text.includes('<!DOCTYPE html')) {
          return text;
        }
      }
    } catch {
      // Try next fallback
    }
  }
  throw new Error('Could not load standalone HTML bundle from server.');
}

export function downloadHtmlViaBlob(htmlText: string, filename = 'cinematic_studio_standalone.html'): boolean {
  try {
    const blob = new Blob([htmlText], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
    return true;
  } catch {
    return false;
  }
}

export function canShareHtmlFile(): boolean {
  try {
    if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
    const testFile = new File(['<html></html>'], 'test.html', { type: 'text/html' });
    return navigator.canShare({ files: [testFile] });
  } catch {
    return false;
  }
}

export async function shareHtmlFileMobile(
  htmlText: string,
  filename = 'cinematic_studio_standalone.html'
): Promise<{ ok: boolean; error?: string }> {
  try {
    const file = new File([htmlText], filename, { type: 'text/html;charset=utf-8' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'Cinematic Editor Studio (Standalone HTML)',
        text: 'Complete single-file offline HTML app',
        files: [file],
      });
      return { ok: true };
    }
    return { ok: false, error: 'File sharing is not supported on this browser.' };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return { ok: false, error: 'Share cancelled.' };
    }
    return { ok: false, error: err?.message || 'Share failed.' };
  }
}

export async function copyTextReliably(
  text: string
): Promise<{ ok: boolean; method: 'clipboard' | 'execCommand' | 'failed'; reason?: string }> {
  // 1. Try modern Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true, method: 'clipboard' };
    } catch {
      // Blocked in sandboxed iframe or exceeds permissions; fall through
    }
  }

  // 2. Fallback: offscreen editable textarea + execCommand('copy')
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('autocomplete', 'off');
    ta.setAttribute('autocorrect', 'off');
    ta.setAttribute('autocapitalize', 'off');
    ta.setAttribute('spellcheck', 'false');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.left = '-9999px';
    ta.style.width = '2em';
    ta.style.height = '2em';
    ta.style.opacity = '0';
    document.body.appendChild(ta);

    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);

    const success = document.execCommand('copy');
    document.body.removeChild(ta);

    if (success) {
      return { ok: true, method: 'execCommand' };
    }
    return {
      ok: false,
      method: 'failed',
      reason: 'Browser blocked large clipboard copy. Try copying in smaller parts or using Download/Share.',
    };
  } catch (err: any) {
    return {
      ok: false,
      method: 'failed',
      reason: err?.message || 'Clipboard copy blocked by browser sandbox.',
    };
  }
}

export function splitTextIntoChunks(text: string, maxChunkChars = 240000): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxChunkChars) {
    chunks.push(text.slice(i, i + maxChunkChars));
  }
  return chunks;
}
