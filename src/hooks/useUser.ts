/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/di';
import { UserProfile, UserRole } from '../types/user';
import { HookResult, HookStatus } from './types';

export function useUser(uid = 'operator-uid'): HookResult<UserProfile> & {
  changeRole: (role: UserRole) => Promise<UserProfile>;
} {
  const [data, setData] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const profile = await userService.getUserProfile(uid);
      setData(profile);
      setStatus('SUCCESS');
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setStatus('ERROR');
    }
  }, [uid]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const changeRole = useCallback(async (role: UserRole) => {
    try {
      const updated = await userService.changeUserRole(uid, role);
      setData(updated);
      return updated;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, [uid]);

  return {
    data,
    status,
    error,
    loading: status === 'LOADING',
    retry: fetchUser,
    changeRole,
  };
}
