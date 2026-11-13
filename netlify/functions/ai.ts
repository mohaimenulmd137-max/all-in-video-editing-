import { GoogleGenAI } from '@google/genai';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  let body: any = {};
  if (req.method === 'POST') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }

  // 1. AI Auto Captions
  if (pathname.endsWith('/captions')) {
    const { videoTitle, duration = 15, language = 'en', contextHint } = body;
    const ai = getGeminiClient();

    if (!ai) {
      if (language === 'bn') {
        return jsonResponse({
          captions: [
            { id: 'c1', start: 0.5, end: 3.5, text: 'সিনেমাটিক এডিটর স্টুডিওতে স্বাগতম' },
            { id: 'c2', start: 4.0, end: 7.2, text: 'আপনার অসাধারণ গল্প শুরু হোক আজই' },
            { id: 'c3', start: 8.0, end: 11.5, text: 'রিয়েল-টাইম কালার গ্রেডিং এবং ৩ডি এফেক্টস' },
            { id: 'c4', start: 12.0, end: Math.min(14.5, duration), text: 'প্রফেশনাল এক্সপোর্ট ৪কে ও ফুল এইচডি' },
          ],
          source: 'local-preset',
        });
      }
      return jsonResponse({
        captions: [
          { id: 'c1', start: 0.5, end: 3.2, text: 'Welcome to Cinematic Editor Studio.' },
          { id: 'c2', start: 3.8, end: 7.0, text: 'Create breathtaking cinematic stories with precision.' },
          { id: 'c3', start: 7.5, end: 10.8, text: 'Master your sound, color grades, and 3D overlays.' },
          { id: 'c4', start: 11.2, end: Math.min(14.5, duration), text: 'Export in ultra high definition directly to your device.' },
        ],
        source: 'local-preset',
      });
    }

    try {
      const prompt = `You are a cinematic auto-caption subtitle generator for a video editor.
Video Title/Subject: "${videoTitle || 'Cinematic Video'}"
Target Duration: ${duration} seconds.
Language: ${language === 'bn' ? 'Bengali (বাংলা)' : 'English'}.
${contextHint ? `Context hint: ${contextHint}` : ''}

Generate 3-6 synchronized subtitle caption blocks distributed evenly between 0.5s and ${duration}s.
Return ONLY valid JSON matching this exact structure:
{
  "captions": [
    { "id": "c1", "start": 0.5, "end": 3.5, "text": "..." }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      return jsonResponse({ captions: parsed.captions || [], source: 'gemini' });
    } catch {
      const isBn = language === 'bn';
      return jsonResponse({
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
  }

  // 2. AI Scene Analysis
  if (pathname.endsWith('/scene-analysis')) {
    const { clipName, mood = 'cinematic', currentGrading } = body;
    const ai = getGeminiClient();

    if (!ai) {
      return jsonResponse({
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

    try {
      const prompt = `Analyze this video clip mood request and recommend optimal color grading and audio attributes:
Clip name: "${clipName}"
Target Mood: "${mood}"
Current Grading: ${JSON.stringify(currentGrading || {})}

Return ONLY a JSON response:
{
  "recommendedLook": "string title",
  "gradeAdjustments": {
    "exposure": 0.05,
    "contrast": 1.15,
    "saturation": 1.1,
    "temperature": -5,
    "tint": 2,
    "highlights": -10,
    "shadows": 8,
    "vignette": 0.35
  },
  "sceneType": "e.g. Moody Night / Golden Hour / Documentary",
  "audioPreset": "e.g. Documentary Voice / Deep Cinematic / Studio Clarity",
  "narrativeTip": "Short 1-sentence directing tip"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const parsed = JSON.parse(response.text || '{}');
      return jsonResponse({ ...parsed, source: 'gemini' });
    } catch {
      return jsonResponse({
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
        source: 'fallback',
      });
    }
  }

  // 3. AI Cartoon Style
  if (pathname.endsWith('/cartoon-style')) {
    const { style = '3D Cartoon', subjectType = 'whole_scene' } = body;
    const presets: Record<string, any> = {
      '3D Cartoon': { edgeWeight: 2, posterizeLevels: 7, saturationBoost: 1.35, bloom: 0.25, lineDarkness: 0.8 },
      'Anime': { edgeWeight: 1.5, posterizeLevels: 6, saturationBoost: 1.45, bloom: 0.4, lineDarkness: 0.9 },
      'Pixar-Inspired': { edgeWeight: 1, posterizeLevels: 10, saturationBoost: 1.25, bloom: 0.3, lineDarkness: 0.6 },
      'Comic Book': { edgeWeight: 3.5, posterizeLevels: 4, saturationBoost: 1.5, halftoneDotSize: 4, lineDarkness: 1.0 },
      'Hand-Drawn': { edgeWeight: 2.2, posterizeLevels: 5, saturationBoost: 0.9, grain: 0.2, lineDarkness: 0.95 },
    };
    return jsonResponse({
      style,
      subjectType,
      shaderParams: presets[style] || presets['3D Cartoon'],
      status: 'ready',
    });
  }

  return jsonResponse({ error: 'Unknown AI endpoint' }, 404);
};
