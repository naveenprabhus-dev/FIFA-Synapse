/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, BellOff, Sparkles, Filter, Trash2, CheckCircle2, RefreshCw, 
  Search, ShieldAlert, History, Radio, Info, ChevronRight 
} from 'lucide-react';
import { useProactiveNotifications } from '../../contexts/ProactiveNotificationContext';
import { useSynapse } from '../../contexts/SynapseContext';
import { NotificationCard } from './NotificationCard';
import { ProactiveNotification, ProactiveNotificationType } from '../../types/proactiveNotification';
import { Button } from '../ui/Button';

export function ProactiveNotificationCenter() {
  const { activeRole } = useSynapse();
  const { 
    proactiveNotifications, 
    isEvaluating, 
    evaluateLiveContext, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useProactiveNotifications();

  const [activeTab, setActiveTab] = useState<'active' | 'history' | 'timeline'>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Count unread
  const unreadCount = proactiveNotifications.filter(n => !n.read).length;

  // Filter items
  const getFilteredNotifications = () => {
    return proactiveNotifications.filter(notif => {
      // 1. Tab filter
      if (activeTab === 'active' && notif.read) return false;

      // 2. Priority filter
      if (priorityFilter !== 'ALL' && notif.priority !== priorityFilter) return false;

      // 3. Type category filter
      if (typeFilter !== 'ALL') {
        const notifType = notif.type.toLowerCase();
        if (typeFilter === 'CROWD' && !notifType.includes('crowd')) return false;
        if (typeFilter === 'ROUTING' && !notifType.includes('route') && !notifType.includes('gate')) return false;
        if (typeFilter === 'FOOD' && !notifType.includes('food') && !notifType.includes('queue_reduction')) return false;
        if (typeFilter === 'EMERGENCY' && !notifType.includes('emergency') && !notifType.includes('medical') && !notifType.includes('security')) return false;
        if (typeFilter === 'ACCESSIBILITY' && !notifType.includes('accessibility')) return false;
        if (typeFilter === 'WEATHER' && !notifType.includes('weather')) return false;
      }

      // 4. Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = notif.title.toLowerCase().includes(query);
        const matchesSummary = notif.summary.toLowerCase().includes(query);
        const matchesZone = notif.affectedZone.toLowerCase().includes(query);
        return matchesTitle || matchesSummary || matchesZone;
      }

      return true;
    });
  };

  const filtered = getFilteredNotifications();

  return (
    <div className="space-y-6 font-sans">
      {/* Dashboard Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              Proactive AI Decision Center
              <Sparkles className="w-4 h-4 text-blue-400" />
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
            Synapse evaluates live stadium telemetry (crowd density, parking spaces, food queues, and weather shifts) to issue autonomous recommendations before issues arise.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            onClick={evaluateLiveContext}
            disabled={isEvaluating}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide h-9 px-4 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/10 active:scale-95 transition-all"
            aria-label="Run Stadium Intelligence Loop"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
            {isEvaluating ? 'Analyzing Telemetry...' : 'Evaluate Stadium State'}
          </Button>

          {proactiveNotifications.length > 0 && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                className="border-slate-800 hover:bg-slate-800/80 text-slate-300 font-semibold text-xs h-9 px-3 rounded-xl flex items-center gap-1.5"
                aria-label="Mark all alerts read"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Mark All Read
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="hover:bg-rose-500/10 hover:text-rose-400 text-slate-500 font-semibold text-xs h-9 px-3 rounded-xl flex items-center gap-1.5"
                aria-label="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Intelligence Filter
            </h3>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search zones, alerts..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700 transition-colors"
                aria-label="Search notifications"
              />
            </div>

            {/* Filter by Priority */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Priority Tier
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                      priorityFilter === p
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'bg-slate-950/40 border-slate-900/80 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Category */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                Intelligence Stream
              </label>
              <div className="space-y-1">
                {[
                  { value: 'ALL', label: 'All Fields' },
                  { value: 'EMERGENCY', label: 'Safety & Crisis' },
                  { value: 'CROWD', label: 'Crowd Dynamics' },
                  { value: 'ROUTING', label: 'Egress & Wayfinding' },
                  { value: 'FOOD', label: 'Concessions & queues' },
                  { value: 'ACCESSIBILITY', label: 'ADA Compliance' },
                  { value: 'WEATHER', label: 'Stadium Environment' },
                ].map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setTypeFilter(cat.value)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                      typeFilter === cat.value
                        ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-transparent text-slate-400 hover:bg-slate-800/20 hover:text-slate-300'
                    }`}
                  >
                    {cat.label}
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${typeFilter === cat.value ? 'rotate-90' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats Explanatory Panel */}
          <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900/50 flex gap-3 text-xs text-slate-400 leading-relaxed">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-300 block mb-0.5">Continuous Monitoring</span>
              Our sensors update every 60 seconds. High risk events trigger push alerts to supervisors instantly.
            </div>
          </div>
        </div>

        {/* List & Tabs */}
        <div className="lg:col-span-3 space-y-4">
          {/* Navigation Tab Menu */}
          <div className="flex border-b border-slate-800/80">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-5 py-3 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'active'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              aria-label="View Active Directives"
            >
              <ShieldAlert className="w-4 h-4" />
              Active Directives
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-[10px] text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-3 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              aria-label="View Log History"
            >
              <History className="w-4 h-4" />
              All Logs History
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-5 py-3 text-xs font-bold tracking-wide border-b-2 flex items-center gap-2 transition-all ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
              aria-label="View Live Feed Timeline"
            >
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Feed
            </button>
          </div>

          {/* Tab Render Switcher */}
          <div className="space-y-4">
            {activeTab === 'timeline' ? (
              /* Live Feed Timeline View */
              <div className="relative pl-6 space-y-6">
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-800/80" />
                <AnimatePresence initial={false}>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 p-6 rounded-2xl bg-slate-900/10 border border-slate-900 text-slate-500">
                      <BellOff className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-semibold">Zero live feed streams found</p>
                      <p className="text-xs mt-1">Change your filters or click Evaluate Stadium State.</p>
                    </div>
                  ) : (
                    filtered.map((notif, index) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                      >
                        {/* Timeline node */}
                        <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-950 shadow-sm shadow-blue-500/20" />
                        <NotificationCard
                          notification={notif}
                          onMarkRead={markAsRead}
                        />
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Normal Card Lists for Active & History */
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 p-6 rounded-2xl bg-slate-900/10 border border-slate-900 text-slate-500">
                      <BellOff className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                      <p className="text-sm font-semibold">No notifications match selection</p>
                      <p className="text-xs mt-1">Change your priority or intelligence stream filter above.</p>
                    </div>
                  ) : (
                    filtered.map((notif) => (
                      <NotificationCard
                        key={notif.id}
                        notification={notif}
                        onMarkRead={markAsRead}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
