/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, MatchTimelineEvent } from '../types/match';
import { RepositoryError } from '../utils/errors';

export interface MatchRepository {
  getMatches(): Promise<Match[]>;
  getMatchById(id: string): Promise<Match>;
  getTimelineEvents(matchId: string): Promise<MatchTimelineEvent[]>;
}

export class MockMatchRepository implements MatchRepository {
  private matches: Match[] = [
    {
      id: 'match-1',
      homeTeam: {
        id: 'team-fra',
        name: 'France',
        shortName: 'FRA',
        score: 1,
      },
      awayTeam: {
        id: 'team-mar',
        name: 'Morocco',
        shortName: 'MAR',
        score: 0,
      },
      status: 'LIVE',
      currentPhase: 'SECOND_HALF',
      currentMinute: 52,
      stoppageTimeMinutes: 2,
      venueName: 'Al Bayt Stadium',
      kickoffTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      timelineEvents: [
        {
          id: 'event-1',
          minute: 15,
          type: 'KICKOFF',
          detail: 'Kickoff Whistle - Match Commenced',
        },
        {
          id: 'event-2',
          minute: 32,
          type: 'YELLOW_CARD',
          detail: 'Yellow Card: Hakimi (Morocco) foul',
          teamId: 'team-mar',
          playerName: 'Achraf Hakimi',
        },
        {
          id: 'event-3',
          minute: 48,
          type: 'GOAL',
          detail: 'GOAL! France [1] - 0 Morocco (Mbappe)',
          teamId: 'team-fra',
          playerName: 'Kylian Mbappé',
        },
      ],
    },
  ];

  async getMatches(): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return this.matches.map((m) => ({ ...m }));
  }

  async getMatchById(id: string): Promise<Match> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const match = this.matches.find((m) => m.id === id);
    if (!match) {
      throw new RepositoryError(`Match not found: ${id}`, 'MATCH_NOT_FOUND');
    }
    return { ...match };
  }

  async getTimelineEvents(matchId: string): Promise<MatchTimelineEvent[]> {
    const match = await this.getMatchById(matchId);
    return [...match.timelineEvents];
  }
}
