import { LiveMatches } from '../LiveMatches';
import { Utils } from '../Utils';
import * as mongo from '../../core/baseModel';
import { writeLogInfo, writeLogError } from '../../core/logger';
import { InvalidMatchIdError, MatchIdRequriedError, NoMatchesFoundError } from '../errors';
import { LiveMatchesResponse, ITeamData, MatchData } from './MatchStatsInterfaces';
import { getTeamScoreString, getTeamData, getBatsmanData } from './MatchUtils'
const _ = require('underscore');


export class MatchStats {
    private tableName: string;
    private liveMatchesObj: LiveMatches;
    private utilsObj: Utils;

    constructor() {
        this.tableName = 'matchStats';
        this.liveMatchesObj = new LiveMatches();
        this.utilsObj = new Utils();
    }

    public async getMatchStats(matchId: string): Promise<{}> {
        try {
            if (!matchId) {
                throw new MatchIdRequriedError();
            }
    
            // matchId should be 0 or alphanumeric string of length 16
            if (matchId !== "0" && !matchId.match(/^[a-zA-Z0-9]{16}$/)) {
                throw new InvalidMatchIdError(matchId);
            }
    
            const liveMatchesResponse = await this.liveMatchesObj.getMatches(matchId);
    
            // If matchId is not "0", get stats for the single match
            // Otherwise, get stats for all matches
            if (matchId !== "0") {
                return this.getStatsForSingleMatch(liveMatchesResponse, matchId);
            }
    
            return this.getStatsForAllMatches(liveMatchesResponse);
        } catch (error) {
            writeLogError(['matchStats | getMatchStats | error', error]);
            throw error; // re-throw the original error
        }
    }

    private async getStatsForAllMatches(liveMatchesResponse: LiveMatchesResponse): Promise<{} | 'No matches found'> {
        // Fetch all data from the database at once
        const allMongoData = await mongo.findAll(this.tableName);
    
        const dataPromises = Object.entries(liveMatchesResponse).map(async ([matchId, match]) => {
            const scrapedData = await this.scrapeData(match.matchUrl, matchId);
            _.extend(scrapedData, { matchName: match.matchName });
    
            // Check if data already exists in the fetched data
            const mongoData = allMongoData.find(data => data._id === matchId);
            if (!mongoData) {
                await this.utilsObj.insertDataToMatchStatsTable(scrapedData, matchId);
            }
    
            return { ...scrapedData, matchId: matchId };
        });
    
        const data = await Promise.all(dataPromises);
    
        if (!data.length) {
            throw new NoMatchesFoundError();
        }
    
        return data;
    }

    private async getStatsForSingleMatch(liveMatchesResponse: LiveMatchesResponse, matchId: string): Promise<{} | 'Match Id is invalid'> {
        let mongoData = await mongo.findById(matchId, this.tableName);
        if (mongoData.length) {
            // Only add the properties you need
            const returnObj = {
                matchId: mongoData[0]._id,
                team1: mongoData[0].team1,
                team2: mongoData[0].team2,
                onBatting: mongoData[0].onBatting,
                summary: mongoData[0].summary,
                tournamentName: mongoData[0].tournamentName,
                matchName: mongoData[0].matchName
            };
    
            return returnObj;
        } else if (_.has(liveMatchesResponse, 'matchId')) {
            const url = liveMatchesResponse.matchUrl;
            const scrapedData = await this.scrapeData(url, matchId);
            _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
            await this.utilsObj.insertDataToMatchStatsTable(scrapedData);
    
            return scrapedData;
        }
    
        return 'Match Id is invalid';
    }

    private async scrapeData(url, matchId: string): Promise<{}> {
        try {
            if (!matchId) return Promise.resolve('Match Id is required');
    
            url = 'https://www.cricbuzz.com' + url;
            const response = await this.utilsObj.fetchData(url);
    
            let tournamentName = await this.getTournamentName(response);
    
            let finalResponse = await this.getMatchStatsByMatchId(response, matchId);
            finalResponse['tournamentName'] = tournamentName;
    
            return Promise.resolve(finalResponse);
        } catch (error) {
            writeLogError(['matchStats | scrapeData |', error, url]);
            return Promise.reject(error);
        }
    }

    private async getTournamentName($): Promise<string[]> {
        try {
            const elements = $('.cb-col.cb-col-100.cb-bg-white');
            if (elements.length === 0) {
                throw new Error('No elements found with the selector .cb-col.cb-col-100.cb-bg-white');
            }
            const tournamentNames = elements.map((i, el) => $(el).find('a').attr('title')).get();
            return tournamentNames[0];
        } catch (error) {
            throw new Error(`Error while fetching tournament name: ${error.message}`);
        }
    }

    private getMatchStatsByMatchId($, matchId: string): Promise<MatchData> {
        return new Promise((resolve, reject) => {
            try {
                let isLive = $('div.cb-text-complete').length === 0;
                let currentTeamScoreString = getTeamScoreString($, isLive, true);
                let otherTeamScoreString = getTeamScoreString($, isLive, false);
    
                let matchData: MatchData = {
                    matchId: matchId,
                    team1: getTeamData(currentTeamScoreString, true),
                    team2: getTeamData(otherTeamScoreString),
                    onBatting: {
                        player1: getBatsmanData($, 0),
                        player2: getBatsmanData($, 1)
                    },
                    summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
                };
    
                resolve(matchData);
            } catch (error) {
                writeLogError(['matchStats | getMatchStatsByMatchId |', error]);
                reject(error);
            }
        });
    }
}