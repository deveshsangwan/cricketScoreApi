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
            const liveMatchesResponse = await liveMatchesObj.getMatches(this.matchId);

            if (!this.matchId) {
                for (let key in liveMatchesResponse) {
                    this.matchId = key;
                    const scrapedData = await this.scrapeData(liveMatchesResponse[key].matchUrl);
                    data.push(scrapedData);
                    //break;
                }
            } else {
                const url = liveMatchesResponse[this.matchId].matchUrl;
                const scrapedData = await this.scrapeData(url);
                return resolve(scrapedData);
            }
            return resolve(data);
        });
    }

    public async scrapeData(url): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            if (!this.matchId) return reject('Match Id is required');

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
        return new Promise((resolve, reject) => {
            let matchData = {};

            request(options, (error, response, html) => {
                if (!error && response.statusCode == 200) {
                    const $ = cheerio.load(html);

                    // split the string by spaces, -, / and brackets
                    const currentTeamDataArray = $('span.ui-bat-team-scores').text().trim().split(/[/\s/\-/\(/\)]/).filter(Boolean);
                    const otherTeamDataArray = $('span.ui-bowl-team-scores').text().trim().split(/[/\s/\-/\(/\)]/).filter(Boolean);
                    const currentBatsman = $('span.bat-bowl-miniscore').eq(0).text().replace('*', '');
                    const [ currentBatsmanRuns, currentBatsmanBalls ] = $('td[class="cbz-grid-table-fix "]').eq(6).text().split('(').map((item) => item.replace(/[\(\)]/g, ''));
                    const otherBatsman = $('span.bat-bowl-miniscore').eq(1).text();
                    const [ otherBatsmanRuns, otherBatsmanBalls ] = $('td[class="cbz-grid-table-fix "]').eq(11).text().split('(').map((item) => item.replace(/[\(\)]/g, ''));
                    
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
    }
}