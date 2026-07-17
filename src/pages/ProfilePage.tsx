/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '../hooks/useAuth';
import { useSynapse } from '../contexts/SynapseContext';
import { UserRole } from '../types/user';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Shield, User, Key, CheckCircle, AlertTriangle } from 'lucide-react';

export function ProfilePage() {
  const { user, switchUserRole } = useAuth();
  const { switchRole } = useSynapse();

  if (!user) return null;

  const roleLabels: Record<UserRole, string> = {
    [UserRole.FAN]: 'Stadium Fan / Spectator',
    [UserRole.ORGANIZER]: 'Stadium General Organizer',
    [UserRole.OPERATIONS]: 'Operations (Security & Volunteers)',
    [UserRole.STAFF]: 'Venue / Concessions Staff Member',
  };

  const permissionsMatrix: Record<UserRole, string[]> = {
    [UserRole.FAN]: [
      'Read static stadium maps',
      'Receive smart routing recommendation queues',
      'Pre-order concessions items',
      'Receive match telemetry events',
    ],
    [UserRole.ORGANIZER]: [
      'Full dashboard access and macros heatmaps',
      'Sector crowd boundary configuration limits',
      'Dynamic security force dispatches',
      'System-wide emergency override triggers',
    ],
    [UserRole.OPERATIONS]: [
      'Localized crowding alerts stream',
      'Fast incident logging feeds',
      'Direct volunteer/security squad dispatches',
      'Local sector routing overrides',
    ],
    [UserRole.STAFF]: [
      'Predictive concessions inventory tracking',
      'Replenishment alarm configurations',
      'Speed-of-service queue tracking',
      'Local food sector boundary overrides',
    ],
  };

  const handleSwitchAndSync = (role: UserRole) => {
    switchUserRole(role);
    switchRole(role);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="border-b border-slate-900 pb-4">
        <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-100 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          <span>Operator Profile Space</span>
        </h2>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          Review active credentials, dynamic RBAC permission keys, and session contexts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <Card className="bg-slate-900/30 border-slate-900 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center text-lg font-bold">
                {user.displayName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">{user.displayName}</h3>
                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase block">
                  Operator Session Keys
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-900/60 pt-3">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Registered Key</span>
                <p className="text-xs text-slate-300 font-mono font-medium truncate">{user.uid}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">System Email Address</span>
                <p className="text-xs text-slate-300 font-mono font-medium truncate">{user.email}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Current Active Cockpit role</span>
                <div className="mt-1">
                  <Badge variant="info" className="text-[9px] font-mono tracking-wider uppercase">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-slate-500 font-mono leading-relaxed mt-4 border-t border-slate-900 pt-3">
            Authenticated session is cached in local memory storage. Clear local session parameters to simulate cold re-authentication.
          </p>
        </Card>

        {/* Permissions Column */}
        <Card className="md:col-span-2 bg-slate-900/30 border-slate-900 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-900">
            <Key className="w-4 h-4 text-amber-500" />
            <span>Active RBAC Authorization Key Matrix</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-900 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-200 block font-sans">
                  {roleLabels[user.role]}
                </span>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                  The active console layout and recommendation agents are compiled dynamically matching this scope.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
                Authorized Capabilities list
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {permissionsMatrix[user.role].map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-slate-950/30 border border-slate-900/40 text-xs text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Role Changer inside profile */}
          <div className="border-t border-slate-900 pt-4 space-y-3">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block">
              Simulation Sandbox: Dynamically Swivel Cockpit RBAC Roles
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { role: UserRole.FAN, label: 'Stadium Fan' },
                { role: UserRole.ORGANIZER, label: 'Organizer' },
                { role: UserRole.OPERATIONS, label: 'Operations/Security' },
                { role: UserRole.STAFF, label: 'Concession Staff' },
              ].map((r) => (
                <Button
                  key={r.role}
                  variant={user.role === r.role ? 'primary' : 'outline'}
                  size="sm"
                  className="text-[10px] font-mono tracking-wider uppercase py-1"
                  onClick={() => handleSwitchAndSync(r.role)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
