import { Request, Response } from 'express';
import { LiveMatches } from "./LiveMatches";
import { MatchStats } from "./MatchStats";

const live = async (req: Request, res: Response) => {
    try {
        const liveMatchesObj = new LiveMatches();
        const liveMatchesResponse = await liveMatchesObj.getMatches();

        return res.status(200).send({
            status: true,
            message: 'Live Matches',
            response: liveMatchesResponse
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching live matches',
            error: error.message
        });
    }
};

const matchStats = async (req: Request, res: Response) => {
    try {
        const matchId = req.params.matchId;
        const matchStatsObj = new MatchStats(matchId);
        const matchStatsResponse = await matchStatsObj.getMatchStats();

        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: error.message
        });
    }
}

const getMatchStats = async (req: Request, res: Response) => {
    try {
        const matchStatsObj = new MatchStats();
        const matchStatsResponse = await matchStatsObj.getMatchStats();

        return res.status(200).send({
            status: true,
            message: 'Match Stats',
            response: matchStatsResponse
        });
    } catch (error) {
        return res.status(500).send({
            status: false,
            message: 'Error fetching match stats',
            error: error.message
        });
    }
}

module.exports = {
    live,
    matchStats,
    getMatchStats
};