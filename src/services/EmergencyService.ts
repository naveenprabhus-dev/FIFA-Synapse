/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EmergencyType, EmergencyContextOptions } from '../types/emergency';

export class EmergencyService {
  /**
   * Classifies the emergency threat level based on the type and crowd factors.
   */
  public classifySeverity(type: EmergencyType, crowdDensityPercent: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' {
    if (type === 'FIRE' || type === 'CROWD_STAMPEDE' || type === 'SECURITY_THREAT') {
      return 'CRITICAL';
    }
    if (crowdDensityPercent > 85) {
      return 'CRITICAL';
    }
    if (type === 'MEDICAL_EMERGENCY' || type === 'BLOCKED_EXIT' || type === 'POWER_FAILURE' || type === 'STRUCTURAL_HAZARD') {
      return 'HIGH';
    }
    return 'MEDIUM';
  }

  /**
   * Determines nearest evacuation facilities and accessibility clearance checks.
   */
  public planEvacuation(
    type: EmergencyType,
    context: EmergencyContextOptions
  ): {
    suggestedExit: string;
    estimatedTimeMin: number;
    accessibilityCleared: boolean;
  } {
    const isWheelchair = context.accessibilityNeeds === 'WHEELCHAIR';
    const hasOfflineElevators = context.elevatorStatus === 'OFFLINE';

    // Base defaults
    let suggestedExit = context.nearestExit || 'Gate 1 Plaza Main Gate';
    let estimatedTimeMin = 5;
    let accessibilityCleared = true;

    if (isWheelchair) {
      if (hasOfflineElevators && type === 'FIRE') {
        suggestedExit = 'Ground Ramp East Lobby';
        estimatedTimeMin = 10;
        accessibilityCleared = false; // Escalators and lifts offline
      } else {
        suggestedExit = context.nearestExit || 'Gate 4 Accessible West Ramp';
        estimatedTimeMin = 7;
      }
    } else if (type === 'CROWD_STAMPEDE') {
      suggestedExit = 'Wide Open North Plaza';
      estimatedTimeMin = 4;
    }

    return {
      suggestedExit,
      estimatedTimeMin,
      accessibilityCleared,
    };
  }

  /**
   * Computes the safest physical traversal segments avoiding known barriers.
   */
  public recommendRoute(
    sectorId: string,
    blockedRoutes: string[] = [],
    _accessibilityNeeds: string = 'NONE'
  ): {
    routeSegments: string;
    alternativeRoutes: string[];
  } {
    const defaultRoute = `${sectorId} ──▶ Concourse Corridor C ──▶ Gate 4 Outer Exit`;
    const alternativeRoutes = [
      `${sectorId} ──▶ North Plaza Overpass`,
      `Elevated Bridge Connection ──▶ South Concourse Hub`
    ];

    if (blockedRoutes.length > 0) {
      // Check if default route is blocked
      const isBlocked = blockedRoutes.some(b => b.toLowerCase().includes('corridor') || b.toLowerCase().includes('gate 4'));
      if (isBlocked) {
        return {
          routeSegments: `${sectorId} ──▶ Left Bypass Escalator ──▶ East Parking Hub`,
          alternativeRoutes: [
            `${sectorId} ──▶ Level 2 Upper Deck Ramp ──▶ West Plaza`,
            `Direct Field Ingress (Steward Guided)`
          ]
        };
      }
    }

    return {
      routeSegments: defaultRoute,
      alternativeRoutes,
    };
  }

  /**
   * Complete high-level emergency intelligence analysis wrapper.
   */
  public analyzeEmergency(type: EmergencyType, context: EmergencyContextOptions) {
    const severity = this.classifySeverity(type, context.crowdDensityPercent || 50);
    const plan = this.planEvacuation(type, context);
    const routing = this.recommendRoute(context.locationSector || 'SEC_104', context.blockedRoutes, context.accessibilityNeeds);

    return {
      severity,
      plan,
      routing,
    };
  }
}
