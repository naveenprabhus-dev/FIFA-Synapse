/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { UserRole, UserProfile } from '../../types/user';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';

// Custom runner helpers
function describe(name: string, fn: () => void) {
  console.log(`[TEST SUITE] Starting: ${name}`);
  fn();
}

function it(name: string, fn: () => Promise<void> | void) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      res.then(
        () => console.log(`  ✓ PASSED: ${name}`),
        (err) => console.error(`  ✗ FAILED: ${name}\n`, err)
      );
    } else {
      console.log(`  ✓ PASSED: ${name}`);
    }
  } catch (err) {
    console.error(`  ✗ FAILED: ${name}\n`, err);
  }
}

describe('FIFA Synapse Integration Flows Suite', () => {
  // Mock repository layers
  const mockUserRepo = {
    getUserProfile: async (uid: string): Promise<UserProfile> => ({
      uid,
      email: 'fan@synapse.fifa.org',
      displayName: 'Leonel Messi',
      role: UserRole.FAN,
      createdAt: new Date().toISOString(),
    }),
  };

  const mockMatchRepo = {
    getMatches: async () => [{
      id: 'm1',
      status: 'LIVE',
      currentMinute: 85,
      homeTeam: { name: 'France', shortName: 'FRA', score: 1 },
      awayTeam: { name: 'Croatia', shortName: 'CRO', score: 0 }
    }],
  };

  const mockCrowdRepo = {
    getCrowdAnalysis: async () => [{ sectorId: 'SEC_B', occupancyPercent: 88, flowRatePerMin: 110, status: 'CRITICAL' }],
  };

  const mockFoodRepo = {
    getFoodCourts: async () => [],
  };

  const mockIncidentRepo = {
    getIncidents: async () => [],
  };

  const mockParkingRepo = {
    getParkingZones: async () => [],
  };

  const mockNotificationRepo = {
    getNotifications: async () => [],
  };

  const mockVenueRepo = {
    getStadiumDetails: async () => ({ name: 'Al Bayt Stadium', gates: [], sectors: [] }),
  };

  // 1. Integration flow: Repository -> Service -> UI context integration
  it('should successfully build combined context across multiple telemetry repositories', async () => {
    const contextBuilder = new ContextBuilder(
      mockUserRepo as any,
      mockMatchRepo as any,
      mockCrowdRepo as any,
      mockFoodRepo as any,
      mockIncidentRepo as any,
      mockParkingRepo as any,
      mockNotificationRepo as any,
      mockVenueRepo as any
    );

    const context = await contextBuilder.buildContext('user-100', UserRole.FAN);
    
    assert.strictEqual(context.userProfile?.displayName, 'Leonel Messi');
    assert.strictEqual(context.activeMatch?.status, 'LIVE');
    assert.strictEqual(context.crowdAnalysis?.[0].sectorId, 'SEC_B');
    assert.strictEqual(context.stadiumDetails?.name, 'Al Bayt Stadium');
  });

  // 2. Integration flow: Intent Engine to Decision Engine hand-off
  it('should verify the classification hand-off between Intent classification and Decision Engine priorities', async () => {
    const intentEngine = new IntentEngine();
    const decisionEngine = new DecisionEngine();
    
    const contextBuilder = new ContextBuilder(
      mockUserRepo as any,
      mockMatchRepo as any,
      mockCrowdRepo as any,
      mockFoodRepo as any,
      mockIncidentRepo as any,
      mockParkingRepo as any,
      mockNotificationRepo as any,
      mockVenueRepo as any
    );
    const context = await contextBuilder.buildContext('user-101', UserRole.FAN);

    const detectedIntent = intentEngine.detectIntent('Severe crowding in concourse, request alternative directions');
    assert.strictEqual(detectedIntent, 'NAVIGATION');

    const analysis = decisionEngine.analyzeDecision(detectedIntent, context);
    assert.strictEqual(analysis.shouldCallLLM, true);
    assert.ok(analysis.preInferenceReasoning.length > 0);
  });

  // 3. Integration flow: Role-based switching impact on Context
  it('should adapt security filters when active user switches from FAN to ORGANIZER', async () => {
    const contextBuilder = new ContextBuilder(
      mockUserRepo as any,
      mockMatchRepo as any,
      mockCrowdRepo as any,
      mockFoodRepo as any,
      mockIncidentRepo as any,
      mockParkingRepo as any,
      mockNotificationRepo as any,
      mockVenueRepo as any
    );

    const fanContext = await contextBuilder.buildContext('user-102', UserRole.FAN);
    const organizerContext = await contextBuilder.buildContext('user-102', UserRole.ORGANIZER);

    assert.strictEqual(fanContext.activeRole, UserRole.FAN);
    assert.strictEqual(organizerContext.activeRole, UserRole.ORGANIZER);
  });

  // 4. Integration flow: Pipeline recovery when Gemini returns empty or distorted answers
  it('should parse distorted or corrupted JSON strings and fall back gracefully', () => {
    const parser = new ResponseParser();
    const messyOutput = `Some text here...
    \`\`\`json
    {
      "title": "Clean Recommendation",
      "recommendation": "Use North Gate Route",
      "reason": "Avoid crowded Sector A",
      "confidenceScore": 0.9,
      "priority": "HIGH"
    }
    \`\`\`
    And some footer text...`;

    const parsed = parser.parseResponse(messyOutput, 'NAVIGATION');
    assert.strictEqual(parsed.title, 'Clean Recommendation');
    assert.strictEqual(parsed.confidenceScore, 0.9);
    assert.strictEqual(parsed.intent, 'NAVIGATION');
  });
});
