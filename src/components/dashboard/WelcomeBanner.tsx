/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Globe, Sun, Moon, Info, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSynapse } from '../../contexts/SynapseContext';
import { UserRole } from '../../types/user';

export function WelcomeBanner() {
  const { user } = useAuth();
  const { activeRole } = useSynapse();
  
  const [greeting, setGreeting] = useState('Welcome');
  const [activeLang, setActiveLang] = useState('EN');
  const [activeTheme, setActiveTheme] = useState<'DARK' | 'HIGH_CONTRAST'>('DARK');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) {
      setGreeting('Good morning');
    } else if (hours < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.FAN:
        return 'from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20';
      case UserRole.ORGANIZER:
        return 'from-indigo-600/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20';
      case UserRole.OPERATIONS:
        return 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20';
      case UserRole.STAFF:
        return 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20';
      default:
        return 'from-slate-600/20 to-slate-500/5 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div id="synapse-welcome-banner" className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-8 shadow-xl">
      {/* Visual neon lines in background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Dynamic greeting statement */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="flex h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Stadium Cognitive Node Assigned
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-blue-300 to-blue-400">{user?.displayName || 'FIFA Synapse Operator'}</span>
          </h1>

          <p className="text-xs text-slate-400 max-w-xl font-sans leading-relaxed">
            Your session is actively routed. FIFA Synapse's decision engines are analyzing current match times, transit corridors, and concession demand rates.
          </p>
        </div>

        {/* Custom controller widgets (Language Selector, Theme Toggle, Role Badge) */}
        <div className="flex flex-wrap items-center gap-3 md:self-center">
          {/* Active Role Identifier */}
          <div className={`px-3 py-1.5 rounded-lg border bg-gradient-to-b ${getRoleBadgeColor(activeRole)} flex items-center space-x-2 font-mono text-[10px] font-semibold uppercase tracking-wider`}>
            <span>Role: {activeRole}</span>
          </div>

          {/* Interactive Language Selector */}
          <div className="flex items-center bg-slate-950/60 border border-slate-800/80 rounded-lg p-0.5">
            {['EN', 'ES', 'FR', 'AR'].map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  activeLang === lang
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label={`Switch language to ${lang}`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Dynamic Theme Toggle */}
          <button
            onClick={() => setActiveTheme((prev) => (prev === 'DARK' ? 'HIGH_CONTRAST' : 'DARK'))}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-slate-200 flex items-center gap-1.5 text-[9px] font-mono cursor-pointer transition-colors"
            title="Toggle contrast mode"
            aria-label="Toggle contrast theme mode"
          >
            {activeTheme === 'DARK' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">DARK</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">HIGH CONTRAST</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
