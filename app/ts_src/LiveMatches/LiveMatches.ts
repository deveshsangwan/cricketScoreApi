import { Promise as promise } from 'bluebird';
const request = require('request');
const cheerio = require('cheerio');

export class LiveMatches {
    constructor() {
    }

    public async getMatches(): Promise<{}> {
        return new promise(async (resolve, reject) => {
            const scrapedData = await this.scrapeData();
            console.log("here=======================")
            console.log("scrapedData=======================", scrapedData);
            return resolve(scrapedData);
        });
    }

    public async scrapeData(): Promise<{}> {
        return new promise((resolve, reject) => {
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
    }
}