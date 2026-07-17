/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SynapseRecommendation } from '../../types/synapse';

interface ExplainabilityCardProps {
  recommendation: SynapseRecommendation<string>;
  title?: string;
}

export function ExplainabilityCard({ recommendation, title = 'Synapse Cognitive Recommendation' }: ExplainabilityCardProps) {
  const confidencePercent = Math.round(recommendation.confidence * 100);

  return (
    <Card className="border-l-4 border-l-blue-500 bg-slate-900/50">
      <div className="flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 text-blue-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <h4 className="text-sm font-semibold uppercase tracking-wider font-sans">{title}</h4>
          </div>
          <Badge variant={recommendation.confidence > 0.8 ? 'success' : 'warning'}>
            {confidencePercent}% Confidence
          </Badge>
        </div>

        {/* Primary recommendation details */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-sans uppercase tracking-wider">Smart Action</span>
          </div>
          <p className="text-sm font-medium text-slate-200 font-sans pl-6">{recommendation.action}</p>
        </div>

        {/* Cognitive reasoning steps */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-mono">Cognitive Chain-of-Thought:</span>
          <ul className="space-y-1.5 pl-4">
            {recommendation.reasoning.map((step, index) => (
              <li key={index} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="text-blue-500 font-bold font-mono mt-0.5">↳</span>
                <span className="font-sans leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Alternative Pathway */}
        {recommendation.alternative && (
          <div className="border-t border-slate-800/60 pt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">Alternative path analyzed:</span>
            <span className="text-slate-400 font-sans italic flex items-center gap-1">
              {recommendation.alternative}
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </span>
          </div>
        )}

        {/* Expected outcomes */}
        <div className="bg-blue-950/20 border border-blue-900/40 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs text-blue-300 font-sans font-medium">Expected Improvement:</span>
          <span className="text-xs text-blue-400 font-mono font-semibold">{recommendation.expectedOutcome}</span>
        </div>
      </div>
    </Card>
  );
}
