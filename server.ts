import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Helper to initialize Gemini API safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// AI Auto Captions & Transcription Endpoint (supports Bengali & English)
app.post('/api/ai/captions', async (req: Request, res: Response) => {
  try {
    const { videoTitle, duration = 15, language = 'en', contextHint } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Smart offline fallback
      if (language === 'bn') {
        return res.json({
          captions: [
            { id: 'c1', start: 0.5, end: 3.5, text: 'সিনেমাটিক এডিটর স্টুডিওতে স্বাগতম' },
            { id: 'c2', start: 4.0, end: 7.2, text: 'আপনার অসাধারণ গল্প শুরু হোক আজই' },
            { id: 'c3', start: 8.0, end: 11.5, text: 'রিয়েল-টাইম কালার গ্রেডিং এবং ৩ডি এফেক্টস' },
            { id: 'c4', start: 12.0, end: Math.min(14.5, duration), text: 'প্রফেশনাল এক্সপোর্ট ৪কে ও ফুল এইচডি' },
          ],
          source: 'local-preset',
        });
      }
      return res.json({
        captions: [
          { id: 'c1', start: 0.5, end: 3.2, text: 'Welcome to Cinematic Editor Studio.' },
          { id: 'c2', start: 3.8, end: 7.0, text: 'Create breathtaking cinematic stories with precision.' },
          { id: 'c3', start: 7.5, end: 10.8, text: 'Master your sound, color grades, and 3D overlays.' },
          { id: 'c4', start: 11.2, end: Math.min(14.5, duration), text: 'Export in ultra high definition directly to your device.' },
        ],
        source: 'local-preset',
      });
    }

    const prompt = `You are a cinematic auto-caption subtitle generator for a video editor.
Video Title/Subject: "${videoTitle || 'Cinematic Video'}"
Target Duration: ${duration} seconds.
Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
${contextHint ? `Context hint: ${contextHint}` : ''}

Generate 3-6 synchronized subtitle caption blocks distributed evenly between 0.5s and ${duration}s.
Return ONLY valid JSON matching this exact structure with no extra markdown formatting:
{
  "captions": [
    { "id": "c1", "start": 0.5, "end": 3.5, "text": "..." }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ captions: parsed.captions || [], source: 'gemini' });
  } catch (error: any) {
    console.error('Caption generation error:', error);
    const isBn = req.body.language === 'bn';
    return res.json({
      captions: isBn
        ? [
            { id: 'c1', start: 0.5, end: 3.5, text: 'সিনেমাটিক এডিটর স্টুডিওতে স্বাগতম' },
            { id: 'c2', start: 4.0, end: 7.2, text: 'আপনার সৃজনশীল গল্প ফুটিয়ে তুলুন' },
            { id: 'c3', start: 8.0, end: 11.5, text: 'কালার গ্রেডিং ও ৩ডি সিনেমাটিক এফেক্টস' },
          ]
        : [
            { id: 'c1', start: 0.5, end: 3.5, text: 'Cinematic visual sequence' },
            { id: 'c2', start: 4.0, end: 7.5, text: 'Dynamic motion and emotional impact' },
            { id: 'c3', start: 8.0, end: 12.0, text: 'Crafted with Cinematic Editor Studio' },
          ],
      source: 'fallback',
    });
  }
});

// AI Scene Breakdown & Creative Color Grade Presets
app.post('/api/ai/scene-analysis', async (req: Request, res: Response) => {
  try {
    const { clipName, mood = 'cinematic', currentGrading } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        recommendedLook: 'Teal & Orange Hollywood Classic',
        gradeAdjustments: {
          exposure: 0.05,
          contrast: 1.15,
          saturation: 1.1,
          temperature: -5,
          tint: 2,
          highlights: -10,
          shadows: 8,
          vignette: 0.35,
        },
        sceneType: 'Outdoor Narrative',
        audioPreset: 'Deep Cinematic',
        source: 'local-rule',
      });
    }

    const prompt = `Analyze this video clip mood request and recommend optimal color grading and audio attributes:
Clip name: "${clipName}"
Target Mood: "${mood}"
Current Grading: ${JSON.stringify(currentGrading || {})}

Return ONLY a JSON response:
{
  "recommendedLook": "string title",
  "gradeAdjustments": {
    "exposure": number between -0.5 and 0.5,
    "contrast": number between 0.8 and 1.5,
    "saturation": number between 0.5 and 1.6,
    "temperature": number between -30 and 30,
    "tint": number between -20 and 20,
    "highlights": number between -40 and 40,
    "shadows": number between -40 and 40,
    "vignette": number between 0 and 0.8
  },
  "sceneType": "e.g. Moody Night / Golden Hour / Documentary",
  "audioPreset": "e.g. Documentary Voice / Deep Cinematic / Studio Clarity",
  "narrativeTip": "Short 1-sentence directing tip"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ ...parsed, source: 'gemini' });
  } catch (error) {
    console.error('Scene analysis error:', error);
    return res.status(500).json({ error: 'Failed to analyze scene' });
  }
});

// AI Cartoon & Stylization Assistant
app.post('/api/ai/cartoon-style', async (req: Request, res: Response) => {
  try {
    const { style = '3D Cartoon', subjectType = 'whole_scene' } = req.body;
    const presets: Record<string, any> = {
      '3D Cartoon': { edgeWeight: 2, posterizeLevels: 7, saturationBoost: 1.35, bloom: 0.25, lineDarkness: 0.8 },
      'Anime': { edgeWeight: 1.5, posterizeLevels: 6, saturationBoost: 1.45, bloom: 0.4, lineDarkness: 0.9 },
      'Pixar-Inspired': { edgeWeight: 1, posterizeLevels: 10, saturationBoost: 1.25, bloom: 0.3, lineDarkness: 0.6 },
      'Comic Book': { edgeWeight: 3.5, posterizeLevels: 4, saturationBoost: 1.5, halftoneDotSize: 4, lineDarkness: 1.0 },
      'Hand-Drawn': { edgeWeight: 2.2, posterizeLevels: 5, saturationBoost: 0.9, grain: 0.2, lineDarkness: 0.95 },
    };

    const styleParams = presets[style] || presets['3D Cartoon'];
    res.json({
      style,
      subjectType,
      shaderParams: styleParams,
      status: 'ready',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/download-standalone-html', (_req: Request, res: Response) => {
  const distPath = path.join(__dirname, 'dist', 'cinematic_studio_standalone.html');
  const publicPath = path.join(__dirname, 'public', 'cinematic_studio_standalone.html');
  const filePath = fs.existsSync(distPath) ? distPath : fs.existsSync(publicPath) ? publicPath : null;
  if (filePath) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="cinematic_studio_standalone.html"');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Standalone HTML not built yet' });
  }
});

app.get('/api/standalone-html-text', (_req: Request, res: Response) => {
  const distPath = path.join(__dirname, 'dist', 'cinematic_studio_standalone.html');
  const publicPath = path.join(__dirname, 'public', 'cinematic_studio_standalone.html');
  const filePath = fs.existsSync(distPath) ? distPath : fs.existsSync(publicPath) ? publicPath : null;
  if (filePath) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(filePath);
  } else {
    res.status(404).send('Standalone HTML not built yet');
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Cinematic Editor Studio server running on port ${PORT} (isDev: ${isDev})`);
  });
}

startServer();
