/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemSettings {
  language: 'EN' | 'ES' | 'FR' | 'AR';
  theme: 'DARK' | 'HIGH_CONTRAST';
  soundEnabled: boolean;
  pushNotificationsEnabled: boolean;
  sandboxMode: boolean;
}

export interface SettingsRepository {
  getSettings(): Promise<SystemSettings>;
  updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}

export class MockSettingsRepository implements SettingsRepository {
  private settings: SystemSettings = {
    language: 'EN',
    theme: 'DARK',
    soundEnabled: true,
    pushNotificationsEnabled: true,
    sandboxMode: true,
  };

  async getSettings(): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.settings = {
      ...this.settings,
      ...updates,
    };
    return { ...this.settings };
  }
}
