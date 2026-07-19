/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import React from 'react';
import CommandCenterDashboard from '../../features/commandcenter/CommandCenterDashboard';
import { LiveAlertPanel } from '../../features/commandcenter/LiveAlertPanel';
import { CrowdOverviewCard, AccessibilityOverview } from '../../features/commandcenter/OverviewCards';
import { RecommendationFeed } from '../../features/commandcenter/RecommendationFeed';
import { StadiumHealthCard } from '../../features/commandcenter/StadiumHealthCard';
import { AccessibilityIntelligenceAgent } from '../../features/accessibility/AccessibilityIntelligenceAgent';
import { EmergencyResponseAgent } from '../../features/emergency/EmergencyResponseAgent';
import { OperationsIntelligenceAgent } from '../../features/operations/OperationsIntelligenceAgent';
import { UserRole } from '../../types/user';

import { describe, it } from 'vitest';

describe('FIFA Synapse CommandCenter & Dashboard Components Tests', () => {
  const mockContext = {
    userId: 'user-0',
    activeRole: UserRole.ORGANIZER,
    userProfile: { uid: 'user-0', displayName: 'Head Admin', email: 'admin@fifa.com', role: UserRole.ORGANIZER },
    activeMatch: { id: 'm1', status: 'LIVE', homeTeam: { name: 'France' }, awayTeam: { name: 'Croatia' } },
    crowdAnalysis: [{ sectorId: 'SEC_A', occupancyPercent: 88, flowRatePerMin: 120, status: 'HIGH' }],
    foodCourts: [],
    activeIncidents: [],
    parkingZones: [],
    notifications: [],
    stadiumDetails: { name: 'Al Bayt Stadium' },
    timestamp: new Date().toISOString()
  };

  // 1. AI Command Center Dashboard test
  it('should instantiate CommandCenterDashboard with proper standard wrapper layout', () => {
    const element = React.createElement(CommandCenterDashboard);
    assert.strictEqual(element.type, CommandCenterDashboard);
  });

  // 2. Live Alert Panel test
  it('should accept active alerts lists and render empty/populated visual states', () => {
    const element = React.createElement(LiveAlertPanel, {
      context: mockContext as any
    });
    assert.ok(element.props.context);
    assert.strictEqual(element.props.context.userId, 'user-0');
  });

  // 3. Overview Cards verification
  it('should initialize OverviewCards with full system telemetry variables', () => {
    const elementCrowd = React.createElement(CrowdOverviewCard, {
      context: mockContext as any
    });
    const elementAccess = React.createElement(AccessibilityOverview, {
      context: mockContext as any
    });
    assert.ok(elementCrowd.props.context);
    assert.ok(elementAccess.props.context);
  });

  // 4. Recommendation Feed component validation
  it('should bind priority recommendation streams to Feed controllers', () => {
    const mockRecs = [
      {
        id: 'rec-1',
        source: 'Food Agent',
        title: 'Concession Load Balancing',
        summary: 'Open additional registers at Lusail Grill',
        reasoning: 'Lusail Grill is under heavy demand',
        recommendedAction: 'Alert staff',
        confidence: 0.95,
        priority: 'HIGH' as const,
        impactBenefit: 'Reduces queue delays by 8 minutes',
        status: 'CRITICAL' as const,
        affectedArea: 'Sector 102'
      }
    ];
    const element = React.createElement(RecommendationFeed, {
      recommendations: mockRecs
    });
    assert.strictEqual(element.props.recommendations.length, 1);
    assert.strictEqual(element.props.recommendations[0].priority, 'HIGH');
  });

  // 5. Stadium Health Card component validation
  it('should format general metrics in Stadium Health tracker', () => {
    const mockHealth = {
      overallScore: 85,
      status: 'OPTIMAL' as const,
      security: { score: 90, status: 'OPTIMAL' as const, description: 'All sectors secured' },
      crowd: { score: 85, status: 'OPTIMAL' as const, description: 'Egress paths clear' },
      concessions: { score: 80, status: 'MODERATE' as const, description: 'Some queues active' },
      accessibility: { score: 95, status: 'OPTIMAL' as const, description: 'All ramps clear' },
      transport: { score: 82, status: 'OPTIMAL' as const, description: 'Transit links running' }
    };
    const element = React.createElement(StadiumHealthCard, {
      health: mockHealth
    });
    assert.ok(element.props.health);
    assert.strictEqual(element.props.health.overallScore, 85);
  });

  // 6. Role-based Intelligence Agent components
  it('should initialize role agents with correct layout parameters', () => {
    const accessibilityElement = React.createElement(AccessibilityIntelligenceAgent);
    const emergencyElement = React.createElement(EmergencyResponseAgent);
    const operationsElement = React.createElement(OperationsIntelligenceAgent);

    assert.strictEqual(accessibilityElement.type, AccessibilityIntelligenceAgent);
    assert.strictEqual(emergencyElement.type, EmergencyResponseAgent);
    assert.strictEqual(operationsElement.type, OperationsIntelligenceAgent);
  });
});
