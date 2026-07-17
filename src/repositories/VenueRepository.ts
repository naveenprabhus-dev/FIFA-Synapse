/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Stadium, StadiumSection, StadiumGate, BathroomTelemetry, MedicalRoom, TransitNode } from '../types/stadium';
import { RepositoryError } from '../utils/errors';

export interface VenueRepository {
  getStadiumDetails(): Promise<Stadium>;
  getSections(): Promise<StadiumSection[]>;
  getSectionById(id: string): Promise<StadiumSection>;
  getGates(): Promise<StadiumGate[]>;
  getGateById(id: string): Promise<StadiumGate>;
  getRestrooms(): Promise<BathroomTelemetry[]>;
  getRestroomById(id: string): Promise<BathroomTelemetry>;
  getMedicalRooms(): Promise<MedicalRoom[]>;
  getTransitNodes(): Promise<TransitNode[]>;
  updateTransitNodeStatus(id: string, status: TransitNode['status']): Promise<TransitNode>;
}

export class MockVenueRepository implements VenueRepository {
  private stadium: Stadium = {
    id: 'stadium-al-bayt',
    name: 'Al Bayt Stadium',
    city: 'Al Khor',
    totalCapacity: 68895,
    sections: [
      { id: 'SEC_101', name: 'Section 101', capacity: 450, currentOccupancy: 420, accessibilityOptimized: true, gateIds: ['GATE_A'] },
      { id: 'SEC_104', name: 'Section 104', capacity: 500, currentOccupancy: 480, accessibilityOptimized: true, gateIds: ['GATE_A', 'GATE_B'] },
      { id: 'SEC_112', name: 'Section 112', capacity: 600, currentOccupancy: 380, accessibilityOptimized: false, gateIds: ['GATE_C'] },
    ],
    gates: [
      { id: 'GATE_A', name: 'Gate A Entrance', status: 'OPEN', congestionIndex: 0.2, averageThroughputPerMinute: 85, supportsAccessibility: true },
      { id: 'GATE_B', name: 'Gate B Egress', status: 'OPEN', congestionIndex: 0.65, averageThroughputPerMinute: 110, supportsAccessibility: true },
      { id: 'GATE_C', name: 'Gate C Security Area', status: 'CLOSED', congestionIndex: 0.0, averageThroughputPerMinute: 0, supportsAccessibility: false },
    ],
    restrooms: [
      { id: 'restroom-1', locationName: 'West Concourse Sector 104', gender: 'ALL_GENDER', queueLength: 4, estimatedWaitMinutes: 2, status: 'OPERATIONAL', cleanlinessScore: 4.8 },
      { id: 'restroom-2', locationName: 'North Concourse Sector 101', gender: 'MALE', queueLength: 12, estimatedWaitMinutes: 6, status: 'OPERATIONAL', cleanlinessScore: 3.5 },
    ],
    medicalRooms: [
      { id: 'med-1', name: 'Main Medical Room Sector 104', locationDescription: 'Concourse level, next to Elevator A', isStaffed: true, currentPatientCount: 3, availableBeds: 5 },
    ],
    transitNodes: [
      { id: 'transit-elevator-1', type: 'ELEVATOR', locationName: 'Sector 104 West Lift Lobby', status: 'OPERATIONAL', direction: 'BIDIRECTIONAL', accessibleReady: true },
      { id: 'transit-escalator-1', type: 'ESCALATOR', locationName: 'Sector 104 Escalator Core', status: 'OPERATIONAL', direction: 'UP', accessibleReady: false },
    ],
  };

  async getStadiumDetails(): Promise<Stadium> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return { ...this.stadium };
  }

  async getSections(): Promise<StadiumSection[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.stadium.sections.map((s) => ({ ...s }));
  }

  async getSectionById(id: string): Promise<StadiumSection> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const section = this.stadium.sections.find((s) => s.id === id);
    if (!section) {
      throw new RepositoryError(`Stadium section not found: ${id}`, 'SECTION_NOT_FOUND');
    }
    return { ...section };
  }

  async getGates(): Promise<StadiumGate[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.stadium.gates.map((g) => ({ ...g }));
  }

  async getGateById(id: string): Promise<StadiumGate> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const gate = this.stadium.gates.find((g) => g.id === id);
    if (!gate) {
      throw new RepositoryError(`Stadium gate not found: ${id}`, 'GATE_NOT_FOUND');
    }
    return { ...gate };
  }

  async getRestrooms(): Promise<BathroomTelemetry[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.stadium.restrooms.map((r) => ({ ...r }));
  }

  async getRestroomById(id: string): Promise<BathroomTelemetry> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const restroom = this.stadium.restrooms.find((r) => r.id === id);
    if (!restroom) {
      throw new RepositoryError(`Restroom telemetry not found: ${id}`, 'RESTROOM_NOT_FOUND');
    }
    return { ...restroom };
  }

  async getMedicalRooms(): Promise<MedicalRoom[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.stadium.medicalRooms.map((mr) => ({ ...mr }));
  }

  async getTransitNodes(): Promise<TransitNode[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.stadium.transitNodes.map((tn) => ({ ...tn }));
  }

  async updateTransitNodeStatus(id: string, status: TransitNode['status']): Promise<TransitNode> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const nodeIndex = this.stadium.transitNodes.findIndex((t) => t.id === id);
    if (nodeIndex === -1) {
      throw new RepositoryError(`Transit node not found: ${id}`, 'TRANSIT_NODE_NOT_FOUND');
    }
    const updated = {
      ...this.stadium.transitNodes[nodeIndex],
      status,
    };
    this.stadium.transitNodes[nodeIndex] = updated;
    return { ...updated };
  }
}
