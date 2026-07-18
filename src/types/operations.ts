/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapsePriority } from './synapse';

export type OperationalArea =
  | 'CROWD_MANAGEMENT'
  | 'GATE_MONITORING'
  | 'QUEUE_MONITORING'
  | 'FOOD_COURT_OPERATIONS'
  | 'RESTROOM_CAPACITY'
  | 'PARKING_STATUS'
  | 'VOLUNTEER_DEPLOYMENT'
  | 'SECURITY_DEPLOYMENT'
  | 'CLEANING_OPERATIONS'
  | 'MEDICAL_TEAM_COORDINATION'
  | 'LOST_AND_FOUND'
  | 'MAINTENANCE_ALERTS';

export interface OperationsContextOptions {
  currentZone: string;
  liveCrowdDensity: number; // percentage
  queueLength: number; // number of people
  gateStatus: 'NORMAL' | 'CONGESTED' | 'CLOSED';
  volunteerCount: number;
  securityCount: number;
  medicalTeamAvailable: boolean;
  cleaningStatus: 'CLEAN' | 'NEEDS_CLEANING' | 'CRITICAL';
  parkingAvailability: number; // percentage available
  weather: string;
  matchTimeline: string;
  liveIncidentCount: number;
  activeNotificationsCount: number;
}

export interface OperationsRecommendation {
  operationType: OperationalArea;
  currentSituation: string;
  recommendation: string;
  reasoning: string[];
  priority: SynapsePriority;
  affectedArea: string;
  requiredResources: string[];
  estimatedImpact: string;
  confidenceScore: number; // 0.0 to 1.0
  alternativeActions: string[];
  timestamp: string;
}
