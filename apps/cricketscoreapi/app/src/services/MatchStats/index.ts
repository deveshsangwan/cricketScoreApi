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
import type {
    CommentaryData,
    ITeamData,
    LiveMatchesResponse,
    MatchData,
    MatchStatsResponse,
    PlayerData,
} from '@types';
import { isError, isLiveMatchesResponse, isMatchStatsResponse } from '@utils/TypesUtils';
import type { ModelName } from '@core/BaseModel';
import { CricbuzzClient } from '@services/Cricbuzz/CricbuzzClient';
import {
    cleanText,
    extractCricbuzzMatchIdFromUrl,
    stripHtml,
    toNumber,
    toStringValue,
} from '@services/Cricbuzz/CricbuzzUtils';

type CricbuzzTeam = {
    id?: number;
    name?: string;
    shortName?: string;
};

type CricbuzzMatchTeamInfo = {
    battingTeamId?: number;
    battingTeamShortName?: string;
    bowlingTeamId?: number;
    bowlingTeamShortName?: string;
};

type CricbuzzTossResults = {
    tossWinnerName?: string;
    decision?: string;
};

type CricbuzzMatchHeader = {
    matchId?: number;
    matchDescription?: string;
    matchFormat?: string;
    state?: string;
    status?: string;
    seriesName?: string;
    seriesDesc?: string;
    team1?: CricbuzzTeam;
    team2?: CricbuzzTeam;
    matchTeamInfo?: CricbuzzMatchTeamInfo[];
    tossResults?: CricbuzzTossResults;
};

type CricbuzzInningsScore = {
    inningsId?: number;
    batTeamId?: number;
    batTeamName?: string;
    score?: number;
    wickets?: number;
    overs?: number;
};

type CricbuzzMatchScoreDetails = {
    inningsScoreList?: CricbuzzInningsScore[];
    state?: string;
    customStatus?: string;
    matchFormat?: string;
    tossResults?: CricbuzzTossResults;
    matchTeamInfo?: CricbuzzMatchTeamInfo[];
};

type CricbuzzBatTeam = {
    teamId?: number;
    teamScore?: number;
    teamWkts?: number;
};

type CricbuzzPlayer = {
    name?: string;
    batName?: string;
    runs?: number | string;
    batRuns?: number | string;
    balls?: number | string;
    batBalls?: number | string;
};

type CricbuzzBowler = {
    name?: string;
    bowlName?: string;
    overs?: number;
    bowlOvs?: number;
    runs?: number;
    bowlRuns?: number;
    wickets?: number;
    bowlWkts?: number;
};

type CricbuzzMiniScore = {
    inningsId?: number;
    batTeam?: CricbuzzBatTeam;
    batsmanStriker?: CricbuzzPlayer;
    batsmanNonStriker?: CricbuzzPlayer;
    bowlerStriker?: CricbuzzBowler;
    bowlerNonStriker?: CricbuzzBowler;
    overs?: number;
    partnerShip?: {
        balls?: number;
        runs?: number;
    };
    currentRunRate?: number;
    requiredRunRate?: number;
    matchScoreDetails?: CricbuzzMatchScoreDetails;
    lastWicket?: string;
    recentOvsStats?: string;
    status?: string;
};

type CricbuzzCommentaryItem = {
    commType?: string;
    commText?: string;
    ballMetric?: number | string;
    timestamp?: number;
};

type CricbuzzCommentaryResponse = {
    matchCommentary?: Record<string, CricbuzzCommentaryItem>;
    miniscore?: CricbuzzMiniScore;
    matchHeader?: CricbuzzMatchHeader;
    status?: string;
    responseLastUpdated?: number;
};

type CricbuzzScorecardInnings = {
    inningsId?: number;
    batTeamDetails?: {
        batTeamId?: number;
        batTeamName?: string;
        batTeamShortName?: string;
    };
    scoreDetails?: {
        runs?: number;
        wickets?: number;
        overs?: number;
        runRate?: number;
    };
};

type CricbuzzScorecardResponse = {
    scoreCard?: CricbuzzScorecardInnings[];
    matchHeader?: CricbuzzMatchHeader;
    status?: string;
    isMatchComplete?: boolean;
    responseLastUpdated?: number;
};

type NormalizedInningsScore = {
    inningsId: number;
    teamId?: number;
    teamName: string;
    score: number;
    wickets: number;
    overs?: number;
};

export class MatchStats {
    private tableName: ModelName;
    private liveMatchesObj: LiveMatches;
    private utilsObj: Utils;
    private cricbuzzClient: CricbuzzClient;

    constructor() {
        this.tableName = 'matchstats';
        this.liveMatchesObj = new LiveMatches();
        this.utilsObj = new Utils();
        this.cricbuzzClient = new CricbuzzClient();
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

            if (matchId !== '0' && !matchId.match(/^[a-zA-Z0-9]{16}$/)) {
                writeLogError(['MatchStats: getMatchStats - Invalid matchId format', { matchId }]);
                throw new InvalidMatchIdError(matchId);
            }

            writeLogDebug(['MatchStats: getMatchStats - Fetching live matches data', { matchId }]);
            const liveMatchesResponse = await this.liveMatchesObj.getMatches(matchId);

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
            throw error;
        }
    }

    private async getStatsForAllMatches(
        liveMatchesResponse: LiveMatchesResponse
    ): Promise<MatchStatsResponse[]> {
        const startTime = Date.now();
        const matchCount = Object.keys(liveMatchesResponse).length;
        writeLogDebug(['MatchStats: getStatsForAllMatches - Starting', { matchCount }]);

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

            const mongoData = allMongoData.find((data: { id: string }) => data.id === matchId);
            const cachedData = this.getCachedMatchStats(mongoData, matchId);

            try {
                const scrapedData = await this.scrapeData(String(match.matchUrl), matchId);
                const finalData = { ...scrapedData, matchName: String(match.matchName), matchId };

                this.utilsObj.insertDataToMatchStatsTable(finalData, matchId).catch((error) => {
                    writeLogError(['MatchStats: Background upsert failed', { matchId, error }]);
                });

                return finalData;
            } catch (error) {
                if (cachedData) {
                    writeLogError([
                        'MatchStats: getStatsForAllMatches - Fresh fetch failed, using cache',
                        { matchId, error },
                    ]);
                    return cachedData;
                }

                throw error;
            }
        });

        const data = await Promise.all(dataPromises);

        if (!data.length) {
            writeLogError(['MatchStats: getStatsForAllMatches - No matches found']);
            throw new NoMatchesFoundError();
        }

        return data;
    }

    private async getStatsForSingleMatch(
        liveMatchesResponse: MatchData,
        matchId: string
    ): Promise<MatchStatsResponse> {
        const startTime = Date.now();
        writeLogDebug(['MatchStats: getStatsForSingleMatch - Starting', { matchId }]);

        const mongoData = await mongo.findById(matchId, this.tableName);
        const dbDuration = Date.now() - startTime;
        logDatabaseOperation('findById', this.tableName, !!mongoData, dbDuration);
        const cachedData = this.getCachedMatchStats(mongoData, matchId);

        if ('matchId' in liveMatchesResponse) {
            writeLogDebug([
                'MatchStats: getStatsForSingleMatch - Fetching fresh Cricbuzz data',
                {
                    matchId,
                    matchUrl: liveMatchesResponse.matchUrl,
                    hasCachedData: !!cachedData,
                },
            ]);

            try {
                const scrapedData = await this.scrapeData(String(liveMatchesResponse.matchUrl), matchId);
                const finalData = {
                    ...scrapedData,
                    matchName: String(liveMatchesResponse.matchName),
                    matchId,
                };

                this.utilsObj.insertDataToMatchStatsTable(finalData, matchId).catch((error) => {
                    writeLogError([
                        'MatchStats: Background upsert failed for single match',
                        { matchId, error },
                    ]);
                });

                return finalData;
            } catch (error) {
                if (cachedData) {
                    writeLogError([
                        'MatchStats: getStatsForSingleMatch - Fresh fetch failed, using cache',
                        { matchId, error },
                    ]);
                    return cachedData;
                }

                throw error;
            }
        }

        if (cachedData) {
            writeLogDebug(['MatchStats: getStatsForSingleMatch - Returning cached data', { matchId }]);
            return cachedData;
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

            const cricbuzzMatchId = extractCricbuzzMatchIdFromUrl(url);
            if (!cricbuzzMatchId) {
                throw new Error(`Unable to extract Cricbuzz match id from URL: ${url}`);
            }

            const commentary = await this.cricbuzzClient.fetchJson<CricbuzzCommentaryResponse>(
                `/api/mcenter/comm/${cricbuzzMatchId}`
            );

            let scorecard: CricbuzzScorecardResponse | undefined;
            if (this.shouldFetchScorecard(commentary)) {
                scorecard = await this.cricbuzzClient.fetchJson<CricbuzzScorecardResponse>(
                    `/api/mcenter/scorecard/${cricbuzzMatchId}`
                );
            }

            const finalResponse = this.prepareMatchStats(commentary, scorecard, matchId);
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

    private shouldFetchScorecard(commentary: CricbuzzCommentaryResponse): boolean {
        const state = cleanText(
            commentary.matchHeader?.state ?? commentary.miniscore?.matchScoreDetails?.state
        );
        const inningsScoreList = commentary.miniscore?.matchScoreDetails?.inningsScoreList ?? [];

        return inningsScoreList.length === 0 || state !== 'In Progress';
    }

    private prepareMatchStats(
        commentary: CricbuzzCommentaryResponse,
        scorecard: CricbuzzScorecardResponse | undefined,
        matchId: string
    ): MatchStatsResponse {
        try {
            const matchHeader = commentary.matchHeader ?? scorecard?.matchHeader;
            const miniscore = commentary.miniscore;
            const inningsScores = this.buildInningsScores(commentary, scorecard);
            const battingTeamId = this.getBattingTeamId(matchHeader, miniscore);

            const matchData: MatchStatsResponse = {
                matchId,
                team1: this.getTeamData(matchHeader?.team1, inningsScores, battingTeamId),
                team2: this.getTeamData(matchHeader?.team2, inningsScores, battingTeamId),
                onBatting: {
                    player1: this.getPlayerData(miniscore?.batsmanStriker),
                    player2: this.getPlayerData(miniscore?.batsmanNonStriker),
                },
                runRate: {
                    currentRunRate: toNumber(miniscore?.currentRunRate),
                    requiredRunRate: toNumber(miniscore?.requiredRunRate),
                },
                summary: this.getSummary(commentary, scorecard),
                tournamentName: cleanText(matchHeader?.seriesName ?? matchHeader?.seriesDesc),
                isLive: this.isLiveState(
                    matchHeader?.state ??
                        miniscore?.matchScoreDetails?.state ??
                        scorecard?.matchHeader?.state
                ),
                matchCommentary: this.getMatchCommentary(commentary),
                keyStats: this.getKeyStats(commentary, matchHeader),
            };

            return matchData;
        } catch (error) {
            writeLogError(['matchStats | prepareMatchStats |', error]);
            throw error;
        }
    }

    private buildInningsScores(
        commentary: CricbuzzCommentaryResponse,
        scorecard: CricbuzzScorecardResponse | undefined
    ): NormalizedInningsScore[] {
        const scores = new Map<string, NormalizedInningsScore>();

        (scorecard?.scoreCard ?? []).forEach((innings) => {
            const normalized = this.normalizeScorecardInnings(innings);
            if (normalized) {
                scores.set(this.getInningsKey(normalized), normalized);
            }
        });

        (commentary.miniscore?.matchScoreDetails?.inningsScoreList ?? []).forEach((innings) => {
            const normalized = this.normalizeCommentaryInnings(innings);
            if (normalized) {
                scores.set(this.getInningsKey(normalized), normalized);
            }
        });

        return Array.from(scores.values()).sort((a, b) => a.inningsId - b.inningsId);
    }

    private normalizeCommentaryInnings(
        innings: CricbuzzInningsScore
    ): NormalizedInningsScore | null {
        const inningsId = toNumber(innings.inningsId, -1);
        if (inningsId < 0) {
            return null;
        }

        return {
            inningsId,
            teamId: innings.batTeamId,
            teamName: cleanText(innings.batTeamName),
            score: toNumber(innings.score),
            wickets: toNumber(innings.wickets),
            overs: innings.overs,
        };
    }

    private normalizeScorecardInnings(
        innings: CricbuzzScorecardInnings
    ): NormalizedInningsScore | null {
        const inningsId = toNumber(innings.inningsId, -1);
        if (inningsId < 0) {
            return null;
        }

        return {
            inningsId,
            teamId: innings.batTeamDetails?.batTeamId,
            teamName: cleanText(
                innings.batTeamDetails?.batTeamShortName ?? innings.batTeamDetails?.batTeamName
            ),
            score: toNumber(innings.scoreDetails?.runs),
            wickets: toNumber(innings.scoreDetails?.wickets),
            overs: innings.scoreDetails?.overs,
        };
    }

    private getInningsKey(score: NormalizedInningsScore): string {
        return `${score.inningsId}-${score.teamId ?? score.teamName}`;
    }

    private getBattingTeamId(
        matchHeader: CricbuzzMatchHeader | undefined,
        miniscore: CricbuzzMiniScore | undefined
    ): number | undefined {
        return (
            miniscore?.batTeam?.teamId ??
            matchHeader?.matchTeamInfo?.[0]?.battingTeamId
        );
    }

    private getTeamData(
        team: CricbuzzTeam | undefined,
        inningsScores: NormalizedInningsScore[],
        battingTeamId: number | undefined
    ): ITeamData {
        const teamName = cleanText(team?.shortName ?? team?.name);
        const teamScores = inningsScores.filter((score) => {
            if (team?.id !== undefined && score.teamId === team.id) {
                return true;
            }

            return !!teamName && score.teamName === teamName;
        });
        const latestScore = teamScores[teamScores.length - 1];
        const previousScore = teamScores.length > 1 ? teamScores[teamScores.length - 2] : undefined;

        const result: ITeamData = {
            isBatting: team?.id !== undefined && battingTeamId === team.id,
            name: latestScore?.teamName || teamName || cleanText(team?.name),
            score: latestScore ? toStringValue(latestScore.score, '0') : '',
            wickets: latestScore ? toStringValue(latestScore.wickets, '0') : '',
        };

        if (latestScore?.overs !== undefined) {
            result.overs = toStringValue(latestScore.overs);
        }

        if (previousScore) {
            result.previousInnings = {
                score: toStringValue(previousScore.score, '0'),
                wickets: toStringValue(previousScore.wickets, '0'),
            };
        }

        return result;
    }

    private getPlayerData(player: CricbuzzPlayer | undefined): PlayerData {
        return {
            name: cleanText(player?.name ?? player?.batName),
            runs: toStringValue(player?.runs ?? player?.batRuns),
            balls: toStringValue(player?.balls ?? player?.batBalls),
        };
    }

    private getSummary(
        commentary: CricbuzzCommentaryResponse,
        scorecard: CricbuzzScorecardResponse | undefined
    ): string {
        return cleanText(
            commentary.matchHeader?.status ??
                commentary.miniscore?.status ??
                commentary.miniscore?.matchScoreDetails?.customStatus ??
                scorecard?.status ??
                scorecard?.matchHeader?.status
        );
    }

    private isLiveState(state: unknown): boolean {
        const normalizedState = cleanText(state).toLowerCase();
        if (!normalizedState) {
            return true;
        }

        return !['complete', 'abandon', 'abandoned', 'preview', 'upcoming'].includes(
            normalizedState
        );
    }

    private getMatchCommentary(commentary: CricbuzzCommentaryResponse): CommentaryData[] {
        return Object.values(commentary.matchCommentary ?? {})
            .filter((item) => cleanText(item.commText))
            .sort((a, b) => toNumber(b.timestamp) - toNumber(a.timestamp))
            .map((item) => {
                const over = item.ballMetric !== undefined ? toStringValue(item.ballMetric) : undefined;

                return {
                    over,
                    commentary: stripHtml(item.commText),
                    hasOver: over !== undefined,
                };
            });
    }

    private getKeyStats(
        commentary: CricbuzzCommentaryResponse,
        matchHeader: CricbuzzMatchHeader | undefined
    ): { [key: string]: string } {
        const miniscore = commentary.miniscore;
        const tossResults = matchHeader?.tossResults ?? miniscore?.matchScoreDetails?.tossResults;
        const keyStats: { [key: string]: string } = {};

        if (miniscore?.partnerShip) {
            keyStats.Partnership = `${toNumber(miniscore.partnerShip.runs)}(${toNumber(
                miniscore.partnerShip.balls
            )})`;
        }

        const lastWicket = cleanText(miniscore?.lastWicket);
        if (lastWicket) {
            keyStats['Last Wicket'] = lastWicket;
        }

        if (tossResults?.tossWinnerName || tossResults?.decision) {
            keyStats.Toss = cleanText(
                `${cleanText(tossResults.tossWinnerName)} ${cleanText(tossResults.decision)}`
            );
        }

        const recentOvers = cleanText(miniscore?.recentOvsStats);
        if (recentOvers) {
            keyStats.Recent = recentOvers;
        }

        return keyStats;
    }

    private getCachedMatchStats(data: unknown, matchId: string): MatchStatsResponse | null {
        if (!data || !isMatchStatsResponse(data)) {
            return null;
        }

        const record = data as MatchStatsResponse & { id?: string };
        return {
            matchId: record.matchId ?? record.id ?? matchId,
            team1: record.team1,
            team2: record.team2,
            onBatting: record.onBatting,
            runRate: record.runRate,
            summary: record.summary,
            matchCommentary: record.matchCommentary,
            keyStats: record.keyStats,
            tournamentName: record.tournamentName,
            matchName: record.matchName,
            isLive: record.isLive,
        };
    }
}
