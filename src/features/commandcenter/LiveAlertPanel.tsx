/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SynapseFullContext } from '../../ai/orchestrator/ContextBuilder';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  CloudRain, Wind, Thermometer, Compass, Car, ShoppingBag, 
  Clock, CheckCircle, Bell, MessageSquare, ShieldAlert, ArrowUpRight 
} from 'lucide-react';

interface LiveAlertPanelProps {
  context: SynapseFullContext;
}

export function LiveAlertPanel({ context }: LiveAlertPanelProps) {
  const weather = context.weather;
  const parking = context.parkingZones || [];
  const foodCourts = context.foodCourts || [];

  return (
    <Card className="p-5 bg-slate-900/30 border border-slate-800/80 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
          Stadium Infrastructure Metrics
        </h4>
        <span className="text-[10px] text-slate-500 font-mono">Live Feeds</span>
      </div>

      {/* Weather Impact Section */}
      {weather && (
        <div className="space-y-2.5">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
            Stadium Environment & Weather Impact
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded bg-slate-950/40 border border-slate-800/80 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">TEMP</span>
                <span className="text-xs font-bold text-slate-200 font-mono">{weather.temperatureCelsius}°C</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950/40 border border-slate-800/80 flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">WIND</span>
                <span className="text-xs font-bold text-slate-200 font-mono">{weather.windSpeedKmh} km/h</span>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950/40 border border-slate-800/80 flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-sky-400" />
              <div>
                <span className="text-[10px] text-slate-500 block font-mono">ROOF</span>
                <span className="text-[9px] font-bold text-slate-200 font-mono leading-none tracking-tight">
                  {weather.roofActionRecommendation}
                </span>
              </div>
            </div>
          </div>

          {weather.activeWeatherAlerts && weather.activeWeatherAlerts.length > 0 ? (
            <div className="p-2.5 rounded bg-rose-950/10 border border-rose-900/40 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="text-[10px] text-rose-300 leading-relaxed font-sans">
                <span className="font-bold">Active Weather Warning:</span> {weather.activeWeatherAlerts.join(', ')}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 font-sans italic leading-relaxed">
              No active weather advisories. General conditions: {weather.forecastBrief || 'Stable and dry'}.
            </p>
          )}
        </div>
      )}

      {/* Parking Status Section */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
          Parking Grid Capacity
        </span>
        <div className="space-y-2">
          {parking.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No parking lot telemetry.</p>
          ) : (
            parking.map((lot, i) => {
              const occupiedPercent = Math.round((lot.currentOccupiedCount / lot.totalCapacity) * 100);
              const availableSpots = lot.totalCapacity - lot.currentOccupiedCount;
              const isFull = occupiedPercent >= 90;

              return (
                <div key={lot.id || i} className="p-2.5 rounded bg-slate-950/20 border border-slate-900/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 font-sans block">{lot.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{availableSpots} spaces free</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${isFull ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                      {occupiedPercent}% Full
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">{lot.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Food Courts Status */}
      <div className="space-y-3 pt-4 border-t border-slate-800/60">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
          Concession Queue Metrics
        </span>
        <div className="space-y-2">
          {foodCourts.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono">No concessions online.</p>
          ) : (
            foodCourts.map((food, i) => {
              const queueLen = food.queue?.currentLength || 0;
              const isBusy = queueLen > 12;

              return (
                <div key={food.id || i} className="p-2.5 rounded bg-slate-950/20 border border-slate-900/60 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-200 font-sans block">{food.name}</span>
                      <span className="text-[10px] text-slate-400 font-sans">{food.locationDescription}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold block ${isBusy ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {queueLen} Patrons
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">
                      ~{food.queue?.estimatedWaitMinutes || 0} mins wait
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}

// 2. NotificationTimeline
interface NotificationTimelineProps {
  context: SynapseFullContext;
  onMarkRead: (id: string) => void;
}

export function NotificationTimeline({ context, onMarkRead }: NotificationTimelineProps) {
  const notifications = context.notifications || [];

  return (
    <Card className="p-5 bg-slate-900/30 border border-slate-800/80 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-500 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-sans">
            AI Operations Log Feed
          </h4>
        </div>
        <Badge variant="neutral" className="text-[9px] font-mono">
          {notifications.length} EVENTS
        </Badge>
      </div>

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono space-y-2">
            <MessageSquare className="w-6 h-6 text-slate-600 mx-auto" />
            <p>Notification timeline queue empty.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 pl-4 space-y-5 ml-2.5">
            {notifications.slice(0, 8).map((notif, i) => {
              const isUnread = !notif.read;

              return (
                <div key={notif.id || i} className="relative space-y-1.5 group">
                  {/* Timeline circular node marker */}
                  <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                    isUnread 
                      ? 'bg-amber-400 border-slate-950 ring-2 ring-amber-500/20' 
                      : 'bg-slate-700 border-slate-950'
                  }`} />

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isUnread && (
                      <button 
                        onClick={() => onMarkRead(notif.id)}
                        className="text-[9px] text-blue-400 hover:text-blue-300 font-mono uppercase tracking-wider border-0 bg-transparent p-0 cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>

                  <div className={`p-2.5 rounded border transition-all duration-300 ${
                    isUnread 
                      ? 'bg-amber-500/5 border-amber-500/10' 
                      : 'bg-slate-950/20 border-slate-900/60'
                  }`}>
                    <h5 className="text-xs font-bold text-slate-200 font-sans">{notif.title}</h5>
                    <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">{notif.message}</p>
                    {(notif as any).recommendation && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1.5 pt-1.5 border-t border-slate-900/50 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-300">{(notif as any).recommendation}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
