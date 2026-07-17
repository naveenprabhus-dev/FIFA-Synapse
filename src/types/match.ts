/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'PAUSED' | 'COMPLETED' | 'POSTPONED';
export type MatchPhase = 'PRE_MATCH' | 'FIRST_HALF' | 'HALF_TIME' | 'SECOND_HALF' | 'EXTRA_TIME' | 'PENALTIES' | 'POST_MATCH';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  flagUrl?: string;
  score: number;
}

export interface MatchTimelineEvent {
  id: string;
  minute: number;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'SUBSTITUTION' | 'PENALTY' | 'VAR' | 'KICKOFF' | 'HALF_TIME_WHISTLE' | 'FULL_TIME_WHISTLE';
  detail: string;
  teamId?: string;
  playerId?: string;
  playerName?: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  currentPhase: MatchPhase;
  currentMinute: number;
  stoppageTimeMinutes: number;
  venueName: string;
  kickoffTime: string; // ISO string
  timelineEvents: MatchTimelineEvent[];
}
