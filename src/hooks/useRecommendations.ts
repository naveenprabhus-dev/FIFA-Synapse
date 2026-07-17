/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '../services/di';
import { SynapseRecommendation, SynapseContext } from '../types/synapse';
import { HookResult, HookStatus } from './types';

export function useRecommendations(): HookResult<SynapseRecommendation<string>[]> & {
  getDecision: (
    decisionType: 'CONCESSION_ROUTING' | 'STADIUM_EGRESS' | 'STAFF_REPLENISHMENT' | 'INCIDENT_DISPATCH',
    context: SynapseContext
  ) => Promise<SynapseRecommendation<string>>;
} {
  const [data, setData] = useState<SynapseRecommendation<string>[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const history = await recommendationService.getHistoricalDecisions();
      setData(history);
      if (history.length === 0) {
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
    fetchHistory();
  }, [fetchHistory]);

  const getDecision = useCallback(async (
    decisionType: 'CONCESSION_ROUTING' | 'STADIUM_EGRESS' | 'STAFF_REPLENISHMENT' | 'INCIDENT_DISPATCH',
    context: SynapseContext
  ) => {
    setStatus('LOADING');
    try {
      const result = await recommendationService.getExplainableDecision(decisionType, context);
      setStatus('SUCCESS');
      // Refresh historical logs in background
      fetchHistory();
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setStatus('ERROR');
      throw errorObj;
    }
  }, [fetchHistory]);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchHistory,
    getDecision,
  };
}
