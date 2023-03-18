const request = require('request');
const cheerio = require('cheerio');
const { LiveMatches } = require('../LiveMatches/LiveMatches');

export class MatchStats {
    private matchId: string;
    constructor(matchId = "0") {
        this.matchId = matchId;
    }

    public async getMatchStats(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            let data = [];

            const liveMatchesObj = new LiveMatches();
            const liveMatchesResponse = await liveMatchesObj.getMatches();

            if (this.matchId == "0") {
                for (let key in liveMatchesResponse) {
                    this.matchId = key;
                    const scrapedData = await this.scrapeData(liveMatchesResponse[key].matchUrl);
                    data.push(scrapedData);
                    break;
                }
            } else {
                const scrapedData = await this.scrapeData(this.matchId);
                return resolve(scrapedData);
            }
            return resolve(data);
        });
    }

    public async scrapeData(url): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            if (!this.matchId) return reject('Match Id is required');

            const options = {
                //url: 'https://www.cricbuzz.com' + this.matchId,
                //url: 'https://www.cricbuzz.com' + url,
                url: 'https://www.cricbuzz.com/live-cricket-scores/50160/wa-vs-vic-30th-match-sheffield-shield-2022-23',
                headers: {
                    'User-Agent': 'request'
                }
            };

            let matchStats = {}
            let tournamentName = await this.getTournamentName(options);

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
            let response = await this.getMatchStatsByMatchId(options);

            return resolve(response);
        });
    }

    public async getTournamentName(options): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (!this.matchId) return reject('Match Id is required');

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
    }

    public async getMatchStatsByMatchId(options): Promise<{}> {
        return new Promise(async (resolve, reject) => {
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
        });
    }
}