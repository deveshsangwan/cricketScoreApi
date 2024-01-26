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

    constructor(matchId = "0") {
        this.matchId = matchId;
        this.tableName = 'matchStats';
        this.liveMatchesObj = new LiveMatches();
        this.utilsObj = new Utils();
    }

    public async getMatchStats(): Promise<{}> {
        try {
            const liveMatchesResponse = await this.liveMatchesObj.getMatches(this.matchId);

            if (this.matchId === "0") {
                return this.getStatsForAllMatches(liveMatchesResponse);
            } else if (this.matchId) {
                return this.getStatsForSingleMatch(liveMatchesResponse);
            }

            throw new Error('Invalid request');
        } catch (error) {
            writeLogError(['matchStats | getMatchStats | error', error]);
            throw new Error("Something went wrong");
        }
    }

    private async getStatsForAllMatches(liveMatchesResponse: LiveMatchesResponse): Promise<{} | 'No matches found'> {
        const dataPromises = Object.entries(liveMatchesResponse).map(async ([matchId, match]) => {
            const scrapedData = await this.scrapeData(match.matchUrl);
            _.extend(scrapedData, { matchName: match.matchName });

            // save data to db if not already exists
            const mongoData = await mongo.findById(matchId, this.tableName);
            if (!mongoData.length) {
                await this.utilsObj.insertDataToMatchStatsTable(scrapedData, matchId);
            }

            return {...scrapedData, matchId: matchId};
        });

        const data = await Promise.all(dataPromises);

        if (!data.length) {
            return 'No matches found';
        }

        return data;
    }

    private async getStatsForSingleMatch(liveMatchesResponse: LiveMatchesResponse): Promise<{} | 'Match Id is invalid'> {
        let mongoData = await mongo.findById(this.matchId, this.tableName);
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
            const scrapedData = await this.scrapeData(url);
            _.extend(scrapedData, { matchName: liveMatchesResponse.matchName });
            await this.utilsObj.insertDataToMatchStatsTable(scrapedData);

            return scrapedData;
        }

        return 'Match Id is invalid';
    }

    private async scrapeData(url): Promise<{}> {
        try {
            if (!this.matchId) return Promise.resolve('Match Id is required');

            url = 'https://www.cricbuzz.com' + url;
            const response = await this.utilsObj.fetchData(url);

            let tournamentName = await this.getTournamentName(response);

            let finalResponse = await this.getMatchStatsByMatchId(response);
            finalResponse['tournamentName'] = tournamentName;

            return Promise.resolve(finalResponse);
        } catch (error) {
            writeLogError(['matchStats | scrapeData |', error]);
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

    private getMatchStatsByMatchId($): Promise<{}> {
        let matchData = {};

        try {
            let currentTeamScoreString = $('span.cb-font-20.text-bold').text().trim();
            let otherTeamScoreString = $('div.cb-text-gray.cb-font-16').text().trim();
            const currentTeamDataArray = this.getTeamData(currentTeamScoreString);
            const otherTeamDataArray = this.getTeamData(otherTeamScoreString);

            matchData = {
                matchId: this.matchId,
                team1: this.getTeamObject(currentTeamDataArray, true),
                team2: this.getTeamObject(otherTeamDataArray, false),
                onBatting: {
                    player1: this.getBatsmanData($, 0),
                    player2: this.getBatsmanData($, 1)
                },
                summary: $('div.cb-text-stumps, div.cb-text-complete, div.cb-text-inprogress').text().trim()
            };

            this.addPreviousInningsData(matchData, currentTeamDataArray, 'team1');
            this.addPreviousInningsData(matchData, otherTeamDataArray, 'team2');

            return Promise.resolve(matchData);
        } catch (error) {
            writeLogError(['matchStats | getMatchStatsByMatchId |', error]);
            throw error;
        }
    }

    private getTeamData(scoreString: string): string[] {
        return scoreString.includes('&') ? this.parseTeamDataForTestMatches(scoreString) : scoreString.split(/[/\s/\-/\(/\)]/).filter(Boolean);
    }

    private getTeamObject(teamDataArray: string[], isBatting: boolean): {} {
        return !teamDataArray[0] ? {} : {
            isBatting: isBatting,
            name: teamDataArray[0],
            score: teamDataArray[1],
            overs: teamDataArray.length > 3 ? teamDataArray[3] : teamDataArray[2],
            wickets: teamDataArray.length > 3 ? teamDataArray[2] : "10",
        };
    }

    private getBatsmanData($, index: number): { name: string, runs: string, balls: string } {
        return {
            name: $('div.cb-col.cb-col-50').eq(index + 1).find('a').text(),
            runs: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2).text(),
            balls: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2 + 1).text()
        };
    }

    private addPreviousInningsData(matchData: {}, teamDataArray: string[], team: string) {
        if (teamDataArray.length > 4) {
            matchData[team]['previousInnings'] = {
                runs: teamDataArray[0],
                wickets: teamDataArray.length > 1 ? teamDataArray[1] : "10"
            };
        }
    }

    private parseTeamDataForTestMatches(scoreString): Array<any> {
        // Regular expression pattern to capture team name, score, wickets, and overs
        const pattern = /([A-Za-z\s]+)\s+(\d+(?:\/\d+)?)(?:\s+&\s+(\d+\/\d+\s+\(\d+(?:\.\d+)?\)))?/;
        let teamName = "", firstInnings = "", secondInnings = "", firstInningsData: string[] = [], secondInningsData: string[] = [];

        const matchData = scoreString.match(pattern);

        if (matchData) {
            [, teamName, firstInnings, secondInnings] = matchData;

            // Process first innings
            firstInningsData = firstInnings.split(/[/\s/\-/\(/\)]/).filter(Boolean);

            // Process second innings if present
            if (secondInnings) {
                secondInningsData = secondInnings.split(/[/\s/\-/\(/\)]/).filter(Boolean);
            }
        } else {
            writeLogError(["Invalid score format"]);
        }

        return secondInningsData.length > 0 ? [teamName, ...secondInningsData, firstInningsData] : [teamName, ...firstInningsData];
    }
}