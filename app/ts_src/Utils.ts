import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeLogError } from '../core/logger';
import * as mongo from '../core/baseModel';

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
            writeLogError(['Utils | scrapeData | error', error]);
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

    // function for inserting data into matchStats table
    public async insertDataToMatchStatsTable(scrapedData: { [key: string]: any }, matchId?: string) {
        const dataToInsert = { ...scrapedData, _id: matchId ? matchId : scrapedData['matchId'] };
        delete dataToInsert['matchId'];
        await mongo.insert(dataToInsert, 'matchStats');
    }
}