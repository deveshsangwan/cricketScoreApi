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
exports.MatchStats = void 0;
const LiveMatches_1 = require("./LiveMatches");
const Utils_1 = require("./Utils");
const mongo = require('../core/baseModel');
const _ = require('underscore');
const logger_1 = require("../core/logger");
const errors_1 = require("./errors");
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
            const dataPromises = Object.entries(liveMatchesResponse).map(([matchId, match]) => __awaiter(this, void 0, void 0, function* () {
                const scrapedData = yield this.scrapeData(match.matchUrl, matchId);
                _.extend(scrapedData, { matchName: match.matchName });
                // save data to db if not already exists
                const mongoData = yield mongo.findById(matchId, this.tableName);
                if (!mongoData.length) {
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
                // create a deep copy of the object and delete unwanted properties mongoData[0]
                const returnObj = JSON.parse(JSON.stringify(mongoData[0]));
                returnObj['matchId'] = returnObj['_id'];
                delete returnObj['_id'];
                delete returnObj['__v'];
                delete returnObj['createdAt'];
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
        let matchData = {};
        try {
            // if live match 'span.cb-font-20.text-bold' else 'h2.cb-col.cb-col-100.cb-min-tm.ng-binding'
            let isLive = $('div.cb-text-complete').length === 0;
            let currentTeamElement = isLive ? $('span.cb-font-20.text-bold') : $('div.cb-col.cb-col-100.cb-min-tm').eq(1);
            let currentTeamScoreString = currentTeamElement.text().trim();
            let otherTeamElement = isLive ? $('div.cb-text-gray.cb-font-16') : $('div.cb-col.cb-col-100.cb-min-tm.cb-text-gray');
            let otherTeamScoreString = otherTeamElement.text().trim();
            matchData = {
                matchId: matchId,
                team1: this.getTeamData(currentTeamScoreString, true),
                team2: this.getTeamData(otherTeamScoreString),
                onBatting: {
                    player1: this.getBatsmanData($, 0),
                    player2: this.getBatsmanData($, 1)
                },
                summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
            };
            return Promise.resolve(matchData);
        }
        catch (error) {
            (0, logger_1.writeLogError)(['matchStats | getMatchStatsByMatchId |', error]);
            throw error;
        }
    }
    getTeamData(input, isBatting = false) {
        const regex = /(\w+)\s+(\d+)(?:\/(\d+))?(?:\s*&\s*(\d+)(?:\/(\d+))?)?(?:\s*\(\s*([\d.]+)\s*\))?/;
        const match = input.match(regex);
        if (!match) {
            (0, logger_1.writeLogInfo)(['matchStats | getTeamData | input', input]);
            return {};
        }
        const [, name, score1, wickets1, score2, wickets2, overs] = match;
        let score, wickets, previousInnings;
        if (score2 !== undefined) {
            // Two innings scenario
            score = score2;
            wickets = wickets2 !== undefined ? wickets2 : "10"; // If wickets are not provided, assume 10 wickets (all out)
            previousInnings = { score: score1, wickets: wickets1 || "10" };
        }
        else {
            // Single innings scenario
            score = score1;
            wickets = wickets1 !== undefined ? wickets1 : "10"; // If wickets are not provided, assume 10 wickets (all out)
        }
        const result = { name, score, wickets, isBatting: isBatting };
        if (overs && parseFloat(overs) > 0) {
            result.overs = overs;
        }
        if (previousInnings) {
            result.previousInnings = { score: previousInnings.score, wickets: previousInnings.wickets };
        }
        // Remove undefined and 0 overs properties
        Object.keys(result).forEach(key => (result[key] === undefined || (key === "overs" && result[key] === "0")) && delete result[key]);
        return result;
    }
    getBatsmanData($, index) {
        return {
            name: $('div.cb-col.cb-col-50').eq(index + 1).find('a').text(),
            runs: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2).text(),
            balls: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2 + 1).text()
        };
    }
}
exports.MatchStats = MatchStats;
