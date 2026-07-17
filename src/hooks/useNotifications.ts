/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/di';
import { SynapseNotification } from '../contexts/SynapseContext';
import { HookResult, HookStatus } from './types';

export function useNotifications(): HookResult<SynapseNotification[]> & {
  sendAlert: (title: string, message: string, severity: 'info' | 'warning' | 'critical') => Promise<SynapseNotification>;
  markAsRead: (id: string) => Promise<SynapseNotification>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => Promise<void>;
} {
  const [data, setData] = useState<SynapseNotification[] | null>(null);
  const [status, setStatus] = useState<HookStatus>('IDLE');
  const [error, setError] = useState<Error | null>(null);

  const fetchNotifications = useCallback(async () => {
    setStatus('LOADING');
    setError(null);
    try {
      const notifs = await notificationService.getNotifications();
      setData(notifs);
      if (notifs.length === 0) {
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
    fetchNotifications();
  }, [fetchNotifications]);

  const sendAlert = useCallback(async (title: string, message: string, severity: 'info' | 'warning' | 'critical') => {
    try {
      const newNotif = await notificationService.sendSystemAlert(title, message, severity);
      setData((prev) => (prev ? [newNotif, ...prev] : [newNotif]));
      setStatus('SUCCESS');
      return newNotif;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const updated = await notificationService.markNotificationRead(id);
      setData((prev) => (prev ? prev.map((n) => (n.id === id ? updated : n)) : null));
      return updated;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setData((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : null));
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAllNotifications();
      setData([]);
      setStatus('EMPTY');
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
    retry: fetchNotifications,
    sendAlert,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
}
