/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { OperationsAgent } from '../../ai/agents/OperationsAgent';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';
import { UserRole } from '../../types/user';
import { OperationsContextOptions } from '../../types/operations';
import {
  OperationsAnalysisService,
  DeploymentRecommendationService,
  QueueIntelligenceService,
  ResourceAllocationService,
  MaintenanceRecommendationService,
  OperationsIntelligenceService
} from '../../services/OperationsIntelligenceService';

// Mock repositories for testing
const mockUserRepo = {
  getUserProfile: async (uid: string) => ({
    uid,
    email: 'operator@synapse.fifa.org',
    displayName: 'Ahmad Al-Mansour',
    role: UserRole.OPERATIONS,
    createdAt: new Date().toISOString(),
  }),
};

const mockMatchRepo = {
  getMatches: async () => [
    {
      id: 'match-1',
      homeTeam: { id: 't1', name: 'France', shortName: 'FRA', score: 2 },
      awayTeam: { id: 't2', name: 'Morocco', shortName: 'MAR', score: 1 },
      status: 'LIVE' as const,
      currentPhase: 'SECOND_HALF' as const,
      currentMinute: 82,
      stoppageTimeMinutes: 0,
      venueName: 'Al Bayt Stadium',
      kickoffTime: new Date().toISOString(),
      timelineEvents: [],
    },
  ],
};

const mockCrowdRepo = {
  getCrowdAnalysis: async () => [
    { sectorId: 'SEC_104', occupancyPercent: 88, flowRatePerMin: 180, status: 'MODERATE' as const },
    { sectorId: 'SEC_108', occupancyPercent: 95, flowRatePerMin: 310, status: 'CRITICAL' as const },
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
    name: 'Al Bayt Stadium',
    capacity: 68895,
    location: 'Al Khor',
    gates: [],
    sectors: [],
  }),
  getWeatherTelemetry: async () => ({
    temperatureCelsius: 27,
    relativeHumidityPercent: 62,
    windSpeedKmh: 14,
    skyCondition: 'CLEAR' as const,
    lastUpdated: new Date().toISOString(),
  }),
};

// Custom minimal runner helpers
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

describe('AI Operations Intelligence Agent Test Suite', () => {
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

  // 1. Crowd Surge Test Scenario
  it('should formulate crowd control directives under active surge levels', async () => {
    const service = new OperationsIntelligenceService();
    const options: OperationsContextOptions = {
      currentZone: 'SEC_108',
      liveCrowdDensity: 92, // Surge
      queueLength: 40,
      gateStatus: 'NORMAL',
      volunteerCount: 10,
      securityCount: 5,
      medicalTeamAvailable: true,
      cleaningStatus: 'CLEAN',
      parkingAvailability: 50,
      weather: 'Clear',
      matchTimeline: 'LIVE',
      liveIncidentCount: 0,
      activeNotificationsCount: 1
    };

    const result = service.getRecommendation('CROWD_MANAGEMENT', options);
    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.recommendation.toLowerCase().includes('redirect') || result.recommendation.toLowerCase().includes('exit') || result.recommendation.toLowerCase().includes('corridor'));
    assert.ok(result.confidenceScore > 0.85);
  });

  // 2. Gate Closure Test Scenario
  it('should recommend traffic diversion when primary entry gates are closed', async () => {
    const service = new OperationsIntelligenceService();
    const options: OperationsContextOptions = {
      currentZone: 'SEC_104',
      liveCrowdDensity: 50,
      queueLength: 180, // Heavy Backlog
      gateStatus: 'CLOSED', // Gate closed
      volunteerCount: 15,
      securityCount: 6,
      medicalTeamAvailable: true,
      cleaningStatus: 'CLEAN',
      parkingAvailability: 45,
      weather: 'Clear',
      matchTimeline: 'LIVE',
      liveIncidentCount: 0,
      activeNotificationsCount: 1
    };

    const result = service.getRecommendation('GATE_MONITORING', options);
    assert.ok(result.recommendation.toLowerCase().includes('divert') || result.recommendation.toLowerCase().includes('neighboring') || result.recommendation.toLowerCase().includes('gate'));
  });

  // 3. Staff / Volunteer Shortage
  it('should recommend volunteer deployment shifts under high crowd density', async () => {
    const deploymentService = new DeploymentRecommendationService();
    const options: OperationsContextOptions = {
      currentZone: 'SEC_108',
      liveCrowdDensity: 80, // High density
      queueLength: 30,
      gateStatus: 'NORMAL',
      volunteerCount: 4, // Shortage in zone
      securityCount: 4,
      medicalTeamAvailable: true,
      cleaningStatus: 'CLEAN',
      parkingAvailability: 60,
      weather: 'Clear',
      matchTimeline: 'LIVE',
      liveIncidentCount: 0,
      activeNotificationsCount: 1
    };

    const result = deploymentService.getStaffDeployment('VOLUNTEER_DEPLOYMENT', options);
    assert.ok(result.recommendation.toLowerCase().includes('redeploy') || result.recommendation.toLowerCase().includes('volunteers'));
    assert.ok(result.requiredResources.some(r => r.includes('Volunteers')));
  });

  // 4. Cleaning & Sanitation Requests
  it('should prioritize rapid restroom sanitization sweep under critical sanitation logs', async () => {
    const service = new OperationsIntelligenceService();
    const options: OperationsContextOptions = {
      currentZone: 'SEC_104',
      liveCrowdDensity: 70,
      queueLength: 20,
      gateStatus: 'NORMAL',
      volunteerCount: 12,
      securityCount: 6,
      medicalTeamAvailable: true,
      cleaningStatus: 'CRITICAL', // Sanitation breach
      parkingAvailability: 80,
      weather: 'Clear',
      matchTimeline: 'LIVE',
      liveIncidentCount: 0,
      activeNotificationsCount: 1
    };

    const result = service.getRecommendation('CLEANING_OPERATIONS', options);
    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.recommendation.toLowerCase().includes('janitorial') || result.recommendation.toLowerCase().includes('restroom') || result.recommendation.toLowerCase().includes('sanitization'));
  });

  // 5. Parking Status Warning
  it('should direct parking inflow to alternative Metro stations under parking exhaustion', async () => {
    const service = new OperationsIntelligenceService();
    const options: OperationsContextOptions = {
      currentZone: 'PARK_A',
      liveCrowdDensity: 30,
      queueLength: 0,
      gateStatus: 'NORMAL',
      volunteerCount: 5,
      securityCount: 2,
      medicalTeamAvailable: true,
      cleaningStatus: 'CLEAN',
      parkingAvailability: 5, // Exhausted parking capacity
      weather: 'Clear',
      matchTimeline: 'LIVE',
      liveIncidentCount: 0,
      activeNotificationsCount: 1
    };

    const result = service.getRecommendation('PARKING_STATUS', options);
    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.recommendation.toLowerCase().includes('secondary') || result.recommendation.toLowerCase().includes('metro') || result.recommendation.toLowerCase().includes('parking'));
  });

  // 6. Medical Team emergency dispatch
  it('should coordinate paramedic dispatch to reported incident zone', async () => {
    const service = new OperationsIntelligenceService();
    const options: OperationsContextOptions = {
      currentZone: 'SEC_104',
      liveCrowdDensity: 40,
      queueLength: 10,
      gateStatus: 'NORMAL',
      volunteerCount: 10,
      securityCount: 6,
      medicalTeamAvailable: true,
      cleaningStatus: 'CLEAN',
      parkingAvailability: 70,
      weather: 'Clear',
      matchTimeline: 'LIVE',
      liveIncidentCount: 1, // Incident registered
      activeNotificationsCount: 1
    };

    const result = service.getRecommendation('MEDICAL_TEAM_COORDINATION', options);
    assert.ok(result.recommendation.toLowerCase().includes('dispatch') || result.recommendation.toLowerCase().includes('medical') || result.recommendation.toLowerCase().includes('paramedic'));
  });

  // 7. Operations Intent Classification
  it('should identify the correct operations intent from system keywords', async () => {
    const queries = [
      'Report active crowd congestion at turnstiles',
      'Janitorial request restroom block Sector 104',
      'Divert inbound vehicles parking level 2'
    ];

    for (const query of queries) {
      const detected = intentEngine.detectIntent(query);
      assert.strictEqual(detected, 'OPERATIONS');
    }
  });

  // 8. End-To-End Synapse Core pipeline run for Operations Agent
  it('should successfully run through Synapse Core with an Operations query', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new OperationsAgent(core);

    const rec = await agent.getOperationsDirectives(
      'operator-uid',
      UserRole.OPERATIONS,
      { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' },
      {
        currentZone: 'SEC_104',
        liveCrowdDensity: 75,
        queueLength: 60,
        gateStatus: 'NORMAL',
        volunteerCount: 12,
        securityCount: 6,
        medicalTeamAvailable: true,
        cleaningStatus: 'CLEAN',
        parkingAvailability: 50,
        weather: 'Clear',
        matchTimeline: 'LIVE',
        liveIncidentCount: 0,
        activeNotificationsCount: 1
      }
    );

    assert.strictEqual(rec.intent, 'OPERATIONS');
    assert.ok(rec.recommendation);
  });

  // 9. Graceful Fallback check on network failure
  it('should fall back to safe offline operational recommendations on AI timeout', async () => {
    const aiProvider = new MockAIProvider(10, true, false); // Simulate AI error
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new OperationsAgent(core);

    const rec = await agent.getOperationsDirectives(
      'operator-uid',
      UserRole.OPERATIONS,
      { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_108' },
      {
        currentZone: 'SEC_108',
        liveCrowdDensity: 95,
        queueLength: 140,
        gateStatus: 'NORMAL',
        volunteerCount: 8,
        securityCount: 4,
        medicalTeamAvailable: true,
        cleaningStatus: 'CRITICAL',
        parkingAvailability: 40,
        weather: 'Clear',
        matchTimeline: 'LIVE',
        liveIncidentCount: 0,
        activeNotificationsCount: 1
      }
    );

    assert.strictEqual(rec.intent, 'OPERATIONS');
    assert.ok(rec.recommendation);
    assert.ok(rec.reason.includes('temporarily unreachable') || rec.reason.includes('offline'));
  });
});
