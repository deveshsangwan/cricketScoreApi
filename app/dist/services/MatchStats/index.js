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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStats = void 0;
const LiveMatches_1 = require("@services/LiveMatches");
const Utils_1 = require("@utils/Utils");
const mongo = __importStar(require("@core/BaseModel"));
const Logger_1 = require("@core/Logger");
const _errors_1 = require("@errors");
const MatchUtils_1 = require("./MatchUtils");
const underscore_1 = __importDefault(require("underscore"));
class MatchStats {
    tableName;
    liveMatchesObj;
    utilsObj;
    constructor() {
        this.tableName = 'matchstats';
        this.liveMatchesObj = new LiveMatches_1.LiveMatches();
        this.utilsObj = new Utils_1.Utils();
    }
    async getMatchStats(matchId) {
        try {
            if (!matchId) {
                throw new _errors_1.MatchIdRequriedError();
            }
            // matchId should be 0 or alphanumeric string of length 16
            if (matchId !== '0' && !matchId.match(/^[a-zA-Z0-9]{16}$/)) {
                throw new _errors_1.InvalidMatchIdError(matchId);
            }
            const liveMatchesResponse = await this.liveMatchesObj.getMatches(matchId);
            // If matchId is not '0', get stats for the single match
            // Otherwise, get stats for all matches
            if (matchId !== '0') {
                return this.getStatsForSingleMatch(liveMatchesResponse, matchId);
            }
            return this.getStatsForAllMatches(liveMatchesResponse);
        }
        catch (error) {
            (0, Logger_1.writeLogError)(['matchStats | getMatchStats | error', error]);
            throw error; // re-throw the original error
        }
    }
    async getStatsForAllMatches(liveMatchesResponse) {
        // Fetch all data from the database at once
        const allMongoData = await mongo.findAll(this.tableName);
        const dataPromises = Object.entries(liveMatchesResponse).map(async ([matchId, match]) => {
            let scrapedData = await this.scrapeData(match.matchUrl, matchId);
            scrapedData = { ...scrapedData, matchName: match.matchName };
            // Check if data already exists in the fetched data
            const mongoData = allMongoData.find((data) => data.id === matchId);
            if (!mongoData) {
                await this.utilsObj.insertDataToMatchStatsTable(scrapedData, matchId);
            }
            return { ...scrapedData, matchId: matchId };
        });
        const data = await Promise.all(dataPromises);
        if (!data.length) {
            throw new _errors_1.NoMatchesFoundError();
        }
        return data;
    }
    async getStatsForSingleMatch(liveMatchesResponse, matchId) {
        const mongoData = await mongo.findById(matchId, this.tableName);
        if (mongoData) {
            // Only add the properties you need
            const returnObj = {
                matchId: mongoData.id,
                team1: mongoData.team1,
                team2: mongoData.team2,
                onBatting: mongoData.onBatting,
                runRate: mongoData.runRate,
                summary: mongoData.summary,
                tournamentName: mongoData.tournamentName,
                matchName: mongoData.matchName,
                isLive: mongoData.isLive,
            };
            return returnObj;
        }
        else if (underscore_1.default.has(liveMatchesResponse, 'matchId')) {
            const url = liveMatchesResponse.matchUrl;
            let scrapedData = await this.scrapeData(url, matchId);
            scrapedData = { ...scrapedData, matchName: liveMatchesResponse.matchName };
            await this.utilsObj.insertDataToMatchStatsTable(scrapedData);
            return scrapedData;
        }
        return {};
    }
    async scrapeData(url, matchId) {
        try {
            if (!matchId) {
                throw new _errors_1.MatchIdRequriedError();
            }
            url = 'https://www.cricbuzz.com' + url;
            const response = await this.utilsObj.fetchData(url);
            const tournamentName = await this.getTournamentName(response);
            const finalResponse = this.getMatchStatsByMatchId(response, matchId);
            finalResponse['tournamentName'] = tournamentName;
            return Promise.resolve(finalResponse);
        }
        catch (error) {
            (0, Logger_1.writeLogError)(['matchStats | scrapeData |', error, url]);
            throw error;
        }
    }
    async getTournamentName($) {
        try {
            const elements = $('.cb-col.cb-col-100.cb-bg-white');
            if (elements.length === 0) {
                throw new Error('No elements found with the selector .cb-col.cb-col-100.cb-bg-white');
            }
            const tournamentNames = elements.map((_, el) => $(el).find('a').attr('title')).get();
            return tournamentNames[0];
        }
        catch (error) {
            throw new Error(`Error while fetching tournament name: ${error.message}`);
        }
    }
    getMatchStatsByMatchId($, matchId) {
        try {
            const isLive = this._getIsLiveStatus($);
            const runRate = (0, MatchUtils_1.getRunRate)($);
            console.log('Run Rate:', runRate);
            const currentTeamScoreString = (0, MatchUtils_1.getTeamScoreString)($, isLive, true);
            const otherTeamScoreString = (0, MatchUtils_1.getTeamScoreString)($, isLive, false);
            const matchData = {
                matchId: matchId,
                team1: (0, MatchUtils_1.getTeamData)(currentTeamScoreString, true),
                team2: (0, MatchUtils_1.getTeamData)(otherTeamScoreString),
                onBatting: {
                    player1: (0, MatchUtils_1.getBatsmanData)($, 0),
                    player2: (0, MatchUtils_1.getBatsmanData)($, 1),
                },
                runRate: runRate,
                summary: this._getSummary($),
                isLive: isLive,
            };
            return matchData;
        }
        catch (error) {
            (0, Logger_1.writeLogError)(['matchStats | getMatchStatsByMatchId |', error]);
            throw error;
        }
    }
    _getIsLiveStatus($) {
        return $('div.cb-text-complete').length === 0;
    }
    _getSummary($) {
        return $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim();
    }
}
exports.MatchStats = MatchStats;
//# sourceMappingURL=index.js.map