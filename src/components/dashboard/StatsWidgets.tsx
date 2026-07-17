/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';

interface StatisticsCardProps {
  id: string;
  title: string;
  value: string | number;
  subtext?: string;
  trend?: {
    value: string | number;
    direction: 'up' | 'down' | 'neutral';
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
  progressValue?: number; // optional, e.g. capacity percentages
}

export function StatisticsCard({
  id,
  title,
  value,
  subtext,
  trend,
  status = 'info',
  icon,
  progressValue,
}: StatisticsCardProps) {
  const getStatusBorder = () => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/10 focus-within:ring-emerald-500/20';
      case 'warning':
        return 'border-amber-500/10 focus-within:ring-amber-500/20';
      case 'error':
        return 'border-rose-500/10 focus-within:ring-rose-500/20';
      default:
        return 'border-blue-500/10 focus-within:ring-blue-500/20';
    }
  };

  return (
    <Card
      id={`stats-card-${id}`}
      hoverable
      className={`relative flex flex-col justify-between p-5 bg-slate-900/30 border ${getStatusBorder()} transition-all`}
    >
      <div className="space-y-4">
        {/* Card Title & Icon */}
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block truncate max-w-[80%]">
            {title}
          </span>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>

        {/* Primary Large Value */}
        <div className="space-y-1">
          <p className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight">
            {value}
          </p>
          {subtext && (
            <p className="text-[10px] text-slate-400 font-sans tracking-wide">
              {subtext}
            </p>
          )}
        </div>

        {/* Optional Capacity Progress Indicator */}
        {progressValue !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-500">
              <span>CAPACITY LOAD</span>
              <span>{progressValue}%</span>
            </div>
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  progressValue > 85
                    ? 'bg-rose-500'
                    : progressValue > 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${progressValue}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Trend indicators and status indicators */}
      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between">
          <span className="text-[9px] text-slate-500 font-mono">TREND MATRIX:</span>
          <div className="flex items-center space-x-1.5">
            {trend.direction === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            ) : trend.direction === 'down' ? (
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span
              className={`text-[10px] font-semibold font-mono ${
                trend.direction === 'up'
                  ? 'text-emerald-400'
                  : trend.direction === 'down'
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}
            >
              {trend.value}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

interface StatusCardProps {
  id: string;
  title: string;
  statusText: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  description?: string;
  extraDetail?: string;
}

export function StatusCard({ id, title, statusText, variant, description, extraDetail }: StatusCardProps) {
  return (
    <Card
      id={`status-card-${id}`}
      hoverable
      className="p-4 bg-slate-900/30 border border-slate-800/60 flex items-start space-x-4"
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
            {title}
          </span>
          <Badge variant={variant}>{statusText}</Badge>
        </div>

        {description && (
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {description}
          </p>
        )}

        {extraDetail && (
          <p className="text-[10px] font-mono text-slate-500 leading-none">
            {extraDetail}
          </p>
        )}
      </div>
    </Card>
  );
}
