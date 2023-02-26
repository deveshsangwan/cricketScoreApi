const request = require('request');
const cheerio = require('cheerio');

export class MatchStats {
    private matchId: string;
    constructor(matchId) {
        this.matchId = matchId;
    }

    public async getMatchStats(): Promise<{}> {
        return new Promise(async (resolve, reject) => {
            const scrapedData = await this.scrapeData();
            return resolve(scrapedData);
        });
    }

    public async scrapeData(): Promise<{}> {
        return new Promise((resolve, reject) => {
        });
    }
}