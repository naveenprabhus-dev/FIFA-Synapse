/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  FAN = 'FAN',
  ORGANIZER = 'ORGANIZER',
  OPERATIONS = 'OPERATIONS',
  STAFF = 'STAFF',
}

export interface UserPermissions {
  canAccessHeatmaps: boolean;
  canBroadcastAlerts: boolean;
  canManageTasks: boolean;
  canUpdateInventory: boolean;
  canRequestNavigation: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.FAN]: {
    canAccessHeatmaps: false,
    canBroadcastAlerts: false,
    canManageTasks: false,
    canUpdateInventory: false,
    canRequestNavigation: true,
  },
  [UserRole.ORGANIZER]: {
    canAccessHeatmaps: true,
    canBroadcastAlerts: true,
    canManageTasks: true,
    canUpdateInventory: true,
    canRequestNavigation: true,
  },
  [UserRole.OPERATIONS]: {
    canAccessHeatmaps: true,
    canBroadcastAlerts: false,
    canManageTasks: true,
    canUpdateInventory: false,
    canRequestNavigation: true,
  },
  [UserRole.STAFF]: {
    canAccessHeatmaps: false,
    canBroadcastAlerts: false,
    canManageTasks: false,
    canUpdateInventory: true,
    canRequestNavigation: true,
  },
};
