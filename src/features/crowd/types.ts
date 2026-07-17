/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SectorTelemetry {
  id: string;
  name: string;
  occupancyPercent: number;
  flowRatePerMin: number;
  walkingSpeedMs: number; // in meters per second
  escalatorStatus: 'OPERATIONAL' | 'DEGRADED' | 'OUT_OF_SERVICE';
  elevatorStatus: 'OPERATIONAL' | 'DEGRADED' | 'OUT_OF_SERVICE';
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
}

export interface GateTelemetry {
  id: string;
  name: string;
  currentQueueLength: number;
  processingRatePerMin: number;
  isEntryAllowed: boolean;
  isExitAllowed: boolean;
  predictedWaitTimeMins: number;
}

export interface CrowdAlert {
  id: string;
  title: string;
  location: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
}

export interface CrowdPredictionItem {
  timeOffsetMins: number;
  predictedOccupancy: number; // percentage
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' | 'CRITICAL';
  eventDescription: string;
}

export interface SimulationParams {
  matchMinute: number;
  matchImportance: 'NORMAL' | 'HIGH' | 'DERBY';
  weather: 'CLEAR' | 'RAINY' | 'EXTREME_HEAT';
  escalatorOutage: boolean;
  hasEmergencyAlert: boolean;
}

export interface CrowdRecommendation {
  id: string;
  summary: string;
  affectedArea: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0.0 - 1.0
  reason: string;
  suggestedAction: string;
  expectedImpact: string;
  timestamp: string;
  steps: string[];
  alternative?: string;
}
