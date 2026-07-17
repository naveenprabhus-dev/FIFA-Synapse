/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseCoreRecommendation } from '../../types/synapse';

export interface LocationState {
  sectorId: string;
  name: string;
  latitude: number;
  longitude: number;
  localDensityScore: number; // 0.0 to 1.0
  queueTimeMin: number;
}

export interface StadiumNode {
  id: string;
  name: string;
  category: 'SECTOR' | 'GATE' | 'AMENITY' | 'PARKING';
  latitude: number;
  longitude: number;
  accessibilityFeatures: string[];
}

export interface NavigationSimulatorState {
  weatherCondition: 'CLEAR' | 'RAIN' | 'WINDY' | 'SURGE_HEAT';
  matchMinute: number;
  matchIntensity: 'LOW' | 'NORMAL' | 'HIGH';
  elevatorsActive: boolean;
  crowdSurgeZone: 'NONE' | 'GATE_A' | 'GATE_B' | 'ZONE_C';
  emergencyLockdown: boolean;
}

export interface NavigationState {
  originId: string;
  destinationId: string;
  optimizedFor: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS';
  isLoading: boolean;
  recommendation: SynapseCoreRecommendation | null;
  error: string | null;
}
