// src/types/api.ts

// Base API response wrapper
export interface ApiResponse<T> {
  response: T;
  status: 'success' | 'error';
  message?: string;
  timestamp?: string;
}

// Error handling types
export interface ApiError {
  message: string;
  code?: string | number;
  details?: Record<string, unknown>;
}

// Authentication types
export interface AuthenticatedRequest {
  headers: {
    Authorization: string;
  };
}

// Match-related types
export interface Match {
  matchId: string;
  matchName: string;
  matchUrl: string;
}

export interface LiveMatchesResponse {
  [matchId: string]: {
    matchName: string;
    matchUrl: string;
  };
}

// Player types
export interface Player {
  name: string;
  runs: string | number;
  balls: string | number;
  strikeRate?: number;
  fours?: number;
  sixes?: number;
}

export interface DetailedPlayer extends Player {
  isStriker?: boolean;
  isNotOut?: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'not-out';
}

// Team types
export interface Team {
  name: string;
  score: string | number;
  wickets: string | number;
  overs?: string | number;
  isBatting: boolean;
  extras?: {
    byes?: number;
    legByes?: number;
    wides?: number;
    noBalls?: number;
    penalties?: number;
    total?: number;
  };
}

// Match statistics types
export interface RunRate {
  currentRunRate: number;
  requiredRunRate?: number;
  targetRunRate?: number;
}

export interface CurrentBatting {
  player1: DetailedPlayer;
  player2: DetailedPlayer;
}

export interface MatchSummary {
  text: string;
  type: 'info' | 'result' | 'toss' | 'weather';
}

// Main match stats interface (enhanced version of the existing one)
export interface MatchStats {
  matchId: string;
  matchName: string;
  tournamentName: string;
  team1: Team;
  team2: Team;
  onBatting?: CurrentBatting;
  runRate?: RunRate;
  summary: string;
  isLive: boolean;
  matchType?: 'Test' | 'ODI' | 'T20' | 'T10';
  venue?: string;
  weather?: string;
  tossWinner?: string;
  tossDecision?: 'bat' | 'bowl';
  target?: number;
  ballsRemaining?: number;
  requiredRuns?: number;
  lastUpdated?: string;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
}

// Utility types for API operations
export type FetchState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: ApiError };

// Hook return types
export interface UseMatchesReturn {
  matches: Match[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseMatchStatsReturn {
  matchStats: MatchStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} 