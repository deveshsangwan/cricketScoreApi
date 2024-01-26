const axios = require('axios');
const cheerio = require('cheerio');
import { writeLogInfo, writeLogError } from '../core/logger';

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
}