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
const LiveMatches_1 = require("./LiveMatches/LiveMatches");
const MatchStats_1 = require("./MatchStats/MatchStats");
const live = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const liveMatchesObj = new LiveMatches_1.LiveMatches();
    const liveMatchesResponse = yield liveMatchesObj.getMatches();
    return res.status(200).send({
        status: true,
        message: 'Live Matches',
        response: liveMatchesResponse
    });
});
const matchStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const matchId = req.params.matchId;
    console.log('matchId', matchId);
    const matchStatsObj = new MatchStats_1.MatchStats(matchId);
    const matchStatsResponse = yield matchStatsObj.getMatchStats();
    return res.status(200).send({
        status: true,
        message: 'Match Stats',
        response: matchStatsResponse
    });
});
const live1 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const matchStatsObj = new MatchStats_1.MatchStats();
    const matchStatsResponse = yield matchStatsObj.getMatchStats();
    return res.status(200).send({
        status: true,
        message: 'Match Stats',
        response: matchStatsResponse
    });
});
module.exports = {
    live,
    matchStats,
    live1
};
