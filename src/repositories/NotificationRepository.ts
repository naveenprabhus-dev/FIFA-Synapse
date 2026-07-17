/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseNotification } from '../contexts/SynapseContext';
import { RepositoryError } from '../utils/errors';

export interface NotificationRepository {
  getNotifications(): Promise<SynapseNotification[]>;
  addNotification(notification: Omit<SynapseNotification, 'id' | 'timestamp' | 'read'>): Promise<SynapseNotification>;
  markAsRead(id: string): Promise<SynapseNotification>;
  markAllRead(): Promise<void>;
  clearNotifications(): Promise<void>;
}

export class MockNotificationRepository implements NotificationRepository {
  private notifications: SynapseNotification[] = [
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
      severity: 'warning',
      read: false,
    },
  ];

  async getNotifications(): Promise<SynapseNotification[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return this.notifications.map((n) => ({ ...n }));
  }

  async addNotification(notification: Omit<SynapseNotification, 'id' | 'timestamp' | 'read'>): Promise<SynapseNotification> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const newNotif: SynapseNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    this.notifications.unshift(newNotif);
    return { ...newNotif };
  }

  async markAsRead(id: string): Promise<SynapseNotification> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) {
      throw new RepositoryError(`Notification not found: ${id}`, 'NOTIFICATION_NOT_FOUND');
    }
    notif.read = true;
    return { ...notif };
  }

  async markAllRead(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    this.notifications.forEach((n) => {
      n.read = true;
    });
  }

  async clearNotifications(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    this.notifications = [];
  }
}
