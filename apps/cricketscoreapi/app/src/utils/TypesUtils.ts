import type { MatchData, MatchStatsResponse } from '@types';

export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

export function isMatchStatsResponse(data: unknown): data is MatchStatsResponse {
    return (
        typeof data === 'object' &&
        data !== null &&
        'matchId' in data &&
        'team1' in data &&
        'team2' in data &&
        'onBatting' in data &&
        'runRate' in data &&
        'summary' in data &&
        'isLive' in data &&
        'matchCommentary' in data &&
        'keyStats' in data
    );
}

export function isLiveMatchesResponse(data: unknown): data is MatchData {
    return (
        typeof data === 'object' &&
        data !== null &&
        'matchUrl' in data &&
        'matchName' in data &&
        ('id' in data || 'matchId' in data)
    );
}

export function isString(data: any): data is string {
    return typeof data === 'string';
}
