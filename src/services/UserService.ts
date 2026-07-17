/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRepository } from '../repositories/UserRepository';
import { UserProfile, UserRole, ROLE_PERMISSIONS } from '../types/user';
import { ValidationError } from '../utils/errors';

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUserProfile(uid: string): Promise<UserProfile> {
    if (!uid) {
      throw new ValidationError('UID cannot be empty', 'EMPTY_UID');
    }
    return this.userRepo.getUserProfile(uid);
  }

  async changeUserRole(uid: string, role: UserRole): Promise<UserProfile> {
    if (!uid) {
      throw new ValidationError('UID cannot be empty', 'EMPTY_UID');
    }
    if (!Object.values(UserRole).includes(role)) {
      throw new ValidationError(`Invalid role supplied: ${role}`, 'INVALID_ROLE');
    }
    return this.userRepo.updateUserProfile(uid, { role });
  }

  async checkUserPermissions(uid: string, permissionKey: keyof typeof ROLE_PERMISSIONS[UserRole]): Promise<boolean> {
    const profile = await this.getUserProfile(uid);
    const permissions = ROLE_PERMISSIONS[profile.role];
    return permissions ? !!permissions[permissionKey] : false;
  }
}
