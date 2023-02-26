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
class LiveMatches {
    constructor() {
    }
    getMatches() {
        return __awaiter(this, void 0, void 0, function* () {
            return new bluebird_1.Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const scrapedData = yield this.scrapeData();
                console.log("here=======================");
                console.log("scrapedData=======================", scrapedData);
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
                const matchUrls = [];
                let response = request(options, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        //const matches = [];
                        //const matchesData = [];
                        $('.cb-col-100 .cb-col .cb-schdl .cb-lv-scr-mtch-hdr').each((i, el) => {
                            const match = $(el).find('.cb-lv-scrs-col').text();
                            const matchData = $(el).find('.cb-lv-scrs-col').text();
                            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
                            //matches.push(match);
                            //matchesData.push(matchData);
                            matchUrls.push(matchUrl);
                        });
                        return resolve(matchUrls);
                    }
                    //return promise.resolve(matchUrls);
                    return resolve(matchUrls);
                });
            });
        });
    }
}
exports.LiveMatches = LiveMatches;
