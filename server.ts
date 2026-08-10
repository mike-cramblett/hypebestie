import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { getUserCredits, decrementUserCredits } from './server/db.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to get userId from Authorization header
function getUserIdFromReq(req: express.Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }
  return 'default-anon-user';
}

// 1. GET /api/credits
app.get('/api/credits', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const creditsRemaining = await getUserCredits(userId);
    const patreonUrl = process.env.PATREON_URL || 'https://patreon.com/hypebestie';
    res.json({ userId, creditsRemaining, patreonUrl });
  } catch (error: any) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credit balance' });
  }
});

// 2. POST /api/scan
app.post('/api/scan', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const creditsRemaining = await getUserCredits(userId);

    if (creditsRemaining <= 0) {
      return res.status(402).json({
        error: 'Scan credits depleted. Upgrade on Patreon for 50/day!',
        needsPatreon: true,
      });
    }

    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided for scanning' });
    }

    // Strip base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Read persona prompt dynamically on request execution
    const promptPath = path.join(process.cwd(), 'server', 'prompts', 'hype_persona.txt');
    let personaPrompt = '';
    try {
      personaPrompt = fs.readFileSync(promptPath, 'utf-8');
    } catch (e) {
      console.error('Failed to read hype_persona.txt prompt:', e);
      personaPrompt = `You are HypeBESTIE. Inspect the image and give effusive hype validation, MCE%, style name, 4 biometric specs starting with '> ', and a hype paragraph mentioning 3 specific visual details.`;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not configured' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `${personaPrompt}\n\nInspect this image and generate the HypeBESTIE analysis json payload according to the schema.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleName: {
              type: Type.STRING,
              description: 'Catchy aesthetic archetype name',
            },
            'MCE%': {
              type: Type.STRING,
              description: 'Main Character Energy percentage string',
            },
            biometricSpecs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Array of EXACTLY 4 technical sci-fi diagnostic strings starting with > ',
            },
            hypeText: {
              type: Type.STRING,
              description: 'Full uncut validation paragraph mentioning 3+ visual details',
            },
          },
          required: ['styleName', 'MCE%', 'biometricSpecs', 'hypeText'],
        },
      },
    });

    const rawText = response.text || '{}';
    let scanResult;
    try {
      scanResult = JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON response:', rawText);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Decrement credit atomically on success
    const newCredits = await decrementUserCredits(userId);

    return res.json({
      success: true,
      scanResult,
      creditsRemaining: newCredits,
    });
  } catch (error: any) {
    console.error('Scan API error:', error);
    return res.status(500).json({ error: error.message || 'An error occurred during scanning' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
