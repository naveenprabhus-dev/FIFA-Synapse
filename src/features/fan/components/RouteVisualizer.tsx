/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, ChevronRight, HelpCircle, Compass, Shield, MapPin, Accessibility, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { MapWaypoint } from '../../../types/navigation';
import { STADIUM_NODES } from '../constants';

interface RouteVisualizerProps {
  originId: string;
  destinationId: string;
  waypoints?: MapWaypoint[];
  accessibilityFriendly?: boolean;
  crowdDensityScore?: number;
}

export function RouteVisualizer({
  originId,
  destinationId,
  waypoints,
  accessibilityFriendly = true,
  crowdDensityScore = 0.25,
}: RouteVisualizerProps) {
  const originNode = STADIUM_NODES.find((n) => n.id === originId) || STADIUM_NODES[0];
  const destNode = STADIUM_NODES.find((n) => n.id === destinationId) || STADIUM_NODES[1];

  // Compile a step list representing the path waypoints
  const stepsList = waypoints && waypoints.length > 0 
    ? waypoints 
    : [
        { name: `${originNode.name} Concourse Entrance`, latitude: originNode.latitude, longitude: originNode.longitude },
        { name: 'Central Sector Transit Link', latitude: (originNode.latitude + destNode.latitude) / 2, longitude: (originNode.longitude + destNode.longitude) / 2 },
        { name: `${destNode.name} Gate Portal`, latitude: destNode.latitude, longitude: destNode.longitude },
      ];

  const getDensityColor = (score: number) => {
    if (score < 0.3) return 'border-emerald-500 text-emerald-400 bg-emerald-950/20';
    if (score < 0.7) return 'border-amber-500 text-amber-400 bg-amber-950/20';
    return 'border-red-500 text-red-400 bg-red-950/20';
  };

  const getDensityLabel = (score: number) => {
    if (score < 0.3) return 'Low Surges';
    if (score < 0.7) return 'Slow/Moderate';
    return 'Surge Overload';
  };

  return (
    <Card className="bg-slate-900/30 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Spatial Navigation Node Map
            </span>
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase">
              Route Waypoint Visualizer
            </h4>
          </div>
        </div>
      </div>

      {/* Styled node sequence map representation */}
      <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:left-2.5 before:top-2 before:w-[2px] before:bg-slate-800">
        {stepsList.map((step, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === stepsList.length - 1;

          return (
            <div 
              key={idx} 
              className="relative flex items-start space-x-3 text-xs"
              tabIndex={0}
              aria-label={`Route step ${idx + 1}: ${step.name}`}
            >
              {/* Bullet node with custom colors */}
              <div className={`absolute -left-[21px] flex h-[13px] w-[13px] items-center justify-center rounded-full border-2 ${
                isFirst 
                  ? 'border-blue-500 bg-slate-950 text-blue-400' 
                  : isLast 
                  ? 'border-emerald-500 bg-slate-950 text-emerald-400' 
                  : 'border-slate-700 bg-slate-850 text-slate-400'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>

              <div className="flex-1 bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-slate-500">Node 0{idx + 1}</span>
                    {isFirst && <Badge variant="info" className="text-[8px] font-mono px-1">START</Badge>}
                    {isLast && <Badge variant="success" className="text-[8px] font-mono px-1">GOAL</Badge>}
                  </div>
                  <p className="font-semibold text-slate-200 font-sans truncate">{step.name}</p>
                  <p className="text-[10px] font-mono text-slate-400 truncate">
                    GPS: {step.latitude.toFixed(5)}, {step.longitude.toFixed(5)}
                  </p>
                </div>

                {/* Micro metrics on mid waypoints */}
                {!isFirst && !isLast && (
                  <div className={`border rounded-lg px-2 py-1 text-[9px] font-mono flex items-center space-x-1 flex-shrink-0 ${getDensityColor(crowdDensityScore)}`}>
                    <span className="font-bold">{getDensityLabel(crowdDensityScore)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Corridor Indicators & alerts */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex items-center space-x-2">
          <Accessibility className={`w-4 h-4 ${accessibilityFriendly ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div className="text-[10px]">
            <span className="text-slate-500 font-mono block">Accessibility</span>
            <span className="font-sans font-bold text-slate-300">
              {accessibilityFriendly ? 'Fully ADA-Compliant' : 'Standard Stairs Only'}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-400" />
          <div className="text-[10px]">
            <span className="text-slate-500 font-mono block">Sensor Status</span>
            <span className="font-sans font-bold text-slate-300">Live Calibration</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
