/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { ProactiveNotification, ProactiveNotificationType } from '../types/proactiveNotification';
import { UserRole } from '../types/user';
import { useSynapse } from './SynapseContext';
import {
  contextBuilder,
  proactiveNotificationAgent,
  decisionService,
  notificationPriorityService,
} from '../services/di';

interface ProactiveNotificationContextType {
  proactiveNotifications: ProactiveNotification[];
  isEvaluating: boolean;
  evaluateLiveContext: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotificationManual: (notif: Omit<ProactiveNotification, 'id' | 'timestamp' | 'read'>) => boolean;
}

const ProactiveNotificationContext = createContext<ProactiveNotificationContextType | undefined>(undefined);

const INITIAL_PROACTIVE_NOTIFICATIONS: ProactiveNotification[] = [
  {
    id: 'notif-proactive-init-1',
    type: ProactiveNotificationType.CROWD_WARNING,
    title: 'Crowd Surge Warning: Sector 108',
    summary: 'Sector 108 has reached 95% seating occupancy with slow corridor flow rates.',
    reason: 'Match is in Minute 82 and early egress waves are beginning to bottleneck the surrounding Gate 4 West concourse.',
    recommendation: 'Instruct stewards to activate the auxiliary Sector 108 bypass corridors and slow incoming traffic.',
    priority: 'HIGH',
    confidenceScore: 0.96,
    affectedZone: 'SEC_108',
    estimatedBenefit: 'Reduces queue dispersal times by up to 8 minutes and avoids localized crush hazards.',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    read: false,
    alternative: 'Divert surrounding pedestrian egress waves to Sector 110 open pathways.',
  },
  {
    id: 'notif-proactive-init-2',
    type: ProactiveNotificationType.FOOD_COURT_SUGGESTION,
    title: 'Halftime Queue Balancing Suggested',
    summary: 'Food Court C queue exceeds 18 people while Burger Bistro in Sector 101 has zero queue.',
    reason: 'Fans in Zone B are flocking to the closest kiosk, unaware of under-utilized dining options nearby.',
    recommendation: 'Push dynamic wait-time alerts to spectators near Sector 104 with 10% mobile order discounts at Burger Bistro.',
    priority: 'MEDIUM',
    confidenceScore: 0.88,
    affectedZone: 'FOOD_C_SEC_104',
    estimatedBenefit: 'Saves spectators an average of 14 minutes in line and rebalances concession workloads.',
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 mins ago
    read: false,
    alternative: 'Display wait times on local corridor monitors to encourage natural dispersal.',
  },
  {
    id: 'notif-proactive-init-3',
    type: ProactiveNotificationType.WEATHER_WARNING,
    title: 'Roof Closure Advised: Rising Wind Gusts',
    summary: 'Wind speed sensors recorded sudden gusts exceeding 32 km/h from the North.',
    reason: 'Incoming atmospheric pressure change threatens to blow sand/wind directly into the spectator bowl during the second half.',
    recommendation: 'Authorize immediate automated closure of Al Bayt Stadium retractable roof system.',
    priority: 'HIGH',
    confidenceScore: 0.94,
    affectedZone: 'ROOF_SYSTEM',
    estimatedBenefit: 'Maintains optimal indoor ambient temperatures and ensures fan/player comfort.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    read: false,
    alternative: 'Set roof to 50% partial closure setting as temporary wind shield.',
  }
];

export function ProactiveNotificationProvider({ children }: { children: ReactNode }) {
  const { activeRole } = useSynapse();
  const [proactiveNotifications, setProactiveNotifications] = useState<ProactiveNotification[]>(
    INITIAL_PROACTIVE_NOTIFICATIONS
  );
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Auto-run evaluation loop periodically to mock continuous active surveillance
  useEffect(() => {
    const timer = setInterval(() => {
      evaluateLiveContext();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(timer);
  }, [activeRole]);

  const evaluateLiveContext = async () => {
    setIsEvaluating(true);
    try {
      // 1. Gather live context
      const fullContext = await contextBuilder.buildContext(
        'demo_user_123',
        activeRole,
        { latitude: 25.3522, longitude: 51.5311, sectorId: 'SEC_104' }
      );

      // Validate context
      decisionService.validateContext(fullContext);

      // 2. Query Gemini / Agent for proactive notifications
      const candidates = await proactiveNotificationAgent.generateProactiveNotifications(fullContext);

      // 3. Evaluate each notification in the Decision Service to avoid duplicates/low-confidence
      const validNotifications: ProactiveNotification[] = [];
      
      setProactiveNotifications((currentList) => {
        let updatedList = [...currentList];
        
        for (const candidate of candidates) {
          const decision = decisionService.shouldPublishNotification(candidate, updatedList);
          if (decision.shouldPublish) {
            validNotifications.push(candidate);
            updatedList = [candidate, ...updatedList];
          }
        }
        
        // 4. Sort / Prioritize the updated list based on current user role and conditions
        return notificationPriorityService.sortNotifications(
          updatedList,
          activeRole,
          activeRole === UserRole.FAN // Assume Fan gets accessibility sorting weight
        );
      });

    } catch (err) {
      console.error('Proactive Notification evaluation failed:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const markAsRead = (id: string) => {
    setProactiveNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setProactiveNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearAll = () => {
    setProactiveNotifications([]);
  };

  const addNotificationManual = (notif: Omit<ProactiveNotification, 'id' | 'timestamp' | 'read'>): boolean => {
    const decision = decisionService.shouldPublishNotification(notif, proactiveNotifications);
    
    if (decision.shouldPublish) {
      const newNotif: ProactiveNotification = {
        ...notif,
        id: `notif-manual-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false,
      };
      
      setProactiveNotifications((prev) => {
        const list = [newNotif, ...prev];
        return notificationPriorityService.sortNotifications(list, activeRole, activeRole === UserRole.FAN);
      });
      return true;
    } else {
      console.warn('Manual notification rejected by Decision Engine:', decision.reason);
      return false;
    }
  };

  return (
    <ProactiveNotificationContext.Provider
      value={{
        proactiveNotifications,
        isEvaluating,
        evaluateLiveContext,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotificationManual,
      }}
    >
      {children}
    </ProactiveNotificationContext.Provider>
  );
}

export function useProactiveNotifications() {
  const context = useContext(ProactiveNotificationContext);
  if (context === undefined) {
    throw new Error('useProactiveNotifications must be used within a ProactiveNotificationProvider');
  }
  return context;
}
