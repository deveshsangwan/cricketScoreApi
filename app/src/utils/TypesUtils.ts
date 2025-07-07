import type { LiveMatchesResponse, MatchStatsResponse } from '@types';

export function isError(error: any): error is Error {
    return error instanceof Error;
}

export function isMatchStatsResponse(data: any): data is MatchStatsResponse {
    return data.matchId && data.team1 && data.team2 && data.onBatting && data.runRate && data.summary && data.isLive && data.matchCommentary && data.keyStats;
}

export function isLiveMatchesResponse(data: any): data is LiveMatchesResponse {
    return data.matchUrl && data.matchName && (data.id || data.matchId);
}