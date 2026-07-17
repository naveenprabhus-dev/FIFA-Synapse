/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useSynapse } from '../contexts/SynapseContext';
import { Card } from '../components/ui/Card';
import { Table, TableColumn } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Bell, ShieldAlert, AlertTriangle, Info, Sparkles } from 'lucide-react';
import { SynapseNotification } from '../contexts/SynapseContext';

export function NotificationsPage() {
  const { notifications, markAllNotificationsRead, clearNotifications } = useSynapse();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.severity === filter;
  });

  const columns: TableColumn<SynapseNotification>[] = [
    {
      key: 'severity',
      header: 'Severity Level',
      render: (row) => {
        const icons = {
          critical: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          info: <Info className="w-4 h-4 text-blue-400" />,
        };
        const badges = {
          critical: <Badge variant="error">Critical</Badge>,
          warning: <Badge variant="warning">Warning</Badge>,
          info: <Badge variant="info">Info</Badge>,
        };
        return (
          <div className="flex items-center space-x-2">
            {icons[row.severity]}
            {badges[row.severity]}
          </div>
        );
      },
    },
    {
      key: 'title',
      header: 'Signal Title',
      render: (row) => (
        <span className={`font-semibold font-sans ${row.read ? 'text-slate-400' : 'text-slate-200'}`}>
          {row.title}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Detailed Parameters / Context',
      render: (row) => (
        <span className={`font-sans leading-relaxed text-xs ${row.read ? 'text-slate-500' : 'text-slate-300'}`}>
          {row.message}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Signal Received At',
      render: (row) => (
        <span className="text-slate-500 font-mono text-[10px]">
          {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto py-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <span>Stadium Telemetry Alerts Node</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Audit logs of cognitive alerts, safety directives, queue thresholds, and match occurrences.
          </p>
        </div>
        <div className="flex gap-2 self-start sm:self-center">
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead} className="text-[10px] font-mono uppercase">
            Mark All Read
          </Button>
          <Button variant="outline" size="sm" onClick={clearNotifications} className="text-[10px] font-mono uppercase">
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Filter Control Panels */}
      <div className="flex items-center space-x-2 border-b border-slate-900 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-blue-600/10 border-blue-500/50 text-blue-300 font-bold'
              : 'border-slate-900 bg-slate-950/40 text-slate-500 hover:text-slate-300'
          }`}
        >
          All Signals ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
            filter === 'critical'
              ? 'bg-rose-600/10 border-rose-500/50 text-rose-300 font-bold'
              : 'border-slate-900 bg-slate-950/40 text-slate-500 hover:text-slate-300'
          }`}
        >
          Critical ({notifications.filter((n) => n.severity === 'critical').length})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
            filter === 'warning'
              ? 'bg-amber-600/10 border-amber-500/50 text-amber-300 font-bold'
              : 'border-slate-900 bg-slate-950/40 text-slate-500 hover:text-slate-300'
          }`}
        >
          Warnings ({notifications.filter((n) => n.severity === 'warning').length})
        </button>
        <button
          onClick={() => setFilter('info')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono tracking-wider uppercase transition-all cursor-pointer ${
            filter === 'info'
              ? 'bg-blue-600/10 border-blue-500/50 text-blue-300 font-bold'
              : 'border-slate-900 bg-slate-950/40 text-slate-500 hover:text-slate-300'
          }`}
        >
          Info ({notifications.filter((n) => n.severity === 'info').length})
        </button>
      </div>

      {/* Main Table view */}
      <Card className="bg-slate-900/10 border-slate-900 p-1">
        <Table
          columns={columns}
          data={filteredNotifications}
          emptyMessage="No telemetry messages match the specified criteria."
        />
      </Card>
    </div>
  );
}
