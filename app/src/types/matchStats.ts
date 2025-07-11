/**
 * Match ID
 * format is random string of length 16
 * @pattern ^[a-zA-Z0-9]{16}$
 * @length 16
 */
type matchId = string;

export interface MatchStatsParams {
    matchId: matchId;
}

export interface LiveMatchesResponse {
    matchUrl: string;
    matchName: string;
    matchId: matchId;
}

export interface IPreviousInnings {
    score: string;
    wickets: string;
}

export interface ITeamData {
    isBatting: boolean;
    name: string;
    score: string;
    overs?: string;
    wickets: string;
    previousInnings?: IPreviousInnings;
}

export interface MatchStatsResponse {
    matchId?: matchId;
    isLive?: boolean;
    team1: ITeamData;
    team2: ITeamData;
    onBatting: {
        player1: PlayerData;
        player2: PlayerData;
    };
    runRate?: RunRateData;
    summary: string;
    tournamentName?: string;
    matchName?: string;
    matchCommentary?: CommentaryData[];
    keyStats: { [key: string]: string };
}

export interface PlayerData {
    name: string;
    runs: string;
    balls: string;
}

export interface RunRateData {
    currentRunRate: number;
    requiredRunRate: number;
}

export interface CommentaryData {
    over?: string;
    commentary: string;
    hasOver: boolean;
}
