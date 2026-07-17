/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, UserRole } from '../types/user';
import { RepositoryError } from '../utils/errors';

export interface UserRepository {
  getUserProfile(uid: string): Promise<UserProfile>;
  updateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<UserProfile>;
  createUserProfile(profile: UserProfile): Promise<UserProfile>;
}

export class MockUserRepository implements UserRepository {
  private users: Map<string, UserProfile> = new Map([
    [
      'operator-uid',
      {
        uid: 'operator-uid',
        email: 'operator@fifasynapse.com',
        displayName: 'FIFA Synapse Operator',
        role: UserRole.ORGANIZER,
        createdAt: new Date('2026-01-01').toISOString(),
      },
    ],
  ]);

  async getUserProfile(uid: string): Promise<UserProfile> {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    const user = this.users.get(uid);
    if (!user) {
      throw new RepositoryError(`User not found with UID: ${uid}`, 'USER_NOT_FOUND');
    }
    return { ...user };
  }

  async updateUserProfile(uid: string, profile: Partial<UserProfile>): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const existing = this.users.get(uid);
    if (!existing) {
      throw new RepositoryError(`Cannot update. User not found: ${uid}`, 'USER_NOT_FOUND');
    }
    const updated = { ...existing, ...profile, uid }; // Keep UID stable
    this.users.set(uid, updated);
    return { ...updated };
  }

  async createUserProfile(profile: UserProfile): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (this.users.has(profile.uid)) {
      throw new RepositoryError(`User already exists with UID: ${profile.uid}`, 'USER_ALREADY_EXISTS');
    }
    this.users.set(profile.uid, { ...profile });
    return { ...profile };
  }
}
