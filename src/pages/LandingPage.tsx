/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSynapse } from '../contexts/SynapseContext';
import { UserRole } from '../types/user';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Sparkles, Shield, User, Users, Landmark } from 'lucide-react';
import { useState } from 'react';

export function LandingPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { switchRole } = useSynapse();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleSelectRole = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      await login(role);
      switchRole(role);
      navigate('/dashboard');
    } catch (e) {
      console.error('Landing login process error:', e);
    } finally {
      setLoadingRole(null);
    }
  };

  const rolesConfig = [
    {
      role: UserRole.FAN,
      title: 'Stadium Fan',
      desc: 'Optimized queue predictors, routing algorithms, and personal concessions navigation.',
      icon: User,
      color: 'border-l-blue-500',
    },
    {
      role: UserRole.ORGANIZER,
      title: 'Stadium Organizer',
      desc: 'Macro congestion heatmaps, dynamic sector overlays, and emergency broadcast dispatch.',
      icon: Landmark,
      color: 'border-l-indigo-500',
    },
    {
      role: UserRole.OPERATIONS,
      title: 'Operations (Security)',
      desc: 'Proactive crowd avoidance streams, fast incident logging, and tactical task alerts.',
      icon: Shield,
      color: 'border-l-amber-500',
    },
    {
      role: UserRole.STAFF,
      title: 'Concession Staff',
      desc: 'Predictive stock tracking, dynamic replenishment alerts, and speed-of-service tuning.',
      icon: Users,
      color: 'border-l-emerald-500',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-12 w-full max-w-4xl mx-auto">
      {/* Premium Hero Header */}
      <div className="text-center space-y-4 max-w-2xl">
        <Badge variant="info" className="uppercase tracking-widest font-mono text-xs">
          FIFA Synapse Console v1.0
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 uppercase font-sans">
          The AI Decision Intelligence Platform for Smart Stadiums
        </h2>
        <p className="text-sm text-slate-400 font-sans leading-relaxed">
          FIFA Synapse continuously runs the <span className="text-blue-400 font-medium">Observe → Understand → Reason → Predict → Recommend → Explain</span> loop. Choose a target cockpit role below to inspect the foundation.
        </p>
      </div>

      {/* The Synapse Intelligence Loop visualization */}
      <Card className="w-full bg-slate-900/30 border-slate-800 p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5 font-mono">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Central Decision Intelligence Engine</span>
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
          {[
            { phase: 'Observe', desc: 'IoT sensors' },
            { phase: 'Understand', desc: 'State collation' },
            { phase: 'Reason', desc: 'Safety policy' },
            { phase: 'Predict', desc: 'Queue flow' },
            { phase: 'Recommend', desc: 'Smart route' },
            { phase: 'Explain', desc: 'Natural text' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5">
              <span className="text-[10px] text-slate-500 font-mono block uppercase">0{idx + 1}</span>
              <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">{item.phase}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Dynamic Cockpit Role Selector Grid */}
      <div className="w-full space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-sans text-center">
          Select Tenant Role Session
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rolesConfig.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.role}
                hoverable
                className={`border-l-4 ${item.color} bg-slate-900/40 hover:bg-slate-900/60 transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-950 rounded-lg text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 font-sans uppercase">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    isLoading={loadingRole === item.role}
                    onClick={() => handleSelectRole(item.role)}
                  >
                    Enter Decision Room
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
