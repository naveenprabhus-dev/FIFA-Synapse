/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NotificationRepository } from '../repositories/NotificationRepository';
import { SynapseNotification } from '../contexts/SynapseContext';
import { ValidationError } from '../utils/errors';

export class NotificationService {
  constructor(private notificationRepo: NotificationRepository) {}

  async getNotifications(): Promise<SynapseNotification[]> {
    return this.notificationRepo.getNotifications();
  }

  async sendSystemAlert(
    title: string,
    message: string,
    severity: 'info' | 'warning' | 'critical'
  ): Promise<SynapseNotification> {
    if (!title || !message) {
      throw new ValidationError('Notification title and message are required', 'INVALID_NOTIF_PARAMS');
    }
    return this.notificationRepo.addNotification({
      title,
      message,
      severity,
    });
  }

  async markNotificationRead(id: string): Promise<SynapseNotification> {
    if (!id) {
      throw new ValidationError('Notification ID is required', 'EMPTY_ID');
    }
    return this.notificationRepo.markAsRead(id);
  }

  async markAllAsRead(): Promise<void> {
    return this.notificationRepo.markAllRead();
  }

  async clearAllNotifications(): Promise<void> {
    return this.notificationRepo.clearNotifications();
  }
}
