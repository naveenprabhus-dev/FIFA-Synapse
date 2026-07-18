/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AccessibilityProfile, AccessibilityContextOptions } from '../types/accessibility';
import { SynapsePriority } from '../types/synapse';

// ==========================================
// 1. Accessibility Analysis Service
// ==========================================
export class AccessibilityAnalysisService {
  /**
   * Classifies the focus priority and general warning criteria for an accessibility profile.
   */
  public analyzeProfile(
    profile: AccessibilityProfile,
    crowdDensityPercent: number
  ): {
    priority: SynapsePriority;
    sensoryWarnings: string[];
    mobilityDirectives: string[];
  } {
    const sensoryWarnings: string[] = [];
    const mobilityDirectives: string[] = [];
    let priority: SynapsePriority = 'LOW';

    if (crowdDensityPercent > 80) {
      priority = 'HIGH';
      sensoryWarnings.push('High crowd density detected. Elevated ambient noise and visual overstimulation levels.');
    }

    switch (profile) {
      case 'WHEELCHAIR':
        priority = 'HIGH';
        mobilityDirectives.push('Enforce standard step-free pathways.');
        mobilityDirectives.push('Avoid all stairwell-only vertical conduits.');
        break;
      case 'BLIND':
      case 'VISUALLY_IMPAIRED':
        priority = 'HIGH';
        sensoryWarnings.push('Dynamic digital board updates may have auditory lag. Rely on standard audio beacons.');
        mobilityDirectives.push('Utilize tactile guiding tiles on concourse pavements.');
        break;
      case 'NEURODIVERGENT':
        priority = 'MEDIUM';
        sensoryWarnings.push('Loud crowd triggers active near main display screens. Sensory bags available.');
        mobilityDirectives.push('Prefer quieter corridors and low-traffic bypass bridges.');
        break;
      case 'SENIOR':
      case 'STROLLER':
      case 'TEMPORARY_INJURY':
        priority = 'MEDIUM';
        mobilityDirectives.push('Minimize heavy incline grades.');
        mobilityDirectives.push('Ensure resting bench nodes are within 50 meters.');
        break;
      case 'HEARING_IMPAIRED':
        priority = 'LOW';
        sensoryWarnings.push('Loudspeaker announcements are transcribed to push notifications on current screen.');
        break;
      default:
        break;
    }

    return {
      priority,
      sensoryWarnings,
      mobilityDirectives,
    };
  }
}

// ==========================================
// 2. Accessible Route Service
// ==========================================
export class AccessibleRouteService {
  /**
   * Generates step-free or sensor-optimized wayfinding pathways.
   */
  public calculateRoute(
    profile: AccessibilityProfile,
    origin: string,
    destination: string,
    blockedRoutes: string[] = [],
    elevatorStatus: 'OPERATIONAL' | 'OFFLINE' = 'OPERATIONAL',
    rampAvailability: 'AVAILABLE' | 'BLOCKED' | 'LIMITED' = 'AVAILABLE'
  ): {
    primaryRoute: string;
    alternativeRoute: string;
    estimatedTime: string;
    routeWarnings: string[];
  } {
    let primaryRoute = `${origin} ──▶ Ramp Area A ──▶ Low-congestion Concourse B ──▶ ${destination}`;
    let alternativeRoute = `${origin} ──▶ Level 1 Sky Bridge ──▶ Lift Station C ──▶ ${destination}`;
    let baseTimeMinutes = 8;
    const routeWarnings: string[] = [];

    // Evaluate route barriers based on profile
    const needsStepFree = profile === 'WHEELCHAIR' || profile === 'STROLLER' || profile === 'TEMPORARY_INJURY';
    const hasElevatorOutage = elevatorStatus === 'OFFLINE';
    const isRampBlocked = rampAvailability === 'BLOCKED';

    if (needsStepFree) {
      if (hasElevatorOutage && isRampBlocked) {
        primaryRoute = `${origin} ──▶ Ground-Level Access Channel D ──▶ Field Perimeter (Staff Guided) ──▶ ${destination}`;
        alternativeRoute = `Direct steward-assisted transfer via emergency golf carts`;
        baseTimeMinutes = 18;
        routeWarnings.push('CRITICAL: Sector elevator is OFFLINE and primary ramp is BLOCKED. Accessible path is limited to steward transfer.');
      } else if (hasElevatorOutage) {
        primaryRoute = `${origin} ──▶ Outer Ramp Sector 1 ──▶ Low-gradient Concourse ──▶ ${destination}`;
        alternativeRoute = `${origin} ──▶ Service Elevator F (Staff-operated) ──▶ ${destination}`;
        baseTimeMinutes = 12;
        routeWarnings.push('Notice: Concourse elevators are offline. Re-routed to long-gradient external ramps.');
      } else if (isRampBlocked) {
        primaryRoute = `${origin} ──▶ Lift Lobby 4 ──▶ Upper Level Concourse ──▶ ${destination}`;
        alternativeRoute = `${origin} ──▶ North Concourse Lift Lobby 2 ──▶ ${destination}`;
        baseTimeMinutes = 10;
        routeWarnings.push('Notice: Standard wheelchair ramp is blocked. Please utilize Level 4 Elevators.');
      }
    } else if (profile === 'BLIND' || profile === 'VISUALLY_IMPAIRED') {
      primaryRoute = `${origin} ──▶ Tactile Pavement Route Alpha ──▶ Audio Beacon Concourse ──▶ ${destination}`;
      alternativeRoute = `${origin} ──▶ Concourse A (Main Wayfinding Desk Guidance) ──▶ ${destination}`;
      baseTimeMinutes = 9;
      routeWarnings.push('Info: Tactile paving is fully continuous on Primary Route.');
    } else if (profile === 'NEURODIVERGENT') {
      primaryRoute = `${origin} ──▶ Sensory Bypass Corridor 104 (Quiet Path) ──▶ ${destination}`;
      alternativeRoute = `${origin} ──▶ Low-Occupancy External Concourse ──▶ ${destination}`;
      baseTimeMinutes = 11;
      routeWarnings.push('Path optimization: Selected route avoids high-decibel concession queues.');
    }

    // Evaluate general blockages
    if (blockedRoutes.length > 0) {
      const isConcourseBlocked = blockedRoutes.some(r => r.toLowerCase().includes('concourse') || r.toLowerCase().includes('bridge'));
      if (isConcourseBlocked) {
        primaryRoute = `${origin} ──▶ Outer Plaza Loop ──▶ Gate West Entrance ──▶ ${destination}`;
        baseTimeMinutes += 4;
        routeWarnings.push('Notice: Core concourse routes are congested. Wayfinding redirected to the external perimeter.');
      }
    }

    return {
      primaryRoute,
      alternativeRoute,
      estimatedTime: `${baseTimeMinutes} minutes`,
      routeWarnings,
    };
  }
}

// ==========================================
// 3. Facility Recommendation Service
// ==========================================
export class FacilityRecommendationService {
  /**
   * Resolves nearest accessible stadium facility nodes.
   */
  public getNearbyFacilities(
    profile: AccessibilityProfile,
    sectorId: string
  ): {
    facilityName: string;
    distanceMeters: number;
    type: 'RESTROOM' | 'ELEVATOR' | 'MEDICAL' | 'QUIET_ZONE' | 'ASSISTANCE_DESK';
    accessibilityRating: 'EXCELLENT' | 'GOOD' | 'STANDARD';
  }[] {
    const facilities: {
      facilityName: string;
      distanceMeters: number;
      type: 'RESTROOM' | 'ELEVATOR' | 'MEDICAL' | 'QUIET_ZONE' | 'ASSISTANCE_DESK';
      accessibilityRating: 'EXCELLENT' | 'GOOD' | 'STANDARD';
    }[] = [
      {
        facilityName: `Sector ${sectorId.replace('SEC_', '')} Wheelchair Restroom A`,
        distanceMeters: 45,
        type: 'RESTROOM',
        accessibilityRating: 'EXCELLENT',
      },
      {
        facilityName: `Concourse Elevator Hub ${sectorId.replace('SEC_', '')}`,
        distanceMeters: 80,
        type: 'ELEVATOR',
        accessibilityRating: 'GOOD',
      },
      {
        facilityName: `First Aid Station Zone ${sectorId.replace('SEC_', '')}`,
        distanceMeters: 120,
        type: 'MEDICAL',
        accessibilityRating: 'EXCELLENT',
      }
    ];

    if (profile === 'NEURODIVERGENT') {
      facilities.push({
        facilityName: `Sensory Retreat Cabin (Sector ${sectorId.replace('SEC_', '')})`,
        distanceMeters: 150,
        type: 'QUIET_ZONE',
        accessibilityRating: 'EXCELLENT',
      });
    }

    if (profile === 'BLIND' || profile === 'VISUALLY_IMPAIRED') {
      facilities.push({
        facilityName: 'Wayfinding Assistance Information Desk',
        distanceMeters: 60,
        type: 'ASSISTANCE_DESK',
        accessibilityRating: 'EXCELLENT',
      });
    }

    return facilities;
  }
}

// ==========================================
// 4. Accessibility Scoring Service
// ==========================================
export class AccessibilityScoringService {
  /**
   * Computes a numerical confidence score for route reliability under existing environments.
   */
  public computeConfidence(
    profile: AccessibilityProfile,
    context: Partial<AccessibilityContextOptions>
  ): number {
    let score = 0.98; // Base perfect score

    const needsStepFree = profile === 'WHEELCHAIR' || profile === 'STROLLER' || profile === 'TEMPORARY_INJURY';
    
    if (needsStepFree) {
      if (context.elevatorStatus === 'OFFLINE') {
        score -= 0.15;
      }
      if (context.rampAvailability === 'LIMITED') {
        score -= 0.08;
      } else if (context.rampAvailability === 'BLOCKED') {
        score -= 0.25;
      }
    }

    if (context.crowdDensityPercent && context.crowdDensityPercent > 85) {
      score -= 0.10; // High crowd density reduces confidence in quick transit
    }

    if (context.blockedRoutes && context.blockedRoutes.length > 0) {
      score -= Math.min(context.blockedRoutes.length * 0.05, 0.15);
    }

    return Math.max(Number(score.toFixed(2)), 0.40);
  }
}

// ==========================================
// 5. Unified Coordinator Service (for backward compatibility)
// ==========================================
export class AccessibilityService {
  public analysis = new AccessibilityAnalysisService();
  public routing = new AccessibleRouteService();
  public facilities = new FacilityRecommendationService();
  public scoring = new AccessibilityScoringService();

  constructor(private venueRepo?: any, private navigationRepo?: any) {}

  public async getAccessibilityOptimizedRoute(originNodeId: string, destinationNodeId: string) {
    const route = this.routing.calculateRoute('WHEELCHAIR', originNodeId, destinationNodeId);
    return {
      id: `accessible-route-${Date.now()}`,
      name: 'AI Optimized Step-Free Route',
      totalDistanceMeters: 380,
      totalWalkingMinutes: 6,
      crowdDensityScore: 0.15,
      accessibilityFriendly: true,
      waypoints: [
        { name: originNodeId, latitude: 25.3522, longitude: 51.5311 },
        { name: 'Accessible Concourse Conduit C', latitude: 25.3530, longitude: 51.5318 },
        { name: destinationNodeId, latitude: 25.3540, longitude: 51.5325 }
      ],
      hazardNotes: route.routeWarnings
    };
  }
}

