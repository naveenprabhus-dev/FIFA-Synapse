/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SectorTelemetry, GateTelemetry, CrowdAlert, CrowdPredictionItem } from './types';

export const STADIUM_SECTORS: SectorTelemetry[] = [
  {
    id: 'SEC_A',
    name: 'Sector A (West Stand)',
    occupancyPercent: 82,
    flowRatePerMin: 124,
    walkingSpeedMs: 1.1,
    escalatorStatus: 'OPERATIONAL',
    elevatorStatus: 'OPERATIONAL',
    status: 'CRITICAL',
  },
  {
    id: 'SEC_B',
    name: 'Sector B (East Stand)',
    occupancyPercent: 44,
    flowRatePerMin: 45,
    walkingSpeedMs: 1.4,
    escalatorStatus: 'OPERATIONAL',
    elevatorStatus: 'OPERATIONAL',
    status: 'OPTIMAL',
  },
  {
    id: 'SEC_C',
    name: 'Sector C (North Stand)',
    occupancyPercent: 68,
    flowRatePerMin: 88,
    walkingSpeedMs: 1.25,
    escalatorStatus: 'DEGRADED',
    elevatorStatus: 'OPERATIONAL',
    status: 'MODERATE',
  },
  {
    id: 'SEC_D',
    name: 'Sector D (South VIP Stand)',
    occupancyPercent: 55,
    flowRatePerMin: 32,
    walkingSpeedMs: 1.35,
    escalatorStatus: 'OPERATIONAL',
    elevatorStatus: 'OUT_OF_SERVICE',
    status: 'MODERATE',
  }
];

export const STADIUM_GATES: GateTelemetry[] = [
  {
    id: 'GATE_1',
    name: 'Gate 1 (West Ingress)',
    currentQueueLength: 180,
    processingRatePerMin: 40,
    isEntryAllowed: true,
    isExitAllowed: true,
    predictedWaitTimeMins: 4.5,
  },
  {
    id: 'GATE_2',
    name: 'Gate 2 (West Ingress)',
    currentQueueLength: 210,
    processingRatePerMin: 38,
    isEntryAllowed: true,
    isExitAllowed: true,
    predictedWaitTimeMins: 5.5,
  },
  {
    id: 'GATE_4',
    name: 'Gate 4 (Halftime Plaza)',
    currentQueueLength: 420,
    processingRatePerMin: 45,
    isEntryAllowed: true,
    isExitAllowed: true,
    predictedWaitTimeMins: 9.3,
  },
  {
    id: 'GATE_6',
    name: 'Gate 6 (East Egress)',
    currentQueueLength: 50,
    processingRatePerMin: 50,
    isEntryAllowed: false,
    isExitAllowed: true,
    predictedWaitTimeMins: 1.0,
  }
];

export const INITIAL_ALERTS: CrowdAlert[] = [
  {
    id: 'alert-1',
    title: 'High-density Halftime Compression',
    location: 'Sector A Concourse Corridor',
    severity: 'HIGH',
    description: 'Saturating flow reported on the main stairways leading to concessions. Densities approach 4.2 people/m².',
    timestamp: '14:22:15',
  },
  {
    id: 'alert-2',
    title: 'Elevator Mechanics Outage',
    location: 'Sector D VIP Elevator Cab 2',
    severity: 'MEDIUM',
    description: 'Power surge triggered automatic safety brake engagement. Elevator is offline; technician has been dispatched.',
    timestamp: '14:15:30',
  }
];

export const MOCK_TIMELINE_PREDICTIONS: CrowdPredictionItem[] = [
  {
    timeOffsetMins: 5,
    predictedOccupancy: 85,
    status: 'CRITICAL',
    eventDescription: 'Halftime Peak Compression. High food court queue growth.'
  },
  {
    timeOffsetMins: 15,
    predictedOccupancy: 78,
    status: 'CONGESTED',
    eventDescription: 'Second half kick-off prep. Redistribution back to seats.'
  },
  {
    timeOffsetMins: 30,
    predictedOccupancy: 50,
    status: 'OPTIMAL',
    eventDescription: 'In-seat game phase. Minimal lobby congestion.'
  },
  {
    timeOffsetMins: 45,
    predictedOccupancy: 92,
    status: 'CRITICAL',
    eventDescription: 'Full-time whistle approaching. Peak egress flow toward main gates.'
  }
];
