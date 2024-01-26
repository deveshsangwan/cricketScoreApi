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
exports.LiveMatches = void 0;
const Utils_1 = require("./Utils");
const logger_1 = require("../core/logger");
const randomstring = require("randomstring");
const mongo = require('../core/baseModel');
const _ = require('underscore');
class LiveMatches {
    constructor() {
        this.tableName = 'liveMatches';
        this.utilsObj = new Utils_1.Utils();
    }
    getMatches(matchId = "0") {
        return __awaiter(this, void 0, void 0, function* () {
            if (matchId !== "0") {
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
                    (0, logger_1.writeLogError)(['LiveMatches | getMatches | error', error]);
                    throw error;
                }
            }
            try {
                const mongoData = yield mongo.findAll(this.tableName);
                const scrapedData = yield this.scrapeData(mongoData);
                return scrapedData;
            }
            catch (error) {
                (0, logger_1.writeLogError)(['LiveMatches | getMatches | error', error]);
                throw error;
            }
        });
    }
    scrapeData(mongoData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = 'https://www.cricbuzz.com/cricket-match/live-scores';
                const response = yield this.utilsObj.fetchData(url);
                let matchesData = this.processData(response, mongoData);
                // matches data is an array of 2 objects insert the second into db as first is already present and return both after combining
                yield this.utilsObj.insertDataToLiveMatchesTable(matchesData[1]);
                matchesData = _.extend(matchesData[0], matchesData[1]);
                return matchesData;
            }
            catch (error) {
                (0, logger_1.writeLogError)(['LiveMatches | scrapeData | error', error]);
                throw error;
            }
        });
    }
    processData($, mongoData) {
        const matchesData = {}, matchesData1 = {};
        $('.cb-col-100 .cb-col .cb-schdl').each((i, el) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);
                if (existingMatch) {
                    matchesData1[existingMatch._id] = { matchUrl, matchName };
                }
                else {
                    const matchId = randomstring.generate({ length: 16, charset: 'alphanumeric' });
                    matchesData[matchId] = { matchUrl, matchName };
                }
            }
        });
        return [matchesData1, matchesData];
    }
}
exports.LiveMatches = LiveMatches;
