/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { incidentRepository, operationsService } from '../services/di';
import { Incident, OperationalStaff } from '../types/incident';
import { HookResult, HookStatus } from './types';

export function useIncidents(): HookResult<Incident[]> & {
  staff: OperationalStaff[];
  staffStatus: HookStatus;
  metrics: { totalActive: number; highSeverityCount: number; unresolved: Incident[] } | null;
  reportIncident: (category: Incident['category'], severity: Incident['severity'], locationName: string, description: string, reportedBy: string) => Promise<Incident>;
  dispatchStaff: (incidentId: string, staffId: string) => Promise<void>;
  resolveIncident: (incidentId: string) => Promise<void>;
  refreshStaff: () => Promise<void>;
} {
  const [data, setData] = useState<Incident[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const [staff, setStaff] = useState<OperationalStaff[]>([]);
  const [staffStatus, setStaffStatus] = useState<HookStatus>('IDLE');

  const [metrics, setMetrics] = useState<{ totalActive: number; highSeverityCount: number; unresolved: Incident[] } | null>(null);

  const fetchIncidentsAndStaff = useCallback(async () => {
    setStatus('LOADING');
    setStaffStatus('LOADING');
    setError(null);
    try {
      const incidents = await incidentRepository.getIncidents();
      const operationalStaff = await incidentRepository.getOperationalStaff();
      const opMetrics = await operationsService.getIncidentMetrics();

      setData(incidents);
      setStaff(operationalStaff);
      setMetrics(opMetrics);

      setStaffStatus('SUCCESS');
      if (incidents.length === 0) {
        setStatus('EMPTY');
      } else {
        setStatus('SUCCESS');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setStatus('ERROR');
      setStaffStatus('ERROR');
    }
  }, []);

  const refreshStaff = useCallback(async () => {
    try {
      const operationalStaff = await incidentRepository.getOperationalStaff();
      setStaff(operationalStaff);
    } catch {
      // Silent catch
    }
  }, []);

  useEffect(() => {
    fetchIncidentsAndStaff();
  }, [fetchIncidentsAndStaff]);

  const reportIncident = useCallback(async (
    category: Incident['category'],
    severity: Incident['severity'],
    locationName: string,
    description: string,
    reportedBy: string
  ) => {
    try {
      const newIncident = await operationsService.reportNewIncident(category, severity, locationName, description, reportedBy);
      setData((prev) => (prev ? [...prev, newIncident] : [newIncident]));
      // Update metrics
      const opMetrics = await operationsService.getIncidentMetrics();
      setMetrics(opMetrics);
      return newIncident;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const dispatchStaff = useCallback(async (incidentId: string, staffId: string) => {
    try {
      await operationsService.dispatchStaffToIncident(incidentId, staffId);
      // Refresh everything to ensure UI consistency
      await fetchIncidentsAndStaff();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, [fetchIncidentsAndStaff]);

  const resolveIncident = useCallback(async (incidentId: string) => {
    try {
      await operationsService.resolveIncident(incidentId);
      await fetchIncidentsAndStaff();
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, [fetchIncidentsAndStaff]);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchIncidentsAndStaff,
    staff,
    staffStatus,
    metrics,
    reportIncident,
    dispatchStaff,
    resolveIncident,
    refreshStaff,
  };
}
