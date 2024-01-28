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
exports.LiveMatches = void 0;
const Utils_1 = require("../Utils");
const logger_1 = require("../../core/logger");
const LiveMatchesUtility_1 = require("./LiveMatchesUtility");
const errors_1 = require("../errors");
const mongo = __importStar(require("../../core/baseModel"));
const randomstring = require("randomstring");
const _ = require('underscore');
const MATCH_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';
class LiveMatches {
    constructor() {
        this.tableName = 'liveMatches';
        this.utilsObj = new Utils_1.Utils();
    }
    handleError(location, error) {
        (0, logger_1.writeLogError)([`${location} | error`, error]);
        throw new errors_1.CustomError(error.message);
    }
    getMatches(matchId = "0") {
        return __awaiter(this, void 0, void 0, function* () {
            if (matchId !== "0") {
                return this.getMatchById(matchId);
            }
            return this.getAllMatches();
        });
    }
    getMatchById(matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongoData = yield mongo.findById(matchId, this.tableName);
                if (mongoData.length) {
                    mongoData[0]['matchId'] = mongoData[0]['_id'];
                    delete mongoData[0]['_id'];
                    return mongoData[0];
                }
                else {
                    throw new Error(`No match found with id: ${matchId}`);
                }
            }
            catch (error) {
                this.handleError('LiveMatches | getMatchById', error);
            }
        });
    }
    getAllMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const mongoData = yield mongo.findAll(this.tableName);
                return this.scrapeData(mongoData);
            }
            catch (error) {
                this.handleError('LiveMatches | getAllMatches', error);
            }
        });
    }
    scrapeData(mongoData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.utilsObj.fetchData(MATCH_URL);
                let matchesData = this.processData(response, mongoData);
                yield (0, LiveMatchesUtility_1.insertDataToLiveMatchesTable)(matchesData[1]);
                matchesData = _.extend(matchesData[0], matchesData[1]);
                return matchesData;
            }
            catch (error) {
                this.handleError('LiveMatches | scrapeData', error);
            }
        });
    }
    processData($, mongoData) {
        const MATCH_ID_LENGTH = 16;
        const existingMatches = {};
        const newMatches = {};
        $('.cb-col-100 .cb-col .cb-schdl').each((i, el) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);
                if (existingMatch) {
                    existingMatches[existingMatch._id] = { matchUrl, matchName };
                }
                else {
                    const matchId = randomstring.generate({ length: MATCH_ID_LENGTH, charset: 'alphanumeric' });
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
