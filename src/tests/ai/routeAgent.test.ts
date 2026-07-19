/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { RouteAgent } from '../../ai/agents/RouteAgent';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';
import { UserRole } from '../../types/user';

// Mock repositories for testing
const mockUserRepo = {
  getUserProfile: async (uid: string) => ({
    uid,
    email: 'fan@synapse.fifa.org',
    displayName: 'Ahmad Ali',
    role: UserRole.FAN,
    createdAt: new Date().toISOString(),
  }),
};

const mockMatchRepo = {
  getMatches: async () => [
    {
      id: 'match-1',
      homeTeam: { id: 't1', name: 'France', shortName: 'FRA', score: 2 },
      awayTeam: { id: 't2', name: 'Argentina', shortName: 'ARG', score: 2 },
      status: 'LIVE' as const,
      currentPhase: 'PENALTY_SHOOTOUT' as const,
      currentMinute: 120,
      stoppageTimeMinutes: 0,
      venueName: 'Lusail Stadium',
      kickoffTime: new Date().toISOString(),
      timelineEvents: [],
    },
  ],
};

const mockCrowdRepo = {
  getCrowdAnalysis: async () => [
    { sectorId: 'SEC_A', occupancyPercent: 95, flowRatePerMin: 210, status: 'CRITICAL' as const },
    { sectorId: 'SEC_B', occupancyPercent: 40, flowRatePerMin: 35, status: 'OPTIMAL' as const },
  ],
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
  getStadiumDetails: async () => ({
    name: 'Lusail Stadium',
    capacity: 88966,
    location: 'Lusail',
    gates: [],
    sectors: [],
  }),
};

function describe(name: string, fn: () => void) {
  console.log(`[TEST SUITE] Starting: ${name}`);
  fn();
}

function it(name: string, fn: () => Promise<void>) {
  fn().then(
    () => console.log(`  ✓ PASSED: ${name}`),
    (err) => console.error(`  ✗ FAILED: ${name}\n`, err)
  );
}

describe('SmartNavigationAgent Suite', () => {
  it('should successfully calculate custom navigation route parameters', async () => {
    const intentEngine = new IntentEngine();
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
    const decisionEngine = new DecisionEngine();
    const promptBuilder = new PromptBuilder();
    const aiProvider = new MockAIProvider(10, false, false);
    const responseParser = new ResponseParser();

    const core = new SynapseCore(
      intentEngine,
      contextBuilder,
      decisionEngine,
      promptBuilder,
      aiProvider,
      responseParser
    );

    const agent = new RouteAgent(core);

    const rec = await agent.calculateSmartRoute(
      'Seat 104-B',
      'West Gate exit corridor',
      true,
      'user_104',
      UserRole.FAN,
      { latitude: 25.42, longitude: 51.49, sectorId: 'SEC_A' }
    );

    assert.ok(rec);
    assert.strictEqual(rec.intent, 'NAVIGATION');
    assert.ok(rec.confidenceScore > 0.8);
    assert.ok(rec.recommendation.length > 0);
  });
});
