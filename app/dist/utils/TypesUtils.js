"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = isError;
exports.isMatchStatsResponse = isMatchStatsResponse;
exports.isLiveMatchesResponse = isLiveMatchesResponse;
exports.isString = isString;
function isError(error) {
    return error instanceof Error;
}
function isMatchStatsResponse(data) {
    return (data.matchId &&
        data.team1 &&
        data.team2 &&
        data.onBatting &&
        data.runRate &&
        data.summary &&
        data.isLive &&
        data.matchCommentary &&
        data.keyStats);
}
function isLiveMatchesResponse(data) {
    return data.matchUrl && data.matchName && (data.id || data.matchId);
}
function isString(data) {
    return typeof data === 'string';
}
//# sourceMappingURL=TypesUtils.js.map