/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StadiumSection {
  id: string; // e.g., "SEC_101"
  name: string; // e.g., "Section 101"
  capacity: number;
  currentOccupancy: number;
  accessibilityOptimized: boolean;
  gateIds: string[];
}

export interface StadiumGate {
  id: string; // e.g., "GATE_A"
  name: string; // e.g., "Gate A"
  status: 'OPEN' | 'CLOSED' | 'EMERGENCY_ONLY';
  congestionIndex: number; // 0.0 to 1.0
  averageThroughputPerMinute: number;
  supportsAccessibility: boolean;
}

export interface BathroomTelemetry {
  id: string;
  locationName: string; // e.g., "Concourse A - Sector 104"
  gender: 'MALE' | 'FEMALE' | 'ALL_GENDER';
  queueLength: number;
  estimatedWaitMinutes: number;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'CLOSED';
  cleanlinessScore: number; // 1 to 5
}

export interface MedicalRoom {
  id: string;
  name: string;
  locationDescription: string;
  isStaffed: boolean;
  currentPatientCount: number;
  availableBeds: number;
}

export interface TransitNode {
  id: string;
  type: 'ELEVATOR' | 'ESCALATOR' | 'STAIRWELL' | 'RAMP';
  locationName: string;
  status: 'OPERATIONAL' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
  direction?: 'UP' | 'DOWN' | 'BIDIRECTIONAL';
  accessibleReady: boolean;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  totalCapacity: number;
  sections: StadiumSection[];
  gates: StadiumGate[];
  restrooms: BathroomTelemetry[];
  medicalRooms: MedicalRoom[];
  transitNodes: TransitNode[];
}
