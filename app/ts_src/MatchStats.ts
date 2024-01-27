import { LiveMatches } from './LiveMatches';
import { Utils } from './Utils';
const mongo = require('../core/baseModel');
const _ = require('underscore');
import { writeLogInfo, writeLogError } from '../core/logger';

interface LiveMatchesResponse {
    matchUrl?: string;
    matchName?: string;
    matchId?: string;
}
export class MatchStats {
    private matchId: string;
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
                throw new Error('Match Id is required');
            }
    
            // matchId should be 0 or alphanumeric string of length 16
            if (matchId !== "0" && !matchId.match(/^[a-zA-Z0-9]{16}$/)) {
                throw new Error('Invalid match id');
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
        const dataPromises = Object.entries(liveMatchesResponse).map(async ([matchId, match]) => {
            const scrapedData = await this.scrapeData(match.matchUrl, matchId);
            _.extend(scrapedData, { matchName: match.matchName });

            // save data to db if not already exists
            const mongoData = await mongo.findById(matchId, this.tableName);
            if (!mongoData.length) {
                await this.utilsObj.insertDataToMatchStatsTable(scrapedData, matchId);
            }

            return { ...scrapedData, matchId: matchId };
        });

        const data = await Promise.all(dataPromises);

        if (!data.length) {
            return 'No matches found';
        }

        return data;
    }

    private async getStatsForSingleMatch(liveMatchesResponse: LiveMatchesResponse, matchId: string): Promise<{} | 'Match Id is invalid'> {
        let mongoData = await mongo.findById(matchId, this.tableName);
        if (mongoData.length) {
            // create a deep copy of the object and delete unwanted properties mongoData[0]
            const returnObj = JSON.parse(JSON.stringify(mongoData[0]));
            returnObj['matchId'] = returnObj['_id'];
            delete returnObj['_id'];
            delete returnObj['__v'];
            delete returnObj['createdAt'];

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

    private getMatchStatsByMatchId($, matchId: string): Promise<{}> {
        let matchData = {};
    
        try {
            // if live match 'span.cb-font-20.text-bold' else 'h2.cb-col.cb-col-100.cb-min-tm.ng-binding'
            let isLive = $('div.cb-text-complete').length === 0;
            let currentTeamElement = isLive ? $('span.cb-font-20.text-bold') : $('div.cb-col.cb-col-100.cb-min-tm').eq(1);
            let currentTeamScoreString = currentTeamElement.text().trim();
            let otherTeamElement = isLive ? $('div.cb-text-gray.cb-font-16') : $('div.cb-col.cb-col-100.cb-min-tm.cb-text-gray');
            let otherTeamScoreString = otherTeamElement.text().trim();
    
            matchData = {
                matchId: matchId,
                team1: this.getTeamData(currentTeamScoreString, true),
                team2: this.getTeamData(otherTeamScoreString),
                onBatting: {
                    player1: this.getBatsmanData($, 0),
                    player2: this.getBatsmanData($, 1)
                },
                summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
            };
    
            return Promise.resolve(matchData);
        } catch (error) {
            writeLogError(['matchStats | getMatchStatsByMatchId |', error]);
            throw error;
        }
    }

    private getTeamData(input: string, isBatting: boolean = false): { name: string, score: string, overs?: string, wickets: string, previousInnings?: { score: string, wickets: string } } | {} {
        const regex = /(\w+)\s+(\d+)(?:\/(\d+))?(?:\s*&\s*(\d+)(?:\/(\d+))?)?(?:\s*\(\s*([\d.]+)\s*\))?/;
        const match = input.match(regex);
        if (!match) {
            writeLogInfo(['matchStats | getTeamData | input', input]);
            return {}
        }

        const [, name, score1, wickets1, score2, wickets2, overs] = match;
        let score, wickets, previousInnings;

        if (score2 !== undefined) {
            // Two innings scenario
            score = score2;
            wickets = wickets2 !== undefined ? wickets2 : "10"; // If wickets are not provided, assume 10 wickets (all out)
            previousInnings = { score: score1, wickets: wickets1 || "10" };
        } else {
            // Single innings scenario
            score = score1;
            wickets = wickets1 !== undefined ? wickets1 : "10"; // If wickets are not provided, assume 10 wickets (all out)
        }

        const result: { isBatting: boolean, name: string, score: string, overs?: string, wickets: string, previousInnings?: { score: string, wickets: string } } = { name, score, wickets, isBatting: isBatting };

        if (overs && parseFloat(overs) > 0) {
            result.overs = overs;
        }

        if (previousInnings) {
            result.previousInnings = { score: previousInnings.score, wickets: previousInnings.wickets };
        }


        // Remove undefined and 0 overs properties
        Object.keys(result).forEach(key => (result[key] === undefined || (key === "overs" && result[key] === "0")) && delete result[key]);

        return result;
    }

    private getBatsmanData($, index: number): { name: string, runs: string, balls: string } {
        return {
            name: $('div.cb-col.cb-col-50').eq(index + 1).find('a').text(),
            runs: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2).text(),
            balls: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2 + 1).text()
        };
    }
}