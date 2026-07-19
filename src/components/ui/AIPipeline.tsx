/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Eye, Brain, ShieldAlert, BarChart3, Navigation, MessageSquareCode } from 'lucide-react';
import { useState } from 'react';

const pipelineStages = [
  {
    phase: 'Observe',
    desc: 'Real-time ingestion of IoT, cameras, and gate sensors.',
    icon: Eye,
    color: 'from-cyan-500/20 to-cyan-500/5',
    borderColor: 'group-hover:border-cyan-500/50',
    iconColor: 'text-cyan-400',
    tag: 'IOT SENSORS',
  },
  {
    phase: 'Understand',
    desc: 'Collation of asynchronous stadium states and telemetry.',
    icon: Brain,
    color: 'from-indigo-500/20 to-indigo-500/5',
    borderColor: 'group-hover:border-indigo-500/50',
    iconColor: 'text-indigo-400',
    tag: 'STATE COLLATOR',
  },
  {
    phase: 'Reason',
    desc: 'Evaluating strict physical security policies and thresholds.',
    icon: ShieldAlert,
    color: 'from-amber-500/20 to-amber-500/5',
    borderColor: 'group-hover:border-amber-500/50',
    iconColor: 'text-amber-400',
    tag: 'SAFETY POLICY',
  },
  {
    phase: 'Predict',
    desc: 'Forecasting queue wait-times, crowding, and traffic density.',
    icon: BarChart3,
    color: 'from-purple-500/20 to-purple-500/5',
    borderColor: 'group-hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    tag: 'QUEUE MODELS',
  },
  {
    phase: 'Recommend',
    desc: 'Synthesizing smartest multi-modal routing & replenishment plans.',
    icon: Navigation,
    color: 'from-blue-500/20 to-blue-500/5',
    borderColor: 'group-hover:border-blue-500/50',
    iconColor: 'text-blue-400',
    tag: 'DECISION ENGINE',
  },
  {
    phase: 'Explain',
    desc: 'Formulating human-readable markdown justifications & briefings.',
    icon: MessageSquareCode,
    color: 'from-emerald-500/20 to-emerald-500/5',
    borderColor: 'group-hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    tag: 'SYNAPSE EXPLAIN',
  },
];

export function AIPipeline() {
  const [activeStage, setActiveStage] = useState<number | null>(null);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            FIFA Synapse Intelligence Loop
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Hover over any processing block to inspect state flow and execution telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono bg-slate-950/60 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
          <span className="text-blue-400">STATUS:</span>
          <span>CYCLE COMPLETE</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Grid wrapper for responsive layout */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 relative">
        {pipelineStages.map((stage, idx) => {
          const Icon = stage.icon;
          const isHovered = activeStage === idx;

          return (
            <div
              key={stage.phase}
              className="relative group"
              onMouseEnter={() => setActiveStage(idx)}
              onMouseLeave={() => setActiveStage(null)}
            >
              {/* Connector line on desktop */}
              {idx < pipelineStages.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-2.5 w-5 h-[2px] bg-slate-800 z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400"
                    initial={{ width: '0%' }}
                    animate={{ width: isHovered ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}

              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative flex flex-col justify-between h-full bg-slate-900/30 backdrop-blur-md border ${
                  isHovered ? 'border-blue-500/40 shadow-lg shadow-blue-500/5' : 'border-slate-800/80'
                } rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden`}
              >
                {/* Background glow overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${stage.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                />

                <div className="space-y-3 z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">
                      ST-0{idx + 1}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 font-medium tracking-tight bg-slate-950/40 px-1.5 py-0.5 rounded border border-slate-800/60">
                      {stage.tag}
                    </span>
                  </div>

                  <div className={`p-2.5 bg-slate-950/60 rounded-lg w-10 h-10 flex items-center justify-center border border-slate-800/80 group-hover:border-blue-500/20 transition-colors duration-300 ${stage.iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight">
                      {stage.phase}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans line-clamp-3">
                      {stage.desc}
                    </p>
                  </div>
                </div>

                {/* Simulated pulse tracking */}
                <div className="mt-4 w-full bg-slate-950/80 rounded-full h-[3px] overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r from-blue-500 to-${stage.iconColor.split('-')[1]}-500`}
                    initial={{ x: '-100%' }}
                    animate={{ x: isHovered ? '0%' : '100%' }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'linear',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
