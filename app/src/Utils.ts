import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import { writeLogError } from '../core/Logger';
import * as mongo from '../core/BaseModel';

/**
 * Utility class providing common functionality across the application
 */
export class Utils {
    private readonly DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; CricketStatsBot/1.0)';
    private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

    /**
     * Fetches and parses HTML data from a given URL
     * @param url - URL to fetch data from
     * @returns Promise resolving to Cheerio instance
     * @throws Error if fetch fails or status is not 200
     */
    public async fetchData(url: string): Promise<cheerio.CheerioAPI> {
        if (!url) {
            throw new Error('URL is required');
        }

        const options = this.prepareRequestOptions(url);
        
        try {
            const response: AxiosResponse = await axios(options);
            
            if (response.status === 200) {
                return cheerio.load(response.data);
            }

            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        } catch (error) {
            writeLogError(['Utils | fetchData | error', error]);
            throw error; // Let caller handle the error
        }
    }

    /**
     * Prepares request options for HTTP requests
     * @param url - Target URL
     * @returns AxiosRequestConfig containing request configuration
     */
    private prepareRequestOptions(url: string): AxiosRequestConfig {
        return {
            url,
            timeout: this.REQUEST_TIMEOUT,
            headers: {
                'User-Agent': this.DEFAULT_USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            validateStatus: (status) => status === 200
        };
    }

    /**
     * Inserts or updates match statistics in the database
     * @param scrapedData - Match data to be inserted
     * @param matchId - Optional match ID for the record
     * @throws Error if database operation fails
     */
    public async insertDataToMatchStatsTable(scrapedData: { [key: string]: object }, matchId?: string): Promise<void> {
        if (!scrapedData) {
            throw new Error('Scraped data is required');
        }

        try {
            const dataToInsert = { 
                ...scrapedData, 
                id: matchId ?? scrapedData['matchId']
            };
            delete dataToInsert['matchId'];
            
            await mongo.insert(dataToInsert, 'matchstats');
        } catch (error) {
            writeLogError(['Utils | insertDataToMatchStatsTable | error', error]);
            throw error;
        }
    }
}