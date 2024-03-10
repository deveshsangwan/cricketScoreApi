"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LiveMatches_1 = require("./LiveMatches");
const MatchStats_1 = require("./MatchStats");
const live = async (_req, res) => {
    try {
        const liveMatchesObj = new LiveMatches_1.LiveMatches();
        const liveMatchesResponse = await liveMatchesObj.getMatches();
        return res.status(200).send({
            status: true,
            message: 'Live Matches',
            response: liveMatchesResponse
        });
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching live matches',
            error: error.message
        });
    }
};
const matchStats = async (req, res) => {
    try {
        const matchId = req.params.matchId;
        const matchStatsObj = new MatchStats_1.MatchStats();
        const matchStatsResponse = await matchStatsObj.getMatchStats(matchId);
        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse
        });
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: error.message
        });
    }
};
const getMatchStats = async (_req, res) => {
    try {
        const matchStatsObj = new MatchStats_1.MatchStats();
        const matchStatsResponse = await matchStatsObj.getMatchStats('0');
        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse
        });
    }
    catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: error.message
        });
    }
};
module.exports = {
    live,
    matchStats,
    getMatchStats
};
//# sourceMappingURL=controller.js.map