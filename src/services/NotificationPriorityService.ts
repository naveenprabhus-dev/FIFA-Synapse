/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProactiveNotification, ProactiveNotificationPriority } from '../types/proactiveNotification';
import { UserRole } from '../types/user';

export class NotificationPriorityService {
  /**
   * Sorts notifications based on base priority, user role match, and accessibility preferences.
   */
  public sortNotifications(
    notifications: ProactiveNotification[],
    userRole: UserRole,
    hasAccessibilityProfile: boolean = false
  ): ProactiveNotification[] {
    return [...notifications].sort((a, b) => {
      const scoreA = this.calculatePriorityScore(a, userRole, hasAccessibilityProfile);
      const scoreB = this.calculatePriorityScore(b, userRole, hasAccessibilityProfile);
      return scoreB - scoreA; // Descending order
    });
  }

  /**
   * Calculates a numeric rank weight for a notification.
   */
  public calculatePriorityScore(
    notif: ProactiveNotification,
    userRole: UserRole,
    hasAccessibilityProfile: boolean
  ): number {
    let score = 0;

    // 1. Base Priority Weights
    switch (notif.priority) {
      case 'CRITICAL':
        score += 100;
        break;
      case 'HIGH':
        score += 70;
        break;
      case 'MEDIUM':
        score += 40;
        break;
      case 'LOW':
        score += 10;
        break;
    }

    // 2. Role-specific prioritization
    if (userRole === UserRole.OPERATIONS || userRole === UserRole.ORGANIZER) {
      if (
        notif.type === 'SECURITY_ALERT' ||
        notif.type === 'MEDICAL_ALERT' ||
        notif.type === 'VOLUNTEER_NOTIFICATION' ||
        notif.type === 'CROWD_WARNING'
      ) {
        score += 30; // Elevated priority for operations and logistics personnel
      }
    } else if (userRole === UserRole.STAFF) {
      if (
        notif.type === 'FACILITY_UPDATE' ||
        notif.type === 'QUEUE_REDUCTION_SUGGESTION' ||
        notif.type === 'FOOD_COURT_SUGGESTION'
      ) {
        score += 30; // Elevated priority for concessions/inventory teams
      }
    } else if (userRole === UserRole.FAN) {
      if (
        notif.type === 'ALTERNATIVE_ROUTE' ||
        notif.type === 'FOOD_COURT_SUGGESTION' ||
        notif.type === 'CROWD_WARNING' ||
        notif.type === 'WEATHER_WARNING'
      ) {
        score += 25; // Elevated priority for spectator safety and navigation
      }
    }

    // 3. Accessibility override
    if (hasAccessibilityProfile && notif.type === 'ACCESSIBILITY_ALERT') {
      score += 45; // Substantial weight increase for mobility updates if user requires accessibility
    }

    // 4. Confidence Score fine-tuning
    score += notif.confidenceScore * 10;

    return score;
  }
}
