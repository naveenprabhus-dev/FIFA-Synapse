/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ProactiveNotificationType {
  CROWD_WARNING = 'CROWD_WARNING',
  GATE_CHANGE = 'GATE_CHANGE',
  ALTERNATIVE_ROUTE = 'ALTERNATIVE_ROUTE',
  FOOD_COURT_SUGGESTION = 'FOOD_COURT_SUGGESTION',
  EMERGENCY_ALERT = 'EMERGENCY_ALERT',
  ACCESSIBILITY_ALERT = 'ACCESSIBILITY_ALERT',
  PARKING_UPDATE = 'PARKING_UPDATE',
  WEATHER_WARNING = 'WEATHER_WARNING',
  QUEUE_REDUCTION_SUGGESTION = 'QUEUE_REDUCTION_SUGGESTION',
  VOLUNTEER_NOTIFICATION = 'VOLUNTEER_NOTIFICATION',
  SECURITY_ALERT = 'SECURITY_ALERT',
  MEDICAL_ALERT = 'MEDICAL_ALERT',
  FACILITY_UPDATE = 'FACILITY_UPDATE',
}

export type ProactiveNotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ProactiveNotification {
  id: string;
  type: ProactiveNotificationType;
  title: string;
  summary: string;
  reason: string;
  recommendation: string;
  priority: ProactiveNotificationPriority;
  confidenceScore: number;
  affectedZone: string;
  estimatedBenefit: string;
  timestamp: string;
  read: boolean;
  alternative?: string;
}
