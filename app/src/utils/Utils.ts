import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import {
    writeLogError,
    writeLogDebug,
    logExternalAPICall,
    logDatabaseOperation,
    logPerformance,
} from '@core/Logger';
import * as mongo from '@core/BaseModel';
import type { MatchStatsResponse } from '@types';

/**
 * Utility class providing common functionality across the application
 */
export class Utils {
    private readonly DEFAULT_USER_AGENT =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
    private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

    /**
     * Fetches and parses HTML data from a given URL
     * @param url - URL to fetch data from
     * @returns Promise resolving to Cheerio instance
     * @throws Error if fetch fails or status is not 200
     */
    public async fetchData(url: string): Promise<cheerio.CheerioAPI> {
        const startTime = Date.now();
        writeLogDebug(['Utils: fetchData - Starting request', { url }]);

        if (!url) {
            writeLogError(['Utils: fetchData - URL is required']);
            throw new Error('URL is required');
        }

        const options = this.prepareRequestOptions(url);
        writeLogDebug([
            'Utils: fetchData - Request options prepared',
            {
                url,
                timeout: options.timeout,
            },
        ]);

        try {
            const response: AxiosResponse = await axios(options);
            const duration = Date.now() - startTime;

            if (response.status === 200) {
                writeLogDebug([
                    'Utils: fetchData - Request successful',
                    {
                        url,
                        statusCode: response.status,
                        contentLength: response.data?.length,
                        duration: `${duration}ms`,
                    },
                ]);

                logExternalAPICall(url, 'GET', response.status, duration);
                logPerformance('Utils-fetchData', duration, { url, statusCode: response.status });

                return cheerio.load(response.data);
            }

            const errorMsg = `Failed to fetch data: ${response.status} ${response.statusText}`;
            writeLogError([
                'Utils: fetchData - Request failed',
                {
                    url,
                    statusCode: response.status,
                    statusText: response.statusText,
                    duration: `${duration}ms`,
                },
            ]);

            logExternalAPICall(url, 'GET', response.status, duration, errorMsg);
            throw new Error(errorMsg);
        } catch (error) {
            const duration = Date.now() - startTime;
            const statusCode = (error as any).response?.status;
            const errorMessage = (error as Error).message || 'Unknown error';

            writeLogError([
                'Utils | fetchData | error',
                {
                    url,
                    error: errorMessage,
                    statusCode,
                    duration: `${duration}ms`,
                },
            ]);

            logExternalAPICall(url, 'GET', statusCode, duration, errorMessage);
            throw error;
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
                Accept: 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            validateStatus: (status) => status === 200,
        };
    }

    /**
     * Inserts or updates match statistics in the database
     * @param scrapedData - Match data to be inserted
     * @param matchId - Optional match ID for the record
     * @throws Error if database operation fails
     */
    public async insertDataToMatchStatsTable(
        scrapedData: MatchStatsResponse,
        matchId?: string
    ): Promise<void> {
        if (!scrapedData) {
            writeLogError(['Utils: insertDataToMatchStatsTable - Scraped data is required']);
            throw new Error('Scraped data is required');
        }

        const startTime = Date.now();
        writeLogDebug([
            'Utils: insertDataToMatchStatsTable - Starting',
            {
                matchId: matchId ?? scrapedData['matchId'],
                hasData: !!scrapedData,
            },
        ]);

        try {
            const dataToInsert = {
                ...scrapedData,
                id: matchId ?? scrapedData['matchId'],
            };
            delete dataToInsert['matchId'];

            writeLogDebug([
                'Utils: insertDataToMatchStatsTable - Inserting data',
                {
                    id: dataToInsert.id,
                    hasTeam1: !!dataToInsert.team1,
                    hasTeam2: !!dataToInsert.team2,
                },
            ]);

            await mongo.insert(dataToInsert, 'matchstats');

            const duration = Date.now() - startTime;
            writeLogDebug([
                'Utils: insertDataToMatchStatsTable - Successfully inserted',
                {
                    id: dataToInsert.id,
                    duration: `${duration}ms`,
                },
            ]);
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = (error as Error).message || 'Unknown error';

            writeLogError([
                'Utils | insertDataToMatchStatsTable | error',
                {
                    matchId: matchId ?? scrapedData['matchId'],
                    error: errorMessage,
                    duration: `${duration}ms`,
                },
            ]);

            logDatabaseOperation('insert', 'matchstats', false, duration, errorMessage);
            throw error;
        }
    }
}
