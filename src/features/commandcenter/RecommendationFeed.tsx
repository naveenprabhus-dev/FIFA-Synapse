/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { PrioritizedRecommendation } from '../../services/InsightPrioritizationService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PriorityBadge, ConfidenceIndicator } from './StadiumHealthCard';
import { Lightbulb, Info, CheckCircle, ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

// Individual AI Insight Card Component
interface AIInsightCardProps {
  recommendation: PrioritizedRecommendation;
  onExecute: (id: string) => void;
  isExecuted: boolean;
}

export function AIInsightCard({ recommendation, onExecute, isExecuted }: AIInsightCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  let borderStyle = 'border-slate-800/80 bg-slate-900/30';
  let bannerBg = 'bg-slate-950/40 border-b border-slate-800/80';
  let glowStyle = '';

  if (recommendation.priority === 'CRITICAL') {
    borderStyle = 'border-rose-950/80 bg-rose-950/5';
    bannerBg = 'bg-rose-950/20 border-b border-rose-900/60';
    glowStyle = 'shadow-sm shadow-rose-500/5';
  } else if (recommendation.priority === 'HIGH') {
    borderStyle = 'border-amber-950/80 bg-amber-950/5';
    bannerBg = 'bg-amber-950/20 border-b border-amber-900/60';
  }

  return (
    <Card className={`overflow-hidden border ${borderStyle} ${glowStyle} transition-all duration-300 hover:border-slate-700/60`}>
      {/* Header Banner */}
      <div className={`px-4 py-3 flex items-center justify-between gap-4 ${bannerBg}`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`w-3.5 h-3.5 ${recommendation.priority === 'CRITICAL' ? 'text-rose-400' : 'text-blue-400'}`} />
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
            {recommendation.source}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={recommendation.priority} />
          <ConfidenceIndicator confidence={recommendation.confidence} />
        </div>
      </div>

      {/* Main recommendation description block */}
      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-100 font-sans tracking-wide">
            {recommendation.title}
          </h4>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {recommendation.summary}
          </p>
        </div>

        {/* Action instruction box */}
        <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/80 space-y-2">
          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
            Recommended Smart Action
          </span>
          <p className="text-xs text-slate-200 font-sans font-medium flex items-start gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0 animate-pulse" />
            <span>{recommendation.recommendedAction}</span>
          </p>
        </div>

        {/* Explanation & Reasoning drawer */}
        <div className="space-y-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-mono uppercase font-bold tracking-wider flex items-center gap-1.5 cursor-pointer"
            aria-expanded={showExplanation}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showExplanation ? 'Hide AI Justification' : 'Explain WHY this recommendation exists'}</span>
          </button>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs text-blue-300 font-sans space-y-1.5"
            >
              <div className="font-bold flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span>AI Rationale & Signal Inputs</span>
              </div>
              <p className="leading-relaxed">
                {recommendation.reasoning} Current live stadium data streams have violated normal operational density caps. 
                Applying this action re-routes resources to prevent cascade failures.
              </p>
              <div className="text-[10px] text-blue-400/80 font-mono font-semibold pt-1 border-t border-blue-500/10">
                EXPECTED BENEFIT: {recommendation.impactBenefit}
              </div>
            </motion.div>
          )}
        </div>

        {/* Action Executer buttons */}
        <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="text-[10px] text-slate-500 font-mono font-semibold uppercase">
            AFFECTED AREA: <span className="text-slate-300 font-bold">{recommendation.affectedArea}</span>
          </div>

          <Button
            size="sm"
            variant={isExecuted ? 'ghost' : 'primary'}
            onClick={() => onExecute(recommendation.id)}
            disabled={isExecuted}
            className="text-[11px] font-bold h-8 px-4 font-mono tracking-wider"
          >
            {isExecuted ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>DISPATCHED</span>
              </span>
            ) : (
              <span>DEPLOY DISPATCH</span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Main Recommendation Feed Component
interface RecommendationFeedProps {
  recommendations: PrioritizedRecommendation[];
}

export function RecommendationFeed({ recommendations }: RecommendationFeedProps) {
  const [executedIds, setExecutedIds] = useState<Record<string, boolean>>({});

  const handleExecute = (id: string) => {
    setExecutedIds(prev => ({ ...prev, [id]: true }));
  };

  const activeRecs = recommendations.filter(r => !executedIds[r.id]);
  const executedRecs = recommendations.filter(r => executedIds[r.id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 font-sans tracking-wide uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>AI Decision Recommendations</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Sorted real-time queue. Confirmed safety, navigation, and staffing interventions.
          </p>
        </div>
        <Badge variant="info" className="font-mono font-bold text-[10px]">
          {activeRecs.length} ACTIVE
        </Badge>
      </div>

      {recommendations.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-slate-800/80 bg-slate-900/10">
          <CheckCircle className="w-8 h-8 text-emerald-500/80 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-300 font-sans mb-1">
            Stadium Infrastructure Operating Cleanly
          </p>
          <p className="text-xs text-slate-500 font-sans max-w-sm mx-auto">
            Zero active alerts or congested signals detected across any intelligence agent nodes.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Active alerts first */}
          {activeRecs.map((rec) => (
            <AIInsightCard
              key={rec.id}
              recommendation={rec}
              onExecute={handleExecute}
              isExecuted={false}
            />
          ))}

          {/* Executed alerts collapsed/lowered */}
          {executedRecs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest block font-bold">
                Archived Dispatches ({executedRecs.length})
              </span>
              <div className="opacity-60 space-y-3">
                {executedRecs.map((rec) => (
                  <AIInsightCard
                    key={rec.id}
                    recommendation={rec}
                    onExecute={handleExecute}
                    isExecuted={true}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
