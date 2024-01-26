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
class MatchStats {
    constructor(matchId = "0") {
        this.matchId = matchId;
        this.tableName = 'matchStats';
        this.liveMatchesObj = new LiveMatches_1.LiveMatches();
        this.utilsObj = new Utils_1.Utils();
    }
    getMatchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const liveMatchesResponse = yield this.liveMatchesObj.getMatches(this.matchId);
                if (this.matchId === "0") {
                    return this.getStatsForAllMatches(liveMatchesResponse);
                }
                else if (this.matchId) {
                    return this.getStatsForSingleMatch(liveMatchesResponse);
                }
                throw new Error('Invalid request');
            }
            catch (error) {
                (0, logger_1.writeLogError)(['matchStats | getMatchStats | error', error]);
                throw new Error("Something went wrong");
            }
        });
    }
    getStatsForAllMatches(liveMatchesResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataPromises = Object.entries(liveMatchesResponse).map(([matchId, match]) => __awaiter(this, void 0, void 0, function* () {
                const scrapedData = yield this.scrapeData(match.matchUrl);
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
                return 'No matches found';
            }
            return data;
        });
    }
    getStatsForSingleMatch(liveMatchesResponse) {
        return __awaiter(this, void 0, void 0, function* () {
            let mongoData = yield mongo.findById(this.matchId, this.tableName);
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
                const scrapedData = yield this.scrapeData(url);
                _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
                yield this.utilsObj.insertDataToMatchStatsTable(scrapedData);
                return scrapedData;
            }
            return 'Match Id is invalid';
        });
    }
    scrapeData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.matchId)
                    return Promise.resolve('Match Id is required');
                url = 'https://www.cricbuzz.com' + url;
                const response = yield this.utilsObj.fetchData(url);
                let tournamentName = yield this.getTournamentName(response);
                let finalResponse = yield this.getMatchStatsByMatchId(response);
                finalResponse['tournamentName'] = tournamentName;
                return Promise.resolve(finalResponse);
            }
            catch (error) {
                (0, logger_1.writeLogError)(['matchStats | scrapeData |', error]);
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
    getMatchStatsByMatchId($) {
        let matchData = {};
        try {
            let currentTeamScoreString = $('span.cb-font-20.text-bold').text().trim();
            let otherTeamScoreString = $('div.cb-text-gray.cb-font-16').text().trim();
            const currentTeamDataArray = this.getTeamData(currentTeamScoreString);
            const otherTeamDataArray = this.getTeamData(otherTeamScoreString);
            matchData = {
                matchId: this.matchId,
                team1: this.getTeamObject(currentTeamDataArray, true),
                team2: this.getTeamObject(otherTeamDataArray, false),
                onBatting: {
                    player1: this.getBatsmanData($, 0),
                    player2: this.getBatsmanData($, 1)
                },
                summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
            };
            this.addPreviousInningsData(matchData, currentTeamDataArray, 'team1');
            this.addPreviousInningsData(matchData, otherTeamDataArray, 'team2');
            return Promise.resolve(matchData);
        }
        catch (error) {
            (0, logger_1.writeLogError)(['matchStats | getMatchStatsByMatchId |', error]);
            throw error;
        }
    }
    getTeamData(scoreString) {
        return scoreString.includes('&') ? this.parseTeamDataForTestMatches(scoreString) : scoreString.split(/[/\s/\-/\(/\)]/).filter(Boolean);
    }
    getTeamObject(teamDataArray, isBatting) {
        return !teamDataArray[0] ? {} : {
            isBatting: isBatting,
            name: teamDataArray[0],
            score: teamDataArray[1],
            overs: teamDataArray.length > 3 ? teamDataArray[3] : teamDataArray[2],
            wickets: teamDataArray.length > 3 ? teamDataArray[2] : "10",
        };
    }
    getBatsmanData($, index) {
        return {
            name: $('div.cb-col.cb-col-50').eq(index + 1).find('a').text(),
            runs: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2).text(),
            balls: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2 + 1).text()
        };
    }
    addPreviousInningsData(matchData, teamDataArray, team) {
        if (teamDataArray.length > 4) {
            matchData[team]['previousInnings'] = {
                runs: teamDataArray[0],
                wickets: teamDataArray.length > 1 ? teamDataArray[1] : "10"
            };
        }
    }
    parseTeamDataForTestMatches(scoreString) {
        // Regular expression pattern to capture team name, score, wickets, and overs
        const pattern = /([A-Za-z\s]+)\s+(\d+(?:\/\d+)?)(?:\s+&\s+(\d+\/\d+\s+\(\d+(?:\.\d+)?\)))?/;
        let teamName = "", firstInnings = "", secondInnings = "", firstInningsData = [], secondInningsData = [];
        const matchData = scoreString.match(pattern);
        if (matchData) {
            [, teamName, firstInnings, secondInnings] = matchData;
            // Process first innings
            firstInningsData = firstInnings.split(/[/\s/\-/\(/\)]/).filter(Boolean);
            // Process second innings if present
            if (secondInnings) {
                secondInningsData = secondInnings.split(/[/\s/\-/\(/\)]/).filter(Boolean);
            }
        }
        else {
            (0, logger_1.writeLogError)(["Invalid score format"]);
        }
        return secondInningsData.length > 0 ? [teamName, ...secondInningsData, firstInningsData] : [teamName, ...firstInningsData];
    }
}
exports.MatchStats = MatchStats;
