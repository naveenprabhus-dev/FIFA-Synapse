/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useSynapse } from '../../contexts/SynapseContext';
import { contextBuilder, dashboardSummaryService, notificationRepository } from '../../services/di';
import { SynapseFullContext } from '../../ai/orchestrator/ContextBuilder';
import { StadiumHealthCard } from './StadiumHealthCard';
import { RecommendationFeed } from './RecommendationFeed';
import { LiveAlertPanel, NotificationTimeline } from './LiveAlertPanel';
import { 
  CrowdOverviewCard, AccessibilityOverview, EmergencyOverview, OperationsOverview 
} from './OverviewCards';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Terminal, RefreshCw, AlertTriangle, Play, Sparkles, LayoutGrid, Eye, HelpCircle 
} from 'lucide-react';

export default function CommandCenterDashboard() {
  const { activeRole, userProfile } = useSynapse();
  const [context, setContext] = useState<SynapseFullContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'decision' | 'telemetry' | 'risks'>('decision');

  // Load contextual telemetry from standard repositories
  const fetchTelemetry = async () => {
    setIsRefreshing(true);
    try {
      const fullContext = await contextBuilder.buildContext(
        userProfile?.uid || 'demo_user_123',
        activeRole
      );
      setContext(fullContext);
    } catch (err) {
      console.error('Failed to resolve Synapse telemetry context:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    // Poll telemetry streams every 8 seconds to reflect real-time dashboard patterns
    const interval = setInterval(fetchTelemetry, 8000);
    return () => clearInterval(interval);
  }, [activeRole, userProfile?.uid]);

  // Generate compiled decision dashboard summary
  const summary = dashboardSummaryService.generateSummary(context);

  const handleMarkRead = async (id: string) => {
    try {
      // Optimistically update local context list
      if (context) {
        const updatedNotifs = (context.notifications || []).map(n => 
          n.id === id ? { ...n, read: true } : n
        );
        setContext({ ...context, notifications: updatedNotifs });
      }
      
      // Update persistent repository
      await notificationRepository.markAsRead(id);
    } catch (err) {
      console.error('Failed to dismiss event notification:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Compiling Synapse Decision Intelligence...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-amber-500/10 text-amber-500 font-mono text-[9px] font-bold uppercase tracking-widest border border-amber-500/20">
              OPERATIONAL HUB
            </div>
            {summary.isSimulatedData && (
              <Badge variant="warning" className="text-[9px] font-mono font-bold">
                DEGRADED TELEMETRY
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 font-sans tracking-tight uppercase flex items-center gap-2">
            <Terminal className="w-5 h-5 text-blue-500" />
            <span>FIFA Synapse AI Command Center</span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed font-sans">
            Real-time neural monitoring room consolidating flow analysis, emergency dispatches, and structural stadium systems.
          </p>
        </div>

        {/* Dashboard Actions and Indicators */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={fetchTelemetry}
            disabled={isRefreshing}
            className="text-[11px] font-mono h-8 border border-slate-800/80 hover:bg-slate-900/60 flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'REFRESHING' : 'POLLING'}</span>
          </Button>

          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Connected" />
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
            SECURE LIVE
          </span>
        </div>
      </div>

      {/* Primary Section: Stadium Overall Health Score Panel */}
      <section aria-label="Stadium overall health analytics">
        <StadiumHealthCard health={summary.health} />
      </section>

      {/* Dashboard Sub-Tabs switcher */}
      <div className="flex items-center border-b border-slate-800/80 gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('decision')}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'decision' 
              ? 'text-blue-400 border-blue-500' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          AI Decisions ({summary.recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'telemetry' 
              ? 'text-blue-400 border-blue-500' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Sensor Grids (4)
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-200 cursor-pointer ${
            activeTab === 'risks' 
              ? 'text-blue-400 border-blue-500' 
              : 'text-slate-500 border-transparent hover:text-slate-300'
          }`}
        >
          Risk Forecasting ({summary.predictedRisks.length})
        </button>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Panel based on tab */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'decision' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <RecommendationFeed recommendations={summary.recommendations} />
            </motion.div>
          )}

          {activeTab === 'telemetry' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {context && (
                <>
                  <CrowdOverviewCard context={context} />
                  <AccessibilityOverview context={context} />
                  <EmergencyOverview context={context} />
                  <OperationsOverview context={context} />
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'risks' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide uppercase flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span>AI Preemptive Risk Horizon</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Pre-emptive analytics tracking physical bottlenecks, capacity saturations, and high-impact egress surges.
                </p>
              </div>

              {summary.predictedRisks.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate-800/80 bg-slate-900/10">
                  <p className="text-xs text-slate-500 font-mono">No imminent operational hazard signals tracked.</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {summary.predictedRisks.map((risk) => (
                    <Card key={risk.id} className="p-5 border-slate-800/80 bg-slate-900/10 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="space-y-3 max-w-xl">
                        <div className="flex items-center gap-2.5">
                          <span className="p-1 rounded bg-rose-500/10 text-rose-400 font-mono text-[9px] font-bold uppercase tracking-wider border border-rose-500/10">
                            PROBABILITY: {Math.round(risk.probability * 100)}%
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            risk.impact === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            IMPACT: {risk.impact}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            HORIZON: ~{risk.timeHorizonMinutes} MINS
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-200 font-sans">{risk.hazard}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans mt-0.5">{risk.description}</p>
                        </div>

                        <div className="text-[11px] text-slate-500 font-sans italic">
                          <span className="font-semibold text-slate-400">TRIGGER:</span> {risk.triggerCondition}
                        </div>
                      </div>

                      <div className="p-3.5 rounded bg-slate-950/40 border border-slate-800/60 max-w-sm flex-shrink-0 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-mono font-bold uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Preemptive Mitigation AI</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                          {risk.mitigationStrategy}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Right Sidebar Columns: Metrics Feed & Event Logger */}
        <div className="space-y-6 lg:col-span-1">
          {context && (
            <>
              <section aria-label="Stadium hardware live metrics">
                <LiveAlertPanel context={context} />
              </section>
              <section aria-label="Recent AI decisions timeline">
                <NotificationTimeline context={context} onMarkRead={handleMarkRead} />
              </section>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
