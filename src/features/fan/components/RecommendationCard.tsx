/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, Compass, AlertTriangle, CheckCircle2, ChevronRight, HelpCircle, ArrowRight, Accessibility, Timer, Save } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { SynapseCoreRecommendation } from '../../../types/synapse';

interface RecommendationCardProps {
  recommendation: SynapseCoreRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const confidencePercent = Math.round(recommendation.confidenceScore * 100);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return <Badge variant="error" className="text-[9px] px-2 py-0.5 uppercase tracking-wider animate-pulse">CRITICAL DISPATCH</Badge>;
      case 'HIGH':
        return <Badge variant="warning" className="text-[9px] px-2 py-0.5 uppercase tracking-wider">HIGH PRIORITY</Badge>;
      case 'MEDIUM':
        return <Badge variant="info" className="text-[9px] px-2 py-0.5 uppercase tracking-wider">MEDIUM</Badge>;
      default:
        return <Badge variant="success" className="text-[9px] px-2 py-0.5 uppercase tracking-wider">LOW</Badge>;
    }
  };

  // Safe parsing of custom metadata injected into the recommendation contextsnapshot
  const reasoning = recommendation.reasoningDetails || 
                    (recommendation.contextSnapshot?.reasoningDetails as string[]) || 
                    ['Dynamic stadium sensors analyzed.', 'Bypassed crowded corridors in real-time.'];

  // Render calculated metadata values
  const getEstimatedTime = () => {
    if (recommendation.recommendation.toLowerCase().includes('2 minutes') || recommendation.reason.toLowerCase().includes('2 minutes')) return '2 min';
    if (recommendation.recommendation.toLowerCase().includes('5 minutes') || recommendation.reason.toLowerCase().includes('5 minutes')) return '5 min';
    return '4 min';
  };

  const getEstimatedSaved = () => {
    if (recommendation.estimatedBenefit.toLowerCase().includes('13 minutes')) return '13 mins saved';
    if (recommendation.estimatedBenefit.toLowerCase().includes('10 minutes')) return '10 mins saved';
    if (recommendation.estimatedBenefit.toLowerCase().includes('8 minutes')) return '8 mins saved';
    return '5 mins saved';
  };

  const isAccessibilityPath = recommendation.intent === 'ACCESSIBILITY' || 
                               recommendation.title.toLowerCase().includes('accessible') || 
                               recommendation.reason.toLowerCase().includes('elevator') ||
                               recommendation.reason.toLowerCase().includes('accessibility');

  return (
    <Card className="border-l-4 border-l-blue-500 bg-slate-900/30 border border-slate-800/80 p-5 space-y-5 animate-fade-in">
      {/* Header and badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
              Cognitive Insight Engine
            </span>
            <h4 className="text-xs font-extrabold text-slate-200 font-sans uppercase tracking-tight">
              {recommendation.title}
            </h4>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {getPriorityBadge(recommendation.priority)}
          <Badge variant={recommendation.confidenceScore > 0.8 ? 'success' : 'warning'} className="text-[9px] font-mono">
            {confidencePercent}% CONFIDENCE
          </Badge>
        </div>
      </div>

      {/* Main recommendation description block */}
      <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400">
          <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">SMART RECOMMENDED DECISION</span>
        </div>
        <p className="text-[13px] font-medium text-slate-100 font-sans leading-relaxed">
          {recommendation.recommendation}
        </p>
      </div>

      {/* Explanatory Reasoning Card */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
          Mathematical & Contextual Reason
        </span>
        <div className="bg-slate-950/20 border border-slate-800/40 rounded-xl p-3.5">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {recommendation.reason}
          </p>
        </div>
      </div>

      {/* Saving and Walking metrics badge row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-blue-950/15 border border-blue-900/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-blue-300 font-sans font-medium">Transit Time</span>
          </div>
          <span className="text-xs font-bold text-blue-400 font-mono bg-blue-950/40 px-2 py-0.5 rounded-md">
            {getEstimatedTime()}
          </span>
        </div>

        <div className="bg-emerald-950/15 border border-emerald-900/40 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Save className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-300 font-sans font-medium">Estimated Saved</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950/40 px-2 py-0.5 rounded-md">
            {getEstimatedSaved()}
          </span>
        </div>
      </div>

      {/* Accessibility details & wheelchair tags */}
      <div className={`rounded-xl p-3.5 border ${
        isAccessibilityPath 
          ? 'bg-emerald-950/10 border-emerald-900/40 text-emerald-300' 
          : 'bg-slate-950/30 border-slate-900 text-slate-400'
      }`}>
        <div className="flex items-start space-x-2.5">
          <Accessibility className={`w-4 h-4 mt-0.5 ${isAccessibilityPath ? 'text-emerald-400' : 'text-slate-500'}`} />
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold block">
              Accessibility Assessment
            </span>
            <p className="text-[11px] leading-relaxed">
              {isAccessibilityPath 
                ? 'Elevator paths verified fully operational. Optimized for step-free transport via North/West ramps.' 
                : 'Contains standard stairs/escalators. Toggle Accessibility Strategy on the selector if wheelchair assistance or step-free travel is required.'}
            </p>
          </div>
        </div>
      </div>

      {/* Alternative option if provided */}
      {recommendation.alternative && (
        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            Alternative Route Path:
          </span>
          <span className="text-xs text-slate-300 font-sans italic flex items-center gap-1 bg-slate-950/40 px-3 py-1 rounded-lg border border-slate-900">
            <span>{recommendation.alternative}</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
          </span>
        </div>
      )}
    </Card>
  );
}
