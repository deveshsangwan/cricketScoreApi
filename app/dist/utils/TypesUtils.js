"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isError = isError;
exports.isMatchStatsResponse = isMatchStatsResponse;
exports.isLiveMatchesResponse = isLiveMatchesResponse;
function isError(error) {
    return error instanceof Error;
}
function isMatchStatsResponse(data) {
    return data.matchId && data.team1 && data.team2 && data.onBatting && data.runRate && data.summary && data.isLive && data.matchCommentary && data.keyStats;
}
function isLiveMatchesResponse(data) {
    return data.matchUrl && data.matchName && (data.id || data.matchId);
}
//# sourceMappingURL=TypesUtils.js.map