/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming requests
  app.use(express.json());

  // Safe Lazy Initializer for GoogleGenAI
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in Settings > Secrets.');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API secure proxy endpoint for Gemini inference
  app.post('/api/gemini/generate', async (req, res) => {
    const startTime = Date.now();
    const { systemInstruction, userPrompt, modelName, temperature } = req.body;

    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        rawText: '',
        modelName: 'gemini-3.5-flash',
        durationMs: 0,
        error: {
          message: 'The userPrompt parameter is required.',
          code: 'INVALID_REQUEST',
        },
      });
    }

    try {
      const ai = getGeminiClient();
      const selectedModel = modelName || 'gemini-3.5-flash';

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: typeof temperature === 'number' ? temperature : 0.2,
          responseMimeType: 'application/json',
        },
      });

      const durationMs = Date.now() - startTime;

      return res.json({
        rawText: response.text || '',
        modelName: selectedModel,
        tokenUsage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          candidatesTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
        durationMs,
        success: true,
      });

    } catch (error: any) {
      const durationMs = Date.now() - startTime;
      console.error('[SynapseServer] Secure Gemini inference failed:', error);

      return res.status(error.status || 500).json({
        success: false,
        rawText: '',
        modelName: modelName || 'gemini-3.5-flash',
        durationMs,
        error: {
          message: error.message || 'An unexpected error occurred during cloud model execution.',
          code: error.code || 'CLOUD_INFERENCE_FAILURE',
        },
      });
    }
  });

  // Health and connectivity metrics check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Vite development vs production asset handling
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
    console.log(`[FIFA Synapse Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('[FIFA Synapse Server] Failed to bootstrap container server:', error);
  process.exit(1);
});
