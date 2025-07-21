import type { Request, Response } from 'express';
import { LiveMatches } from '@services/LiveMatches';
import { MatchStats } from '@services/MatchStats';
// Import types
import type { MatchStatsResponse, LiveMatchesResponse } from '@types';
import { isError, isString } from '@/utils/TypesUtils';
import { writeLogDebug, writeLogError, logServiceOperation } from '@core/Logger';

const live = async (_req: Request, res: Response) => {
    const startTime = Date.now();
    writeLogDebug(['Controller: live - Starting live matches request']);

    try {
        const liveMatchesObj = new LiveMatches();
        writeLogDebug(['Controller: live - Created LiveMatches instance']);

        const liveMatchesResponse = (await liveMatchesObj.getMatches()) as LiveMatchesResponse;
        const duration = Date.now() - startTime;

        writeLogDebug([
            'Controller: live - Successfully fetched live matches',
            {
                matchCount: Array.isArray(liveMatchesResponse)
                    ? liveMatchesResponse.length
                    : Object.keys(liveMatchesResponse).length,
                duration: `${duration}ms`,
            },
        ]);

        logServiceOperation('LiveMatches', 'getMatches', true, duration);

        return res.status(200).send({
            status: true,
            message: 'Live Matches',
            response: liveMatchesResponse,
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        writeLogError(['Controller: live - Error fetching live matches', error]);
        logServiceOperation('LiveMatches', 'getMatches', false, duration, {
            error: isError(error) ? error.message : 'Unknown error',
        });

        return res.status(500).send({
            status: false,
            message: 'Error fetching live matches',
            error: isError(error) ? error.message : 'Unknown error',
        });
    }
};

const matchStats = async (req: Request, res: Response) => {
    const startTime = Date.now();
    const matchId = req.params.matchId;

    writeLogDebug(['Controller: matchStats - Starting match stats request', { matchId }]);

    try {
        const matchStatsObj = new MatchStats();
        writeLogDebug(['Controller: matchStats - Created MatchStats instance']);

        if (!isString(matchId)) {
            writeLogError([
                'Controller: matchStats - Invalid match ID type',
                { matchId, type: typeof matchId },
            ]);
            return res.status(400).send({
                status: false,
                message: 'Invalid match ID',
            });
        }

        writeLogDebug(['Controller: matchStats - Fetching match stats for ID', matchId]);
        const matchStatsResponse = (await matchStatsObj.getMatchStats(
            matchId
        )) as MatchStatsResponse;

        const duration = Date.now() - startTime;
        writeLogDebug([
            'Controller: matchStats - Successfully fetched match stats',
            {
                matchId,
                duration: `${duration}ms`,
                hasData: !!matchStatsResponse,
            },
        ]);

        logServiceOperation('MatchStats', 'getMatchStats', true, duration, { matchId });

        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse,
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        writeLogError(['Controller: matchStats - Error fetching match stats', { matchId, error }]);
        logServiceOperation('MatchStats', 'getMatchStats', false, duration, {
            matchId,
            error: isError(error) ? error.message : 'Unknown error',
        });

        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: isError(error) ? error.message : 'Unknown error',
        });
    }
};

const getMatchStats = async (_req: Request, res: Response) => {
    const startTime = Date.now();
    writeLogDebug(['Controller: getMatchStats - Starting all match stats request']);

    try {
        const matchStatsObj = new MatchStats();
        writeLogDebug(['Controller: getMatchStats - Created MatchStats instance']);

        const matchStatsResponse = (await matchStatsObj.getMatchStats('0')) as MatchStatsResponse;
        const duration = Date.now() - startTime;

        writeLogDebug([
            'Controller: getMatchStats - Successfully fetched all match stats',
            {
                duration: `${duration}ms`,
                hasData: !!matchStatsResponse,
            },
        ]);

        logServiceOperation('MatchStats', 'getAllMatchStats', true, duration);

        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse,
        });
    } catch (error) {
        const duration = Date.now() - startTime;
        writeLogError(['Controller: getMatchStats - Error fetching all match stats', error]);
        logServiceOperation('MatchStats', 'getAllMatchStats', false, duration, {
            error: isError(error) ? error.message : 'Unknown error',
        });

        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: isError(error) ? error.message : 'Unknown error',
        });
    }
};

export default {
    live,
    matchStats,
    getMatchStats,
};
