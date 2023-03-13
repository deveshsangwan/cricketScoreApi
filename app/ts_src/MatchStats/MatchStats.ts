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
                }
            } else {
                const scrapedData = await this.scrapeData(this.matchId);
                return resolve(scrapedData);
            }
            return resolve(data);
        });
    }

    public async scrapeData(url): Promise<{}> {
        return new Promise((resolve, reject) => {
            if (!this.matchId) return reject('Match Id is required');
            
            const options = {
                //url: 'https://www.cricbuzz.com' + this.matchId,
                url: 'https://www.cricbuzz.com' + url,
                headers: {
                    'User-Agent': 'request'
                }
            };

            let matchStats = {};

            request(options, (error, response, html) => {
                if (!error && response.statusCode == 200) {
                    const $ = cheerio.load(html);
                    let tournamentName;
                    $('.cb-col.cb-col-100.cb-bg-white').each((i, el) => {
                        tournamentName = $(el).find('a').attr('title');
                        //console.log('tournamentName', tournamentName);
                    });
                    $('.cb-mini-scr-col').each((i, el) => {
                        //console.log('el', el);
                        const currentTeamData = $(el).find('.cb-text-gray.cb-font-16').text().trim();
                        const otherTeamData = $(el).find('.cb-font-20.text-bold').text().trim();
                        const currentSummary = $(el).find('.cb-text-inprogress').text().trim();
                        const batsmanData = $(el).find('.cb-min-inf.cb-col-100').text().trim();
                        console.log('batsmanData', batsmanData);
                        //console.log('currentTeamData', currentTeamData);
                        //console.log('otherTeamData', otherTeamData);
                        /*
                        1. replace the brackets
                        2. break the string by spaces and slashes 
                        3. remove the empty string
                        */
                        const currentTeamDataArray = currentTeamData.replace(/[\(\)]/g, '').split(/[/\s]/).filter(Boolean);
                        const otherTeamDataArray = otherTeamData.replace(/[\(\)]/g, '').split(/[/\s]/).filter(Boolean);

                        matchStats = {
                            matchId: this.matchId,
                            tournamentName: tournamentName,
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

                                },
                                player2: {
                                }
                            },
                            summary: currentSummary
                        }

                        //console.log('matchStats', matchStats);
                        return resolve(matchStats);
                    });
                    return resolve(matchStats);
                }
            });
        });
    }
}