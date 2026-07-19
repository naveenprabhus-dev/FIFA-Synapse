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

/**
 * Generates structured mock responses mimicking Gemini output.
 * Specially designed to fit the schemas expected by various FIFA Synapse agents.
 */
function generateMockServerResponse(systemInstruction: string = '', userPrompt: string = ''): string {
  const promptLower = (userPrompt || '').toLowerCase();
  const systemLower = (systemInstruction || '').toLowerCase();
  const has = (str: string) => promptLower.includes(str) || systemLower.includes(str);

  // 1. Proactive Notifications Schema Call
  if (has('proactive') || has('notification') || has('active incidents')) {
    const alerts: any[] = [];

    // Medical or emergency incident
    if (has('medical') || has('emergency') || has('incident')) {
      alerts.push({
        type: 'MEDICAL_ALERT',
        title: 'Emergency Medical Dispatch',
        summary: 'Medic Unit 2 has been dispatched to Sector 112 Row 14 for rapid health support.',
        reason: 'Panic alarm registered near Stairwell B reporting a spectator in physical distress.',
        recommendation: 'Keep surrounding escalators clear and cooperate with security stewards.',
        priority: 'CRITICAL',
        confidenceScore: 0.98,
        affectedZone: 'SEC_112',
        estimatedBenefit: 'Ensures paramedics reach the patient 3 minutes faster.',
        alternative: 'Notify nearby sector steward if further assistance is required.'
      });
    }

    // Crowd bottleneck
    if (has('crowd') || has('congestion') || has('90%') || has('density') || has('egress')) {
      alerts.push({
        type: 'CROWD_WARNING',
        title: 'Egress Congestion: Sector 104',
        summary: 'High crowd density detected near Sector 104 exit tunnels.',
        reason: ' Halftime mass movement is bottlenecking standard exit paths.',
        recommendation: 'Utilize the alternative smart route through Sector 101 Promenade.',
        priority: 'HIGH',
        confidenceScore: 0.95,
        affectedZone: 'SEC_104',
        estimatedBenefit: 'Bypasses standard corridor delays saving up to 10 minutes.',
        alternative: 'Stagger exit release or wait in seating tiers for 5 minutes.'
      });
    }

    // Concession suggestion
    if (has('concession') || has('food') || has('pizza') || has('bistro') || has('replenishment')) {
      alerts.push({
        type: 'FOOD_COURT_SUGGESTION',
        title: 'Smart Concession Route',
        summary: 'Halftime snack line at Sector 104 is 18 people. Sector 101 Bistro is clear.',
        reason: 'Halftime egress is bottlenecking the closest food vendor counters.',
        recommendation: 'Proceed 90 meters to Sector 101 Food Court for immediate service.',
        priority: 'MEDIUM',
        confidenceScore: 0.92,
        affectedZone: 'SEC_104',
        estimatedBenefit: 'Reduces queue wait time by 11 minutes.',
        alternative: 'Pre-order drinks on-screen using Express Pickup.'
      });
    }

    // Parking lot warning
    if (has('parking') || has('lot')) {
      alerts.push({
        type: 'PARKING_UPDATE',
        title: 'Lot A Saturation Alert',
        summary: 'VIP Parking Lot A occupancy is at 90% capacity.',
        reason: 'High ingress volume during pre-match peak arrival slots.',
        recommendation: 'Redirect incoming VIPs to South Lot B or nearby Metro Park & Ride.',
        priority: 'MEDIUM',
        confidenceScore: 0.89,
        affectedZone: 'Lot A',
        estimatedBenefit: 'Bypasses Lot A loop traffic and saves 8 minutes searching.',
        alternative: 'Utilize auxiliary sector garage C.'
      });
    }

    // Default general update if no specific alert triggered
    if (alerts.length === 0) {
      alerts.push({
        type: 'FACILITY_UPDATE',
        title: 'Stadium Smart Flow Active',
        summary: 'All gates, queues, and corridors are operating within safe baseline bounds.',
        reason: 'Real-time telemetry reports wait times across all sectors are under 4 minutes.',
        recommendation: 'Enjoy the match! Baseline updates will publish if crowd metrics shift.',
        priority: 'LOW',
        confidenceScore: 0.95,
        affectedZone: 'All Zones',
        estimatedBenefit: 'Maintains steady walkthrough and zero standing bottlenecks.',
        alternative: 'Check the digital map for localized facilities.'
      });
    }

    return JSON.stringify({ notifications: alerts }, null, 2);
  }

  // 2. Concession / Replenishment Intent
  if (has('concession') || has('pizza') || has('replenishment') || has('food')) {
    return JSON.stringify({
      title: 'Heuristic Concession Optimization',
      recommendation: 'Direct Zone B fans to Sector 101 Pizza & Burger Bistro',
      reason: 'Sector 104 concession is congested with an 18-person line (>14 mins wait), whereas Sector 101 has only a 3-person queue (<3 mins wait).',
      confidenceScore: 0.94,
      priority: 'MEDIUM',
      suggestedAction: 'Deploy push notification to Sector 104 fans suggesting Sector 101.',
      estimatedBenefit: 'Reduces user wait time by up to 11 minutes and increases food-court throughput by 12%.',
      alternative: 'Direct fans to Concourse A Merchandise snack stalls',
      reasoningDetails: [
        'Sensor 104 is heavily saturated at halftime.',
        'Direct correlation with sector occupancy ratios.',
        'Maintains balanced revenue distribution across concessions.'
      ]
    }, null, 2);
  }

  // 3. Emergency Intent
  if (has('emergency') || has('incident') || has('medical') || has('blocked')) {
    return JSON.stringify({
      title: 'Emergency Safety Route Clearance',
      recommendation: 'Deploy Medic Unit 2 via Elevator A and reroute surrounding crowd through Sector 101 Promenade.',
      reason: 'Escalator core at Sector 104 is reported inoperative due to a power outage, blocking the standard rapid dispatch path.',
      confidenceScore: 0.98,
      priority: 'CRITICAL',
      suggestedAction: 'Activate Emergency Green LED light strip pathway leading around Sector 104 staircase.',
      estimatedBenefit: 'Ensures paramedics reach the critical patient 3 minutes faster than staircase climbing.',
      alternative: 'Dispatch auxiliary volunteer stretcher unit from Gate B.',
      reasoningDetails: [
        'Critical patient reported at Sector 112 Row 14.',
        'Elevator A is operational and accessible-friendly.',
        'Prevents crowding panic in secondary narrow transit lanes.'
      ]
    }, null, 2);
  }

  // 4. Navigation / Routing Intent
  if (has('routing') || has('navigation') || has('gate') || has('egress')) {
    return JSON.stringify({
      title: 'Dynamic Spectator Routing',
      recommendation: 'Reroute Sector 104 egress through Gate B and Concourse A South Corridor.',
      reason: 'Gate A entrance is experiencing peak ingress congestion (index: 0.2 vs Gate B: 0.65, but with higher security clearances).',
      confidenceScore: 0.89,
      priority: 'HIGH',
      suggestedAction: 'Instruct stewards at Sector 104 intersection to point flags toward Gate B.',
      estimatedBenefit: 'Reduces queue dispersal bottleneck duration by 7 minutes.',
      alternative: 'Hold spectators in seat tiers for staggered exits of 3-minute intervals.',
      reasoningDetails: [
        'Spectators seek closest path.',
        'Saves 150 seconds of dense corridor standing.',
        'Maintains Gate B throughput below peak mechanical limits.'
      ]
    }, null, 2);
  }

  // 5. Crowd Control Intent
  if (has('crowd') || has('sensor') || has('congestion') || has('density') || has('flow')) {
    return JSON.stringify({
      title: 'Sector 104 Crowding Forecasting',
      recommendation: 'Stagger egress gates opening sequence at Sector 104.',
      reason: 'Local density has breached 3.8 people per square meter near Gate B egress gates.',
      confidenceScore: 0.92,
      priority: 'HIGH',
      suggestedAction: 'Manually override Gate B barrier sequence to 50% flow restriction.',
      estimatedBenefit: 'Prevents crushing hazard and reduces flow convergence risks by 22%.',
      alternative: 'Open secondary safety roll-up gate at sector perimeter.',
      reasoningDetails: [
        'Real-time flowrate hit 124 persons/minute.',
        'Second half of match is in minute 52, showing high early departures.'
      ]
    }, null, 2);
  }

  // 6. Parking / Garage Intent
  if (has('parking') || has('lot')) {
    return JSON.stringify({
      title: 'Post-Match Parking Routing',
      recommendation: 'Assign incoming VIP vehicles to South Public Lot B.',
      reason: 'North VIP Lot A is filling fast (450/500 spaces occupied) with high risk of immediate saturation.',
      confidenceScore: 0.87,
      priority: 'MEDIUM',
      suggestedAction: 'Instruct digital lane boards to flash LOT B parking guidance.',
      estimatedBenefit: 'Prevents entry loop gridlock at Lot A and saves 9 minutes in parking search time.',
      alternative: 'Open auxiliary dirt lot C for peak overflow.',
      reasoningDetails: [
        'Lot B has 680 available slots.',
        'Lot B offers 60 accessibility spaces.'
      ]
    }, null, 2);
  }

  // 7. Accessibility Intent
  if (has('accessibility') || has('disabled') || has('wheelchair') || has('step-free')) {
    return JSON.stringify({
      title: 'Accessible Pathing Optimization',
      recommendation: 'Direct ADA and stroller guests to Concourse North Ramp 3.',
      reason: 'Elevator E1 in sector 104 has been locked for brief maintenance diagnostics.',
      confidenceScore: 0.94,
      priority: 'HIGH',
      suggestedAction: 'Update mobile application step-free navigation graph with elevator outage weight.',
      estimatedBenefit: 'Ensures uninterrupted step-free path safety and avoids stairs wait times.',
      alternative: 'Signal Sector 104 information kiosk for lift coordinator escort.',
      reasoningDetails: [
        'Continuous sensor reports on Elevator E1 mechanical delay.',
        'Ramp 3 offers compliant 1:12 slope ratio with resting landings.'
      ]
    }, null, 2);
  }

  // 8. General Default Support
  return JSON.stringify({
    title: 'Synapse Core Concierge Support',
    recommendation: 'Welcome to Al Bayt Stadium. Please refer to Section 104 Information Kiosks.',
    reason: 'Normal baseline operations. Weather is clear (28C) and gates are operating smoothly.',
    confidenceScore: 0.95,
    priority: 'LOW',
    suggestedAction: 'Visit nearest information desk for printed layouts.',
    estimatedBenefit: 'Provides friendly wayfinding orientation.',
    alternative: 'Rely on mobile GPS pathfinding inside the stadium app.',
    reasoningDetails: ['Weather is favorable.', 'No current incident alert blocks.']
  }, null, 2);
}

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

    // Check if API key is missing or empty - fallback to high-fidelity mock seamlessly
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.warn('[SynapseServer] GEMINI_API_KEY is missing/empty. Falling back to high-fidelity simulated response.');
      const rawText = generateMockServerResponse(systemInstruction, userPrompt);
      const durationMs = Date.now() - startTime;
      return res.json({
        rawText,
        modelName: 'simulated-gemini-3.5-flash',
        tokenUsage: {
          promptTokens: 120,
          candidatesTokens: 250,
          totalTokens: 370,
        },
        durationMs,
        success: true,
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
      
      // Determine if error is a 429 rate-limit / quota-exhausted condition
      const errorMsg = String(error.message || '').toLowerCase();
      const isRateLimitOrQuota = 
        error.status === 429 || 
        errorMsg.includes('429') || 
        errorMsg.includes('quota') || 
        errorMsg.includes('exhausted') || 
        errorMsg.includes('limit') ||
        errorMsg.includes('resource_exhausted');

      if (isRateLimitOrQuota) {
        console.warn(`[SynapseServer] Gemini API quota limits (429/ResourceExhausted) detected. Falling back to high-fidelity simulated response. originalError: ${error.message}`);
        const rawText = generateMockServerResponse(systemInstruction, userPrompt);
        return res.json({
          rawText,
          modelName: 'simulated-gemini-3.5-flash',
          tokenUsage: {
            promptTokens: 150,
            candidatesTokens: 300,
            totalTokens: 450,
          },
          durationMs,
          success: true,
        });
      }

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
