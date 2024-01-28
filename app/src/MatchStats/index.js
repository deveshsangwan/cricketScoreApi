"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.MatchStats = void 0;
const LiveMatches_1 = require("../LiveMatches");
const Utils_1 = require("../Utils");
const mongo = __importStar(require("../../core/baseModel"));
const logger_1 = require("../../core/logger");
const errors_1 = require("../errors");
const MatchUtils_1 = require("./MatchUtils");
const _ = require('underscore');
class MatchStats {
    constructor() {
        this.tableName = 'matchStats';
        this.liveMatchesObj = new LiveMatches_1.LiveMatches();
        this.utilsObj = new Utils_1.Utils();
    }
    getMatchStats(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!matchId) {
                    throw new errors_1.MatchIdRequriedError();
                }
                // matchId should be 0 or alphanumeric string of length 16
                if (matchId !== "0" && !matchId.match(/^[a-zA-Z0-9]{16}$/)) {
                    throw new errors_1.InvalidMatchIdError(matchId);
                }
                const liveMatchesResponse = yield this.liveMatchesObj.getMatches(matchId);
                // If matchId is not "0", get stats for the single match
                // Otherwise, get stats for all matches
                if (matchId !== "0") {
                    return this.getStatsForSingleMatch(liveMatchesResponse, matchId);
                }
                return this.getStatsForAllMatches(liveMatchesResponse);
            }
            catch (error) {
                (0, logger_1.writeLogError)(['matchStats | getMatchStats | error', error]);
                throw error; // re-throw the original error
            }
        });
    }
    getStatsForAllMatches(liveMatchesResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch all data from the database at once
            const allMongoData = yield mongo.findAll(this.tableName);
            const dataPromises = Object.entries(liveMatchesResponse).map(([matchId, match]) => __awaiter(this, void 0, void 0, function* () {
                const scrapedData = yield this.scrapeData(match.matchUrl, matchId);
                _.extend(scrapedData, { matchName: match.matchName });
                // Check if data already exists in the fetched data
                const mongoData = allMongoData.find(data => data._id === matchId);
                if (!mongoData) {
                    yield this.utilsObj.insertDataToMatchStatsTable(scrapedData, matchId);
                }
                return Object.assign(Object.assign({}, scrapedData), { matchId: matchId });
            }));
            const data = yield Promise.all(dataPromises);
            if (!data.length) {
                throw new errors_1.NoMatchesFoundError();
            }
            return data;
        });
    }
    getStatsForSingleMatch(liveMatchesResponse, matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongoData = yield mongo.findById(matchId, this.tableName);
            if (mongoData.length) {
                // Only add the properties you need
                const returnObj = {
                    matchId: mongoData[0]._id,
                    team1: mongoData[0].team1,
                    team2: mongoData[0].team2,
                    onBatting: mongoData[0].onBatting,
                    summary: mongoData[0].summary,
                    tournamentName: mongoData[0].tournamentName,
                    matchName: mongoData[0].matchName
                };
                return returnObj;
            }
            else if (_.has(liveMatchesResponse, 'matchId')) {
                const url = liveMatchesResponse.matchUrl;
                const scrapedData = yield this.scrapeData(url, matchId);
                _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
                yield this.utilsObj.insertDataToMatchStatsTable(scrapedData);
                return scrapedData;
            }
            return 'Match Id is invalid';
        });
    }
    scrapeData(url, matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!matchId)
                    return Promise.resolve('Match Id is required');
                url = 'https://www.cricbuzz.com' + url;
                const response = yield this.utilsObj.fetchData(url);
                let tournamentName = yield this.getTournamentName(response);
                let finalResponse = yield this.getMatchStatsByMatchId(response, matchId);
                finalResponse['tournamentName'] = tournamentName;
                return Promise.resolve(finalResponse);
            }
            catch (error) {
                (0, logger_1.writeLogError)(['matchStats | scrapeData |', error, url]);
                return Promise.reject(error);
            }
        });
    }
    getTournamentName($) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const elements = $('.cb-col.cb-col-100.cb-bg-white');
                if (elements.length === 0) {
                    throw new Error('No elements found with the selector .cb-col.cb-col-100.cb-bg-white');
                }
                const tournamentNames = elements.map((i, el) => $(el).find('a').attr('title')).get();
                return tournamentNames[0];
            }
            catch (error) {
                throw new Error(`Error while fetching tournament name: ${error.message}`);
            }
        });
    }
    getMatchStatsByMatchId($, matchId) {
        return new Promise((resolve, reject) => {
            try {
                let isLive = $('div.cb-text-complete').length === 0;
                let currentTeamScoreString = (0, MatchUtils_1.getTeamScoreString)($, isLive, true);
                let otherTeamScoreString = (0, MatchUtils_1.getTeamScoreString)($, isLive, false);
                let matchData = {
                    matchId: matchId,
                    team1: (0, MatchUtils_1.getTeamData)(currentTeamScoreString, true),
                    team2: (0, MatchUtils_1.getTeamData)(otherTeamScoreString),
                    onBatting: {
                        player1: (0, MatchUtils_1.getBatsmanData)($, 0),
                        player2: (0, MatchUtils_1.getBatsmanData)($, 1)
                    },
                    summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
                };
                resolve(matchData);
            }
            catch (error) {
                (0, logger_1.writeLogError)(['matchStats | getMatchStatsByMatchId |', error]);
                reject(error);
            }
        });
    }
}
exports.MatchStats = MatchStats;
