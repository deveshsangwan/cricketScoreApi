import * as cheerio from 'cheerio';
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
import { isError, isLiveMatchesResponse } from '@utils/TypesUtils';
import type { LiveMatchesDbResponse } from '@cricketscoreapi/types/db';
import { CricbuzzClient } from '@services/Cricbuzz/CricbuzzClient';
import {
    buildMatchNameFromAnchor,
    extractCricbuzzMatchIdFromUrl,
    normalizeCricbuzzPath,
} from '@services/Cricbuzz/CricbuzzUtils';

const MATCH_URL = 'https://www.cricbuzz.com/cricket-match/live-scores';

type ParsedCricbuzzMatch = {
    cricbuzzMatchId: string;
    matchUrl: string;
    matchName: string;
};

/**
 * Class responsible for handling live cricket match data.
 * Fetches and processes live match information from Cricbuzz.
 */
export class LiveMatches {
    private tableName: ModelName;
    private cricbuzzClient: CricbuzzClient;
    private readonly MATCH_ID_LENGTH = 16;

    constructor() {
        this.tableName = 'livematches';
        this.cricbuzzClient = new CricbuzzClient();
    }

    /**
     * Handles error logging and rejection.
     */
    private handleError(location: string, error: Error): Promise<never> {
        writeLogError([`${location} | error`, error]);
        return Promise.reject(new CustomError(error.message));
    }

    /**
     * Gets match data either for a specific match or all matches.
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
                    matchUrl: String(mongoData.matchUrl),
                    matchName: String(mongoData.matchName),
                };
            }

            writeLogError(['LiveMatches: getMatchById - No match found', { matchId }]);
            throw new Error(`No match found with id: ${matchId}`);
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
            const mongoData = await mongo.findAll(this.tableName, {
                limit: 100,
                orderBy: {
                    createdAt: 'desc',
                },
            });
            const dbDuration = Date.now() - startTime;
            logDatabaseOperation('findAll', this.tableName, true, dbDuration);

            writeLogDebug([
                'LiveMatches: getAllMatches - Found existing matches in DB',
                {
                    count: mongoData.length,
                    dbDuration: `${dbDuration}ms`,
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

    private async scrapeData(
        mongoData: LiveMatchesDbResponse[]
    ): Promise<Record<string, MatchData>> {
        const startTime = Date.now();
        writeLogDebug([
            'LiveMatches: scrapeData - Starting Cricbuzz match discovery',
            {
                existingDataCount: mongoData.length,
            },
        ]);

        try {
            const html = await this.cricbuzzClient.fetchHtml(MATCH_URL);

            writeLogDebug(['LiveMatches: scrapeData - Processing Cricbuzz live scores page']);
            const matchesData = this.processData(html, mongoData);

            const newMatchesCount = Object.keys(matchesData[1]).length;
            if (newMatchesCount > 0) {
                writeLogDebug([
                    'LiveMatches: scrapeData - Scheduling async insertion of new matches',
                    {
                        newMatchesCount,
                    },
                ]);
                insertDataToLiveMatchesTable(matchesData[1]).catch((error) => {
                    writeLogError(['LiveMatches: scrapeData - Async insertion failed', error]);
                });
            } else {
                writeLogDebug(['LiveMatches: scrapeData - No new matches to insert']);
            }

            const mergedMatchesData = { ...matchesData[0], ...matchesData[1] };
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
     * Processes Cricbuzz's current Next-rendered HTML to extract match links.
     * Existing app IDs are reused by Cricbuzz numeric match ID so slug changes do not create duplicates.
     */
    private processData(
        html: string,
        mongoData: LiveMatchesDbResponse[]
    ): [Record<string, MatchData>, Record<string, MatchData>] {
        const existingMatches: Record<string, MatchData> = {};
        const newMatches: Record<string, MatchData> = {};

        const existingMatchesByCricbuzzId = new Map<string, LiveMatchesDbResponse>();
        const existingMatchesByUrl = new Map<string, LiveMatchesDbResponse>();

        mongoData.forEach((match) => {
            const normalizedPath = normalizeCricbuzzPath(String(match.matchUrl));
            const cricbuzzMatchId = extractCricbuzzMatchIdFromUrl(String(match.matchUrl));

            if (cricbuzzMatchId) {
                existingMatchesByCricbuzzId.set(cricbuzzMatchId, match);
            }

            if (normalizedPath) {
                existingMatchesByUrl.set(normalizedPath, match);
            }
        });

        writeLogDebug([
            'LiveMatches: processData - Created lookup maps',
            {
                cricbuzzIdMapSize: existingMatchesByCricbuzzId.size,
                urlMapSize: existingMatchesByUrl.size,
            },
        ]);

        const parsedMatches = this.parseLiveScoreMatches(html);

        parsedMatches.forEach((match) => {
            const existingMatch =
                existingMatchesByCricbuzzId.get(match.cricbuzzMatchId) ??
                existingMatchesByUrl.get(match.matchUrl);

            if (existingMatch) {
                existingMatches[existingMatch.id] = {
                    matchUrl: match.matchUrl,
                    matchName: match.matchName,
                    matchId: existingMatch.id,
                };
                return;
            }

            const matchId = randomstring.generate({
                length: this.MATCH_ID_LENGTH,
                charset: 'alphanumeric',
            });
            newMatches[matchId] = {
                matchUrl: match.matchUrl,
                matchName: match.matchName,
                matchId,
            };
        });

        if (Object.keys(existingMatches).length === 0 && Object.keys(newMatches).length === 0) {
            throw new Error('No matches found');
        }

        writeLogDebug([
            'LiveMatches: processData - Processed matches',
            {
                existingCount: Object.keys(existingMatches).length,
                newCount: Object.keys(newMatches).length,
            },
        ]);

        return [existingMatches, newMatches];
    }

    private parseLiveScoreMatches(html: string): ParsedCricbuzzMatch[] {
        const $ = cheerio.load(html);
        const seenCricbuzzMatchIds = new Set<string>();
        const matches: ParsedCricbuzzMatch[] = [];

        $('a[href*="/live-cricket-scores/"]').each((_, element) => {
            const href = $(element).attr('href') ?? '';
            const matchUrl = normalizeCricbuzzPath(href);
            if (!matchUrl) {
                return;
            }

            const cricbuzzMatchId = extractCricbuzzMatchIdFromUrl(matchUrl);
            if (!cricbuzzMatchId || seenCricbuzzMatchIds.has(cricbuzzMatchId)) {
                return;
            }

            const matchName = buildMatchNameFromAnchor(
                $(element).attr('title'),
                $(element).text()
            );
            if (!matchName) {
                return;
            }

            seenCricbuzzMatchIds.add(cricbuzzMatchId);
            matches.push({
                cricbuzzMatchId,
                matchUrl,
                matchName,
            });
        });

        return matches;
    }
}
