/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { AccessibilityAgent } from '../../ai/agents/AccessibilityAgent';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';
import { UserRole } from '../../types/user';
import { AccessibilityProfile, AccessibilityContextOptions } from '../../types/accessibility';
import {
  AccessibilityAnalysisService,
  AccessibleRouteService,
  FacilityRecommendationService,
  AccessibilityScoringService,
  AccessibilityService
} from '../../services/AccessibilityService';

// Mock repositories for testing
const mockUserRepo = {
  getUserProfile: async (uid: string) => ({
    uid,
    email: 'visitor@synapse.fifa.org',
    displayName: 'Juan Gomez',
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
      currentMinute: 55,
      stoppageTimeMinutes: 0,
      venueName: 'Al Bayt Stadium',
      kickoffTime: new Date().toISOString(),
      timelineEvents: [],
    },
  ],
};

const mockCrowdRepo = {
  getCrowdAnalysis: async () => [
    { sectorId: 'SEC_104', occupancyPercent: 65, flowRatePerMin: 80, status: 'OPTIMAL' as const },
    { sectorId: 'SEC_108', occupancyPercent: 92, flowRatePerMin: 220, status: 'CRITICAL' as const },
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
    temperatureCelsius: 28,
    relativeHumidityPercent: 60,
    windSpeedKmh: 15,
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

describe('AI Accessibility Intelligence Agent Test Suite', () => {
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

  // 1. Wheelchair Navigation
  it('should formulate step-free routing guidelines for Wheelchair Users', async () => {
    const routeService = new AccessibleRouteService();
    const result = routeService.calculateRoute('WHEELCHAIR', 'SEC_104', 'Gate 4 Main Entrance');
    
    assert.ok(result.primaryRoute.includes('Ramp') || result.primaryRoute.includes('Elevator') || result.primaryRoute.includes('Level'));
    assert.strictEqual(result.routeWarnings.length, 0);
  });

  // 2. Blind User
  it('should formulate continuous tactile tile routing for Blind Users', async () => {
    const routeService = new AccessibleRouteService();
    const result = routeService.calculateRoute('BLIND', 'SEC_104', 'Gate 4 Main Entrance');
    
    assert.ok(result.primaryRoute.includes('Tactile'));
    assert.ok(result.routeWarnings.some(w => w.includes('Tactile paving')));
  });

  // 3. Low Vision
  it('should customize routing indicators for Low Vision profiles', async () => {
    const routeService = new AccessibleRouteService();
    const result = routeService.calculateRoute('LOW_VISION', 'SEC_104', 'Gate 4 Main Entrance');
    
    assert.ok(result.primaryRoute);
    assert.ok(result.estimatedTime);
  });

  // 4. Elevator Failure Fallback
  it('should divert Wheelchair Users to alternative external ramps under Elevator offline events', async () => {
    const routeService = new AccessibleRouteService();
    const result = routeService.calculateRoute('WHEELCHAIR', 'SEC_104', 'Gate 4 Main Entrance', [], 'OFFLINE', 'AVAILABLE');
    
    assert.ok(result.primaryRoute.includes('Ramp') || result.primaryRoute.includes('Ground'));
    assert.ok(result.routeWarnings.some(w => w.toLowerCase().includes('elevator')));
  });

  // 5. Blocked Ramp diversion
  it('should divert Wheelchair Users to alternative elevator lifts under Blocked Ramp events', async () => {
    const routeService = new AccessibleRouteService();
    const result = routeService.calculateRoute('WHEELCHAIR', 'SEC_104', 'Gate 4 Main Entrance', [], 'OPERATIONAL', 'BLOCKED');
    
    assert.ok(result.primaryRoute.includes('Lift') || result.primaryRoute.includes('Elevator') || result.primaryRoute.includes('Plaza'));
    assert.ok(result.routeWarnings.some(w => w.toLowerCase().includes('ramp')));
  });

  // 6. Crowded Accessible Route warning
  it('should adjust travel safety parameters for heavy crowd density conditions', async () => {
    const analysisService = new AccessibilityAnalysisService();
    const result = analysisService.analyzeProfile('WHEELCHAIR', 90);
    
    assert.strictEqual(result.priority, 'HIGH');
    assert.ok(result.sensoryWarnings.some(w => w.toLowerCase().includes('crowd')));
  });

  // 7. Scoring and confidence computations
  it('should decrease wayfinding confidence scores appropriately under barriers', async () => {
    const scoringService = new AccessibilityScoringService();
    const scoreNormal = scoringService.computeConfidence('WHEELCHAIR', { elevatorStatus: 'OPERATIONAL', rampAvailability: 'AVAILABLE' });
    const scoreFaulty = scoringService.computeConfidence('WHEELCHAIR', { elevatorStatus: 'OFFLINE', rampAvailability: 'BLOCKED' });
    
    assert.ok(scoreNormal > scoreFaulty);
    assert.ok(scoreFaulty < 0.70);
  });

  // 8. Repository Layer Context check
  it('should verify the repository structures return valid context parameters', async () => {
    const profile = await mockUserRepo.getUserProfile('test-uid');
    const matches = await mockMatchRepo.getMatches();
    const weather = await mockVenueRepo.getWeatherTelemetry();
    
    assert.strictEqual(profile.role, UserRole.FAN);
    assert.strictEqual(matches[0].status, 'LIVE');
    assert.strictEqual(weather.skyCondition, 'CLEAR');
  });

  // 9. Synapse Core Integration Intent checking
  it('should detect the correct intent from accessibility instructions', async () => {
    const query = 'Where is the nearest wheelchair ramp access channel?';
    const detected = intentEngine.detectIntent(query);
    
    assert.strictEqual(detected, 'ACCESSIBILITY');
  });

  // 10. End-To-End Synapse Core pipeline run for Accessibility Agent
  it('should successfully run through Synapse Core with an Accessibility query', async () => {
    const aiProvider = new MockAIProvider(10, false, false);
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new AccessibilityAgent(core);

    const rec = await agent.getAccessibilityDirectives(
      'demo-uid',
      UserRole.FAN,
      { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' },
      {
        profileType: 'WHEELCHAIR',
        locationSector: 'SEC_104',
        destinationSector: 'Gate 4 Main Entrance',
        crowdDensityPercent: 50,
        blockedRoutes: [],
        accessibleRoutes: ['Concourse B Step-Free'],
        elevatorStatus: 'OPERATIONAL',
        rampAvailability: 'AVAILABLE',
        hasAccessibleSeating: true,
        hasAccessibleRestrooms: true,
        hasMedicalStations: true,
        liveAlerts: [],
        weatherConditions: 'Clear',
        matchStatus: 'LIVE'
      }
    );

    assert.strictEqual(rec.intent, 'ACCESSIBILITY');
    assert.ok(rec.recommendation);
  });

  // 11. Graceful Backup Fallback on network failure
  it('should fall back to safe offline routing heuristics if AI provider fails', async () => {
    const aiProvider = new MockAIProvider(10, true, false); // Simulate AI provider error / timeout
    const core = new SynapseCore(intentEngine, contextBuilder, decisionEngine, promptBuilder, aiProvider, responseParser);
    const agent = new AccessibilityAgent(core);

    const rec = await agent.getAccessibilityDirectives(
      'demo-uid',
      UserRole.FAN,
      { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' },
      {
        profileType: 'WHEELCHAIR',
        locationSector: 'SEC_104',
        destinationSector: 'Gate 4 Main Entrance',
        crowdDensityPercent: 50,
        blockedRoutes: [],
        accessibleRoutes: [],
        elevatorStatus: 'OFFLINE',
        rampAvailability: 'AVAILABLE',
        hasAccessibleSeating: true,
        hasAccessibleRestrooms: true,
        hasMedicalStations: true,
        liveAlerts: [],
        weatherConditions: 'Clear',
        matchStatus: 'LIVE'
      }
    );

    assert.strictEqual(rec.intent, 'ACCESSIBILITY');
    assert.ok(rec.recommendation);
    assert.ok(rec.reason.includes('temporarily unreachable') || rec.reason.includes('offline'));
  });
});
