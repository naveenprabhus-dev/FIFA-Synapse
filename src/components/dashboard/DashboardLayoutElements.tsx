/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode, useState } from 'react';
import { Card } from '../ui/Card';
import { UserRole } from '../../types/user';
import { 
  Plus, Radio, AlertOctagon, HeartHandshake, Compass, Navigation, 
  Layers, CheckCircle, Package, Send
} from 'lucide-react';

interface SectionContainerProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function SectionContainer({ title, description, children }: SectionContainerProps) {
  return (
    <div className="space-y-4 py-4 border-t border-slate-900/60 first:border-0 first:pt-0">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="w-full">{children}</div>
    </div>
  );
}

interface WidgetGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
}

export function WidgetGrid({ children, cols = 3 }: WidgetGridProps) {
  const getColClass = () => {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className={`grid ${getColClass()} gap-6 w-full`}>
      {children}
    </div>
  );
}

interface QuickActionsProps {
  role: UserRole;
}

export function QuickActions({ role }: QuickActionsProps) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const getActionsForRole = () => {
    switch (role) {
      case UserRole.FAN:
        return [
          { label: 'Find Nearest Restroom', icon: Compass, actionName: 'restroom-routing' },
          { label: 'Order Pizza Gate 8', icon: Compass, actionName: 'concession-order' },
          { label: 'Locate Wheelchair Ramp', icon: Compass, actionName: 'accessibility-ramp' }
        ];
      case UserRole.ORGANIZER:
        return [
          { label: 'Trigger Gate Egress Override', icon: AlertOctagon, actionName: 'egress-override' },
          { label: 'Broadcast Stadium Notice', icon: Radio, actionName: 'general-broadcast' },
          { label: 'Request Security Dispatch', icon: Radio, actionName: 'security-dispatch' }
        ];
      case UserRole.OPERATIONS:
        return [
          { label: 'Log New Concourse Spill', icon: AlertOctagon, actionName: 'incident-log' },
          { label: 'Dispatch Medical Cart', icon: HeartHandshake, actionName: 'medical-cart' },
          { label: 'Signal Escort Team', icon: HeartHandshake, actionName: 'volunteer-escort' }
        ];
      case UserRole.STAFF:
        return [
          { label: 'Confirm Burger Bistro Stock', icon: Package, actionName: 'stock-replenished' },
          { label: 'Report Elevator Issue', icon: Package, actionName: 'elevator-report' },
          { label: 'Request Support Escalation', icon: Package, actionName: 'venue-escalate' }
        ];
      default:
        return [];
    }
  };

  const actions = getActionsForRole();

  const handleActionClick = (label: string) => {
    setLastAction(label);
    setTimeout(() => setLastAction(null), 3000);
  };

  return (
    <Card className="bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Contextual Quick Actions
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          {role} COMMANDS
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              onClick={() => handleActionClick(act.label)}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-medium text-slate-200 bg-slate-950/40 border border-slate-900 hover:border-slate-800/60 hover:bg-slate-900/40 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/15 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[11px] text-slate-200 leading-none">{act.label}</p>
                <p className="text-[9px] text-slate-500 font-sans tracking-wide mt-1">Ready for sandbox dispatch</p>
              </div>
            </button>
          );
        })}
      </div>

      {lastAction && (
        <div className="p-2.5 rounded-lg border border-emerald-500/10 bg-emerald-500/5 text-emerald-400 text-[10px] flex items-center space-x-2 animate-fade-in font-mono">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
          <span className="truncate">Sandbox simulated: "{lastAction}" dispatch successful!</span>
        </div>
      )}
    </Card>
  );
}
