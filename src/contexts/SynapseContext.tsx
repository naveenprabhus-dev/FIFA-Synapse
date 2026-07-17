/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, UserProfile } from '../types/user';

export interface SynapseNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
}

interface SynapseContextType {
  activeRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile | null;
  notifications: SynapseNotification[];
  switchRole: (role: UserRole) => void;
  addNotification: (notification: Omit<SynapseNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const SynapseContext = createContext<SynapseContextType | undefined>(undefined);

const INITIAL_NOTIFICATIONS: SynapseNotification[] = [
  {
    id: 'notif-1',
    timestamp: new Date().toISOString(),
    title: 'Smart Egress Protocol Active',
    message: 'Gate 4 has peak congestion. Synapse recommends smart route updates for Zone B egress.',
    severity: 'warning',
    read: false,
  },
  {
    id: 'notif-2',
    timestamp: new Date().toISOString(),
    title: 'Concession Replenishment Queue',
    message: 'Sector 104 stock predictions show low beverage levels within 15 mins.',
    severity: 'info',
    read: false,
  },
];

export function SynapseProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.FAN);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [notifications, setNotifications] = useState<SynapseNotification[]>(INITIAL_NOTIFICATIONS);

  const userProfile: UserProfile = {
    uid: 'demo_user_123',
    email: 'user@synapse.fifa.org',
    displayName: 'FIFA Synapse Operator',
    role: activeRole,
    createdAt: new Date().toISOString(),
  };

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    setActiveTab('home'); // Reset tab on role switch
  };

  const addNotification = (notif: Omit<SynapseNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SynapseNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <SynapseContext.Provider
      value={{
        activeRole,
        activeTab,
        setActiveTab,
        userProfile,
        notifications,
        switchRole,
        addNotification,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </SynapseContext.Provider>
  );
}

export function useSynapse() {
  const context = useContext(SynapseContext);
  if (context === undefined) {
    throw new Error('useSynapse must be used within a SynapseProvider');
  }
  return context;
}
