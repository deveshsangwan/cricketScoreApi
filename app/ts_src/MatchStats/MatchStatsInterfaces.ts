export interface LiveMatchesResponse {
    matchUrl?: string;
    matchName?: string;
    matchId?: string;
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

export interface MatchData {
    matchId: string;
    isLive: boolean;
    team1: ITeamData | {};
    team2: ITeamData | {};
    onBatting: {
        player1: any;
        player2: any;
    };
    summary: string;
}