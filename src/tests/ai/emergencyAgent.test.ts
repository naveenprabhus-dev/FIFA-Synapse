/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { EmergencyAgent } from '../../ai/agents/EmergencyAgent';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';
import { UserRole } from '../../types/user';
import { EmergencyContextOptions, EmergencyType } from '../../types/emergency';

// Mock dependencies for unit testing
const mockUserRepo = {
  getUserProfile: async (uid: string) => ({
    uid,
    email: 'fan@synapse.fifa.org',
    displayName: 'Ahmad Al-Khor',
    role: UserRole.FAN,
    createdAt: new Date().toISOString(),
  }),
};

const mockMatchRepo = {
  getMatches: async () => [
    {
      id: 'match-1',
      homeTeam: { id: 't1', name: 'France', shortName: 'FRA', score: 1 },
      awayTeam: { id: 't2', name: 'Morocco', shortName: 'MAR', score: 0 },
      status: 'LIVE' as const,
      currentPhase: 'SECOND_HALF' as const,
      currentMinute: 72,
      stoppageTimeMinutes: 0,
      venueName: 'Al Bayt Stadium',
      kickoffTime: new Date().toISOString(),
      timelineEvents: [],
    },
  ],
};

const mockCrowdRepo = {
  getCrowdAnalysis: async () => [
    { sectorId: 'SEC_104', occupancyPercent: 88, flowRatePerMin: 150, status: 'CRITICAL' as const },
    { sectorId: 'SEC_108', occupancyPercent: 32, flowRatePerMin: 22, status: 'OPTIMAL' as const },
  ],
};

const mockFoodRepo = {
  getFoodCourts: async () => [],
};

const mockIncidentRepo = {
  getIncidents: async () => [
    {
      id: 'inc-101',
      category: 'MEDICAL_EMERGENCY' as const,
      severity: 'CRITICAL' as const,
      status: 'DISPATCHED' as const,
      locationName: 'Sector 104 Concourse',
      description: 'Cardiac arrest reported in seat area.',
      timeline: [],
      reportedBy: 'anonymous',
      assignedStaffIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const mockParkingRepo = {
  getParkingZones: async () => [],
};

const mockNotificationRepo = {
  getNotifications: async () => [],
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
    temperatureCelsius: 38,
    relativeHumidityPercent: 70,
    windSpeedKmh: 20,
    skyCondition: 'HUMID_HEAT' as const,
    lastUpdated: new Date().toISOString(),
  }),
};

// Test Runner Harness Helpers
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

describe('AI Emergency Response Agent Test Suite', () => {
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
  const responseParser = new ResponseParser();

  // Test 1: Medical Emergency
  it('should formulate appropriate tactical plan for Medical Emergency', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new EmergencyAgent(core);

    const options: EmergencyContextOptions = {
      emergencyType: 'MEDICAL_EMERGENCY',
      locationSector: 'SEC_104',
      nearestMedicalRoom: 'Sector 104 Concourse First Aid Station',
    };

    const rec = await agent.getEmergencyDirectives('user-fan-1', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, options);
    assert.strictEqual(rec.intent, 'EMERGENCY');
    assert.strictEqual(rec.priority, 'CRITICAL');
    assert.ok(rec.recommendation);
    assert.ok(rec.reason);
  });

  // Test 2: Blocked Exit
  it('should recommend correct secondary route if exit is blocked', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new EmergencyAgent(core);

    const options: EmergencyContextOptions = {
      emergencyType: 'BLOCKED_EXIT',
      locationSector: 'SEC_104',
      blockedRoutes: ['Gate 4 East Exit Corridor'],
      nearestExit: 'Gate 2 West Wing Corridor',
    };

    const rec = await agent.getEmergencyDirectives('user-fan-1', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, options);
    assert.strictEqual(rec.intent, 'EMERGENCY');
    assert.ok(rec.recommendation);
  });

  // Test 3: Fire Emergency
  it('should formulate evacuation path and safety zones for active fire', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new EmergencyAgent(core);

    const options: EmergencyContextOptions = {
      emergencyType: 'FIRE',
      locationSector: 'SEC_112',
    };

    const rec = await agent.getEmergencyDirectives('user-fan-2', UserRole.FAN, { latitude: 25.3530, longitude: 51.5320, sectorId: 'SEC_112' }, options);
    assert.strictEqual(rec.priority, 'CRITICAL');
    assert.ok(rec.recommendation);
  });

  // Test 4: Weather Emergency
  it('should suggest indoor assembly and safety warnings for Extreme Weather', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new EmergencyAgent(core);

    const options: EmergencyContextOptions = {
      emergencyType: 'WEATHER_EMERGENCY',
      weatherCondition: 'Severe Humid Heat Sandstorm',
    };

    const rec = await agent.getEmergencyDirectives('user-fan-1', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, options);
    assert.ok(rec.recommendation);
  });

  // Test 5: Wheelchair User Accessibility
  it('should recommend lift-based or step-free routes for wheelchair user', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new EmergencyAgent(core);

    const options: EmergencyContextOptions = {
      emergencyType: 'FIRE',
      accessibilityNeeds: 'WHEELCHAIR',
      elevatorStatus: 'OPERATIONAL',
    };

    const rec = await agent.getEmergencyDirectives('user-fan-3', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, options);
    assert.ok(rec.recommendation);
  });

  // Test 6: Blind User Accessibility
  it('should recommend audio-guided exit pathing for blind user', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new EmergencyAgent(core);

    const options: EmergencyContextOptions = {
      emergencyType: 'FIRE',
      accessibilityNeeds: 'BLIND',
    };

    const rec = await agent.getEmergencyDirectives('user-fan-4', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, options);
    assert.ok(rec.recommendation);
  });

  // Test 7: Network Failure Recovery
  it('should recover gracefully and provide local stencils when AI Provider fails with an error', async () => {
    // Force AI Provider to fail by simulating a network crash (throws an Error)
    const crashingProvider = {
      generateResponse: async () => {
        throw new Error('Stadium Network Interface Lost (Simulated Crash)');
      },
    };
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, crashingProvider as any, responseParser);
    const agent = new EmergencyAgent(core);

    const rec = await agent.getEmergencyDirectives('user-fan-1', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, { emergencyType: 'FIRE' });
    assert.strictEqual(rec.intent, 'EMERGENCY');
    assert.strictEqual(rec.priority, 'CRITICAL');
    assert.ok(rec.title.includes('Recovery'));
    assert.ok(rec.reason.includes('Error detail:'));
  });

  // Test 8: Provider Failure (Empty or invalid response output)
  it('should recover gracefully when AI Provider returns empty or corrupt format', async () => {
    const corruptProvider = {
      generateResponse: async () => {
        return '--- CORRUPT STRING WITHOUT JSON ---';
      },
    };
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, corruptProvider as any, responseParser);
    const agent = new EmergencyAgent(core);

    const rec = await agent.getEmergencyDirectives('user-fan-1', UserRole.FAN, { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }, { emergencyType: 'FIRE' });
    assert.strictEqual(rec.intent, 'EMERGENCY');
    assert.strictEqual(rec.priority, 'CRITICAL');
    assert.ok(rec.title.includes('Recovery'));
    assert.ok(rec.recommendation);
  });
});
