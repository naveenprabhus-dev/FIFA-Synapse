/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { useSynapse } from '../contexts/SynapseContext';
import { UserRole } from '../types/user';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Home, Compass, Map, AlertTriangle, Radio, BarChart3, ClipboardList, Package, 
  Zap, ShoppingBag, Bell, User, Settings, ShieldAlert, Heart, Activity, Flame, Users, Accessibility, Terminal
} from 'lucide-react';

interface RoleLayoutProps {
  children: ReactNode;
}

export function RoleLayout({ children }: RoleLayoutProps) {
  const { activeRole, activeTab, setActiveTab, switchRole, notifications } = useSynapse();

  // Navigation schema depending on active role as defined by user requests
  const getNavigationForRole = (role: UserRole) => {
    switch (role) {
      case UserRole.FAN:
        return [
          { id: 'home', name: 'Home', icon: Home },
          { id: 'proactive-center', name: 'Proactive Center', icon: Radio },
          { id: 'navigation', name: 'Navigation', icon: Compass },
          { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
          { id: 'matches', name: 'Matches', icon: Flame },
          { id: 'food-services', name: 'Food & Services', icon: ShoppingBag },
          { id: 'profile', name: 'Profile', icon: User },
          { id: 'settings', name: 'Settings', icon: Settings },
        ];
      case UserRole.ORGANIZER:
        return [
          { id: 'home', name: 'Home', icon: Home },
          { id: 'command-center', name: 'AI Command Center', icon: Terminal },
          { id: 'proactive-center', name: 'Proactive Center', icon: Radio },
          { id: 'operations-overview', name: 'Operations Overview', icon: Activity },
          { id: 'crowd-management', name: 'Crowd Management', icon: Users },
          { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
          { id: 'incident-center', name: 'Incident Center', icon: ShieldAlert },
          { id: 'analytics', name: 'Analytics', icon: BarChart3 },
          { id: 'settings', name: 'Settings', icon: Settings },
        ];
      case UserRole.OPERATIONS:
        return [
          { id: 'home', name: 'Home', icon: Home },
          { id: 'command-center', name: 'AI Command Center', icon: Terminal },
          { id: 'proactive-center', name: 'Proactive Center', icon: Radio },
          { id: 'active-incidents', name: 'Active Incidents', icon: ShieldAlert },
          { id: 'assigned-tasks', name: 'Assigned Tasks', icon: ClipboardList },
          { id: 'accessibility', name: 'Accessibility', icon: Accessibility },
          { id: 'crowd-monitoring', name: 'Crowd Monitoring', icon: Users },
          { id: 'emergency-center', name: 'Emergency Center', icon: AlertTriangle },
          { id: 'settings', name: 'Settings', icon: Settings },
        ];
      case UserRole.STAFF:
        return [
          { id: 'home', name: 'Home', icon: Home },
          { id: 'proactive-center', name: 'Proactive Center', icon: Radio },
          { id: 'maintenance', name: 'Maintenance', icon: Settings },
          { id: 'facility-status', name: 'Facility Status', icon: Map },
          { id: 'service-requests', name: 'Service Requests', icon: Heart },
          { id: 'inventory', name: 'Inventory', icon: Package },
          { id: 'settings', name: 'Settings', icon: Settings },
        ];
      default:
        return [{ id: 'home', name: 'Home', icon: Home }];
    }
  };

  const navItems = getNavigationForRole(activeRole);
  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  return (
    <div id="role-layout-root" className="flex flex-col lg:flex-row gap-6 w-full">
      {/* Dynamic Role Navigation Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <Card className="flex flex-col space-y-5 p-5 bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">
              Active Module
            </span>
            <h3 className="text-sm font-extrabold text-slate-200 tracking-tight flex items-center gap-1.5 font-sans uppercase">
              <span>FIFA Command Cockpit</span>
            </h3>
          </div>

          {/* Quick role-switching interface for sandbox testing */}
          <div className="border-t border-b border-slate-800/80 py-3.5 space-y-2">
            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block">
              Sandbox Role Switch:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.values(UserRole).map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`px-2 py-1.5 text-[9px] font-semibold font-mono rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                    activeRole === role
                      ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-600/20'
                      : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-950'
                  }`}
                  aria-label={`Switch context to ${role}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Navigational controls */}
          <nav className="space-y-1" aria-label="Role Navigation Menu">
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block mb-2.5">
              Role Navigation
            </span>
            <div className="space-y-1 max-h-[300px] overflow-y-auto lg:max-h-none lg:overflow-visible">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-300 shadow-sm shadow-blue-500/5'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-950/30'
                    }`}
                    aria-label={`Go to ${item.name}`}
                  >
                    <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                    <span className="font-sans text-[11px] font-medium tracking-wide">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* System Notifications Summary */}
          {unreadAlertsCount > 0 && (
            <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                  Live Feed
                </span>
                <Badge variant="warning" className="text-[9px] px-2 py-0.5">
                  {unreadAlertsCount} Alert{unreadAlertsCount > 1 ? 's' : ''}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                Synapse core is listening to stadium sensor payloads.
              </p>
            </div>
          )}
        </Card>
      </aside>

      {/* Main Feature viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
