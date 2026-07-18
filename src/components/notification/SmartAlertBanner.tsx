/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, ArrowRight, ShieldAlert } from 'lucide-react';
import { ProactiveNotification } from '../../types/proactiveNotification';
import { Button } from '../ui/Button';

interface SmartAlertBannerProps {
  notifications: ProactiveNotification[];
  onDismiss: (id: string) => void;
  onView: (notif: ProactiveNotification) => void;
}

export function SmartAlertBanner({ notifications, onDismiss, onView }: SmartAlertBannerProps) {
  // Find the highest priority active unread notification (CRITICAL or HIGH)
  const alert = notifications.find(n => !n.read && (n.priority === 'CRITICAL' || n.priority === 'HIGH'));

  if (!alert) return null;

  const isCritical = alert.priority === 'CRITICAL';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full z-40 font-sans"
        role="alert"
        aria-live="assertive"
      >
        <div className={`p-4 rounded-xl border ${
          isCritical 
            ? 'bg-rose-500/15 border-rose-500/30 text-rose-100 shadow-lg shadow-rose-950/10' 
            : 'bg-amber-500/10 border-amber-500/20 text-amber-100 shadow-md shadow-amber-950/5'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                isCritical ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {isCritical ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <span className={`text-[10px] font-bold tracking-wider uppercase ${
                  isCritical ? 'text-rose-400' : 'text-amber-400'
                }`}>
                  {alert.priority} ACTIVE DIRECTIVE
                </span>
                <p className="text-xs font-semibold truncate text-slate-100 mt-0.5">
                  {alert.title}
                </p>
                <p className="text-[11px] text-slate-400 truncate hidden md:block">
                  {alert.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onView(alert)}
                className={`text-[11px] font-semibold h-8 px-3 tracking-wide flex items-center gap-1 ${
                  isCritical ? 'hover:bg-rose-500/10 text-rose-300' : 'hover:bg-amber-500/10 text-amber-300'
                }`}
              >
                Inspect Directive
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              
              <button
                onClick={() => onDismiss(alert.id)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors outline-none focus:ring-1 focus:ring-slate-700"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
