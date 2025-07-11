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
        const startTime = Date.now();
        (0, Logger_1.writeLogDebug)(['LiveMatches: getMatches - Starting', { matchId }]);
        try {
            if (matchId !== '0') {
                (0, Logger_1.writeLogDebug)(['LiveMatches: getMatches - Fetching single match', { matchId }]);
                const result = await this.getMatchById(matchId);
                return result;
            }
            (0, Logger_1.writeLogDebug)(['LiveMatches: getMatches - Fetching all matches']);
            const result = await this.getAllMatches();
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            (0, Logger_1.logServiceOperation)('LiveMatches', 'getMatches', false, duration, {
                matchId,
                error: (0, TypesUtils_1.isError)(error) ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    async getMatchById(matchId) {
        const startTime = Date.now();
        (0, Logger_1.writeLogDebug)(['LiveMatches: getMatchById - Starting', { matchId }]);
        try {
            const mongoData = await mongo.findById(matchId, this.tableName);
            const dbDuration = Date.now() - startTime;
            (0, Logger_1.logDatabaseOperation)('findById', this.tableName, !!mongoData, dbDuration);
            if (mongoData && (0, TypesUtils_1.isLiveMatchesResponse)(mongoData)) {
                (0, Logger_1.writeLogDebug)([
                    'LiveMatches: getMatchById - Found match in database',
                    {
                        matchId,
                        matchName: mongoData.matchName,
                    },
                ]);
                return {
                    matchId: mongoData.id,
                    matchUrl: mongoData.matchUrl,
                    matchName: mongoData.matchName,
                };
            }
            else {
                (0, Logger_1.writeLogError)(['LiveMatches: getMatchById - No match found', { matchId }]);
                throw new Error(`No match found with id: ${matchId}`);
            }
        }
        catch (error) {
            return this.handleError('LiveMatches | getMatchById', (0, TypesUtils_1.isError)(error) ? error : new Error('Unknown error'));
        }
    }
    async getAllMatches() {
        const startTime = Date.now();
        (0, Logger_1.writeLogDebug)(['LiveMatches: getAllMatches - Starting']);
        try {
            const mongoData = await mongo.findAll(this.tableName);
            const dbDuration = Date.now() - startTime;
            (0, Logger_1.logDatabaseOperation)('findAll', this.tableName, true, dbDuration);
            (0, Logger_1.writeLogDebug)([
                'LiveMatches: getAllMatches - Found existing matches in DB',
                {
                    count: mongoData.length,
                },
            ]);
            const result = await this.scrapeData(mongoData);
            return result;
        }
        catch (error) {
            return this.handleError('LiveMatches | getAllMatches', (0, TypesUtils_1.isError)(error) ? error : new Error('Unknown error'));
        }
    }
    async scrapeData(mongoData) {
        const startTime = Date.now();
        (0, Logger_1.writeLogDebug)([
            'LiveMatches: scrapeData - Starting web scraping',
            {
                existingDataCount: mongoData.length,
            },
        ]);
        try {
            const response = await this.utilsObj.fetchData(MATCH_URL);
            (0, Logger_1.writeLogDebug)(['LiveMatches: scrapeData - Processing scraped data']);
            let matchesData = this.processData(response, mongoData);
            const newMatchesCount = Object.keys(matchesData[1]).length;
            if (newMatchesCount > 0) {
                (0, Logger_1.writeLogDebug)([
                    'LiveMatches: scrapeData - Inserting new matches',
                    {
                        newMatchesCount,
                    },
                ]);
                await (0, LiveMatchesUtility_1.insertDataToLiveMatchesTable)(matchesData[1]);
            }
            else {
                (0, Logger_1.writeLogDebug)(['LiveMatches: scrapeData - No new matches to insert']);
            }
            let mergedMatchesData = { ...matchesData[0], ...matchesData[1] };
            const totalDuration = Date.now() - startTime;
            (0, Logger_1.writeLogDebug)([
                'LiveMatches: scrapeData - Completed',
                {
                    existingMatches: Object.keys(matchesData[0]).length,
                    newMatches: newMatchesCount,
                    totalMatches: Object.keys(mergedMatchesData).length,
                    duration: `${totalDuration}ms`,
                },
            ]);
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