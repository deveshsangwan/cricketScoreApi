const axios = require('axios');
const cheerio = require('cheerio');
import { LiveMatches } from '../LiveMatches/LiveMatches';
const mongo = require('../../core/baseModel');
const _ = require('underscore');

export class MatchStats {
    private matchId: string;
    constructor(matchId = "0") {
        this.matchId = matchId;
    }

    public async getMatchStats(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            let data = [];

            const liveMatchesObj = new LiveMatches();
            const liveMatchesResponse = await liveMatchesObj.getMatches(this.matchId);

            if (this.matchId === "0") {
                for (let key in liveMatchesResponse) {
                    this.matchId = key;
                    const scrapedData = await this.scrapeData(liveMatchesResponse[key].matchUrl);
                    _.extend(scrapedData, { matchName: liveMatchesResponse[key].matchName });
                    data.push(scrapedData);

                    // save data to db if not already exists
                    const mongoData = await mongo.findById(this.matchId, true);
                    if (!mongoData.length) {
                        let dataToInsert = JSON.parse(JSON.stringify(scrapedData));
                        // repalace key matchId with _id
                        dataToInsert['_id'] = dataToInsert['matchId'];
                        delete dataToInsert['matchId'];
                        await mongo.insert(dataToInsert, true);
                    }
                }

                if (!data.length) {
                    return resolve('No matches found');
                }
                return resolve(data);
            } else if (!!this.matchId) {
                let mongoData = await mongo.findById(this.matchId, true);
                if (mongoData.length) {
                    let returnObj = JSON.parse(JSON.stringify(mongoData[0]));
                    // repalce key _id with matchId
                    returnObj['matchId'] = returnObj['_id'];

                    delete returnObj['_id'];
                    delete returnObj['__v'];
                    delete returnObj['createdAt'];

                    return resolve(returnObj);
                } else if (_.has(liveMatchesResponse, 'matchId')) {
                    const url = liveMatchesResponse.matchUrl;
                    const scrapedData = await this.scrapeData(url);
                    _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
                    // insert data to db
                    let dataToInsert = JSON.parse(JSON.stringify(scrapedData));
                    dataToInsert['_id'] = dataToInsert['matchId'];
                    delete dataToInsert['matchId'];
                    await mongo.insert(dataToInsert, true);

                    return resolve(scrapedData);
                }

                return resolve('Match Id is invalid');
            }

            return resolve('Invalid request');
        });
    }

    public async scrapeData(url): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            if (!this.matchId) return resolve('Match Id is required');

            const options = {
                url: 'https://www.cricbuzz.com' + url,
                headers: {
                    'User-Agent': 'request'
                }
            };

            let tournamentName = await this.getTournamentName(options);

            // replace www with m in options.url
            options.url = options.url.replace('www', 'm');
            let response = await this.getMatchStatsByMatchId(options);
            response['tournamentName'] = tournamentName;

            return resolve(response);
        });
    }

    public async getTournamentName(options): Promise<{}> {
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

    public async getMatchStatsByMatchId(options): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            let matchData = {};

            try {
                const response = await axios(options);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);

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
                        summary: $("div.cbz-ui-status").text().trim()
                    };

                    return resolve(matchData);
                }
            } catch (error) {
                return reject(error);
            }
        });
    }
}