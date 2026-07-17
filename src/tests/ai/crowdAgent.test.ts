/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { CrowdAgent } from '../../ai/agents/CrowdAgent';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';
import { UserRole } from '../../types/user';

// Mock dependencies
const mockUserRepo = {
  getUserProfile: async (uid: string) => ({
    uid,
    email: 'operator@synapse.fifa.org',
    displayName: 'Stadium Commander',
    role: UserRole.ORGANIZER,
    createdAt: new Date().toISOString(),
  }),
  updateUserProfile: async () => { throw new Error('Not implemented'); },
  createUserProfile: async () => { throw new Error('Not implemented'); },
};

const mockMatchRepo = {
  getMatches: async () => [
    {
      id: 'match-1',
      homeTeam: { id: 't1', name: 'France', shortName: 'FRA', score: 1 },
      awayTeam: { id: 't2', name: 'Morocco', shortName: 'MAR', score: 0 },
      status: 'LIVE' as const,
      currentPhase: 'SECOND_HALF' as const,
      currentMinute: 52,
      stoppageTimeMinutes: 0,
      venueName: 'Al Bayt Stadium',
      kickoffTime: new Date().toISOString(),
      timelineEvents: [],
    },
  ],
  getMatchById: async () => { throw new Error('Not implemented'); },
  getTimelineEvents: async () => [],
};

const mockCrowdRepo = {
  getCrowdAnalysis: async () => [
    { sectorId: 'SEC_A', occupancyPercent: 82, flowRatePerMin: 124, status: 'CRITICAL' as const },
    { sectorId: 'SEC_B', occupancyPercent: 44, flowRatePerMin: 45, status: 'OPTIMAL' as const },
  ],
  getCrowdAnalysisBySector: async (sectorId: string) => ({
    sectorId,
    occupancyPercent: 82,
    flowRatePerMin: 124,
    status: 'CRITICAL' as const,
  }),
  updateSectorCrowdData: async () => { throw new Error('Not implemented'); },
};

const mockFoodRepo = {
  getFoodCourts: async () => [],
  getFoodCourtById: async () => { throw new Error('Not implemented'); },
  updateMenuItemStock: async () => { throw new Error('Not implemented'); },
  updateQueueLength: async () => { throw new Error('Not implemented'); },
};

const mockIncidentRepo = {
  getIncidents: async () => [],
  getIncidentById: async () => { throw new Error('Not implemented'); },
  createIncident: async () => { throw new Error('Not implemented'); },
  updateIncident: async () => { throw new Error('Not implemented'); },
  getOperationalStaff: async () => [],
  getStaffById: async () => { throw new Error('Not implemented'); },
  updateStaffStatus: async () => { throw new Error('Not implemented'); },
};

const mockParkingRepo = {
  getParkingZones: async () => [],
  getParkingZoneById: async () => { throw new Error('Not implemented'); },
  updateParkingOccupancy: async () => { throw new Error('Not implemented'); },
};

const mockNotificationRepo = {
  getNotifications: async () => [],
  addNotification: async () => { throw new Error('Not implemented'); },
  markAsRead: async () => { throw new Error('Not implemented'); },
  markAllRead: async () => {},
  clearNotifications: async () => {},
};

const mockVenueRepo = {
  getStadiumDetails: async () => ({
    name: 'Al Bayt Stadium',
    capacity: 68895,
    location: 'Al Khor',
    gates: [],
    sectors: [],
  }),
  getWeatherTelemetry: async () => ({
    temperatureCelsius: 29,
    relativeHumidityPercent: 62,
    windSpeedKmh: 14,
    skyCondition: 'CLEAR' as const,
    lastUpdated: new Date().toISOString(),
  }),
};

describe('CrowdIntelligenceAgent Suite', () => {
  it('should successfully forecast crowd congestion utilizing Synapse Core orchestration', async () => {
    // 1. Arrange Singletons
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

    const agent = new CrowdAgent(core);

    // 2. Act
    const rec = await agent.forecastSectorCrowd('SEC_A', 'user_123', UserRole.ORGANIZER);

    // 3. Assert
    assert.ok(rec);
    assert.strictEqual(rec.intent, 'CROWD');
    assert.ok(rec.confidenceScore > 0.8);
    assert.ok(rec.recommendation.length > 0);
  });
});

// Helper for test harness mapping
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
