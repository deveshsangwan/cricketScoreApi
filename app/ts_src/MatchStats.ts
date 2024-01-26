const axios = require('axios');
const cheerio = require('cheerio');
import { LiveMatches } from './LiveMatches';
import { Utils } from './Utils';
const mongo = require('../core/baseModel');
const _ = require('underscore');
import { writeLogInfo, writeLogError } from '../core/logger';

interface LiveMatchesResponse {
    matchUrl?: string;
    matchName?: string;
    matchId?: string;
}
export class MatchStats {
    private matchId: string;
    private tableName: string;
    private liveMatchesObj: LiveMatches;
    private utilsObj: Utils;

    constructor(matchId = "0") {
        this.matchId = matchId;
        this.tableName = 'matchStats';
        this.liveMatchesObj = new LiveMatches();
        this.utilsObj = new Utils();
    }

    public async getMatchStats(): Promise<{}> {
        try {
            const liveMatchesResponse = await this.liveMatchesObj.getMatches(this.matchId);

            if (this.matchId === "0") {
                return await this.getStatsForAllMatches(liveMatchesResponse);
            } else if (!!this.matchId) {
                return await this.getStatsForSingleMatch(liveMatchesResponse);
            }

            return Promise.resolve('Invalid request');
        } catch (error) {
            writeLogError(['matchStats | getMatchStats | error', error]);
            return Promise.reject("Something went wrong");
        }
    }

    private async getStatsForAllMatches(liveMatchesResponse: LiveMatchesResponse): Promise<{}> {
        let data = [];
        for (let key in liveMatchesResponse) {
            this.matchId = key;
            const scrapedData = await this.scrapeData(liveMatchesResponse[key].matchUrl);
            _.extend(scrapedData, { matchName: liveMatchesResponse[key].matchName });
            data.push(scrapedData);

            // save data to db if not already exists
            const mongoData = await mongo.findById(this.matchId, this.tableName);
            if (!mongoData.length) {
                let dataToInsert = JSON.parse(JSON.stringify(scrapedData));
                // repalace key matchId with _id
                dataToInsert['_id'] = dataToInsert['matchId'];
                delete dataToInsert['matchId'];
                await mongo.insert(dataToInsert, this.tableName);
            }
        }

        if (!data.length) {
            return Promise.resolve('No matches found');
        }
        return Promise.resolve(data);
    }

    private async getStatsForSingleMatch(liveMatchesResponse: LiveMatchesResponse): Promise<{}> {
        let mongoData = await mongo.findById(this.matchId, this.tableName);
        if (mongoData.length) {
            let returnObj = JSON.parse(JSON.stringify(mongoData[0]));
            // repalce key _id with matchId
            returnObj['matchId'] = returnObj['_id'];

            delete returnObj['_id'];
            delete returnObj['__v'];
            delete returnObj['createdAt'];

            return Promise.resolve(returnObj);
        } else if (_.has(liveMatchesResponse, 'matchId')) {
            const url = liveMatchesResponse.matchUrl;
            const scrapedData = await this.scrapeData(url);
            _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
            // insert data to db
            let dataToInsert = JSON.parse(JSON.stringify(scrapedData));
            dataToInsert['_id'] = dataToInsert['matchId'];
            delete dataToInsert['matchId'];
            await mongo.insert(dataToInsert, this.tableName);

            return Promise.resolve(scrapedData);
        }

        return Promise.resolve('Match Id is invalid');
    }

    private async scrapeData(url): Promise<{}> {
        try {
            if (!this.matchId) return Promise.resolve('Match Id is required');

            const options = {
                url: 'https://www.cricbuzz.com' + url,
                headers: {
                    'User-Agent': 'request'
                }
            };

            let tournamentName = await this.getTournamentName(options);

            let response = await this.getMatchStatsByMatchId(options);
            response['tournamentName'] = tournamentName;

            return Promise.resolve(response);
        } catch (error) {
            writeLogError(['matchStats | scrapeData |', error]);
            return Promise.reject(error);
        }
    }

    private getTournamentName(options): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            if (!this.matchId) return resolve('Match Id is required');

            try {
                const response = await axios(options);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);

                    $('.cb-col.cb-col-100.cb-bg-white').each((i, el) => {
                        const tournamentName = $(el).find('a').attr('title');
                        return resolve(tournamentName);
                    });
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    private getMatchStatsByMatchId(options): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            let matchData = {};

            try {
                const response = await axios(options);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);

                    let currentTeamScoreString = $('span.cb-font-20.text-bold').text().trim();
                    let otherTeamScoreString = $('div.cb-text-gray.cb-font-16').text().trim();
                    const currentTeamDataArray = currentTeamScoreString.includes('&') ? this.parseTeamDataForTestMatches(currentTeamScoreString) : currentTeamScoreString.split(/[/\s/\-/\(/\)]/).filter(Boolean);
                    const otherTeamDataArray = otherTeamScoreString.includes('&') ? this.parseTeamDataForTestMatches(otherTeamScoreString) : otherTeamScoreString.split(/[/\s/\-/\(/\)]/).filter(Boolean);
                    const currentBatsman = $('div.cb-col.cb-col-50').eq(1).find('a').text();
                    const currentBatsmanRuns = $('div.cb-col.cb-col-10.ab.text-right').eq(0).text();
                    const currentBatsmanBalls = $('div.cb-col.cb-col-10.ab.text-right').eq(1).text();
                    const otherBatsman = $('div.cb-col.cb-col-50').eq(2).find('a').text();
                    const otherBatsmanRuns = $('div.cb-col.cb-col-10.ab.text-right').eq(2).text();
                    const otherBatsmanBalls = $('div.cb-col.cb-col-10.ab.text-right').eq(3).text();

                    matchData = {
                        matchId: this.matchId,
                        team1: !currentTeamDataArray[0] ? {} : {
                            isBatting: true,
                            name: currentTeamDataArray[0],
                            score: currentTeamDataArray[1],
                            overs: currentTeamDataArray.length > 3 ? currentTeamDataArray[3] : currentTeamDataArray[2],
                            wickets: currentTeamDataArray.length > 3 ? currentTeamDataArray[2] : "10",
                        },
                        team2: !otherTeamDataArray[0] ? {} : {
                            isBatting: false,
                            name: otherTeamDataArray[0],
                            score: otherTeamDataArray[1],
                            overs: otherTeamDataArray.length > 3 ? otherTeamDataArray[3] : otherTeamDataArray[2],
                            wickets: otherTeamDataArray.length > 3 ? otherTeamDataArray[2] : "10",
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
                                onStrike: false,
                                runs: otherBatsmanRuns,
                                balls: otherBatsmanBalls
                            }
                        },
                        summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
                    };

                    // add previousInnings data if present in team1 and team2
                    if (currentTeamDataArray.length > 4) {
                        matchData['team1']['previousInnings'] = this.appendPreviousInningsData(currentTeamDataArray[4]);
                    }

                    if (otherTeamDataArray.length > 4) {
                        matchData['team2']['previousInnings'] = this.appendPreviousInningsData(otherTeamDataArray[4]);
                    }

                    return resolve(matchData);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }

    private parseTeamDataForTestMatches(scoreString): Array<any> {
        // Regular expression pattern to capture team name, score, wickets, and overs
        const pattern = /([A-Za-z\s]+)\s+(\d+(?:\/\d+)?)(?:\s+&\s+(\d+\/\d+\s+\(\d+(?:\.\d+)?\)))?/;
        let teamName = "", firstInnings = "", secondInnings = "", firstInningsData = [], secondInningsData = [];

        const matchData = scoreString.match(pattern);

        if (matchData) {
            [, teamName, firstInnings, secondInnings] = matchData;

            // Process first innings
            firstInningsData = firstInnings.split(/[/\s/\-/\(/\)]/).filter(Boolean);

            // Process second innings if present
            if (secondInnings) {
                secondInningsData = secondInnings.split(/[/\s/\-/\(/\)]/).filter(Boolean);
            }
        } else {
            writeLogError(["Invalid score format"]);
        }

        return secondInningsData.length > 0 ? [teamName, ...secondInningsData, firstInningsData] : [teamName, ...firstInningsData];
    }

    private appendPreviousInningsData(dataArray) {
        // dataArray is an array containing [ runs, wickets ], flatten it to an object { runs, wickets }. If only runs is present, then wickets will be 10
        return {
            runs: dataArray[0],
            wickets: dataArray.length > 1 ? dataArray[1] : "10"
        };
    }
}