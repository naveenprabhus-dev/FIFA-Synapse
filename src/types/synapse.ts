/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SynapseRecommendation<T = unknown> {
  action: T;
  alternative: T;
  reasoning: string[];
  expectedOutcome: string;
  confidence: number; // value between 0.0 and 1.0
}

export type DecisionType = 'CONCESSION_ROUTING' | 'STADIUM_EGRESS' | 'STAFF_REPLENISHMENT' | 'INCIDENT_DISPATCH';

export interface SynapseContext {
  userId: string;
  userRole: string;
  location?: {
    latitude: number;
    longitude: number;
    sectorId?: string;
  };
  timestamp: string;
}

export interface CrowdAnalysisData {
  sectorId: string;
  occupancyPercent: number;
  flowRatePerMin: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
}

export interface ConcessionData {
  id: string;
  displayName: string;
  distanceMeters: number;
  currentQueueLength: number;
  serviceRateSeconds: number;
  inventoryAlert: boolean;
}
