/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { RecommendationAggregator } from '../../services/RecommendationAggregator';
import { DecisionService } from '../../services/DecisionService';
import { NotificationPriorityService } from '../../services/NotificationPriorityService';
import { ProactiveNotificationAgent } from '../../ai/agents/ProactiveNotificationAgent';
import { MockAIProvider } from '../../ai/orchestrator/AIProvider';
import { ProactiveNotification, ProactiveNotificationType } from '../../types/proactiveNotification';
import { UserRole } from '../../types/user';
import { SynapseFullContext } from '../../ai/orchestrator/ContextBuilder';

// Mock context builder payload
const createMockStadiumContext = (options?: {
  crowdOccupancy?: number;
  foodQueue?: number;
  hasIncident?: boolean;
  incidentType?: 'MEDICAL_EMERGENCY' | 'SECURITY_BREACH' | 'INFRASTRUCTURE_FAILURE';
  incidentTitle?: string;
  parkingAvailablePercent?: number;
  weatherAlerts?: string[];
}): SynapseFullContext => {
  return {
    userId: 'demo_user_123',
    timestamp: new Date().toISOString(),
    activeRole: UserRole.FAN,
    userLocation: { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_108' },
    activeMatch: {
      id: 'match-1',
      homeTeam: { id: 't1', name: 'France', shortName: 'FRA', score: 1 },
      awayTeam: { id: 't2', name: 'Morocco', shortName: 'MAR', score: 0 },
      status: 'LIVE',
      currentPhase: 'SECOND_HALF',
      currentMinute: 82,
      stoppageTimeMinutes: 0,
      kickoffTime: new Date().toISOString(),
      timelineEvents: [],
      venueName: 'Al Bayt Stadium',
    },
    weather: {
      temperatureCelsius: 28,
      humidityPercentage: 60,
      precipitationProbability: 10,
      windSpeedKmh: 12,
      roofActionRecommendation: 'LEAVE_OPEN',
      forecastBrief: 'CLEAR',
      activeWeatherAlerts: options?.weatherAlerts || [],
      lastUpdated: new Date().toISOString(),
    },
    activeIncidents: options?.hasIncident ? [
      {
        id: 'inc-123',
        category: options.incidentType || 'MEDICAL_EMERGENCY',
        severity: 'CRITICAL',
        status: 'REPORTED',
        locationName: 'Sector 108 - Concourse',
        description: options.incidentTitle || 'Heat exhaustion event reported.',
        reportedBy: 'user_123',
        assignedStaffIds: [],
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ] : [],
    crowdAnalysis: [
      {
        sectorId: 'SEC_108',
        occupancyPercent: options?.crowdOccupancy !== undefined ? options.crowdOccupancy : 85,
        flowRatePerMin: 120,
        status: 'OPTIMAL',
      }
    ],
    foodCourts: [
      {
        id: 'food-c',
        name: 'Burger Bistro',
        locationDescription: 'Sector 101',
        status: 'OPEN',
        categories: ['PIZZA', 'BURGER'],
        capacityLimit: 100,
        currentCapacityLoad: 40,
        popularityScore: 4.5,
        accessibilityFriendly: true,
        menu: [],
        queue: {
          currentLength: options?.foodQueue !== undefined ? options.foodQueue : 4,
          predictedLength15Min: 6,
          predictedLength30Min: 8,
          trend: 'STABLE',
          confidenceScore: 0.90,
          estimatedWaitMinutes: options?.foodQueue !== undefined ? Math.round(options.foodQueue * 1.2) : 5,
          lastUpdated: new Date().toISOString(),
        }
      }
    ],
    parkingZones: [
      {
        id: 'park-a',
        name: 'North Lot A',
        status: 'AVAILABLE',
        totalCapacity: 1000,
        currentOccupiedCount: options?.parkingAvailablePercent !== undefined 
          ? Math.round(1000 * (1 - options.parkingAvailablePercent))
          : 500,
        accessibilitySpacesCount: 40,
        accessibilitySpacesOccupied: 10,
        expectedExitMinutesAverage: 15,
      }
    ],
    notifications: [],
  };
};

describe('AI Proactive Notification Engine Test Suite', () => {

  it('RecommendationAggregator should map Crowd Alert, Food Recommendation and Emergency insights cleanly', async () => {
    const aggregator = new RecommendationAggregator();
    
    // Create congested context
    const context = createMockStadiumContext({
      crowdOccupancy: 95,
      foodQueue: 18,
      hasIncident: true,
      incidentType: 'MEDICAL_EMERGENCY'
    });

    const insights = aggregator.aggregateInsights(context);

    // Verify Crowd Insights
    assert.ok(insights['Crowd Intelligence Agent']);
    assert.strictEqual(insights['Crowd Intelligence Agent'].status, 'CRITICAL');
    assert.ok(insights['Crowd Intelligence Agent'].insightSummary.includes('SEC_108'));

    // Verify Concessions / Food Insights
    assert.ok(insights['Food Recommendation Agent']);
    assert.strictEqual(insights['Food Recommendation Agent'].status, 'MODERATE');

    // Verify Emergency Response Insights
    assert.ok(insights['Emergency Response Agent']);
    assert.strictEqual(insights['Emergency Response Agent'].status, 'CRITICAL');
    assert.ok(insights['Emergency Response Agent'].insightSummary.includes('MEDICAL_EMERGENCY'));
  });

  it('DecisionService should block duplicates within a 15-minute cooldown timeframe', async () => {
    const decisionService = new DecisionService();
    const mockTime = new Date().toISOString();

    const notif1: ProactiveNotification = {
      id: 'n-1',
      type: ProactiveNotificationType.CROWD_WARNING,
      title: 'Crowd Surge Sector 108',
      summary: 'Heavy congestion.',
      reason: ' halftimes crowd convergence.',
      recommendation: 'Open secondary bypass corridors.',
      priority: 'HIGH',
      confidenceScore: 0.95,
      affectedZone: 'SEC_108',
      estimatedBenefit: 'Saves 5 minutes.',
      timestamp: mockTime,
      read: false,
    };

    // Duplicate matching same category and affected zone
    const notifDuplicate: Omit<ProactiveNotification, 'id' | 'timestamp' | 'read'> = {
      type: ProactiveNotificationType.CROWD_WARNING,
      title: 'Crowd Surge Sector 108 - Secondary Alert',
      summary: 'Still congested.',
      reason: ' halftimes crowd convergence.',
      recommendation: 'Open secondary bypass corridors.',
      priority: 'HIGH',
      confidenceScore: 0.94,
      affectedZone: 'SEC_108',
      estimatedBenefit: 'Saves 5 minutes.',
    };

    const existingList = [notif1];

    // Attempt to evaluate duplicate
    const decision = decisionService.shouldPublishNotification(notifDuplicate, existingList);
    
    assert.strictEqual(decision.shouldPublish, false);
    assert.ok(decision.reason?.includes('cooldown'));
  });

  it('NotificationPriorityService should rank CRITICAL and role-specific alerts higher', async () => {
    const priorityService = new NotificationPriorityService();
    const timestamp = new Date().toISOString();

    const lowNotif: ProactiveNotification = {
      id: 'low',
      type: ProactiveNotificationType.FACILITY_UPDATE,
      title: 'Facility Baseline Clean',
      summary: 'All bathrooms serviced.',
      reason: 'Schedule check.',
      recommendation: 'None.',
      priority: 'LOW',
      confidenceScore: 0.88,
      affectedZone: 'SEC_101',
      estimatedBenefit: 'Comfort.',
      timestamp,
      read: false,
    };

    const criticalNotif: ProactiveNotification = {
      id: 'critical',
      type: ProactiveNotificationType.EMERGENCY_ALERT,
      title: 'Incident Dispatch Alert',
      summary: 'Safety alert.',
      reason: 'Power Outage.',
      recommendation: 'Follow safety lanes.',
      priority: 'CRITICAL',
      confidenceScore: 0.99,
      affectedZone: 'SEC_108',
      estimatedBenefit: 'Safety clearance.',
      timestamp,
      read: false,
    };

    const sorted = priorityService.sortNotifications([lowNotif, criticalNotif], UserRole.ORGANIZER, false);
    
    assert.strictEqual(sorted[0].id, 'critical');
    assert.strictEqual(sorted[1].id, 'low');
  });

  it('ProactiveNotificationAgent should gracefully fallback to Heuristics on AI Provider Network/Gemini Failure', async () => {
    // Inject mock AI provider set to forcefully fail
    const failingProvider = new MockAIProvider(10, true, false); // forceFailure = true
    const agent = new ProactiveNotificationAgent(failingProvider);

    const context = createMockStadiumContext({
      crowdOccupancy: 96, // Should trigger heuristic crowd warning fallback
      hasIncident: true,
      incidentType: 'MEDICAL_EMERGENCY',
      incidentTitle: 'Paramedic request.'
    });

    const notifications = await agent.generateProactiveNotifications(context);

    assert.ok(notifications.length > 0);
    // Verified that heuristic failover produced a crowd warning and emergency alert
    const emergency = notifications.find(n => n.type === ProactiveNotificationType.MEDICAL_ALERT);
    const crowd = notifications.find(n => n.type === ProactiveNotificationType.CROWD_WARNING);

    assert.ok(emergency);
    assert.ok(crowd);
    assert.strictEqual(emergency.priority, 'CRITICAL');
    assert.strictEqual(crowd.priority, 'HIGH');
  });

  it('ProactiveNotificationAgent should successfully parse Gemini Provider structured JSON output under normal conditions', async () => {
    const workingProvider = new MockAIProvider(10, false, false);
    const agent = new ProactiveNotificationAgent(workingProvider);

    // Mock active concession context (causes MockAIProvider to return concession recommendation JSON)
    const context = createMockStadiumContext({ foodQueue: 18 });
    const notifications = await agent.generateProactiveNotifications(context);

    assert.ok(notifications.length > 0);
    assert.ok(notifications[0].title.toLowerCase().includes('concession') || notifications[0].title.toLowerCase().includes('dining') || notifications[0].title.toLowerCase().includes('route'));
  });

});

import { describe, it } from 'vitest';
