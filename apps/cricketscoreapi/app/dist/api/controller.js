"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LiveMatches_1 = require("@services/LiveMatches");
const MatchStats_1 = require("@services/MatchStats");
const TypesUtils_1 = require("@/utils/TypesUtils");
const Logger_1 = require("@core/Logger");
const live = async (_req, res) => {
    const startTime = Date.now();
    (0, Logger_1.writeLogDebug)(['Controller: live - Starting live matches request']);
    try {
        const liveMatchesObj = new LiveMatches_1.LiveMatches();
        (0, Logger_1.writeLogDebug)(['Controller: live - Created LiveMatches instance']);
        const liveMatchesResponse = (await liveMatchesObj.getMatches());
        const duration = Date.now() - startTime;
        (0, Logger_1.writeLogDebug)([
            'Controller: live - Successfully fetched live matches',
            {
                matchCount: Array.isArray(liveMatchesResponse)
                    ? liveMatchesResponse.length
                    : Object.keys(liveMatchesResponse).length,
                duration: `${duration}ms`,
            },
        ]);
        (0, Logger_1.logServiceOperation)('LiveMatches', 'getMatches', true, duration);
        return res.status(200).send({
            status: true,
            message: 'Live Matches',
            response: liveMatchesResponse,
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, Logger_1.writeLogError)(['Controller: live - Error fetching live matches', error]);
        (0, Logger_1.logServiceOperation)('LiveMatches', 'getMatches', false, duration, {
            error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
        });
        return res.status(500).send({
            status: false,
            message: 'Error fetching live matches',
            error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
        });
    }
};
const matchStats = async (req, res) => {
    const startTime = Date.now();
    const matchId = req.params.matchId;
    (0, Logger_1.writeLogDebug)(['Controller: matchStats - Starting match stats request', { matchId }]);
    try {
        const matchStatsObj = new MatchStats_1.MatchStats();
        (0, Logger_1.writeLogDebug)(['Controller: matchStats - Created MatchStats instance']);
        if (!(0, TypesUtils_1.isString)(matchId)) {
            (0, Logger_1.writeLogError)([
                'Controller: matchStats - Invalid match ID type',
                { matchId, type: typeof matchId },
            ]);
            return res.status(400).send({
                status: false,
                message: 'Invalid match ID',
            });
        }
        (0, Logger_1.writeLogDebug)(['Controller: matchStats - Fetching match stats for ID', matchId]);
        const matchStatsResponse = (await matchStatsObj.getMatchStats(matchId));
        const duration = Date.now() - startTime;
        (0, Logger_1.writeLogDebug)([
            'Controller: matchStats - Successfully fetched match stats',
            {
                matchId,
                duration: `${duration}ms`,
                hasData: !!matchStatsResponse,
            },
        ]);
        (0, Logger_1.logServiceOperation)('MatchStats', 'getMatchStats', true, duration, { matchId });
        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse,
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, Logger_1.writeLogError)(['Controller: matchStats - Error fetching match stats', { matchId, error }]);
        (0, Logger_1.logServiceOperation)('MatchStats', 'getMatchStats', false, duration, {
            matchId,
            error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
        });
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
        });
    }
};
const getMatchStats = async (_req, res) => {
    const startTime = Date.now();
    (0, Logger_1.writeLogDebug)(['Controller: getMatchStats - Starting all match stats request']);
    try {
        const matchStatsObj = new MatchStats_1.MatchStats();
        (0, Logger_1.writeLogDebug)(['Controller: getMatchStats - Created MatchStats instance']);
        const matchStatsResponse = (await matchStatsObj.getMatchStats('0'));
        const duration = Date.now() - startTime;
        (0, Logger_1.writeLogDebug)([
            'Controller: getMatchStats - Successfully fetched all match stats',
            {
                duration: `${duration}ms`,
                hasData: !!matchStatsResponse,
            },
        ]);
        (0, Logger_1.logServiceOperation)('MatchStats', 'getAllMatchStats', true, duration);
        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse,
        });
    }
    catch (error) {
        const duration = Date.now() - startTime;
        (0, Logger_1.writeLogError)(['Controller: getMatchStats - Error fetching all match stats', error]);
        (0, Logger_1.logServiceOperation)('MatchStats', 'getAllMatchStats', false, duration, {
            error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
        });
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
        });
    }
};
exports.default = {
    live,
    matchStats,
    getMatchStats,
};
//# sourceMappingURL=controller.js.map