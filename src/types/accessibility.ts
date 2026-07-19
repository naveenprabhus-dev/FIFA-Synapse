/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapsePriority } from './synapse';

export type AccessibilityProfile =
  | 'WHEELCHAIR'
  | 'VISUALLY_IMPAIRED'
  | 'BLIND'
  | 'LOW_VISION'
  | 'HEARING_IMPAIRED'
  | 'SENIOR'
  | 'TEMPORARY_INJURY'
  | 'STROLLER'
  | 'NEURODIVERGENT';

export interface AccessibilityContextOptions {
  profileType: AccessibilityProfile;
  locationSector: string;
  destinationSector: string;
  crowdDensityPercent: number;
  blockedRoutes: string[];
  accessibleRoutes: string[];
  elevatorStatus: 'OPERATIONAL' | 'OFFLINE';
  rampAvailability: 'AVAILABLE' | 'BLOCKED' | 'LIMITED';
  hasAccessibleSeating: boolean;
  hasAccessibleRestrooms: boolean;
  hasMedicalStations: boolean;
  liveAlerts: string[];
  weatherConditions: string;
  matchStatus: string;
}

export interface AccessibilityRecommendation {
  profileType: AccessibilityProfile;
  recommendation: string;
  reason: string;
  primaryRoute: string;
  alternativeRoute: string;
  estimatedTime: string;
  nearbyAccessibleFacilities: string[];
  accessibilityWarnings: string[];
  confidenceScore: number;
  priority: SynapsePriority;
  timestamp: string;
}
