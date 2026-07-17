/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserSettings {
  theme: 'dark' | 'light';
  language: 'en' | 'es' | 'fr' | 'ar';
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    screenReaderOptimized: boolean;
  };
  notifications: {
    emergencyAlerts: boolean;
    aiRecommendations: boolean;
    queueWarnings: boolean;
    matchEvents: boolean;
  };
  aiPreferences: {
    confidenceThreshold: number; // between 0.5 and 1.0
    reasoningDetail: 'concise' | 'detailed';
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'en',
  accessibility: {
    highContrast: false,
    largeText: false,
    screenReaderOptimized: false,
  },
  notifications: {
    emergencyAlerts: true,
    aiRecommendations: true,
    queueWarnings: true,
    matchEvents: true,
  },
  aiPreferences: {
    confidenceThreshold: 0.85,
    reasoningDetail: 'detailed',
  },
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (updater: (prev: UserSettings) => UserSettings) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('fifa_synapse_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('fifa_synapse_settings', JSON.stringify(settings));

    // Handle high contrast and large text accessibility bindings directly at the HTML root element
    const root = document.documentElement;
    if (settings.accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.accessibility.largeText) {
      root.classList.add('text-lg');
    } else {
      root.classList.remove('text-lg');
    }
  }, [settings]);

  const updateSettings = (updater: (prev: UserSettings) => UserSettings) => {
    setSettings((prev) => updater(prev));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
