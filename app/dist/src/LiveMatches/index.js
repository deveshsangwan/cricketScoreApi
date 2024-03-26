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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveMatches = void 0;
const Utils_1 = require("../Utils");
const Logger_1 = require("../../core/Logger");
const LiveMatchesUtility_1 = require("./LiveMatchesUtility");
const errors_1 = require("../errors");
const mongo = __importStar(require("../../core/BaseModel"));
const randomstring_1 = __importDefault(require("randomstring"));
const underscore_1 = __importDefault(require("underscore"));
const MATCH_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';
class LiveMatches {
    tableName;
    utilsObj;
    constructor() {
        this.tableName = 'livematches';
        this.utilsObj = new Utils_1.Utils();
    }
    handleError(location, error) {
        (0, Logger_1.writeLogError)([`${location} | error`, error]);
        return Promise.reject(new errors_1.CustomError(error.message));
    }
    async getMatches(matchId = '0') {
        if (matchId !== '0') {
            return this.getMatchById(matchId);
        }
        return this.getAllMatches();
    }
    async getMatchById(matchId) {
        try {
            const mongoData = await mongo.findById(matchId, this.tableName);
            if (mongoData) {
                mongoData['matchId'] = mongoData['id'];
                delete mongoData['id'];
                return mongoData;
            }
            else {
                throw new Error(`No match found with id: ${matchId}`);
            }
        }
        catch (error) {
            return this.handleError('LiveMatches | getMatchById', error);
        }
    }
    async getAllMatches() {
        try {
            const mongoData = await mongo.findAll(this.tableName);
            return this.scrapeData(mongoData);
        }
        catch (error) {
            return this.handleError('LiveMatches | getAllMatches', error);
        }
    }
    async scrapeData(mongoData) {
        try {
            const response = await this.utilsObj.fetchData(MATCH_URL);
            let matchesData = this.processData(response, mongoData);
            await (0, LiveMatchesUtility_1.insertDataToLiveMatchesTable)(matchesData[1]);
            matchesData = underscore_1.default.extend(matchesData[0], matchesData[1]);
            return matchesData;
        }
        catch (error) {
            return this.handleError('LiveMatches | scrapeData', error);
        }
    }
    processData($, mongoData) {
        const MATCH_ID_LENGTH = 16;
        const existingMatches = {};
        const newMatches = {};
        $('.cb-col-100 .cb-col .cb-schdl').each((_, el) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);
                if (existingMatch) {
                    existingMatches[existingMatch.id] = { matchUrl, matchName };
                }
                else {
                    const matchId = randomstring_1.default.generate({ length: MATCH_ID_LENGTH, charset: 'alphanumeric' });
                    newMatches[matchId] = { matchUrl, matchName };
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