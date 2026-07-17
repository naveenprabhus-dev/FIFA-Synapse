/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IncidentRepository } from '../repositories/IncidentRepository';
import { Incident, OperationalStaff, IncidentStatus } from '../types/incident';
import { ValidationError } from '../utils/errors';

export class OperationsService {
  constructor(private incidentRepo: IncidentRepository) {}

  async reportNewIncident(
    category: Incident['category'],
    severity: Incident['severity'],
    locationName: string,
    description: string,
    reportedBy: string
  ): Promise<Incident> {
    if (!category || !severity || !locationName || !description || !reportedBy) {
      throw new ValidationError('All fields are required to report an incident', 'MISSING_INCIDENT_FIELDS');
    }
    return this.incidentRepo.createIncident({
      category,
      severity,
      status: 'REPORTED',
      locationName,
      reportedBy,
      assignedStaffIds: [],
      description,
    });
  }

  async dispatchStaffToIncident(incidentId: string, staffId: string): Promise<{ incident: Incident; staff: OperationalStaff }> {
    if (!incidentId || !staffId) {
      throw new ValidationError('Incident ID and Staff ID are required', 'EMPTY_PARAMS');
    }

    const incident = await this.incidentRepo.getIncidentById(incidentId);
    const staff = await this.incidentRepo.getStaffById(staffId);

    if (staff.currentStatus === 'OFF_DUTY') {
      throw new ValidationError('Cannot dispatch staff who are OFF_DUTY', 'STAFF_OFF_DUTY');
    }

    // Perform dispatch logic
    const updatedStaffIds = Array.from(new Set([...incident.assignedStaffIds, staffId]));
    const updatedIncident = await this.incidentRepo.updateIncident(incidentId, {
      status: 'DISPATCHED',
      assignedStaffIds: updatedStaffIds,
    });

    const updatedIncidentIds = Array.from(new Set([...staff.assignedIncidentIds, incidentId]));
    const updatedStaff = await this.incidentRepo.updateStaffStatus(staffId, 'DISPATCHED', updatedIncidentIds);

    return { incident: updatedIncident, staff: updatedStaff };
  }

  async resolveIncident(incidentId: string): Promise<Incident> {
    if (!incidentId) {
      throw new ValidationError('Incident ID is required', 'EMPTY_ID');
    }

    const incident = await this.incidentRepo.getIncidentById(incidentId);
    const updatedIncident = await this.incidentRepo.updateIncident(incidentId, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
    });

    // Release all assigned staff
    for (const staffId of incident.assignedStaffIds) {
      try {
        const staff = await this.incidentRepo.getStaffById(staffId);
        const filteredIncidentIds = staff.assignedIncidentIds.filter((id) => id !== incidentId);
        const status = filteredIncidentIds.length === 0 ? 'AVAILABLE' : 'DISPATCHED';
        await this.incidentRepo.updateStaffStatus(staffId, status as 'AVAILABLE' | 'DISPATCHED', filteredIncidentIds);
      } catch {
        // Silent catch for robust performance in mock environments
      }
    }

    return updatedIncident;
  }

  async getIncidentMetrics(): Promise<{ totalActive: number; highSeverityCount: number; unresolved: Incident[] }> {
    const incidents = await this.incidentRepo.getIncidents();
    const activeStates: IncidentStatus[] = ['REPORTED', 'DISPATCHED', 'ON_SCENE', 'RESOLVING'];
    
    const unresolved = incidents.filter((i) => activeStates.includes(i.status));
    const totalActive = unresolved.length;
    const highSeverityCount = unresolved.filter((i) => i.severity === 'HIGH' || i.severity === 'CRITICAL').length;

    return { totalActive, highSeverityCount, unresolved };
  }
}
