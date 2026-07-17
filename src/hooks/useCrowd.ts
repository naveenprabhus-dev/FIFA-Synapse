/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { crowdService } from '../services/di';
import { CrowdAnalysisData } from '../types/synapse';
import { HookResult, HookStatus } from './types';

export function useCrowd(): HookResult<CrowdAnalysisData[]> & {
  checkCriticalCongestion: (percent?: number) => Promise<CrowdAnalysisData[]>;
  getEvacRecommendation: (sectorId: string) => Promise<string>;
} {
  const [data, setData] = useState<CrowdAnalysisData[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchCrowd = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const crowdData = await crowdService.getAllSectorDensities();
      setData(crowdData);
      if (crowdData.length === 0) {
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
    fetchCrowd();
  }, [fetchCrowd]);

  const checkCriticalCongestion = useCallback(async (percent = 80) => {
    return crowdService.checkCongestionThresholds(percent);
  }, []);

  const getEvacRecommendation = useCallback(async (sectorId: string) => {
    return crowdService.triggerSmartEvacuationRecommendation(sectorId);
  }, []);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchCrowd,
    checkCriticalCongestion,
    getEvacRecommendation,
  };
}
