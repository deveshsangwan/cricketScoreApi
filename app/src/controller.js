"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const LiveMatches_1 = require("./LiveMatches");
const MatchStats_1 = require("./MatchStats");
const live = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const liveMatchesObj = new LiveMatches_1.LiveMatches();
        const liveMatchesResponse = yield liveMatchesObj.getMatches();
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
});
const matchStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matchId = req.params.matchId;
        const matchStatsObj = new MatchStats_1.MatchStats(matchId);
        const matchStatsResponse = yield matchStatsObj.getMatchStats();
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
});
const getMatchStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const matchStatsObj = new MatchStats_1.MatchStats();
        const matchStatsResponse = yield matchStatsObj.getMatchStats();
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
});
module.exports = {
    live,
    matchStats,
    getMatchStats
};
