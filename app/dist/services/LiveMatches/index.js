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
exports.LiveMatches = void 0;
const Utils_1 = require("@utils/Utils");
const Logger_1 = require("@core/Logger");
const LiveMatchesUtility_1 = require("./LiveMatchesUtility");
const _errors_1 = require("@errors");
const mongo = __importStar(require("@core/BaseModel"));
const randomstring_1 = __importDefault(require("randomstring"));
const TypesUtils_1 = require("@/utils/TypesUtils");
const MATCH_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';
/**
 * Class responsible for handling live cricket match data
 * Fetches and processes live match information from Cricbuzz
 */
class LiveMatches {
    tableName;
    utilsObj;
    MATCH_ID_LENGTH = 16;
    constructor() {
        this.tableName = 'livematches';
        this.utilsObj = new Utils_1.Utils();
    }
    /**
     * Handles error logging and rejection
     * @param location - Location where error occurred for logging
     * @param error - Error object to be handled
     * @returns Rejected promise with CustomError
     */
    handleError(location, error) {
        (0, Logger_1.writeLogError)([`${location} | error`, error]);
        return Promise.reject(new _errors_1.CustomError(error.message));
    }
    /**
     * Gets match data either for a specific match or all matches
     * @param matchId - Optional ID of specific match to fetch (defaults to '0' for all matches)
     * @returns Promise resolving to match data
     */
    async getMatches(matchId = '0') {
        if (matchId !== '0') {
            return this.getMatchById(matchId);
        }
        return this.getAllMatches();
    }
    async getMatchById(matchId) {
        try {
            const mongoData = await mongo.findById(matchId, this.tableName);
            if (mongoData && (0, TypesUtils_1.isLiveMatchesResponse)(mongoData)) {
                return {
                    matchId: mongoData.id,
                    matchUrl: mongoData.matchUrl,
                    matchName: mongoData.matchName,
                };
            }
            else {
                throw new Error(`No match found with id: ${matchId}`);
            }
        }
        catch (error) {
            return this.handleError('LiveMatches | getMatchById', (0, TypesUtils_1.isError)(error) ? error : new Error('Unknown error'));
        }
    }
    async getAllMatches() {
        try {
            const mongoData = await mongo.findAll(this.tableName);
            return this.scrapeData(mongoData);
        }
        catch (error) {
            return this.handleError('LiveMatches | getAllMatches', (0, TypesUtils_1.isError)(error) ? error : new Error('Unknown error'));
        }
    }
    async scrapeData(mongoData) {
        try {
            const response = await this.utilsObj.fetchData(MATCH_URL);
            let matchesData = this.processData(response, mongoData);
            await (0, LiveMatchesUtility_1.insertDataToLiveMatchesTable)(matchesData[1]);
            let mergedMatchesData = { ...matchesData[0], ...matchesData[1] };
            return mergedMatchesData;
        }
        catch (error) {
            return this.handleError('LiveMatches | scrapeData', (0, TypesUtils_1.isError)(error) ? error : new Error('Unknown error'));
        }
    }
    /**
     * Processes HTML data to extract match information
     * @param $ - Cheerio instance containing parsed HTML
     * @param mongoData - Existing match data from database
     * @returns Tuple of [existing matches, new matches]
     * @throws Error if no matches are found
     */
    processData($, mongoData) {
        const existingMatches = {};
        const newMatches = {};
        const extractMatchInfo = (el) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            return { matchUrl, matchName };
        };
        const handleExistingMatch = (existingMatch, matchUrl, matchName) => {
            existingMatches[existingMatch.id] = { matchUrl, matchName, matchId: existingMatch.id };
        };
        const handleNewMatch = (matchUrl, matchName) => {
            const matchId = randomstring_1.default.generate({
                length: this.MATCH_ID_LENGTH,
                charset: 'alphanumeric',
            });
            newMatches[matchId] = { matchUrl, matchName, matchId };
        };
        $('.cb-col-100 .cb-col .cb-schdl').each((_, el) => {
            const { matchUrl, matchName } = extractMatchInfo(el);
            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);
                if (existingMatch) {
                    handleExistingMatch(existingMatch, matchUrl, matchName);
                }
                else {
                    handleNewMatch(matchUrl, matchName);
                }
            }
        });
        if (Object.keys(existingMatches).length === 0 && Object.keys(newMatches).length === 0) {
            throw new Error('No matches found');
        }
        return [existingMatches, newMatches];
    }
}
exports.LiveMatches = LiveMatches;
//# sourceMappingURL=index.js.map