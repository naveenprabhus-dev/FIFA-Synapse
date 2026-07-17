/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MatchRepository } from '../repositories/MatchRepository';
import { Match, MatchTimelineEvent } from '../types/match';
import { ValidationError } from '../utils/errors';

export class MatchService {
  constructor(private matchRepo: MatchRepository) {}

  async getActiveMatches(): Promise<Match[]> {
    return this.matchRepo.getMatches();
  }

  async getLiveMatchStatus(matchId: string): Promise<{
    score: string;
    minute: number;
    phase: Match['currentPhase'];
    latestEvent?: MatchTimelineEvent;
  }> {
    if (!matchId) {
      throw new ValidationError('Match ID is required', 'EMPTY_ID');
    }
    const match = await this.matchRepo.getMatchById(matchId);
    const sortedEvents = [...match.timelineEvents].sort((a, b) => b.minute - a.minute);

    return {
      score: `${match.homeTeam.score} - ${match.awayTeam.score}`,
      minute: match.currentMinute,
      phase: match.currentPhase,
      latestEvent: sortedEvents[0],
    };
  }

  async getMatchTimeline(matchId: string): Promise<MatchTimelineEvent[]> {
    if (!matchId) {
      throw new ValidationError('Match ID is required', 'EMPTY_ID');
    }
    return this.matchRepo.getTimelineEvents(matchId);
  }
}
