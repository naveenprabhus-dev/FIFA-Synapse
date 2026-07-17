/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Incident, OperationalStaff, IncidentStatus, IncidentSeverity, IncidentCategory } from '../types/incident';
import { RepositoryError } from '../utils/errors';

export interface IncidentRepository {
  getIncidents(): Promise<Incident[]>;
  getIncidentById(id: string): Promise<Incident>;
  createIncident(incident: Omit<Incident, 'id' | 'timeline' | 'createdAt' | 'updatedAt'>): Promise<Incident>;
  updateIncident(id: string, updates: Partial<Incident>): Promise<Incident>;
  getOperationalStaff(): Promise<OperationalStaff[]>;
  getStaffById(id: string): Promise<OperationalStaff>;
  updateStaffStatus(id: string, status: 'AVAILABLE' | 'DISPATCHED' | 'BUSY' | 'OFF_DUTY', assignedIncidentIds?: string[]): Promise<OperationalStaff>;
}

export class MockIncidentRepository implements MockIncidentRepository {
  private incidents: Incident[] = [
    {
      id: 'inc-1',
      category: 'INFRASTRUCTURE_FAILURE',
      severity: 'HIGH',
      status: 'DISPATCHED',
      locationName: 'Sector 104 - Concourse B Staircase',
      coordinates: { latitude: 25.3522, longitude: 51.5311 },
      reportedBy: 'user-staff-1',
      assignedStaffIds: ['staff-ops-1'],
      description: 'Power surge has disabled the down escalators at Sector 104. Backup lights active.',
      timeline: [
        {
          id: 'timeline-e-1',
          status: 'REPORTED',
          notes: 'Power surge reported by cleaning supervisor.',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          operatorId: 'system',
        },
        {
          id: 'timeline-e-2',
          status: 'DISPATCHED',
          notes: 'Maintenance unit 3 dispatched to assess escalator control board.',
          timestamp: new Date(Date.now() - 1500000).toISOString(),
          operatorId: 'operator-uid',
        },
      ],
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1500000).toISOString(),
    },
    {
      id: 'inc-2',
      category: 'MEDICAL_EMERGENCY',
      severity: 'CRITICAL',
      status: 'ON_SCENE',
      locationName: 'Sector 112 - Row 14 Seat 10',
      coordinates: { latitude: 25.3530, longitude: 51.5320 },
      reportedBy: 'anonymous-fan',
      assignedStaffIds: ['staff-ops-2'],
      description: 'Fan reporting severe chest pains during penalty kick.',
      timeline: [
        {
          id: 'timeline-e-3',
          status: 'REPORTED',
          notes: 'Emergency medical alarm raised in stadium app.',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          operatorId: 'anonymous-fan',
        },
        {
          id: 'timeline-e-4',
          status: 'ON_SCENE',
          notes: 'Medic Unit 2 reached location and administering oxygen.',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          operatorId: 'operator-uid',
        },
      ],
      createdAt: new Date(Date.now() - 600000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
    },
  ];

  private staff: OperationalStaff[] = [
    {
      id: 'staff-ops-1',
      name: 'Michael Chen',
      role: 'SUPERVISOR',
      currentLocationName: 'Sector 104 Concourse',
      currentStatus: 'DISPATCHED',
      skills: ['CPR', 'ELECTRICAL_ASSESSMENT', 'CROWD_CONTROL'],
      assignedIncidentIds: ['inc-1'],
    },
    {
      id: 'staff-ops-2',
      name: 'Sarah Jenkins',
      role: 'MEDICAL_TEAM',
      currentLocationName: 'Sector 112 First Aid',
      currentStatus: 'BUSY',
      skills: ['CPR', 'FIRST_AID', 'TRAUMA_RESPONSE'],
      assignedIncidentIds: ['inc-2'],
      averageResponseTimeSeconds: 180,
    },
    {
      id: 'staff-ops-3',
      name: 'Ramon De Souza',
      role: 'SECURITY_OFFICER',
      currentLocationName: 'Gate 4 Entrance',
      currentStatus: 'AVAILABLE',
      skills: ['CROWD_CONTROL', 'DE_ESCALATION', 'BILINGUAL'],
      assignedIncidentIds: [],
    },
  ];

  async getIncidents(): Promise<Incident[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.incidents.map((i) => ({ ...i }));
  }

  async getIncidentById(id: string): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) {
      throw new RepositoryError(`Incident not found: ${id}`, 'INCIDENT_NOT_FOUND');
    }
    return { ...incident };
  }

  async createIncident(incident: Omit<Incident, 'id' | 'timeline' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const now = new Date().toISOString();
    const newIncident: Incident = {
      ...incident,
      id: `inc-${Date.now()}`,
      timeline: [
        {
          id: `timeline-e-${Date.now()}`,
          status: 'REPORTED',
          notes: 'Incident reported in sandbox dashboard.',
          timestamp: now,
          operatorId: incident.reportedBy,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.incidents.push(newIncident);
    return { ...newIncident };
  }

  async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = this.incidents.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new RepositoryError(`Incident not found to update: ${id}`, 'INCIDENT_NOT_FOUND');
    }
    const current = this.incidents[index];
    const updated: Incident = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Auto append timeline event if status changed
    if (updates.status && updates.status !== current.status) {
      updated.timeline = [
        ...updated.timeline,
        {
          id: `timeline-e-${Date.now()}`,
          status: updates.status,
          notes: `Incident status escalated/updated to ${updates.status}`,
          timestamp: updated.updatedAt,
          operatorId: 'operator-uid',
        },
      ];
    }

    this.incidents[index] = updated;
    return { ...updated };
  }

  async getOperationalStaff(): Promise<OperationalStaff[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.staff.map((s) => ({ ...s }));
  }

  async getStaffById(id: string): Promise<OperationalStaff> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const s = this.staff.find((member) => member.id === id);
    if (!s) {
      throw new RepositoryError(`Staff member not found with ID: ${id}`, 'STAFF_NOT_FOUND');
    }
    return { ...s };
  }

  async updateStaffStatus(
    id: string,
    status: 'AVAILABLE' | 'DISPATCHED' | 'BUSY' | 'OFF_DUTY',
    assignedIncidentIds?: string[]
  ): Promise<OperationalStaff> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const index = this.staff.findIndex((member) => member.id === id);
    if (index === -1) {
      throw new RepositoryError(`Staff member not found with ID: ${id}`, 'STAFF_NOT_FOUND');
    }
    const updated = {
      ...this.staff[index],
      currentStatus: status,
      assignedIncidentIds: assignedIncidentIds ?? this.staff[index].assignedIncidentIds,
    };
    this.staff[index] = updated;
    return { ...updated };
  }
}
