/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// Progress Bar
// ============================================================================
export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

export function ProgressBar({ value, max = 100, variant = 'primary', size = 'sm' }: ProgressBarProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    primary: 'bg-blue-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
  };

  return (
    <div className="w-full space-y-1">
      <div className={`w-full bg-slate-900 rounded-full overflow-hidden ${heights[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors[variant]}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Skeleton Loading Blocks
// ============================================================================
export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const shapes = {
    text: 'h-4 w-3/4 rounded',
    rect: 'h-20 rounded-lg',
    circle: 'h-10 w-10 rounded-full',
  };

  return (
    <div
      className={`animate-pulse bg-slate-900/60 border border-slate-900 ${shapes[variant]} ${className}`}
    />
  );
}

// ============================================================================
// Timeline Steps
// ============================================================================
export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description: string;
  status?: 'completed' | 'current' | 'pending';
}

export interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="space-y-6">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const color =
          item.status === 'completed'
            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
            : item.status === 'current'
            ? 'bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse'
            : 'bg-slate-950 border-slate-800 text-slate-500';

        return (
          <div key={item.id} className="relative flex space-x-4">
            {/* Connector Line */}
            {!isLast && (
              <span
                className="absolute top-5 left-2.5 -ml-px h-full w-0.5 bg-slate-800"
                aria-hidden="true"
              />
            )}

            {/* Stage indicator circle */}
            <div className={`relative flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold font-mono ${color}`}>
              {idx + 1}
            </div>

            {/* Text details */}
            <div className="flex-1 space-y-1.5 pb-2">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-semibold text-slate-200 font-sans uppercase tracking-wider">{item.title}</h5>
                <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// Divider Section
// ============================================================================
export function Divider({ label, className = '' }: { label?: string; className?: string }) {
  if (label) {
    return (
      <div className={`relative flex py-4 items-center ${className}`}>
        <div className="flex-grow border-t border-slate-900" />
        <span className="flex-shrink mx-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-grow border-t border-slate-900" />
      </div>
    );
  }
  return <div className={`border-t border-slate-900 my-4 ${className}`} />;
}
