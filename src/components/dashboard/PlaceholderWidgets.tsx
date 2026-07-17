/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Users, Flame, Clock, Navigation, MapPin, Compass, ShieldCheck, 
  Sparkles, CloudRain, ShieldAlert, Heart, RefreshCw, Layers, Map,
  CheckCircle, HelpCircle, ArrowUpRight, ArrowDownRight, Volume2, Footprints
} from 'lucide-react';

/**
 * 1. Crowd Density Widget
 */
export function CrowdDensityWidget() {
  const [selectedSector, setSelectedSector] = useState<'SEC_A' | 'SEC_B' | 'SEC_C'>('SEC_A');

  const sectorData = {
    SEC_A: { name: 'North Concourse A', density: 82, count: '14,240', state: 'CRITICAL_LOAD', color: 'text-rose-400' },
    SEC_B: { name: 'South Gate B Egress', density: 44, count: '8,120', state: 'STABLE', color: 'text-emerald-400' },
    SEC_C: { name: 'Main Concourse C', density: 68, count: '11,480', state: 'FILLING_FAST', color: 'text-amber-400' }
  };

  const active = sectorData[selectedSector];

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Crowd Density Indicator</span>
          </div>
          <Badge variant={active.state === 'STABLE' ? 'success' : active.state === 'FILLING_FAST' ? 'warning' : 'error'}>
            {active.state}
          </Badge>
        </div>

        {/* Sector quick tabs */}
        <div className="grid grid-cols-3 gap-1.5">
          {(['SEC_A', 'SEC_B', 'SEC_C'] as const).map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`py-1 text-[9px] font-mono rounded cursor-pointer transition-colors ${
                selectedSector === sec
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-950/40 border border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {sec.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-200 font-sans leading-none">{active.name}</h4>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight">{active.density}%</span>
            <span className="text-[10px] text-slate-400 font-mono">({active.count} heads counted)</span>
          </div>

          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                active.density > 80 ? 'bg-rose-500' : active.density > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              }`} 
              style={{ width: `${active.density}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-[9px] text-slate-500 font-sans leading-relaxed mt-4 pt-3 border-t border-slate-900/60">
        Calculated using real-time thermal concourse camera feeds and turnstile logs.
      </p>
    </Card>
  );
}

/**
 * 2. Match Status Widget
 */
export function MatchStatusWidget() {
  const [showEventTimeline, setShowEventTimeline] = useState(false);

  const mockTimeline = [
    { minute: 48, event: 'GOAL! France [1] - 0 Morocco (Mbappe)' },
    { minute: 32, event: 'Yellow Card: Hakimi (Morocco) foul' },
    { minute: 15, event: 'Kickoff Whistle - Match Commenced' }
  ];

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Live Match Scoreboard</span>
        </div>
        <Badge variant="error" className="animate-pulse">LIVE - 52'</Badge>
      </div>

      <div className="flex items-center justify-between py-2 px-3 bg-slate-950/40 rounded-xl border border-slate-900/60">
        {/* Home Team */}
        <div className="flex flex-col items-center space-y-1 w-1/3">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center font-mono text-xs">FRA</div>
          <span className="text-xs font-semibold text-slate-200 text-center truncate w-full">France</span>
        </div>

        {/* Score indicator */}
        <div className="text-center w-1/3">
          <p className="text-xl font-extrabold text-slate-100 font-sans tracking-tight">1 - 0</p>
          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">SECOND HALF</p>
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-center space-y-1 w-1/3">
          <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center font-mono text-xs">MAR</div>
          <span className="text-xs font-semibold text-slate-200 text-center truncate w-full">Morocco</span>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowEventTimeline(!showEventTimeline)}
          className="w-full text-center py-1.5 bg-slate-900/60 border border-slate-850 hover:bg-slate-850 text-[10px] font-mono text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
        >
          {showEventTimeline ? 'Hide Live Match Timeline' : 'View Live Match Timeline'}
        </button>

        {showEventTimeline && (
          <div className="bg-slate-950/40 rounded-lg p-2.5 border border-slate-900/80 space-y-2 text-[10px]">
            {mockTimeline.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <span className="font-mono text-blue-400 font-bold">{item.minute}'</span>
                <span className="text-slate-300 font-sans">{item.event}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * 3. Queue Analytics Widget
 */
export function QueueAnalyticsWidget() {
  const [activeZone, setActiveZone] = useState<'bistro' | 'merch' | 'gate'>('bistro');

  const zoneData = {
    bistro: { title: 'Pizza & Burger Bistro', current: '14 min', predicted: '26 min', trend: 'RISING', load: 88, status: 'warning' },
    merch: { title: 'West Fan Merchandise Hub', current: '3 min', predicted: '5 min', trend: 'STABLE', load: 15, status: 'success' },
    gate: { title: 'Main Security Gate 3', current: '8 min', predicted: '4 min', trend: 'FALLING', load: 45, status: 'success' }
  };

  const data = zoneData[activeZone];

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Queue & Service Analytics</span>
        </div>
        <Badge variant={data.status === 'warning' ? 'warning' : 'success'}>
          {data.trend}
        </Badge>
      </div>

      <div className="flex gap-1.5">
        {(['bistro', 'merch', 'gate'] as const).map((z) => (
          <button
            key={z}
            onClick={() => setActiveZone(z)}
            className={`flex-1 py-1 text-[9px] font-mono rounded cursor-pointer transition-colors capitalize ${
              activeZone === z
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-950/40 border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {z}
          </button>
        ))}
      </div>

      <div className="space-y-3 bg-slate-950/40 rounded-xl p-3 border border-slate-900/60">
        <h4 className="text-xs font-bold text-slate-200 font-sans">{data.title}</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">CURRENT WAIT</span>
            <span className="text-base font-extrabold text-slate-100 font-sans tracking-tight">{data.current}</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">PREDICTED (30m)</span>
            <span className="text-base font-extrabold text-blue-400 font-sans tracking-tight">{data.predicted}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[8px] text-slate-500 font-mono">
            <span>CONGESTION LOAD</span>
            <span>{data.load}%</span>
          </div>
          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
            <div className={`h-full ${data.load > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${data.load}%` }} />
          </div>
        </div>
      </div>
    </Card>
  );
}

/**
 * 4. Parking Status Widget
 */
export function ParkingStatusWidget() {
  const [selectedZone, setSelectedZone] = useState<'LOT_A' | 'LOT_B'>('LOT_A');

  const lots = {
    LOT_A: { name: 'North VIP Lot A', occupied: 450, capacity: 500, state: 'NEARLY FULL', color: 'text-amber-400' },
    LOT_B: { name: 'South Public Lot B', occupied: 120, capacity: 800, state: 'WIDE OPEN', color: 'text-emerald-400' }
  };

  const active = lots[selectedZone];
  const percent = Math.round((active.occupied / active.capacity) * 100);

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Parking Space Tracker</span>
        </div>
        <Badge variant={percent > 85 ? 'error' : percent > 50 ? 'warning' : 'success'}>
          {active.state}
        </Badge>
      </div>

      <div className="flex gap-2">
        {(['LOT_A', 'LOT_B'] as const).map((lot) => (
          <button
            key={lot}
            onClick={() => setSelectedZone(lot)}
            className={`flex-1 py-1 text-[9px] font-mono rounded cursor-pointer transition-colors ${
              selectedZone === lot
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-950/40 border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {lot === 'LOT_A' ? 'Lot A (North)' : 'Lot B (South)'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold text-slate-100 font-sans tracking-tight">
            {active.occupied} <span className="text-xs font-normal text-slate-400">/ {active.capacity} spaces</span>
          </span>
          <span className="text-xs font-semibold font-mono text-blue-400">{percent}% filled</span>
        </div>

        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
          <div className={`h-full ${percent > 85 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Card>
  );
}

/**
 * 5. Weather Telemetry Widget
 */
export function WeatherWidget() {
  const [unitCelsius, setUnitCelsius] = useState(true);

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CloudRain className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Stadium Weather Telemetry</span>
        </div>
        <button 
          onClick={() => setUnitCelsius(!unitCelsius)} 
          className="text-[9px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          {unitCelsius ? 'Switch to °F' : 'Switch to °C'}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-2xl font-extrabold text-slate-100 font-sans tracking-tight">
            {unitCelsius ? '29°C' : '84°F'}
          </p>
          <p className="text-xs text-slate-300 font-sans">Moderate Humidity - Pitch Open</p>
          <p className="text-[10px] text-slate-500 font-mono">Precipitation: 12% probability</p>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-900 text-center space-y-1">
          <span className="text-[8px] text-slate-500 font-mono block">ROOF MODE</span>
          <span className="text-[10px] font-bold text-emerald-400 font-sans border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded">
            LEAVE OPEN
          </span>
        </div>
      </div>
    </Card>
  );
}

/**
 * 6. Accessibility Status Widget
 */
export function AccessibilityStatusWidget() {
  const [selectedFacility, setSelectedFacility] = useState<'elevator' | 'restroom' | 'route'>('elevator');

  const facilityDetails = {
    elevator: { title: 'Elevator Cluster West Concourse', status: 'OPERATIONAL', label: 'All 3 lift cabs active', percent: 100, variant: 'success' },
    restroom: { title: 'Sector 104 ADA restrooms', status: 'OPERATIONAL', label: 'Cleaned 12 minutes ago', percent: 100, variant: 'success' },
    route: { title: 'Optimal Wheelchair Ramp Gate 4', status: 'CONGESTED', label: 'Egress traffic is elevated', percent: 65, variant: 'warning' }
  };

  const active = facilityDetails[selectedFacility];

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Accessibility Indicators</span>
        </div>
        <Badge variant={active.variant as any}>{active.status}</Badge>
      </div>

      <div className="flex gap-1.5">
        {(['elevator', 'restroom', 'route'] as const).map((fac) => (
          <button
            key={fac}
            onClick={() => setSelectedFacility(fac)}
            className={`flex-1 py-1 text-[9px] font-mono rounded cursor-pointer transition-colors capitalize ${
              selectedFacility === fac
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-slate-950/40 border border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {fac}
          </button>
        ))}
      </div>

      <div className="space-y-1">
        <p className="text-xs font-bold text-slate-200 font-sans leading-none">{active.title}</p>
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{active.label}</p>
      </div>
    </Card>
  );
}

/**
 * 7. Emergency Alerts Widget
 */
export function EmergencyAlertsWidget() {
  const [alerts, setAlerts] = useState([
    { id: '1', title: 'Power Surge Concourse B', desc: 'Backup generators are active at Sector 104 escalators. Maintenance team dispatched.', severity: 'critical' },
    { id: '2', title: 'Restricted Egress Sector 2', desc: 'Crowd congestion is rising near Gate 4. Operations recommended detour routes.', severity: 'warning' }
  ]);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-850 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Active Incident Core</span>
        </div>
        <Badge variant="error" className="animate-pulse">{alerts.length} ALERTS</Badge>
      </div>

      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                alert.severity === 'critical' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase font-mono tracking-tight">{alert.title}</span>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="text-[9px] font-mono text-slate-400 hover:text-slate-100 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-[10px] leading-relaxed opacity-90 font-sans">{alert.desc}</p>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-[10px] font-mono text-slate-500">
            ✓ All stadium sectors running within optimal limits.
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * 8. AI Recommendations (Explainable Synapse recommendation module)
 */
export function AiRecommendationsWidget() {
  const [recommendationIndex, setRecommendationIndex] = useState(0);

  const recommendations = [
    {
      action: 'Redirect Zone B Egress to Sector 101 Gate A',
      why: 'Saves 14 minutes on average waiting and walking transit times.',
      confidence: 96,
      reasoning: [
        'Gate 4 sensors read high congestion levels (>4 people/sqm).',
        'Gate A (120m away) records zero queue backlog.'
      ]
    },
    {
      action: 'Pre-load transport carts for Sector 104 Beverage Replenishment',
      why: 'Avoids stockouts and improves concession throughput score by 18%.',
      confidence: 91,
      reasoning: [
        'High sales spikes detected during half-time break.',
        'Current inventory level at Sector 104 stands at 24% capacity.'
      ]
    }
  ];

  const current = recommendations[recommendationIndex];

  return (
    <Card hoverable className="bg-slate-900/30 border border-slate-800/80 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Synapse Recommended Action</span>
        </div>
        <Badge variant="info">AI ASSIST</Badge>
      </div>

      <div className="space-y-3 bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-wider block">RECOMMENDED DECISION</span>
          <p className="text-sm font-bold text-slate-100 font-sans leading-snug">{current.action}</p>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-900/60">
          <span className="text-[9px] font-mono text-blue-400 uppercase tracking-wider block">WHY THIS IS SMART</span>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">{current.why}</p>
        </div>

        <div className="flex justify-between items-center pt-2 text-[9px] font-mono text-slate-400">
          <span>Inference Confidence:</span>
          <span className="text-blue-300 font-bold">{current.confidence}%</span>
        </div>
      </div>

      {/* Controller swapper */}
      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
        <span>Inference node: Active</span>
        <button
          onClick={() => setRecommendationIndex((prev) => (prev === 0 ? 1 : 0))}
          className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Next Recommendation</span>
        </button>
      </div>
    </Card>
  );
}
