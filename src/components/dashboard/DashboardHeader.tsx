/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChevronRight, Home, Shield, RefreshCw } from 'lucide-react';

interface DashboardHeaderProps {
  role: string;
  activeTab: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ role, activeTab, onRefresh, isRefreshing = false }: DashboardHeaderProps) {
  const getFormattedTabName = (tabId: string) => {
    return tabId
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div id="synapse-dashboard-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/60 pb-5">
      {/* Breadcrumb path */}
      <div className="space-y-1">
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <div className="flex items-center hover:text-slate-300 transition-colors cursor-pointer">
            <Home className="w-3 h-3 mr-1" />
            <span>Synapse</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className="text-slate-400">{role}</span>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className="text-blue-400 font-semibold">{getFormattedTabName(activeTab)}</span>
        </nav>

        <h2 className="text-xl font-extrabold text-slate-100 font-sans uppercase tracking-tight flex items-center gap-2">
          <span>{getFormattedTabName(activeTab)} View</span>
          <span className="text-xs font-normal text-slate-600 font-mono">/</span>
          <span className="text-[10px] font-mono font-medium text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md bg-slate-950/40">
            {role.toUpperCase()} SPACE
          </span>
        </h2>
      </div>

      {/* Operations telemetry stream state indicator */}
      <div className="flex items-center space-x-3 self-start sm:self-center">
        <div className="flex items-center space-x-2 bg-slate-900/40 border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px]">LIVE TELEMETRY STREAM</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Refresh Telemetry View"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
