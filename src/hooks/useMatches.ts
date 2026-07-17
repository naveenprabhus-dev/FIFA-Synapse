/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { matchService } from '../services/di';
import { Match } from '../types/match';
import { HookResult, HookStatus } from './types';

export function useMatches(): HookResult<Match[]> {
  const [data, setData] = useState<Match[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchMatches = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const matches = await matchService.getActiveMatches();
      setData(matches);
      if (matches.length === 0) {
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
    fetchMatches();
  }, [fetchMatches]);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchMatches,
  };
}
