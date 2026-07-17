/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { HelpCircle, AlertCircle, Sparkles, Inbox } from 'lucide-react';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type?: 'incident' | 'system' | 'ai' | 'general';
  severity?: 'info' | 'warning' | 'error';
}

interface ActivityFeedProps {
  id: string;
  title: string;
  items: FeedItem[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export function ActivityFeed({ id, title, items, emptyMessage = 'No activities recorded.', isLoading = false }: ActivityFeedProps) {
  const getSeverityBulletColor = (severity?: string) => {
    switch (severity) {
      case 'error':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <Card id={`activity-feed-${id}`} className="space-y-4 bg-slate-900/30 border border-slate-800/80">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          {title}
        </h3>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2 py-0.5 rounded">
          {items.length} EVENTS
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center items-center">
          <LoadingSpinner message="Scanning network telemetry feeds..." />
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
          <ul className="relative border-l border-slate-800 ml-2.5 pl-4 space-y-4">
            {items.map((item) => (
              <li key={item.id} className="relative">
                {/* Timeline node bullet */}
                <span className={`absolute -left-[21px] top-1.5 flex h-2 w-2 rounded-full ring-4 ring-slate-950 ${getSeverityBulletColor(item.severity)}`} />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-200 font-sans tracking-tight leading-none">
                      {item.title}
                    </p>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState message={emptyMessage} />
      )}
    </Card>
  );
}

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
}

export function EmptyState({ message, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
      <div className="mb-3 text-slate-600">
        {icon || <Inbox className="w-8 h-8" />}
      </div>
      <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
    </div>
  );
}

interface DashboardLoaderProps {
  message?: string;
}

export function DashboardLoader({ message = 'Loading layout telemetry...' }: DashboardLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <LoadingSpinner message={message} />
    </div>
  );
}
