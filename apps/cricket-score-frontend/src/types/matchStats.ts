// src/types/matchStats.ts
// Re-export types from the main API types file for backward compatibility
export type { 
  MatchStats, 
  Team, 
  Player, 
  DetailedPlayer, 
  RunRate, 
  CurrentBatting 
} from './api';

// Legacy types - keeping for backward compatibility
// These can be removed once all components are updated
interface LegacyPlayer {
  name: string;
  runs: string;
  balls: string;
}

interface LegacyTeam {
  isBatting: boolean;
  name: string;
  score: string;
  wickets: string;
  overs?: string;
}

export interface LegacyMatchStats {
  matchId: string;
  team1: LegacyTeam;
  team2: LegacyTeam;
  onBatting?: {
    player1: LegacyPlayer;
    player2: LegacyPlayer;
  };
  runRate?: {
    currentRunRate: number;
    requiredRunRate: number;
  };
  summary: string;
  isLive: boolean;
  tournamentName: string;
  matchName: string;
} 