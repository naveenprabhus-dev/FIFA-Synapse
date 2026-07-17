/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { navigationService, accessibilityService } from '../services/di';
import { RouteOption, NavigationQuery } from '../types/navigation';
import { HookResult, HookStatus } from './types';

export function useNavigation(): HookResult<NavigationQuery[]> & {
  calculateRoute: (
    originNodeId: string,
    destinationNodeId: string,
    optimizedFor: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS'
  ) => Promise<{ primary: RouteOption; alternatives: RouteOption[] }>;
  calculateAccessibleRoute: (originNodeId: string, destinationNodeId: string) => Promise<RouteOption>;
} {
  const [data, setData] = useState<NavigationQuery[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const history = await navigationService.getNavigationHistory();
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

  const calculateRoute = useCallback(async (
    originNodeId: string,
    destinationNodeId: string,
    optimizedFor: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS'
  ) => {
    try {
      const result = await navigationService.calculateRoutes(originNodeId, destinationNodeId, optimizedFor);
      // Refresh queries history
      await fetchHistory();
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, [fetchHistory]);

  const calculateAccessibleRoute = useCallback(async (originNodeId: string, destinationNodeId: string) => {
    try {
      return await accessibilityService.getAccessibilityOptimizedRoute(originNodeId, destinationNodeId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchHistory,
    calculateRoute,
    calculateAccessibleRoute,
  };
}
