import { Utils } from '@utils/Utils';
import {
    writeLogError,
    writeLogDebug,
    logServiceOperation,
    logDatabaseOperation,
} from '@core/Logger';
import type { MatchData } from '@types';
import { insertDataToLiveMatchesTable } from './LiveMatchesUtility';
import { CustomError } from '@errors';
import * as mongo from '@core/BaseModel';
import type { ModelName } from '@core/BaseModel';
import randomstring from 'randomstring';
import _ from 'underscore';
import { CheerioAPI } from 'cheerio';
import { Element } from 'domhandler';
import { isError, isLiveMatchesResponse } from '@/utils/TypesUtils';
import type { LiveMatchesDbResponse } from '@/types/db';

const MATCH_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';

/**
 * Class responsible for handling live cricket match data
 * Fetches and processes live match information from Cricbuzz
 */
export class LiveMatches {
    private tableName: ModelName;
    private utilsObj: Utils;
    private readonly MATCH_ID_LENGTH = 16;

    constructor() {
        this.tableName = 'livematches';
        this.utilsObj = new Utils();
    }

    /**
     * Handles error logging and rejection
     * @param location - Location where error occurred for logging
     * @param error - Error object to be handled
     * @returns Rejected promise with CustomError
     */
    private handleError(location: string, error: Error): Promise<never> {
        writeLogError([`${location} | error`, error]);
        return Promise.reject(new CustomError(error.message));
    }

    /**
     * Gets all live matches
     * @returns Promise resolving to all matches data
     */
    public async getMatches(): Promise<Record<string, MatchData>>;
    
    /**
     * Gets a specific match by ID
     * @param matchId - ID of specific match to fetch
     * @returns Promise resolving to single match data
     */
    public async getMatches(matchId: string): Promise<MatchData>;

    /**
     * Gets match data either for a specific match or all matches
     * @param matchId - Optional ID of specific match to fetch (defaults to '0' for all matches)
     * @returns Promise resolving to match data
     */
    public async getMatches(matchId = '0'): Promise<MatchData | Record<string, MatchData>> {
        const startTime = Date.now();
        writeLogDebug(['LiveMatches: getMatches - Starting', { matchId }]);

        try {
            if (matchId !== '0') {
                writeLogDebug(['LiveMatches: getMatches - Fetching single match', { matchId }]);
                const result: MatchData = await this.getMatchById(matchId);
                return result;
            }

            writeLogDebug(['LiveMatches: getMatches - Fetching all matches']);
            const result: Record<string, MatchData> = await this.getAllMatches();
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logServiceOperation('LiveMatches', 'getMatches', false, duration, {
                matchId,
                error: isError(error) ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    private async getMatchById(matchId: string): Promise<MatchData> {
        const startTime = Date.now();
        writeLogDebug(['LiveMatches: getMatchById - Starting', { matchId }]);

        try {
            const mongoData = await mongo.findById(matchId, this.tableName);
            const dbDuration = Date.now() - startTime;
            logDatabaseOperation('findById', this.tableName, !!mongoData, dbDuration);

            if (mongoData && isLiveMatchesResponse(mongoData)) {
                writeLogDebug([
                    'LiveMatches: getMatchById - Found match in database',
                    {
                        matchId,
                        matchName: mongoData.matchName,
                    },
                ]);

                return {
                    matchId: mongoData.id,
                    matchUrl: mongoData.matchUrl,
                    matchName: mongoData.matchName,
                };
            } else {
                writeLogError(['LiveMatches: getMatchById - No match found', { matchId }]);
                throw new Error(`No match found with id: ${matchId}`);
            }
        } catch (error) {
            return this.handleError(
                'LiveMatches | getMatchById',
                isError(error) ? error : new Error('Unknown error')
            );
        }
    }

    private async getAllMatches(): Promise<Record<string, MatchData>> {
        const startTime = Date.now();
        writeLogDebug(['LiveMatches: getAllMatches - Starting']);

        try {
            const mongoData = await mongo.findAll(this.tableName);
            const dbDuration = Date.now() - startTime;
            logDatabaseOperation('findAll', this.tableName, true, dbDuration);

            writeLogDebug([
                'LiveMatches: getAllMatches - Found existing matches in DB',
                {
                    count: mongoData.length,
                },
            ]);

            const result = await this.scrapeData(mongoData as LiveMatchesDbResponse[]);
            return result;
        } catch (error) {
            return this.handleError(
                'LiveMatches | getAllMatches',
                isError(error) ? error : new Error('Unknown error')
            );
        }
    }

    private async scrapeData(mongoData: LiveMatchesDbResponse[]): Promise<Record<string, MatchData>> {
        const startTime = Date.now();
        writeLogDebug([
            'LiveMatches: scrapeData - Starting web scraping',
            {
                existingDataCount: mongoData.length,
            },
        ]);

        try {
            const response = await this.utilsObj.fetchData(MATCH_URL);

            writeLogDebug(['LiveMatches: scrapeData - Processing scraped data']);
            let matchesData = this.processData(response, mongoData);

            const newMatchesCount = Object.keys(matchesData[1]).length;
            if (newMatchesCount > 0) {
                writeLogDebug([
                    'LiveMatches: scrapeData - Inserting new matches',
                    {
                        newMatchesCount,
                    },
                ]);
                await insertDataToLiveMatchesTable(matchesData[1]);
            } else {
                writeLogDebug(['LiveMatches: scrapeData - No new matches to insert']);
            }

            let mergedMatchesData = { ...matchesData[0], ...matchesData[1] };
            const totalDuration = Date.now() - startTime;

            writeLogDebug([
                'LiveMatches: scrapeData - Completed',
                {
                    existingMatches: Object.keys(matchesData[0]).length,
                    newMatches: newMatchesCount,
                    totalMatches: Object.keys(mergedMatchesData).length,
                    duration: `${totalDuration}ms`,
                },
            ]);

            return mergedMatchesData;
        } catch (error) {
            return this.handleError(
                'LiveMatches | scrapeData',
                isError(error) ? error : new Error('Unknown error')
            );
        }
    }

    /**
     * Processes HTML data to extract match information
     * @param $ - Cheerio instance containing parsed HTML
     * @param mongoData - Existing match data from database
     * @returns Tuple of [existing matches, new matches]
     * @throws Error if no matches are found
     */
    private processData(
        $: CheerioAPI,
        mongoData: LiveMatchesDbResponse[]
    ): [Record<string, MatchData>, Record<string, MatchData>] {
        const existingMatches: Record<string, MatchData> = {};
        const newMatches: Record<string, MatchData> = {};

        const extractMatchInfo = (el: Element) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            return { matchUrl, matchName };
        };

        const handleExistingMatch = (existingMatch: any, matchUrl: string, matchName: string) => {
            existingMatches[existingMatch.id] = { matchUrl, matchName, matchId: existingMatch.id };
        };

        const handleNewMatch = (matchUrl: string, matchName: string) => {
            const matchId = randomstring.generate({
                length: this.MATCH_ID_LENGTH,
                charset: 'alphanumeric',
            });
            newMatches[matchId] = { matchUrl, matchName, matchId };
        };

        $('.cb-col-100 .cb-col .cb-schdl').each((_: number, el: Element) => {
            const { matchUrl, matchName } = extractMatchInfo(el);

            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);

                if (existingMatch) {
                    handleExistingMatch(existingMatch, matchUrl, matchName);
                } else {
                    handleNewMatch(matchUrl, matchName);
                }
            }
        });

        if (Object.keys(existingMatches).length === 0 && Object.keys(newMatches).length === 0) {
            throw new Error('No matches found');
        }

        return [existingMatches, newMatches];
    }
}
