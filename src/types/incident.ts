/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type IncidentCategory = 'CROWD_CONGESTION' | 'MEDICAL_EMERGENCY' | 'SECURITY_BREACH' | 'INFRASTRUCTURE_FAILURE' | 'STADIUM_DAMAGE' | 'OTHER';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'REPORTED' | 'DISPATCHED' | 'ON_SCENE' | 'RESOLVING' | 'RESOLVED' | 'CLOSED';

export interface IncidentTimelineEvent {
  id: string;
  status: IncidentStatus;
  notes: string;
  timestamp: string; // ISO string
  operatorId: string;
}

export interface OperationalStaff {
  id: string;
  name: string;
  role: 'VOLUNTEER' | 'SECURITY_OFFICER' | 'MEDICAL_TEAM' | 'SUPERVISOR';
  currentLocationName: string; // sector details
  currentStatus: 'AVAILABLE' | 'DISPATCHED' | 'BUSY' | 'OFF_DUTY';
  skills: string[]; // e.g., ["CPR", "CROWD_CONTROL", "TRANSLATION"]
  assignedIncidentIds: string[];
  averageResponseTimeSeconds?: number;
}

export interface Incident {
  id: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  locationName: string; // e.g., "Sector 104 - Concourse B"
  coordinates?: { latitude: number; longitude: number };
  reportedBy: string; // userId or anonymous
  assignedStaffIds: string[];
  description: string;
  timeline: IncidentTimelineEvent[];
  resolvedAt?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
