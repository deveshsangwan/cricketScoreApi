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
const bluebird_1 = require("bluebird");
const request = require('request');
const cheerio = require('cheerio');
const randomstring = require("randomstring");
const mongo = require('../../core/baseModel');
class LiveMatches {
    constructor() {
    }
    getMatches(matchId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return new bluebird_1.Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (matchId) {
                }
                const matches = yield mongo.findAll();
                console.log('matches', matches);
                const scrapedData = yield this.scrapeData();
                // insert scraped data into db
                let dataToInsert = [];
                for (let key in scrapedData) {
                    dataToInsert.push({
                        _id: key,
                        matchUrl: scrapedData[key].matchUrl
                    });
                }
                const insert = yield mongo.insertMany(dataToInsert);
                return resolve(scrapedData);
            }));
        });
    }
    scrapeData() {
        return __awaiter(this, void 0, void 0, function* () {
            return new bluebird_1.Promise((resolve, reject) => {
                const options = {
                    url: 'https://www.cricbuzz.com/cricket-match/live-scores',
                    headers: {
                        'User-Agent': 'request'
                    }
                };
                const matchesData = {};
                request(options, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        $('.cb-col-100 .cb-col .cb-schdl').each((i, el) => {
                            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
                            const matchData = $(el).find('.cb-billing-plans-text a').attr('title');
                            if (matchUrl && matchData) {
                                const matchId = randomstring.generate({
                                    length: 16,
                                    charset: 'alphanumeric'
                                });
                                matchesData[matchId] = {
                                    matchUrl,
                                    matchData
                                };
                            }
                        });
                        return resolve(matchesData);
                    }
                    //return promise.resolve(matchUrls);
                    return reject(error);
                });
            });
        });
    }
}
exports.LiveMatches = LiveMatches;
