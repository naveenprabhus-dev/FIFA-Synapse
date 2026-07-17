/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MapPin, Compass, Users, Clock, Flame, ShieldCheck } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { LocationState } from '../types';

interface LocationCardProps {
  location: LocationState;
  matchMinute: number;
}

export function LocationCard({ location, matchMinute }: LocationCardProps) {
  const getDensityBadgeVariant = (score: number) => {
    if (score < 0.3) return 'success';
    if (score < 0.7) return 'warning';
    return 'error';
  };

  const getDensityText = (score: number) => {
    if (score < 0.3) return 'Low Density (Optimal Flow)';
    if (score < 0.7) return 'Moderate Density (Slow/Regular)';
    return 'High Surge Alert (Bottleneck Danger)';
  };

  return (
    <Card className="bg-slate-900/30 border border-slate-800/80 p-5 space-y-4">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Telemetry Status
            </span>
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase">
              Current Location Card
            </h4>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/40 px-2.5 py-1 rounded-md border border-slate-900">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span>SENSORS ONLINE</span>
        </div>
      </div>

      {/* Spatial Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
            Location Anchor
          </span>
          <p className="text-sm font-semibold text-slate-100 font-sans truncate">
            {location.name}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
            GPS Coordinates
          </span>
          <div className="flex items-center space-x-1 text-xs font-mono text-slate-400">
            <Compass className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate">
              {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
            </span>
          </div>
        </div>
      </div>

      {/* Sensor Metrics Stack */}
      <div className="space-y-3 pt-2">
        {/* Local Crowd Density */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span>Local Crowd Density</span>
            </span>
            <Badge variant={getDensityBadgeVariant(location.localDensityScore)} className="text-[9px] font-mono">
              {(location.localDensityScore * 4.5).toFixed(1)} people/m²
            </Badge>
          </div>
          {/* Progress bar representing density */}
          <div className="w-full h-1.5 bg-slate-950/80 rounded-full overflow-hidden border border-slate-900">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                location.localDensityScore < 0.3 
                  ? 'bg-emerald-500' 
                  : location.localDensityScore < 0.7 
                  ? 'bg-amber-500' 
                  : 'bg-red-500'
              }`}
              style={{ width: `${location.localDensityScore * 100}%` }}
              aria-label="Local Crowd Density Level"
            />
          </div>
          <span className="text-[10px] text-slate-400 font-sans block italic">
            {getDensityText(location.localDensityScore)}
          </span>
        </div>

        {/* Stadium Egress Timing Alert */}
        <div className="bg-slate-950/40 border border-slate-900 rounded-lg p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-slate-400 font-sans">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Match Minute:</span>
            <span className="font-mono font-semibold text-slate-200">{matchMinute}'</span>
          </div>
          {matchMinute >= 80 ? (
            <Badge variant="warning" className="text-[9px] font-mono animate-pulse">
              EGRESS FLOW SURGE RISK (CRITICAL)
            </Badge>
          ) : (
            <Badge variant="success" className="text-[9px] font-mono">
              REGULAR FLOW
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
