/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Compass, Settings, AlertTriangle, Snowflake, Sun, CloudRain, Shield, Users, Layers, Accessibility } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { STADIUM_NODES } from '../constants';
import { NavigationSimulatorState } from '../types';

interface SelectorPanelProps {
  originId: string;
  setOriginId: (id: string) => void;
  destinationId: string;
  setDestinationId: (id: string) => void;
  optimizedFor: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS';
  setOptimizedFor: (opt: 'SPEED' | 'ACCESSIBILITY' | 'LOW_CROWDS') => void;
  simulator: NavigationSimulatorState;
  setSimulator: (updater: (prev: NavigationSimulatorState) => NavigationSimulatorState) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
}

export function SelectorPanel({
  originId,
  setOriginId,
  destinationId,
  setDestinationId,
  optimizedFor,
  setOptimizedFor,
  simulator,
  setSimulator,
  onRunAnalysis,
  isLoading,
}: SelectorPanelProps) {

  const handleToggleElevators = () => {
    setSimulator(prev => ({ ...prev, elevatorsActive: !prev.elevatorsActive }));
  };

  const handleToggleEmergency = () => {
    setSimulator(prev => ({ ...prev, emergencyLockdown: !prev.emergencyLockdown }));
  };

  const handleWeatherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const weather = e.target.value as 'CLEAR' | 'RAIN' | 'WINDY' | 'SURGE_HEAT';
    setSimulator(prev => ({ ...prev, weatherCondition: weather }));
  };

  const handleSurgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const surge = e.target.value as 'NONE' | 'GATE_A' | 'GATE_B' | 'ZONE_C';
    setSimulator(prev => ({ ...prev, crowdSurgeZone: surge }));
  };

  const handleMatchMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = Number(e.target.value);
    setSimulator(prev => ({ ...prev, matchMinute: min }));
  };

  return (
    <Card className="bg-slate-900/30 border border-slate-800/80 p-5 space-y-5">
      {/* Selector Heading */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Waypoint Optimization
            </span>
            <h4 className="text-xs font-bold text-slate-200 font-sans uppercase">
              Routing Parameters
            </h4>
          </div>
        </div>
      </div>

      {/* Origin and Destination selects */}
      <div className="space-y-4">
        {/* Origin dropdown */}
        <div className="space-y-1">
          <label htmlFor="origin-select" className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Start Origin Location
          </label>
          <select
            id="origin-select"
            value={originId}
            onChange={(e) => setOriginId(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {STADIUM_NODES.map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>

        {/* Destination dropdown */}
        <div className="space-y-1">
          <label htmlFor="destination-select" className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Final Target Destination
          </label>
          <select
            id="destination-select"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
            disabled={isLoading}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-sans focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          >
            {STADIUM_NODES.filter(n => n.id !== originId).map((node) => (
              <option key={node.id} value={node.id}>
                {node.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cognitive Mode Segment */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Optimization Strategy
          </label>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Route optimization selection">
            <button
              onClick={() => setOptimizedFor('SPEED')}
              disabled={isLoading}
              className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                optimizedFor === 'SPEED'
                  ? 'bg-blue-600 border-blue-500 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              role="radio"
              aria-checked={optimizedFor === 'SPEED'}
            >
              FASTEST TIME
            </button>
            <button
              onClick={() => setOptimizedFor('ACCESSIBILITY')}
              disabled={isLoading}
              className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                optimizedFor === 'ACCESSIBILITY'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              role="radio"
              aria-checked={optimizedFor === 'ACCESSIBILITY'}
            >
              ACCESSIBILITY
            </button>
            <button
              onClick={() => setOptimizedFor('LOW_CROWDS')}
              disabled={isLoading}
              className={`py-2 text-[10px] font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                optimizedFor === 'LOW_CROWDS'
                  ? 'bg-amber-600 border-amber-500 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              role="radio"
              aria-checked={optimizedFor === 'LOW_CROWDS'}
            >
              MIN CROWDS
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Tweak Settings Panel */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-2xl p-4 space-y-4">
        <div className="flex items-center space-x-1.5 border-b border-slate-900 pb-2">
          <Settings className="w-3.5 h-3.5 text-blue-400 animate-spin-slow" />
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">
            Synapse Environment Simulator
          </span>
        </div>

        {/* Simulator controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Weather Option */}
          <div className="space-y-1">
            <label htmlFor="weather-select" className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Weather
            </label>
            <select
              id="weather-select"
              value={simulator.weatherCondition}
              onChange={handleWeatherChange}
              disabled={isLoading}
              className="w-full bg-slate-900/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-sans focus:outline-none"
            >
              <option value="CLEAR">☀️ Clear Skies</option>
              <option value="RAIN">🌧️ Dense Rain</option>
              <option value="WINDY">💨 High Winds</option>
              <option value="SURGE_HEAT">🔥 Extreme Heat</option>
            </select>
          </div>

          {/* Surge Zone Option */}
          <div className="space-y-1">
            <label htmlFor="surge-select" className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">
              Surge Bottleneck
            </label>
            <select
              id="surge-select"
              value={simulator.crowdSurgeZone}
              onChange={handleSurgeChange}
              disabled={isLoading}
              className="w-full bg-slate-900/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-sans focus:outline-none"
            >
              <option value="NONE">🟢 None (Free Flow)</option>
              <option value="GATE_A">🔴 Gate A Overload</option>
              <option value="GATE_B">🔴 Gate B Transit Jam</option>
              <option value="ZONE_C">🔴 Sector 120 Bottleneck</option>
            </select>
          </div>
        </div>

        {/* Interactive Match minute range */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span className="uppercase tracking-wider">Match Phase Clock</span>
            <span className="text-slate-300 font-bold">{simulator.matchMinute}m (2nd Half)</span>
          </div>
          <input
            type="range"
            min={45}
            max={90}
            value={simulator.matchMinute}
            onChange={handleMatchMinuteChange}
            disabled={isLoading}
            className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            aria-label="Match Minute Simulation Slider"
          />
        </div>

        {/* Dynamic Facility Alerts */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* Elevator button */}
          <button
            onClick={handleToggleElevators}
            disabled={isLoading}
            className={`py-1.5 px-2 text-[9px] font-mono font-bold rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
              simulator.elevatorsActive
                ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400'
                : 'bg-red-950/40 border-red-900 text-red-400'
            }`}
          >
            <span>ADA ELEVATORS</span>
            <span className="text-[8px] uppercase tracking-widest font-extrabold">
              {simulator.elevatorsActive ? 'ACTIVE' : 'OUTAGE'}
            </span>
          </button>

          {/* Emergency state button */}
          <button
            onClick={handleToggleEmergency}
            disabled={isLoading}
            className={`py-1.5 px-2 text-[9px] font-mono font-bold rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
              !simulator.emergencyLockdown
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-red-900 border-red-800 text-white animate-pulse'
            }`}
          >
            <span>EMERGENCY SECTOR</span>
            <span className="text-[8px] uppercase tracking-widest font-extrabold">
              {simulator.emergencyLockdown ? 'ALERT' : 'CLEAR'}
            </span>
          </button>
        </div>
      </div>

      {/* Core Run Button */}
      <Button
        id="synapse-run-analysis-btn"
        variant="primary"
        size="lg"
        onClick={onRunAnalysis}
        disabled={isLoading}
        className="w-full h-11 bg-blue-600 hover:bg-blue-500 font-sans text-xs uppercase font-extrabold tracking-widest shadow-lg shadow-blue-600/10 hover:shadow-blue-600/20 transition-all rounded-xl cursor-pointer"
        aria-label="Execute Smart Synapse Routing"
      >
        {isLoading ? 'ANALYZING TELEMETRY...' : 'SOLVE SMART COGNITIVE ROUTE'}
      </Button>
    </Card>
  );
}
