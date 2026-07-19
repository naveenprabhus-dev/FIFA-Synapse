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
import { useState } from 'react';
import { motion } from 'motion/react';
import { NeuralBackground } from '../components/ui/NeuralBackground';
import { AIPipeline } from '../components/ui/AIPipeline';
import {
  Sparkles,
  Shield,
  User,
  Users,
  Landmark,
  ArrowRight,
  Cpu,
  Zap,
  Clock,
  CheckCircle2,
  Activity,
} from 'lucide-react';

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
      title: 'Stadium Fan Cockpit',
      desc: 'Predictive queue times, multi-modal routing overlays, and premium concessions trackers designed to maximize matchday flow.',
      icon: User,
      badge: 'FAN CONSOLE',
      color: 'from-blue-500/10 via-cyan-500/5 to-transparent',
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-400 bg-blue-500/10',
      highlights: ['Smart Navigation Pathing', 'Concessions Wait-Time Prediction', 'Proactive Facility Routing'],
    },
    {
      role: UserRole.ORGANIZER,
      title: 'Command & Control Room',
      desc: 'Macro stadium level congestion heatmaps, sector occupancy indicators, and direct priority emergency broadcast dispatches.',
      icon: Landmark,
      badge: 'COMMAND CENTER',
      color: 'from-indigo-500/10 via-purple-500/5 to-transparent',
      borderColor: 'border-l-indigo-500',
      iconColor: 'text-indigo-400 bg-indigo-500/10',
      highlights: ['Sector Congestion Heatmap', 'Strategic Security Dispatcher', 'Stadium Live Health Status'],
    },
    {
      role: UserRole.OPERATIONS,
      title: 'Tactical Field Operations',
      desc: 'Proactive crowd avoidance streams, fast tactical incident logging, and automated volunteer shift coordination maps.',
      icon: Shield,
      badge: 'SECURITY DISPATCH',
      color: 'from-amber-500/10 via-orange-500/5 to-transparent',
      borderColor: 'border-l-amber-500',
      iconColor: 'text-amber-400 bg-amber-500/10',
      highlights: ['Real-Time Incident Stream', 'Volunteer Tactical Positioning', 'Crowd Density Notifications'],
    },
    {
      role: UserRole.STAFF,
      title: 'Concession Supply Operations',
      desc: 'Real-time stock level predictions, auto-replenishment notifications, and transaction speed-of-service optimization dashboards.',
      icon: Users,
      badge: 'SUPPLY LOGISTICS',
      color: 'from-emerald-500/10 via-teal-500/5 to-transparent',
      borderColor: 'border-l-emerald-500',
      iconColor: 'text-emerald-400 bg-emerald-500/10',
      highlights: ['Stock Level Predictions', 'Auto-Replenishment Triggers', 'Service Performance Analytics'],
    },
  ];

  const stats = [
    { value: '99.4%', label: 'Prediction Accuracy', desc: 'Neural Queue Engine', icon: Cpu },
    { value: '< 8 ms', label: 'Inference Latency', desc: 'Edge Device Sync', icon: Zap },
    { value: '80K+', label: 'Streams Monitored', desc: 'Asynchronous IoT feeds', icon: Activity },
    { value: '+34%', label: 'Flow Efficiency', desc: 'Traffic optimization', icon: Clock },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="bg-[#070b19] text-slate-100 min-h-screen relative flex flex-col justify-start overflow-x-hidden">
      {/* Canvas Neural Background */}
      <NeuralBackground />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-6xl mx-auto px-4 py-12 md:py-16 space-y-16 relative z-10"
      >
        {/* Hero Header Section */}
        <motion.div variants={itemVariants} className="text-center space-y-6 max-w-3xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <Badge variant="info" className="uppercase tracking-widest font-mono text-[10px] py-0.5">
              FIFA Synapse Enterprise v1.0
            </Badge>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-mono text-slate-400">DECISION HUB ONLINE</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-slate-100 via-slate-300 to-slate-100 bg-clip-text text-transparent uppercase font-sans">
            The AI Decision Intelligence Platform <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
              For Smart Stadium Operations
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            FIFA Synapse transforms live telemetry, fan densities, and operational logs into actionable intelligence. Deploy the full Observe → Understand → Reason loop to optimize security, concessions, and navigation dynamically.
          </p>
        </motion.div>

        {/* Real-time Telemetry Stats Row */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className="bg-slate-900/25 border-slate-800/60 backdrop-blur-md p-4 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-blue-400 group-hover:border-blue-500/30 transition-colors duration-300">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-lg md:text-xl font-bold font-mono text-slate-100 tracking-tight mt-0.5">
                      {stat.value}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono">{stat.desc}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>

        {/* Central Decision Pipeline Loop */}
        <motion.div variants={itemVariants}>
          <AIPipeline />
        </motion.div>

        {/* Premium Cockpit Selector Section */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              STADIUM CONTROL COCKPITS
            </h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Select an operational role to access dedicated command modules, live heatmaps, and telemetry feeds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rolesConfig.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.role}
                  className={`border-l-4 ${item.borderColor} bg-gradient-to-br ${item.color} border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between p-6 relative group overflow-hidden`}
                >
                  {/* Subtle top right badge overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-full text-[9px] font-mono tracking-wider text-slate-400 font-bold uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    {item.badge}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl border border-slate-800/80 flex items-center justify-center ${item.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-100 font-sans uppercase tracking-tight">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-slate-400 font-sans leading-relaxed">
                      {item.desc}
                    </p>

                    {/* Highlights bullet points */}
                    <div className="space-y-2 pt-1 border-t border-slate-900/80">
                      {item.highlights.map((highlight, hIdx) => (
                        <div key={hIdx} className="flex items-center space-x-2 text-[11px] text-slate-400 font-sans">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400/80 flex-shrink-0" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-mono font-bold uppercase tracking-wider py-2.5 bg-slate-950/60 hover:bg-blue-600 hover:text-white hover:border-blue-500 transition-all duration-300 group-hover:translate-y-0 relative overflow-hidden"
                      isLoading={loadingRole === item.role}
                      onClick={() => handleSelectRole(item.role)}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        Access Control Console
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
