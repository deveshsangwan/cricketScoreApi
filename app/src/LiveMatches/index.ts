import { Utils } from '../Utils';
import { writeLogError } from '../../core/Logger';
import { MatchData } from '../types';
import { insertDataToLiveMatchesTable } from './LiveMatchesUtility';
import { CustomError } from '../errors';
import * as mongo from '../../core/BaseModel';
import randomstring from 'randomstring';
import _ from 'underscore';

const MATCH_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';

/**
 * Class responsible for handling live cricket match data
 * Fetches and processes live match information from Cricbuzz
 */
export class LiveMatches {
    private tableName: string;
    private utilsObj: Utils;

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
     * Gets match data either for a specific match or all matches
     * @param matchId - Optional ID of specific match to fetch (defaults to '0' for all matches)
     * @returns Promise resolving to match data
     */
    public async getMatches(matchId = '0'): Promise<{}> {
        if (matchId !== '0') {
            return this.getMatchById(matchId);
        }
        return this.getAllMatches();
    }

    private async getMatchById(matchId: string): Promise<{}> {
        try {
            const mongoData = await mongo.findById(matchId, this.tableName);
            if (mongoData) {
                mongoData['matchId'] = mongoData['id'];
                delete mongoData['id'];
                return mongoData;
            } else {
                throw new Error(`No match found with id: ${matchId}`);
            }
        } catch (error) {
            return this.handleError('LiveMatches | getMatchById', error);
        }
    }

    private async getAllMatches(): Promise<{}> {
        try {
            const mongoData = await mongo.findAll(this.tableName);
            return this.scrapeData(mongoData);
        } catch (error) {
            return this.handleError('LiveMatches | getAllMatches', error);
        }
    }

    private async scrapeData(mongoData: any[]): Promise<{}> {
        try {
            const response = await this.utilsObj.fetchData(MATCH_URL);
            let matchesData = this.processData(response, mongoData);
            await insertDataToLiveMatchesTable(matchesData[1]);
            matchesData = _.extend(matchesData[0], matchesData[1]);
            return matchesData;
        } catch (error) {
            return this.handleError('LiveMatches | scrapeData', error);
        }
    }

    /**
     * Processes HTML data to extract match information
     * @param $ - Cheerio instance containing parsed HTML
     * @param mongoData - Existing match data from database
     * @returns Tuple of [existing matches, new matches]
     * @throws Error if no matches are found
     */
    private processData($: any, mongoData: any[]): [Record<string, MatchData>, Record<string, MatchData>] {
        const MATCH_ID_LENGTH = 16;
        const existingMatches: Record<string, MatchData> = {};
        const newMatches: Record<string, MatchData> = {};

        $('.cb-col-100 .cb-col .cb-schdl').each((_, el) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');

            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);

                if (existingMatch) {
                    existingMatches[existingMatch.id] = { matchUrl, matchName };
                } else {
                    const matchId = randomstring.generate({ length: MATCH_ID_LENGTH, charset: 'alphanumeric' });
                    newMatches[matchId] = { matchUrl, matchName };
                }
            }
        });

        if (Object.keys(existingMatches).length === 0 && Object.keys(newMatches).length === 0) {
            throw new Error('No matches found');
        }

        return [existingMatches, newMatches];
    }
}
