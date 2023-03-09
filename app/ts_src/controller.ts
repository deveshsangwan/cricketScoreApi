import { LiveMatches } from "./LiveMatches/LiveMatches";
import { MatchStats } from "./MatchStats/MatchStats";

const live = async (req, res) => {
    const liveMatchesObj = new LiveMatches();
    const liveMatchesResponse = await liveMatchesObj.getMatches();

    return res.status(200).send({
        status: true,
        message: 'Live Matches',
        response: liveMatchesResponse
    });
};

const matchStats = async (req, res) => {
    const matchId = req.params.matchId;
    console.log('matchId', matchId);
    
    const matchStatsObj = new MatchStats(matchId);
    const matchStatsResponse = await matchStatsObj.getMatchStats();

    return res.status(200).send({
        status: true,
        message: 'Match Stats',
        response: matchStatsResponse
    });
}

module.exports = {
    live,
    matchStats
};