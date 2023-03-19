import { Promise as promise } from 'bluebird';
const request = require('request');
const cheerio = require('cheerio');
const randomstring = require("randomstring");

export class LiveMatches {
    constructor() {
    }

    public async getMatches(): Promise<{}> {
        return new promise(async (resolve, reject) => {
            const scrapedData = await this.scrapeData();
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
    }
}