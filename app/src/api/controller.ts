import { Request, Response } from 'express';
import { LiveMatches } from '@services/LiveMatches';
import { MatchStats } from '@services/MatchStats';
// Import types
import type { MatchStatsResponse, LiveMatchesResponse } from '@types';
import { isError } from '@/utils/TypesUtils';

const live = async (_req: Request, res: Response) => {
    try {
        const liveMatchesObj = new LiveMatches();
        const liveMatchesResponse = (await liveMatchesObj.getMatches()) as LiveMatchesResponse;

        return res.status(200).send({
            status: true,
            message: 'Live Matches',
            response: liveMatchesResponse,
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching live matches',
            error: isError(error) ? error.message : 'Unknown error',
        });
    }
};

const matchStats = async (req: Request, res: Response) => {
    try {
        const matchId = req.params.matchId;
        const matchStatsObj = new MatchStats();
        const matchStatsResponse = (await matchStatsObj.getMatchStats(
            matchId
        )) as MatchStatsResponse;

        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse,
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: isError(error) ? error.message : 'Unknown error',
        });
    }
};

const getMatchStats = async (_req: Request, res: Response) => {
    try {
        const matchStatsObj = new MatchStats();
        const matchStatsResponse = (await matchStatsObj.getMatchStats('0')) as MatchStatsResponse;

        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse,
        });
    } catch (error) {
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
