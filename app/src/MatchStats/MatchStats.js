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
const request = require('request');
const cheerio = require('cheerio');
const { LiveMatches } = require('../LiveMatches/LiveMatches');
const mongo = require('../../core/baseModel');
const _ = require('underscore');
class MatchStats {
    constructor(matchId = "0") {
        this.matchId = matchId;
    }
    getMatchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let data = [];
                const liveMatchesObj = new LiveMatches();
                const liveMatchesResponse = yield liveMatchesObj.getMatches(this.matchId);
                if (this.matchId === "0") {
                    for (let key in liveMatchesResponse) {
                        this.matchId = key;
                        const scrapedData = yield this.scrapeData(liveMatchesResponse[key].matchUrl);
                        _.extend(scrapedData, { matchName: liveMatchesResponse[key].matchName });
                        data.push(scrapedData);
                        // save data to db if not already exists
                        const mongoData = yield mongo.findById(this.matchId, true);
                        if (!mongoData.length) {
                            let dataToInsert = JSON.parse(JSON.stringify(scrapedData));
                            // repalace key matchId with _id
                            dataToInsert['_id'] = dataToInsert['matchId'];
                            delete dataToInsert['matchId'];
                            yield mongo.insert(dataToInsert, true);
                        }
                    }
                    if (!data.length) {
                        return reject('No matches found');
                    }
                    return resolve(data);
                }
                else if (!!this.matchId) {
                    let mongoData = yield mongo.findById(this.matchId, true);
                    if (mongoData.length) {
                        let returnObj = JSON.parse(JSON.stringify(mongoData[0]));
                        // repalce key _id with matchId
                        returnObj['matchId'] = returnObj['_id'];
                        delete returnObj['_id'];
                        delete returnObj['__v'];
                        delete returnObj['createdAt'];
                        return resolve(returnObj);
                    }
                    else if (_.has(liveMatchesResponse, 'matchId')) {
                        const url = liveMatchesResponse.matchUrl;
                        const scrapedData = yield this.scrapeData(url);
                        _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
                        // insert data to db
                        let dataToInsert = JSON.parse(JSON.stringify(scrapedData));
                        dataToInsert['_id'] = dataToInsert['matchId'];
                        delete dataToInsert['matchId'];
                        yield mongo.insert(dataToInsert, true);
                        return resolve(scrapedData);
                    }
                    return resolve('Match Id is invalid');
                }
                return resolve('Invalid request');
            }));
        });
    }
    scrapeData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchId)
                    return reject('Match Id is required');
                const options = {
                    url: 'https://www.cricbuzz.com' + url,
                    headers: {
                        'User-Agent': 'request'
                    }
                };
                let tournamentName = yield this.getTournamentName(options);
                // replace www with m in options.url
                options.url = options.url.replace('www', 'm');
                let response = yield this.getMatchStatsByMatchId(options);
                response['tournamentName'] = tournamentName;
                return resolve(response);
            }));
        });
    }
    getTournamentName(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.matchId)
                    return reject('Match Id is required');
                request(options, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        $('.cb-col.cb-col-100.cb-bg-white').each((i, el) => {
                            const tournamentName = $(el).find('a').attr('title');
                            return resolve(tournamentName);
                        });
                    }
                });
            });
        });
    }
    getMatchStatsByMatchId(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let matchData = {};
                request(options, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        // split the string by spaces, -, / and brackets
                        const currentTeamDataArray = $('span.ui-bat-team-scores').text().trim().split(/[/\s/\-/\(/\)]/).filter(Boolean);
                        const otherTeamDataArray = $('span.ui-bowl-team-scores').text().trim().split(/[/\s/\-/\(/\)]/).filter(Boolean);
                        const currentBatsman = $('span.bat-bowl-miniscore').eq(0).text().replace('*', '');
                        const [currentBatsmanRuns, currentBatsmanBalls] = $('td[class="cbz-grid-table-fix "]').eq(6).text().split('(').map((item) => item.replace(/[\(\)]/g, ''));
                        const otherBatsman = $('span.bat-bowl-miniscore').eq(1).text();
                        const [otherBatsmanRuns, otherBatsmanBalls] = $('td[class="cbz-grid-table-fix "]').eq(11).text().split('(').map((item) => item.replace(/[\(\)]/g, ''));
                        matchData = {
                            matchId: this.matchId,
                            team1: !currentTeamDataArray[0] ? {} : {
                                isBatting: true,
                                name: currentTeamDataArray[0],
                                score: currentTeamDataArray[1],
                                overs: currentTeamDataArray.length > 3 ? currentTeamDataArray[3] : currentTeamDataArray[2],
                                wickets: currentTeamDataArray.length > 3 ? currentTeamDataArray[2] : 10,
                            },
                            team2: !otherTeamDataArray[0] ? {} : {
                                name: otherTeamDataArray[0],
                                score: otherTeamDataArray[1],
                                overs: otherTeamDataArray.length > 3 ? otherTeamDataArray[3] : otherTeamDataArray[2],
                                wickets: otherTeamDataArray.length > 3 ? otherTeamDataArray[2] : 10,
                            },
                            onBatting: {
                                player1: {
                                    name: currentBatsman,
                                    onStrike: true,
                                    runs: currentBatsmanRuns,
                                    balls: currentBatsmanBalls
                                },
                                player2: {
                                    name: otherBatsman,
                                    runs: otherBatsmanRuns,
                                    balls: otherBatsmanBalls
                                }
                            },
                            summary: $("div.cbz-ui-status").text().trim()
                        };
                        return resolve(matchData);
                    }
                });
            });
        });
    }
}
exports.MatchStats = MatchStats;
