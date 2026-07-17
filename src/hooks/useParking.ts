/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { venueService } from '../services/di';
import { ParkingZone } from '../types/parking';
import { HookResult, HookStatus } from './types';

interface ParkingSummary {
  zones: ParkingZone[];
  totalSpaces: number;
  totalOccupied: number;
  overallStatus: 'AVAILABLE' | 'FULL_SOON' | 'FULL';
}

export function useParking(): HookResult<ParkingSummary> {
  const [data, setData] = useState<ParkingSummary | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchParking = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const summary = await venueService.getParkingAvailability();
      setData(summary);
      if (summary.zones.length === 0) {
        setStatus('EMPTY');
      } else {
        setStatus('SUCCESS');
      }
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setStatus('ERROR');
    }
  }, []);

  useEffect(() => {
    fetchParking();
  }, [fetchParking]);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchParking,
  };
}
