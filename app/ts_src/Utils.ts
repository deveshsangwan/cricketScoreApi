const axios = require('axios');
const cheerio = require('cheerio');
import { writeLogInfo, writeLogError } from '../core/logger';
const mongo = require('../core/baseModel');

export class Utils {
    constructor() {
    }

    public async fetchData(url: string): Promise<{}> {
        const options = this.prepareRequestOptions(url);
        try {
            const response = await axios(options);
            if (response.status === 200) {
                const $ = cheerio.load(response.data);
                return Promise.resolve($);
            }

            throw new Error(`Error while fetching data from url: ${url}`);
        } catch (error) {
            writeLogError(['Utils | scrapeData | error', error])
            return Promise.reject(error);
        }
    }

    private prepareRequestOptions(url: string): {} {
        return {
            url,
            headers: {
                'User-Agent': 'request'
            }
        };
    }

    // function for inserting data into liveMatches table
    public async insertDataToLiveMatchesTable(matchesData: { [key: string]: { matchUrl: string, matchName: string } }) {
        const dataToInsert = Object.entries(matchesData).map(([key, value]) => ({
            _id: key,
            matchUrl: value.matchUrl,
            matchName: value.matchName
        }));

        await mongo.insertMany(dataToInsert, 'liveMatches');
    }

    // function for inserting data into matchStats table
    public async insertDataToMatchStatsTable(scrapedData: { [key: string]: any }, matchId?: string) {
        const dataToInsert = { ...scrapedData, _id: matchId ? matchId : scrapedData['matchId'] }
        delete dataToInsert['matchId'];
        await mongo.insert(dataToInsert, 'matchStats');
    }
}