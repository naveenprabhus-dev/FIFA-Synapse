/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { IntentEngine } from '../../ai/orchestrator/IntentEngine';
import { DecisionEngine } from '../../ai/orchestrator/DecisionEngine';
import { PromptBuilder } from '../../ai/orchestrator/PromptBuilder';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ResponseParser } from '../../ai/orchestrator/ResponseParser';
import { SynapseCore } from '../../ai/orchestrator/SynapseCore';
import { ContextBuilder } from '../../ai/orchestrator/ContextBuilder';
import { UserRole } from '../../types/user';

// Mock repositories for testing context building
const mockUserRepo = {
  getUserProfile: async (uid: string) => ({
    uid,
    email: 'test@synapse.com',
    displayName: 'Test User',
    role: UserRole.FAN,
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
      currentMinute: 85,
      stoppageTimeMinutes: 2,
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
    { sectorId: 'SEC_A', occupancyPercent: 90, flowRatePerMin: 150, status: 'CRITICAL' as const },
    { sectorId: 'SEC_B', occupancyPercent: 30, flowRatePerMin: 20, status: 'OPTIMAL' as const },
  ],
  getCrowdAnalysisBySector: async () => { throw new Error('Not implemented'); },
  updateSectorCrowdData: async () => { throw new Error('Not implemented'); },
};

const mockFoodRepo = {
  getFoodCourts: async () => [
    {
      id: 'bistro-1',
      name: 'Pizza & Burger Bistro',
      locationDescription: 'Sector 104',
      status: 'OPEN' as const,
      categories: ['PIZZA'],
      capacityLimit: 100,
      currentCapacityLoad: 50,
      popularityScore: 4.5,
      queue: { currentLength: 15, predictedLength15Min: 20, predictedLength30Min: 25, trend: 'STABLE' as const, confidenceScore: 0.9, estimatedWaitMinutes: 10, lastUpdated: new Date().toISOString() },
      accessibilityFriendly: true,
      menu: [],
    },
  ],
  getFoodCourtById: async () => { throw new Error('Not implemented'); },
  updateMenuItemStock: async () => { throw new Error('Not implemented'); },
  updateQueueLength: async () => { throw new Error('Not implemented'); },
};

const mockIncidentRepo = {
  getIncidents: async () => [
    {
      id: 'inc-1',
      category: 'MEDICAL_EMERGENCY' as const,
      severity: 'CRITICAL' as const,
      status: 'REPORTED' as const,
      locationName: 'Sector 104',
      reportedBy: 'user-1',
      assignedStaffIds: [],
      description: 'Fan requires assistance.',
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
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
    id: 'stadium-1',
    name: 'Al Bayt Stadium',
    city: 'Al Khor',
    totalCapacity: 60000,
    sections: [],
    gates: [],
    restrooms: [],
    medicalRooms: [],
    transitNodes: [],
  }),
  getSections: async () => [],
  getSectionById: async () => { throw new Error('Not implemented'); },
  getGates: async () => [],
  getGateById: async () => { throw new Error('Not implemented'); },
  getRestrooms: async () => [],
  getRestroomById: async () => { throw new Error('Not implemented'); },
  getMedicalRooms: async () => [],
  getTransitNodes: async () => [],
  updateTransitNodeStatus: async () => { throw new Error('Not implemented'); },
};

export async function runTests() {
  console.log('🏁 Starting FIFA Synapse Core Unit & Integration Tests...');

  // 1. Test Intent Engine
  console.log('\n--- Test Case 1: Intent Engine Classification ---');
  const intentEngine = new IntentEngine();
  
  assert.strictEqual(intentEngine.detectIntent('Where is the closest exit path?'), 'NAVIGATION');
  assert.strictEqual(intentEngine.detectIntent('I am extremely hungry, recommend food spots'), 'FOOD_RECOMMENDATION');
  assert.strictEqual(intentEngine.detectIntent('Active fire in Sector 104 concourse, alert medical!'), 'EMERGENCY');
  assert.strictEqual(intentEngine.detectIntent('Is the stadium sector crowded right now?'), 'CROWD');
  assert.strictEqual(intentEngine.detectIntent('Is there any elevator or wheelchair ramp here?'), 'ACCESSIBILITY');
  assert.strictEqual(intentEngine.detectIntent('Who won the game or scored the goals?'), 'MATCH_INFORMATION');
  assert.strictEqual(intentEngine.detectIntent('Random general text inquiry'), 'GENERAL_ASSISTANCE');
  
  console.log('✅ Intent Engine passed successfully.');

  // 2. Test Response Parser & Fallbacks
  console.log('\n--- Test Case 2: Response Parser with Clean and Corrupted JSON ---');
  const parser = new ResponseParser();
  
  const validJson = `\`\`\`json
  {
    "title": "Smart Concession Relocation",
    "recommendation": "Reroute to Concession A",
    "reason": "Saves wait time",
    "confidenceScore": 0.95,
    "priority": "HIGH",
    "suggestedAction": "Notify fans",
    "estimatedBenefit": "10 minutes wait reduction",
    "alternative": "Concession B"
  }
  \`\`\``;

  const parsedValid = parser.parseResponse(validJson, 'FOOD_RECOMMENDATION');
  assert.strictEqual(parsedValid.title, 'Smart Concession Relocation');
  assert.strictEqual(parsedValid.confidenceScore, 0.95);
  assert.strictEqual(parsedValid.priority, 'HIGH');
  assert.strictEqual(parsedValid.intent, 'FOOD_RECOMMENDATION');

  const corruptedJson = '{"title": "Broken Json,';
  const parsedFallback = parser.parseResponse(corruptedJson, 'CROWD');
  assert.ok(parsedFallback.title.includes('Synapse Recovery Directive'));
  assert.strictEqual(parsedFallback.confidenceScore, 0.5);
  assert.strictEqual(parsedFallback.intent, 'CROWD');

  console.log('✅ Response Parser passed successfully.');

  // 3. Test Decision Engine
  console.log('\n--- Test Case 3: Decision Engine Heuristics ---');
  const decisionEngine = new DecisionEngine();
  const contextBuilder = new ContextBuilder(
    mockUserRepo,
    mockMatchRepo,
    mockCrowdRepo,
    mockFoodRepo,
    mockIncidentRepo,
    mockParkingRepo,
    mockNotificationRepo,
    mockVenueRepo
  );

  const context = await contextBuilder.buildContext('user-1', UserRole.FAN);
  const decision = decisionEngine.analyzeDecision('NAVIGATION', context);

  assert.strictEqual(decision.shouldCallLLM, true);
  assert.strictEqual(decision.suggestedPriority, 'CRITICAL'); // due to critical medical incident in mock
  assert.ok(decision.preInferenceReasoning.length > 0);
  assert.strictEqual(decision.preComputedMetrics?.matchMinute, 85);

  console.log('✅ Decision Engine passed successfully.');

  // 4. Test Prompt Builder
  console.log('\n--- Test Case 4: Prompt Builder Template Compilation ---');
  const promptBuilder = new PromptBuilder();
  const prompt = promptBuilder.buildPrompt('CROWD', context);

  assert.ok(prompt.systemInstruction.includes('Crowd Intelligence Specialist'));
  assert.ok(prompt.userPrompt.includes('Crowd Sensors Telemetry'));
  assert.ok(prompt.userPrompt.includes('Sector SEC_A: 90% occupancy'));

  console.log('✅ Prompt Builder passed successfully.');

  // 5. Test Full Integrated SynapseCore Flow
  console.log('\n--- Test Case 5: SynapseCore Integrated Pipeline ---');
  const mockAI = new MockAIProvider(10, false, false);
  const core = new SynapseCore(
    intentEngine,
    contextBuilder,
    decisionEngine,
    promptBuilder,
    mockAI,
    parser
  );

  const recommendation = await core.getRecommendation(
    'Suggest concessions with shorter queues',
    { userId: 'user-1', activeRole: UserRole.FAN }
  );

  assert.strictEqual(recommendation.intent, 'FOOD_RECOMMENDATION');
  assert.strictEqual(recommendation.priority, 'CRITICAL'); // high priority due to mock state
  assert.ok(recommendation.recommendation.length > 0);
  assert.ok(recommendation.confidenceScore > 0.8);
  assert.ok(recommendation.reasoningDetails!.length > 0);

  console.log('✅ SynapseCore integrated pipeline passed successfully.');

  // 6. Test Core Fallback Safety
  console.log('\n--- Test Case 6: SynapseCore Fallback Recovery on Failure ---');
  const brokenAI = new MockAIProvider(10, true, false); // forceFailure = true
  const resilientCore = new SynapseCore(
    intentEngine,
    contextBuilder,
    decisionEngine,
    promptBuilder,
    brokenAI,
    parser
  );

  const fallbackRec = await resilientCore.getRecommendation(
    'Show me egress crowd alerts',
    { userId: 'user-1', activeRole: UserRole.FAN }
  );

  assert.ok(fallbackRec.title.includes('Fallback Intelligence Directive'));
  assert.strictEqual(fallbackRec.confidenceScore, 0.75);
  assert.ok(fallbackRec.reason.includes('temporarily unreachable'));

  console.log('✅ Fallback recovery passed successfully.');

  // 7. Test Prompt Manager & Gemini Provider Mock Suite
  console.log('\n--- Test Case 7: Gemini Provider Architecture & Prompt Templates ---');
  const { PromptManager } = await import('../../ai/orchestrator/PromptManager');
  const { GeminiProvider } = await import('../../ai/orchestrator/GeminiProvider');
  const { GeminiClient } = await import('../../ai/orchestrator/GeminiClient');

  const pm = new PromptManager();
  const compiledReq = pm.compileRequest('NAVIGATION', context, {
    originName: 'VIP Seat Row 2',
    destinationName: 'Main VIP Gate',
  });

  assert.strictEqual(compiledReq.intent, 'NAVIGATION');
  assert.ok(compiledReq.systemInstruction.includes('Wayfinding'));
  assert.ok(compiledReq.userPrompt.includes('VIP Seat Row 2'));

  // Test client failure handling
  const badClient = new GeminiClient('/api/invalid-endpoint-for-testing', 1, 10);
  const failingProvider = new GeminiProvider(badClient);

  try {
    await failingProvider.generateContent({
      systemInstruction: compiledReq.systemInstruction,
      userPrompt: compiledReq.userPrompt,
    }, 100);
    assert.fail('Should have thrown an API or network error');
  } catch (err: any) {
    assert.ok(err.message || err.code);
  }

  // Verify observability metrics are tracked properly
  const metrics = GeminiProvider.getObservabilityMetrics();
  assert.strictEqual(metrics.totalRequests, 1);
  assert.strictEqual(metrics.failedRequests, 1);

  console.log('✅ Gemini Provider Architecture passed successfully.');

  console.log('\n🏆 ALL TESTS PASSED SUCCESSFULLY! 100% build health verified.');
}
