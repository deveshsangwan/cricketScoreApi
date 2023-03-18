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
class MatchStats {
    constructor(matchId = "0") {
        this.matchId = matchId;
    }
    getMatchStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let data = [];
                const liveMatchesObj = new LiveMatches();
                const liveMatchesResponse = yield liveMatchesObj.getMatches();
                if (this.matchId == "0") {
                    for (let key in liveMatchesResponse) {
                        this.matchId = key;
                        const scrapedData = yield this.scrapeData(liveMatchesResponse[key].matchUrl);
                        data.push(scrapedData);
                        break;
                    }
                }
                else {
                    const scrapedData = yield this.scrapeData(this.matchId);
                    return resolve(scrapedData);
                }
                return resolve(data);
            }));
        });
    }
    scrapeData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!this.matchId)
                    return reject('Match Id is required');
                const options = {
                    //url: 'https://www.cricbuzz.com' + this.matchId,
                    //url: 'https://www.cricbuzz.com' + url,
                    url: 'https://www.cricbuzz.com/live-cricket-scores/50160/wa-vs-vic-30th-match-sheffield-shield-2022-23',
                    headers: {
                        'User-Agent': 'request'
                    }
                };
                let matchStats = {};
                let tournamentName = yield this.getTournamentName(options);
                // request(options, (error, response, html) => {
                //     if (!error && response.statusCode == 200) {
                //         const $ = cheerio.load(html);
                //         $('.cb-mini-scr-col').each((i, el) => {
                //             //console.log('el', el);
                //             const currentTeamData = $(el).find('.cb-text-gray.cb-font-16').text().trim();
                //             const otherTeamData = $(el).find('.cb-font-20.text-bold').text().trim();
                //             const currentSummary = $(el).find('.cb-text-inprogress').text().trim();
                //             let batsmanData = $(el).find('.cb-min-inf.cb-col-100').find('.cb-col.cb-col-50').text();
                //             $(el).find('.cb-min-inf.cb-col-100').each((i, el) => {
                //                 console.log('html====================', $(el).html());
                //                 // console.log('eeeeeeeeeeeeeeeeeeeeee', $(el).find('.cb-text-link').text());
                //                 // console.log('ffffffffffffffffffffff', $(el).find('.cb-text-link').next().html());
                //                 // // if () {
                //                 //     console.log('el', $(el).text());
                //                 // // }
                //             });
                //             console.log('batsmanData', batsmanData);
                //             //console.log('currentTeamData', currentTeamData);
                //             //console.log('otherTeamData', otherTeamData);
                //             /*
                //             1. replace the brackets
                //             2. break the string by spaces and slashes 
                //             3. remove the empty string
                //             */
                //             const currentTeamDataArray = currentTeamData.replace(/[\(\)]/g, '').split(/[/\s]/).filter(Boolean);
                //             const otherTeamDataArray = otherTeamData.replace(/[\(\)]/g, '').split(/[/\s]/).filter(Boolean);
                //             matchStats = {
                //                 matchId: this.matchId,
                //                 tournamentName: tournamentName,
                //                 team1: !currentTeamDataArray[0] ? {} : {
                //                     isBatting: true,
                //                     name: currentTeamDataArray[0],
                //                     score: currentTeamDataArray[1],
                //                     overs: currentTeamDataArray.length > 3 ? currentTeamDataArray[3] : currentTeamDataArray[2],
                //                     wickets: currentTeamDataArray.length > 3 ? currentTeamDataArray[2] : 10,
                //                 },
                //                 team2: !otherTeamDataArray[0] ? {} : {
                //                     name: otherTeamDataArray[0],
                //                     score: otherTeamDataArray[1],
                //                     overs: otherTeamDataArray.length > 3 ? otherTeamDataArray[3] : otherTeamDataArray[2],
                //                     wickets: otherTeamDataArray.length > 3 ? otherTeamDataArray[2] : 10,
                //                 },
                //                 onBatting: {
                //                     player1: {
                //                     },
                //                     player2: {
                //                     }
                //                 },
                //                 summary: currentSummary
                //             }
                //             //console.log('matchStats', matchStats);
                //             return resolve(matchStats);
                //         });
                //         return resolve(matchStats);
                //     }
                // });
                // replace www with m in options.url
                options.url = options.url.replace('www', 'm');
                let response = yield this.getMatchStatsByMatchId(options);
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
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let matchData = {};
                request(options, (error, response, html) => {
                    if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        let currentTeamData = $('span.ui-bat-team-scores').text();
                        let currentBatsman = $('span.bat-bowl-miniscore').eq(0).text();
                        console.log('currentBatsman', currentBatsman);
                        console.log('currentTeamData', currentTeamData);
                    }
                });
                return resolve(matchData);
            }));
        });
    }
}
exports.MatchStats = MatchStats;
