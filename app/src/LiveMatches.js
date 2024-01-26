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
const logger_1 = require("../core/logger");
const axios = require('axios');
const cheerio = require('cheerio');
const randomstring = require("randomstring");
const mongo = require('../core/baseModel');
const _ = require('underscore');
class LiveMatches {
    constructor() {
        this.tableName = 'liveMatches';
    }
    getMatches(matchId = "0") {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (matchId != "0") {
                    const mongoData = yield mongo.findById(matchId, this.tableName);
                    if (mongoData.length) {
                        mongoData[0]['matchId'] = mongoData[0]['_id'];
                        delete mongoData[0]['_id'];
                        return Promise.resolve(mongoData[0]);
                    }
                }
                const mongoData = yield mongo.findAll(this.tableName);
                const scrapedData = yield this.scrapeData(mongoData);
                return Promise.resolve(scrapedData);
            }
            catch (error) {
                (0, logger_1.writeLogError)(['LiveMatches | getMatches | error', error]);
                return Promise.reject(error);
            }
        });
    }
    scrapeData(mongoData) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                url: 'https://www.cricbuzz.com/cricket-match/live-scores',
                headers: {
                    'User-Agent': 'request'
                }
            };
            const matchesData = {}, matchesData1 = {};
            try {
                const response = yield axios(options);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);
                    $('.cb-col-100 .cb-col .cb-schdl').each((i, el) => {
                        const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
                        const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
                        // if already exists in db, then add it to matchesData
                        if (mongoData.length && mongoData.find((item) => item.matchUrl === matchUrl)) {
                            const matchId = mongoData.find((item) => item.matchUrl === matchUrl)._id;
                            matchesData1[matchId] = {
                                matchUrl,
                                matchName
                            };
                        }
                        else if (matchUrl && matchName) {
                            const matchId = randomstring.generate({
                                length: 16,
                                charset: 'alphanumeric'
                            });
                            matchesData[matchId] = {
                                matchUrl,
                                matchName
                            };
                        }
                    });
                    // insert new matches into db
                    let dataToInsert = [];
                    for (let key in matchesData) {
                        dataToInsert.push({
                            _id: key,
                            matchUrl: matchesData[key].matchUrl,
                            matchName: matchesData[key].matchName
                        });
                    }
                    yield mongo.insertMany(dataToInsert, this.tableName);
                }
                return Promise.resolve(_.extend(matchesData1, matchesData));
            }
            catch (error) {
                (0, logger_1.writeLogError)(['LiveMatches | scrapeData | error', error]);
                return Promise.reject(error);
            }
        });
    }
}
exports.LiveMatches = LiveMatches;
