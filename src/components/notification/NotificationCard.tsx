/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, AlertCircle, Compass, Users, Utensils, Shield, 
  Accessibility, Car, Cloud, Check, ChevronDown, ChevronUp, Clock, HelpCircle
} from 'lucide-react';
import { ProactiveNotification, ProactiveNotificationType } from '../../types/proactiveNotification';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '../ui/Button';

interface NotificationCardProps {
  notification: ProactiveNotification;
  onMarkRead: (id: string) => void;
  onExecute?: (notif: ProactiveNotification) => void;
}

export function NotificationCard({ notification, onMarkRead, onExecute }: NotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecuted, setIsExecuted] = useState(false);

  // Map notification types to lucide icons
  const getIcon = () => {
    switch (notification.type) {
      case ProactiveNotificationType.CROWD_WARNING:
        return <Users className="w-5 h-5 text-amber-400" />;
      case ProactiveNotificationType.GATE_CHANGE:
      case ProactiveNotificationType.ALTERNATIVE_ROUTE:
        return <Compass className="w-5 h-5 text-blue-400" />;
      case ProactiveNotificationType.FOOD_COURT_SUGGESTION:
      case ProactiveNotificationType.QUEUE_REDUCTION_SUGGESTION:
        return <Utensils className="w-5 h-5 text-emerald-400" />;
      case ProactiveNotificationType.EMERGENCY_ALERT:
        return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case ProactiveNotificationType.ACCESSIBILITY_ALERT:
        return <Accessibility className="w-5 h-5 text-indigo-400" />;
      case ProactiveNotificationType.PARKING_UPDATE:
        return <Car className="w-5 h-5 text-sky-400" />;
      case ProactiveNotificationType.WEATHER_WARNING:
        return <Cloud className="w-5 h-5 text-teal-400" />;
      case ProactiveNotificationType.SECURITY_ALERT:
        return <Shield className="w-5 h-5 text-red-400" />;
      case ProactiveNotificationType.MEDICAL_ALERT:
        return <AlertCircle className="w-5 h-5 text-rose-500 animate-pulse" />;
      case ProactiveNotificationType.VOLUNTEER_NOTIFICATION:
        return <Users className="w-5 h-5 text-purple-400" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins === 1) return '1 min ago';
    if (mins < 60) return `${mins} mins ago`;
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleExecuteAction = () => {
    setIsExecuted(true);
    if (onExecute) {
      onExecute(notification);
    }
  };

  const confidencePercentage = Math.round(notification.confidenceScore * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className={`p-5 rounded-2xl border transition-all duration-300 font-sans ${
        notification.read 
          ? 'bg-slate-900/20 border-slate-800/50 text-slate-400' 
          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 text-slate-100 shadow-md shadow-black/10'
      }`}
      role="article"
      aria-labelledby={`notif-title-${notification.id}`}
      aria-describedby={`notif-summary-${notification.id}`}
    >
      <div className="flex items-start gap-4">
        {/* Unread dot indicator & Icon container */}
        <div className="relative flex-shrink-0 mt-0.5">
          {!notification.read && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
          )}
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            {getIcon()}
          </div>
        </div>

        {/* Core content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <PriorityBadge priority={notification.priority} />
            <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded bg-slate-800/30 border border-slate-800/50">
              Zone: {notification.affectedZone}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {formatTime(notification.timestamp)}
            </span>
          </div>

          <h3 
            id={`notif-title-${notification.id}`} 
            className={`text-sm font-semibold tracking-tight leading-tight ${notification.read ? 'text-slate-400' : 'text-white'}`}
          >
            {notification.title}
          </h3>
          <p id={`notif-summary-${notification.id}`} className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            {notification.summary}
          </p>

          {/* Action recommendation */}
          <div className="mt-3.5 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-0.5">Smart Recommendation</span>
              <p className="text-xs text-slate-200 font-medium">{notification.recommendation}</p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.read && (
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkRead(notification.id)}
                  aria-label="Dismiss alert"
                  className="px-2 py-1 h-8 text-[11px] font-semibold border-slate-700 hover:border-slate-600 hover:bg-slate-800 text-slate-300"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Dismiss
                </Button>
              )}
              
              <Button 
                size="sm"
                variant={isExecuted ? "ghost" : "primary"}
                onClick={handleExecuteAction}
                disabled={isExecuted}
                aria-label="Execute recommendation"
                className={`h-8 px-3 text-[11px] font-semibold tracking-wide ${
                  isExecuted 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/10'
                }`}
              >
                {isExecuted ? 'Executed ✓' : 'Execute Directive'}
              </Button>
            </div>
          </div>

          {/* Expandable explainability details */}
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1 outline-none focus:ring-1 focus:ring-slate-700 rounded px-1.5 py-0.5"
              aria-expanded={isExpanded}
              aria-label="Toggle details"
            >
              {isExpanded ? 'Hide AI Explanation' : 'Show AI Explanation'}
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <span className="text-[11px] text-slate-500 font-mono">
              Inference Confidence: {confidencePercentage}%
            </span>
          </div>

          {/* Expanded details container */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3.5 pt-3.5 border-t border-slate-800/80 space-y-3.5 text-xs text-slate-400">
                  {/* Why generated */}
                  <div>
                    <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block mb-1">
                      WHY WAS THIS GENERATED?
                    </span>
                    <p className="leading-relaxed bg-slate-800/20 p-2.5 rounded-lg border border-slate-800/40 text-slate-300">
                      {notification.reason}
                    </p>
                  </div>

                  {/* Estimated Benefit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px] block mb-0.5">
                        EXPECTED OUTCOME / BENEFIT
                      </span>
                      <p className="text-slate-300 font-medium">{notification.estimatedBenefit}</p>
                    </div>

                    {notification.alternative && (
                      <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800/50">
                        <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-0.5">
                          CONTINGENCY ALTERNATIVE
                        </span>
                        <p className="text-slate-300 font-medium">{notification.alternative}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
