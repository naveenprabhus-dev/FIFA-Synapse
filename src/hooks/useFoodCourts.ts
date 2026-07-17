/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { foodCourtRepository, venueService } from '../services/di';
import { FoodCourt } from '../types/concessions';
import { HookResult, HookStatus } from './types';

export function useFoodCourts(): HookResult<FoodCourt[]> & {
  findShortestQueue: (category?: string) => Promise<FoodCourt>;
  updateStock: (foodCourtId: string, itemId: string, stockLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK') => Promise<void>;
  updateQueue: (foodCourtId: string, currentLength: number) => Promise<void>;
} {
  const [data, setData] = useState<FoodCourt[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchFoodCourts = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const courts = await foodCourtRepository.getFoodCourts();
      setData(courts);
      if (courts.length === 0) {
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
    fetchFoodCourts();
  }, [fetchFoodCourts]);

  const findShortestQueue = useCallback(async (category?: string) => {
    return venueService.locateShortestFoodCourtQueue(category);
  }, []);

  const updateStock = useCallback(async (foodCourtId: string, itemId: string, stockLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'OUT_OF_STOCK') => {
    try {
      const updated = await foodCourtRepository.updateMenuItemStock(foodCourtId, itemId, stockLevel);
      setData((prev) => prev ? prev.map((fc) => fc.id === foodCourtId ? updated : fc) : null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const updateQueue = useCallback(async (foodCourtId: string, currentLength: number) => {
    try {
      const updated = await foodCourtRepository.updateQueueLength(foodCourtId, currentLength);
      setData((prev) => prev ? prev.map((fc) => fc.id === foodCourtId ? updated : fc) : null);
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
    retry: fetchFoodCourts,
    findShortestQueue,
    updateStock,
    updateQueue,
  };
}
