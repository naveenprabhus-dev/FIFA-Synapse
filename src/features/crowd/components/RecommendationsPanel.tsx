/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CrowdRecommendation } from '../types';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Sparkles, ArrowRight, HelpCircle, Activity, Lightbulb, Compass, RotateCcw } from 'lucide-react';

interface RecommendationsPanelProps {
  recommendation: CrowdRecommendation | null;
  isLoading: boolean;
  onRefreshAi: () => void;
  errorText: string | null;
}

export function RecommendationsPanel({
  recommendation,
  isLoading,
  onRefreshAi,
  errorText
}: RecommendationsPanelProps) {
  const getBadgeVariant = (severity: CrowdRecommendation['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
      default:
        return 'info';
    }
  };

  return (
    <Card className="p-6 bg-slate-950/40 border border-slate-900 flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-200 font-sans uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Crowd Dispatch Advisor</span>
          </h4>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mt-0.5">
            Synapse cognitive orchestration model suggestions
          </p>
        </div>
        <button
          onClick={onRefreshAi}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 cursor-pointer disabled:opacity-40 transition-all outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Ask Synapse Core for AI recommendations"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>CONSULT SYNAPSE</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center flex flex-col items-center justify-center space-y-3.5 bg-slate-950/10 border border-dashed border-slate-900 rounded-xl">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Compiling Crowd Context Models</p>
            <p className="text-[10px] text-slate-500 font-sans">Evaluating match state, sensor maps & gate telemetry</p>
          </div>
        </div>
      ) : errorText ? (
        <div className="py-10 text-center bg-red-950/10 border border-red-900/30 rounded-xl p-6 space-y-3">
          <HelpCircle className="w-8 h-8 text-red-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-red-400 font-mono uppercase">AI Consultation Failed</p>
            <p className="text-[10px] text-red-300 max-w-md mx-auto leading-relaxed">{errorText}</p>
          </div>
          <button
            onClick={onRefreshAi}
            className="px-3 py-1.5 text-[10px] font-bold font-mono text-red-400 border border-red-900/40 bg-red-950/30 hover:bg-red-950/50 rounded-lg transition-all"
          >
            RETRY INFERENCE
          </button>
        </div>
      ) : recommendation ? (
        <div className="space-y-5 animate-fade-in">
          {/* Main summary card */}
          <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-950 pb-2.5">
              <div className="space-y-0.5">
                <span className="text-xs font-mono text-blue-400 block uppercase tracking-wider">Recommended Strategy</span>
                <h5 className="text-sm font-extrabold text-slate-200 font-sans leading-tight">{recommendation.summary}</h5>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(recommendation.severity)} className="text-[8px] px-2 py-0.5 font-mono uppercase">
                  {recommendation.severity} Priority
                </Badge>
                <div className="text-[9px] font-mono text-slate-500">
                  Confidence: <span className="font-bold text-slate-300">{(recommendation.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Affected Area</span>
                <span className="text-xs font-bold text-slate-300 font-sans block">{recommendation.affectedArea}</span>
              </div>

              <div className="space-y-1 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Reason / Rationale</span>
                <p className="text-[11px] text-slate-400 leading-snug font-sans">{recommendation.reason}</p>
              </div>

              <div className="space-y-1 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Suggested Tactical Action</span>
                <span className="text-[11px] font-bold text-emerald-400 font-sans block leading-snug">{recommendation.suggestedAction}</span>
              </div>

              <div className="space-y-1 bg-slate-950/40 border border-slate-900 p-2.5 rounded-lg">
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider block">Expected Impact Outcome</span>
                <span className="text-[11px] text-blue-300 font-sans block leading-snug">{recommendation.expectedImpact}</span>
              </div>
            </div>
          </div>

          {/* Reasoning steps sequence */}
          {recommendation.steps && recommendation.steps.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                Synapse Reasoning Trace (Decision Sequence)
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {recommendation.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-900/10 border border-slate-900/60 p-2.5 rounded-lg text-xs items-start">
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-400 font-sans leading-normal">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternative Contingency */}
          {recommendation.alternative && (
            <div className="bg-slate-900/20 border border-slate-900 p-3.5 rounded-xl space-y-1.5">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-600" /> Secondary Contingency Path
              </span>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {recommendation.alternative}
              </p>
            </div>
          )}

          <div className="text-[8px] font-mono text-slate-600 uppercase text-right">
            Generated: {recommendation.timestamp}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center border border-dashed border-slate-900 rounded-xl bg-slate-950/20 space-y-3">
          <Lightbulb className="w-8 h-8 text-slate-700 mx-auto" />
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-400 font-sans">AI Decision Model Idle</p>
            <p className="text-[10px] text-slate-500 font-sans">Click "Consult Synapse" to load proactive AI crowd recommendations.</p>
          </div>
        </div>
      )}
    </Card>
  );
}
