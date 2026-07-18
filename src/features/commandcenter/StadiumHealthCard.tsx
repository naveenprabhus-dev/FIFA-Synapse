/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { StadiumHealth, SubsystemHealth } from '../../services/HealthScoreService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Shield, Users, ShoppingBag, Accessibility, Car, Activity } from 'lucide-react';

// Priority Badge Component
interface PriorityBadgeProps {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const variantMap = {
    CRITICAL: 'error' as const,
    HIGH: 'warning' as const,
    MEDIUM: 'info' as const,
    LOW: 'neutral' as const,
  };

  return (
    <Badge variant={variantMap[priority]} className="font-mono text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider">
      {priority}
    </Badge>
  );
}

// Confidence Indicator Component
interface ConfidenceIndicatorProps {
  confidence: number; // Value between 0.0 and 1.0
}

export function ConfidenceIndicator({ confidence }: ConfidenceIndicatorProps) {
  const percent = Math.round(confidence * 100);
  
  // Decide color depending on confidence level
  let strokeColor = 'stroke-emerald-500';
  let textColor = 'text-emerald-400';
  if (percent < 75) {
    strokeColor = 'stroke-amber-500';
    textColor = 'text-amber-400';
  } else if (percent < 50) {
    strokeColor = 'stroke-rose-500';
    textColor = 'text-rose-400';
  }

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" aria-label={`Confidence score: ${percent}%`}>
      <svg className="w-6 h-6 transform -rotate-90 flex-shrink-0" viewBox="0 0 40 40">
        {/* Background track circle */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          className="stroke-slate-800"
          strokeWidth="3.5"
          fill="transparent"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="20"
          cy="20"
          r={radius}
          className={strokeColor}
          strokeWidth="3.5"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span className={textColor}>{percent}% confidence</span>
    </div>
  );
}

// Subsystem Health Meter Ring Component
interface SubsystemMeterProps {
  name: string;
  subsystem: SubsystemHealth;
  icon: React.ReactNode;
}

export function SubsystemMeter({ name, subsystem, icon }: SubsystemMeterProps) {
  const score = subsystem.score;
  
  // Custom color tokens based on standard design system rules
  let borderStyle = 'border-slate-800/80 bg-slate-950/20';
  let badgeColor: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'success';
  let scoreColor = 'text-emerald-400';

  if (subsystem.status === 'CRITICAL') {
    borderStyle = 'border-rose-950/40 bg-rose-950/5';
    badgeColor = 'error';
    scoreColor = 'text-rose-400';
  } else if (subsystem.status === 'CONGESTED' || subsystem.status === 'MODERATE') {
    borderStyle = 'border-amber-950/40 bg-amber-950/5';
    badgeColor = 'warning';
    scoreColor = 'text-amber-400';
  }

  return (
    <div className={`p-4 rounded-xl border ${borderStyle} flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:border-slate-700/50`}>
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-lg ${subsystem.status === 'CRITICAL' ? 'bg-rose-950/20 text-rose-400' : subsystem.status === 'CONGESTED' || subsystem.status === 'MODERATE' ? 'bg-amber-950/20 text-amber-400' : 'bg-slate-900/50 text-slate-400'}`}>
          {icon}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-200 font-sans tracking-wide uppercase">{name}</span>
            <Badge variant={badgeColor} className="text-[9px] px-1.5 py-0">
              {subsystem.status}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">{subsystem.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 self-end md:self-center">
        <span className="text-[10px] text-slate-500 font-mono">HEALTH</span>
        <span className={`text-lg font-black font-mono tracking-tight ${scoreColor}`}>
          {score}%
        </span>
      </div>
    </div>
  );
}

// Main StadiumHealthCard Component
interface StadiumHealthCardProps {
  health: StadiumHealth;
}

export function StadiumHealthCard({ health }: StadiumHealthCardProps) {
  const isHealthy = health.overallScore >= 80;
  const isCritical = health.overallScore < 60 || health.status === 'CRITICAL';

  let borderStyle = 'border-slate-800/80';
  let statusText = 'Stadium Status: Optimal Operations';
  let scoreColor = 'text-emerald-400';
  let glowColor = 'shadow-emerald-500/5';

  if (isCritical) {
    borderStyle = 'border-rose-900/60 bg-gradient-to-br from-rose-950/5 to-slate-900/10';
    statusText = 'Stadium Alert: Emergency Subsystem Interventions Required';
    scoreColor = 'text-rose-400';
    glowColor = 'shadow-rose-500/10';
  } else if (health.overallScore < 80) {
    borderStyle = 'border-amber-900/60 bg-gradient-to-br from-amber-950/5 to-slate-900/10';
    statusText = 'Stadium Status: Elevated Operational Demands';
    scoreColor = 'text-amber-400';
    glowColor = 'shadow-amber-500/10';
  }

  return (
    <Card className={`p-6 ${borderStyle} transition-all duration-300 hover:shadow-lg ${glowColor} relative overflow-hidden`}>
      {/* Decorative Top Accent Line */}
      <div className={`absolute top-0 left-0 w-full h-[2px] ${isCritical ? 'bg-rose-500' : health.overallScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Circular Big Overall Score Widget */}
        <div className="flex flex-col items-center justify-center p-4 border-r border-slate-800/80 last:border-0 lg:col-span-1">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-3 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Stadium Health Index</span>
          </span>

          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background circular ring */}
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-950"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="3"
                fill="transparent"
              />
              {/* Active overall progress circle */}
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                className={`stroke-current ${isCritical ? 'text-rose-500' : health.overallScore < 80 ? 'text-amber-500' : 'text-emerald-500'}`}
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 42}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: (2 * Math.PI * 42) - (health.overallScore / 100) * (2 * Math.PI * 42) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Overall Score text inside ring */}
            <div className="text-center z-10">
              <span className={`text-4xl font-extrabold font-mono tracking-tighter ${scoreColor}`}>
                {health.overallScore}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono font-semibold tracking-wide mt-0.5">/ 100 PTS</span>
            </div>
          </div>

          <div className="text-center mt-4">
            <h4 className="text-xs font-bold text-slate-200 tracking-wide font-sans uppercase mb-1">
              {statusText}
            </h4>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
              Calibrated Live across 42 sensor nodes
            </span>
          </div>
        </div>

        {/* Subsystem Health Grid */}
        <div className="lg:col-span-2 space-y-3">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block mb-1">
            Subsystem Telemetry Matrices
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SubsystemMeter
              name="Security & Emergency"
              subsystem={health.security}
              icon={<Shield className="w-4 h-4" />}
            />
            <SubsystemMeter
              name="Crowd Dynamics"
              subsystem={health.crowd}
              icon={<Users className="w-4 h-4" />}
            />
            <SubsystemMeter
              name="Concessions & Services"
              subsystem={health.concessions}
              icon={<ShoppingBag className="w-4 h-4" />}
            />
            <SubsystemMeter
              name="Accessibility (ADA)"
              subsystem={health.accessibility}
              icon={<Accessibility className="w-4 h-4" />}
            />
          </div>

          <SubsystemMeter
            name="Outer Parking & Transport Grid"
            subsystem={health.transport}
            icon={<Car className="w-4 h-4" />}
          />
        </div>
      </div>
    </Card>
  );
}
