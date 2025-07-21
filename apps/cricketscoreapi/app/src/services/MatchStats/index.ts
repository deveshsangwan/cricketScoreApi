import { LiveMatches } from '@services/LiveMatches';
import { Utils } from '@utils/Utils';
import * as mongo from '@core/BaseModel';
import {
    writeLogError,
    writeLogDebug,
    logServiceOperation,
    logDatabaseOperation,
} from '@core/Logger';
import { InvalidMatchIdError, MatchIdRequriedError, NoMatchesFoundError } from '@errors';
import type { LiveMatchesResponse, MatchStatsResponse } from '@types';
import {
    getTeamScoreString,
    getTeamData,
    getBatsmanData,
    getRunRate,
    getMatchCommentary,
    getKeyStats,
} from './MatchUtils';
import { CheerioAPI } from 'cheerio';
import _ from 'underscore';
import { isError, isLiveMatchesResponse, isMatchStatsResponse } from '@/utils/TypesUtils';
import type { ModelName } from '@core/BaseModel';

export class MatchStats {
    private tableName: ModelName;
    private liveMatchesObj: LiveMatches;
    private utilsObj: Utils;

    constructor() {
        this.tableName = 'matchstats';
        this.liveMatchesObj = new LiveMatches();
        this.utilsObj = new Utils();
    }

    public async getMatchStats(
        matchId: string
    ): Promise<MatchStatsResponse | MatchStatsResponse[]> {
        writeLogDebug(['MatchStats: getMatchStats - Starting request', { matchId }]);

        try {
            if (!matchId) {
                writeLogError(['MatchStats: getMatchStats - Missing matchId']);
                throw new MatchIdRequriedError();
            }

            // matchId should be 0 or alphanumeric string of length 16
            if (matchId !== '0' && !matchId.match(/^[a-zA-Z0-9]{16}$/)) {
                writeLogError(['MatchStats: getMatchStats - Invalid matchId format', { matchId }]);
                throw new InvalidMatchIdError(matchId);
            }

            writeLogDebug(['MatchStats: getMatchStats - Fetching live matches data', { matchId }]);
            const liveMatchesResponse = await this.liveMatchesObj.getMatches(matchId);

            // If matchId is not '0', get stats for the single match
            // Otherwise, get stats for all matches
            if (isLiveMatchesResponse(liveMatchesResponse)) {
                writeLogDebug(['MatchStats: getMatchStats - Processing single match', { matchId }]);
                const result = await this.getStatsForSingleMatch(liveMatchesResponse, matchId);
                return result;
            }

            writeLogDebug([
                'MatchStats: getMatchStats - Processing all matches',
                {
                    matchCount: Object.keys(liveMatchesResponse).length,
                },
            ]);
            const result = await this.getStatsForAllMatches(liveMatchesResponse);
            return result;
        } catch (error) {
            writeLogError(['matchStats | getMatchStats | error', error]);
            throw error; // re-throw the original error
        }
    }

    private async getStatsForAllMatches(
        liveMatchesResponse: Record<string, LiveMatchesResponse>
    ): Promise<MatchStatsResponse[]> {
        const startTime = Date.now();
        const matchCount = Object.keys(liveMatchesResponse).length;
        writeLogDebug(['MatchStats: getStatsForAllMatches - Starting', { matchCount }]);

        // Fetch all data from the database at once
        const allMongoData = await mongo.findAll(this.tableName);
        const dbDuration = Date.now() - startTime;
        logDatabaseOperation('findAll', this.tableName, true, dbDuration, undefined);
        writeLogDebug([
            'MatchStats: getStatsForAllMatches - Fetched DB data',
            {
                dbRecords: allMongoData.length,
                dbDuration: `${dbDuration}ms`,
            },
        ]);

        const dataPromises = Object.entries(liveMatchesResponse).map(async ([matchId, match]) => {
            writeLogDebug([
                'MatchStats: getStatsForAllMatches - Processing match',
                {
                    matchId,
                    matchUrl: match.matchUrl,
                },
            ]);

            let scrapedData = await this.scrapeData(match.matchUrl, matchId);
            scrapedData = { ...scrapedData, matchName: match.matchName };

            // Check if data already exists in the fetched data
            const mongoData = allMongoData.find((data: { id: string }) => data.id === matchId);
            if (!mongoData) {
                writeLogDebug([
                    'MatchStats: getStatsForAllMatches - Inserting new data',
                    { matchId },
                ]);
                await this.utilsObj.insertDataToMatchStatsTable(scrapedData, matchId);
            } else {
                writeLogDebug([
                    'MatchStats: getStatsForAllMatches - Data already exists',
                    { matchId },
                ]);
            }

            return { ...scrapedData, matchId: matchId };
        });

        const data = await Promise.all(dataPromises);

        if (!data.length) {
            writeLogError(['MatchStats: getStatsForAllMatches - No matches found']);
            throw new NoMatchesFoundError();
        }

        return data;
    }

    private async getStatsForSingleMatch(
        liveMatchesResponse: LiveMatchesResponse,
        matchId: string
    ): Promise<MatchStatsResponse> {
        const startTime = Date.now();
        writeLogDebug(['MatchStats: getStatsForSingleMatch - Starting', { matchId }]);

        const mongoData = await mongo.findById(matchId, this.tableName);
        const dbDuration = Date.now() - startTime;
        logDatabaseOperation('findById', this.tableName, !!mongoData, dbDuration);

        if (mongoData && isMatchStatsResponse(mongoData)) {
            writeLogDebug([
                'MatchStats: getStatsForSingleMatch - Found data in database',
                { matchId },
            ]);

            // Only add the properties you need
            const returnObj = {
                matchId: mongoData.id,
                team1: mongoData.team1,
                team2: mongoData.team2,
                onBatting: mongoData.onBatting,
                runRate: mongoData.runRate,
                summary: mongoData.summary,
                matchCommentary: mongoData.matchCommentary,
                keyStats: mongoData.keyStats,
                tournamentName: mongoData.tournamentName,
                matchName: mongoData.matchName,
                isLive: mongoData.isLive,
            };

            return returnObj;
        } else if (_.has(liveMatchesResponse, 'matchId')) {
            writeLogDebug([
                'MatchStats: getStatsForSingleMatch - Data not found in DB, scraping',
                {
                    matchId,
                    matchUrl: liveMatchesResponse.matchUrl,
                },
            ]);

            const url = liveMatchesResponse.matchUrl;
            let scrapedData = await this.scrapeData(url, matchId);
            scrapedData = { ...scrapedData, matchName: liveMatchesResponse.matchName };
            await this.utilsObj.insertDataToMatchStatsTable(scrapedData);

            return scrapedData;
        }

        writeLogError(['MatchStats: getStatsForSingleMatch - No valid data found', { matchId }]);
        return {} as MatchStatsResponse;
    }

    private async scrapeData(url: string, matchId: string): Promise<MatchStatsResponse> {
        const startTime = Date.now();
        writeLogDebug(['MatchStats: scrapeData - Starting', { url, matchId }]);

        try {
            if (!matchId) {
                throw new MatchIdRequriedError();
            }

            url = 'https://www.cricbuzz.com' + url;
            writeLogDebug(['MatchStats: scrapeData - Fetching data from URL', { fullUrl: url }]);

            const response = await this.utilsObj.fetchData(url);

            writeLogDebug([
                'MatchStats: scrapeData - Data fetched, getting tournament name',
                { matchId },
            ]);
            const tournamentName = await this.getTournamentName(response);

            writeLogDebug([
                'MatchStats: scrapeData - Processing match statistics',
                {
                    matchId,
                    tournamentName,
                },
            ]);
            const finalResponse = this.getMatchStatsByMatchId(response, matchId);
            finalResponse['tournamentName'] = tournamentName;

            return Promise.resolve(finalResponse);
        } catch (error) {
            const duration = Date.now() - startTime;
            writeLogError(['matchStats | scrapeData |', error, url]);
            logServiceOperation('MatchStats', 'scrapeData', false, duration, {
                url,
                matchId,
                error: isError(error) ? error.message : 'Unknown error',
            });
            throw error;
        }
    }

    private async getTournamentName($: CheerioAPI): Promise<string> {
        try {
            const elements = $('.cb-col.cb-col-100.cb-bg-white');
            if (elements.length === 0) {
                throw new Error(
                    'No elements found with the selector .cb-col.cb-col-100.cb-bg-white'
                );
            }
            const tournamentNames = elements.map((_, el) => $(el).find('a').attr('title')).get();
            return tournamentNames[0] || '';
        } catch (error) {
            throw new Error(
                `Error while fetching tournament name: ${isError(error) ? error.message : 'Unknown error'}`
            );
        }
    }

    private getMatchStatsByMatchId($: CheerioAPI, matchId: string): MatchStatsResponse {
        try {
            const isLive = this._getIsLiveStatus($);
            const runRate = getRunRate($);
            const currentTeamScoreString = getTeamScoreString($, isLive, true);
            const otherTeamScoreString = getTeamScoreString($, isLive, false);

            const matchData: MatchStatsResponse = {
                matchId: matchId,
                team1: getTeamData(currentTeamScoreString, true),
                team2: getTeamData(otherTeamScoreString),
                onBatting: {
                    player1: getBatsmanData($, 0),
                    player2: getBatsmanData($, 1),
                },
                runRate: runRate,
                summary: this._getSummary($),
                isLive: isLive,
                matchCommentary: getMatchCommentary($),
                keyStats: getKeyStats($),
            };

            return matchData;
        } catch (error) {
            writeLogError(['matchStats | getMatchStatsByMatchId |', error]);
            throw error;
        }
    }

    private _getIsLiveStatus($: CheerioAPI): boolean {
        return $('div.cb-text-complete').length === 0;
    }

    private _getSummary($: CheerioAPI): string {
        return $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim();
    }
}
