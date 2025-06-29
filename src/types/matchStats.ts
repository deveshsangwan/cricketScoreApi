interface Player {
  name: string;
  runs: string;
  balls: string;
}

interface Team {
  isBatting: boolean;
  name: string;
  score: string;
  wickets: string;
  overs?: string;
}

export interface MatchStats {
  matchId: string;
  team1: Team;
  team2: Team;
  onBatting?: {
    player1: Player;
    player2: Player;
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