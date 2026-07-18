/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapsePriority } from './synapse';

export type EmergencyType =
  | 'MEDICAL_EMERGENCY'
  | 'FIRE'
  | 'CROWD_STAMPEDE'
  | 'SECURITY_THREAT'
  | 'LOST_CHILD'
  | 'MISSING_PERSON'
  | 'BLOCKED_EXIT'
  | 'WEATHER_EMERGENCY'
  | 'STRUCTURAL_HAZARD'
  | 'POWER_FAILURE';

export interface EmergencyContextOptions {
  emergencyType?: EmergencyType;
  locationSector?: string;
  nearestMedicalRoom?: string;
  nearestExit?: string;
  crowdDensityPercent?: number;
  blockedRoutes?: string[];
  accessibilityNeeds?: 'WHEELCHAIR' | 'BLIND' | 'DEAF' | 'NONE';
  elevatorStatus?: 'OPERATIONAL' | 'OFFLINE' | 'PARTIAL';
  weatherCondition?: string;
  matchState?: string;
}

export interface EmergencyResponse {
  emergencyType: EmergencyType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
  reason: string;
  safeRoute: string;
  nearestAssistance: string;
  estimatedTime: string; // e.g., "4 minutes"
  confidence: number; // 0.0 to 1.0
  priority: SynapsePriority;
  alternativeRoutes: string[];
  timestamp: string;
}
