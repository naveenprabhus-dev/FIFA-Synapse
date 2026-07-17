/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSettings } from '../contexts/SettingsContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Switch, Select } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Settings, Shield, Sliders, Volume2, HelpCircle } from 'lucide-react';

export function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const language = e.target.value as any;
    updateSettings((prev) => ({ ...prev, language }));
  };

  const handleToggleAccessibility = (key: 'highContrast' | 'largeText' | 'screenReaderOptimized') => {
    updateSettings((prev) => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [key]: !prev.accessibility[key],
      },
    }));
  };

  const handleToggleNotification = (key: 'emergencyAlerts' | 'aiRecommendations' | 'queueWarnings' | 'matchEvents') => {
    updateSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleAIThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    updateSettings((prev) => ({
      ...prev,
      aiPreferences: {
        ...prev.aiPreferences,
        confidenceThreshold: val,
      },
    }));
  };

  const handleAIReasoningChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const reasoningDetail = e.target.value as any;
    updateSettings((prev) => ({
      ...prev,
      aiPreferences: {
        ...prev.aiPreferences,
        reasoningDetail,
      },
    }));
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-4">
      {/* Settings Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-500" />
            <span>Platform Settings & Cognitive Cockpit</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Configure system themes, accessibility overrides, and AI decision parameters.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSettings} className="self-start text-[10px] font-mono">
          Reset to Factory Defaults
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization & Sound Preferences */}
        <Card className="bg-slate-900/30 border-slate-900 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-900">
            <Volume2 className="w-4 h-4 text-blue-400" />
            <span>System Localization & Language</span>
          </h3>

          <Select
            id="lang-select"
            label="Default Cognitive Language"
            value={settings.language}
            onChange={handleLanguageChange}
          >
            <option value="en">English (US/UK) - Stadium Default</option>
            <option value="es">Español (ES) - Tournament Alternative</option>
            <option value="fr">Français (FR) - Olympic Standard</option>
            <option value="ar">العربية (AR) - Regional Focus</option>
          </Select>

          <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
            Changing this updates the text-to-speech feedback and visual headers on your primary cockpit route recommendation dashboard.
          </p>
        </Card>

        {/* AI Inference Tuning */}
        <Card className="bg-slate-900/30 border-slate-900 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-900">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Synapse Cognitive AI Tuning</span>
          </h3>

          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="ai-confidence" className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">
                AI Confidence Threshold Gate
              </label>
              <Badge variant="info" className="font-mono text-[10px]">
                {(settings.aiPreferences.confidenceThreshold * 100).toFixed(0)}%
              </Badge>
            </div>
            <input
              id="ai-confidence"
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={settings.aiPreferences.confidenceThreshold}
              onChange={handleAIThresholdChange}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-[10px] text-slate-500 font-sans">
              Only display recommendations with matching model confidence ratings. Lowering increases recommendations but introduces statistical queue drift.
            </p>
          </div>

          <Select
            id="reasoning-select"
            label="AI Explanation Mode"
            value={settings.aiPreferences.reasoningDetail}
            onChange={handleAIReasoningChange}
          >
            <option value="concise">Concise - Just action items & targets</option>
            <option value="detailed">Detailed - Include mathematical queue math & telemetry logs</option>
          </Select>
        </Card>

        {/* Accessibility Panel */}
        <Card className="bg-slate-900/30 border-slate-900 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-900">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Accessibility Preferences</span>
          </h3>

          <div className="space-y-4 pt-1">
            <Switch
              id="a11y-contrast"
              label="High Contrast Canvas UI"
              description="Boost color limits for high environmental outdoor stadium glare."
              checked={settings.accessibility.highContrast}
              onChange={() => handleToggleAccessibility('highContrast')}
            />

            <Switch
              id="a11y-text"
              label="Enlarged UI Font Elements"
              description="Scales text dimensions by 115% for readability on moving tablets."
              checked={settings.accessibility.largeText}
              onChange={() => handleToggleAccessibility('largeText')}
            />

            <Switch
              id="a11y-screen"
              label="Optimize for Screen Readers"
              description="Instruments semantic aria roles explicitly on map markers."
              checked={settings.accessibility.screenReaderOptimized}
              onChange={() => handleToggleAccessibility('screenReaderOptimized')}
            />
          </div>
        </Card>

        {/* Real-time Notifications Portal */}
        <Card className="bg-slate-900/30 border-slate-900 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-900">
            <Shield className="w-4 h-4 text-rose-400" />
            <span>Interactive Notifications</span>
          </h3>

          <div className="space-y-4 pt-1">
            <Switch
              id="notif-emergency"
              label="Emergency & Safety Broadcasts"
              description="Critical route re-routing alerts (Cannot be fully silenced)."
              checked={settings.notifications.emergencyAlerts}
              onChange={() => handleToggleNotification('emergencyAlerts')}
              disabled
            />

            <Switch
              id="notif-ai"
              label="Synapse AI Recommendations"
              description="Alert when smarter route alternatives match confidence gate."
              checked={settings.notifications.aiRecommendations}
              onChange={() => handleToggleNotification('aiRecommendations')}
            />

            <Switch
              id="notif-queue"
              label="Concession Queue Warnings"
              description="Pre-emptive alert when estimated queue wait exceeds 12 minutes."
              checked={settings.notifications.queueWarnings}
              onChange={() => handleToggleNotification('queueWarnings')}
            />

            <Switch
              id="notif-match"
              label="Live Tournament Match Events"
              description="Goal updates, penalty cards, and stadium-wide cheers synced with live audio."
              checked={settings.notifications.matchEvents}
              onChange={() => handleToggleNotification('matchEvents')}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
