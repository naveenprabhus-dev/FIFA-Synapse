/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Card } from '../../../components/ui/Card';
import { BarChart3, HelpCircle } from 'lucide-react';

export function TrendGraph() {
  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span>Egress & Ingress Velocity Curve</span>
        </h4>
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
          Sensor monitoring of combined flowrates (people/minute vs elapsed minutes)
        </p>
      </div>

      {/* Polish Interactive SVG Chart */}
      <div className="relative w-full aspect-[2/1] min-h-[160px] bg-slate-950/60 border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
        <svg viewBox="0 0 400 160" className="w-full h-full">
          {/* Gridlines */}
          <line x1="40" y1="20" x2="380" y2="20" className="stroke-slate-900/60 stroke-1" strokeDasharray="4 4" />
          <line x1="40" y1="50" x2="380" y2="50" className="stroke-slate-900/60 stroke-1" strokeDasharray="4 4" />
          <line x1="40" y1="80" x2="380" y2="80" className="stroke-slate-900/60 stroke-1" strokeDasharray="4 4" />
          <line x1="40" y1="110" x2="380" y2="110" className="stroke-slate-900/60 stroke-1" strokeDasharray="4 4" />
          <line x1="40" y1="140" x2="380" y2="140" className="stroke-slate-800" /> {/* X axis line */}
          <line x1="40" y1="20" x2="40" y2="140" className="stroke-slate-800" /> {/* Y axis line */}

          {/* Left Y Axis Labels */}
          <text x="32" y="24" className="fill-slate-500 font-mono text-[8px] text-right" textAnchor="end">500</text>
          <text x="32" y="54" className="fill-slate-500 font-mono text-[8px] text-right" textAnchor="end">350</text>
          <text x="32" y="84" className="fill-slate-500 font-mono text-[8px] text-right" textAnchor="end">200</text>
          <text x="32" y="114" className="fill-slate-500 font-mono text-[8px] text-right" textAnchor="end">50</text>
          <text x="32" y="144" className="fill-slate-500 font-mono text-[8px] text-right" textAnchor="end">0</text>

          {/* Bottom X Axis Labels */}
          <text x="40" y="152" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">-60m</text>
          <text x="125" y="152" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">-30m</text>
          <text x="210" y="152" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">Now</text>
          <text x="295" y="152" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">+30m</text>
          <text x="380" y="152" className="fill-slate-500 font-mono text-[8px] text-center" textAnchor="middle">+60m</text>

          {/* Historic Data Line (Left to Center) */}
          <path
            d="M 40,120 L 70,110 L 100,125 L 125,100 L 155,70 L 180,85 L 210,40"
            className="fill-none stroke-blue-500 stroke-2"
          />
          {/* Projected Trend Line (Center to Right) */}
          <path
            d="M 210,40 L 240,48 L 270,75 L 295,115 L 325,130 L 355,135 L 380,138"
            className="fill-none stroke-blue-500/40 stroke-2 stroke-dasharray-[4 4]"
            strokeDasharray="4 4"
          />

          {/* Critical Threshold Warning line */}
          <line x1="40" y1="45" x2="380" y2="45" className="stroke-red-500/25 stroke-1" strokeDasharray="2 2" />
          <text x="375" y="40" className="fill-red-500/60 font-mono text-[7px]" textAnchor="end">CONGESTION LIMIT</text>

          {/* Live indicator dot */}
          <circle cx="210" cy="40" r="4.5" className="fill-blue-500 stroke-slate-950 stroke-2" />
          <circle cx="210" cy="40" r="7" className="fill-none stroke-blue-500/50 stroke-1 animate-ping" />
        </svg>

        <div className="absolute top-2 right-2 flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-[8px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span> Actual Flow
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40 border border-dashed border-blue-500 inline-block"></span> Forecast Curve
          </span>
        </div>
      </div>
    </Card>
  );
}
