import { Project, ExportSettings } from '../types/editor';
import { renderFrame } from './canvasRenderer';
import { getAudioContext } from './audioEngine';

export interface ExportProgress {
  percent: number;
  currentFrame: number;
  totalFrames: number;
  currentTime: number;
  status: 'rendering' | 'encoding' | 'completed' | 'cancelled' | 'error';
  downloadUrl?: string;
  blobSizeMb?: string;
  errorMessage?: string;
}

export class VideoExportSession {
  private isCancelled = false;
  private recorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];

  public cancel() {
    this.isCancelled = true;
    if (this.recorder && this.recorder.state !== 'inactive') {
      try {
        this.recorder.stop();
      } catch (e) {
        // Ignore
      }
    }
  }

  public async exportProject(
    project: Project,
    settings: ExportSettings,
    onProgress: (p: ExportProgress) => void
  ): Promise<string> {
    this.isCancelled = false;
    this.recordedChunks = [];

    // Determine dimensions based on resolution and aspect ratio
    let targetWidth = 1920;
    let targetHeight = 1080;

    const baseHeights: Record<string, number> = {
      '480p': 480,
      '720p': 720,
      '1080p': 1080,
      '2K': 1440,
      '4K': 2160,
    };

    const baseH = baseHeights[settings.resolution] || 1080;

    if (settings.aspectRatio === '16:9') {
      targetHeight = baseH;
      targetWidth = Math.round((baseH * 16) / 9);
    } else if (settings.aspectRatio === '9:16') {
      targetWidth = baseH;
      targetHeight = Math.round((baseH * 16) / 9);
    } else if (settings.aspectRatio === '1:1') {
      targetWidth = baseH;
      targetHeight = baseH;
    } else if (settings.aspectRatio === '4:5') {
      targetWidth = baseH;
      targetHeight = Math.round((baseH * 5) / 4);
    } else if (settings.aspectRatio === '21:9') {
      targetHeight = baseH;
      targetWidth = Math.round((baseH * 21) / 9);
    }

    // Ensure even dimensions
    targetWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth + 1;
    targetHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight + 1;

    // Create rendering canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Could not create export canvas context');
    }

    const fps = settings.fps || 30;
    const duration = project.duration;
    const totalFrames = Math.max(1, Math.round(duration * fps));
    const dt = 1 / fps;

    // Setup MediaRecorder Stream
    const stream = canvas.captureStream(fps);

    // Audio stream synthesis connection
    try {
      const actx = getAudioContext();
      const dest = actx.createMediaStreamDestination();
      if (dest.stream.getAudioTracks().length > 0) {
        stream.addTrack(dest.stream.getAudioTracks()[0]);
      }
    } catch (e) {
      console.warn('Audio capture stream fallback:', e);
    }

    // Pick best supported MIME type
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }

    const videoBitrate =
      settings.quality === 'high' ? 12_000_000 : settings.quality === 'medium' ? 6_000_000 : 3_000_000;

    this.recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: videoBitrate,
    });

    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    this.recorder.start(100);

    // Render frame loop
    for (let f = 0; f < totalFrames; f++) {
      if (this.isCancelled) {
        onProgress({
          percent: 0,
          currentFrame: f,
          totalFrames,
          currentTime: f * dt,
          status: 'cancelled',
        });
        throw new Error('Export cancelled by user');
      }

      const t = f * dt;

      // Render accurate frame with all compositing, color grades, and effects
      renderFrame(ctx, project, t, targetWidth, targetHeight, {
        showSafeAreas: false,
        splitCompare: false,
        quality: 'full',
      });

      const percent = Math.min(99, Math.round(((f + 1) / totalFrames) * 100));
      onProgress({
        percent,
        currentFrame: f + 1,
        totalFrames,
        currentTime: t,
        status: 'rendering',
      });

      // Allow event loop to process recording chunks and UI repaint
      await new Promise((resolve) => setTimeout(resolve, Math.max(1, Math.floor(1000 / (fps * 2)))));
    }

    onProgress({
      percent: 99,
      currentFrame: totalFrames,
      totalFrames,
      currentTime: duration,
      status: 'encoding',
    });

    // Finalize recording
    const blob = await new Promise<Blob>((resolve) => {
      if (!this.recorder) return;
      this.recorder.onstop = () => {
        const finalBlob = new Blob(this.recordedChunks, { type: mimeType });
        resolve(finalBlob);
      };
      this.recorder.stop();
    });

    const downloadUrl = URL.createObjectURL(blob);
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(2) + ' MB';

    onProgress({
      percent: 100,
      currentFrame: totalFrames,
      totalFrames,
      currentTime: duration,
      status: 'completed',
      downloadUrl,
      blobSizeMb: sizeMb,
    });

    return downloadUrl;
  }
}
