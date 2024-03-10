import { writeLogInfo } from '../../core/logger';
import { ITeamData } from './MatchStatsInterfaces';

export function getTeamScoreString($, isLive: boolean, isCurrentTeam: boolean): string {
    const element = isLive 
        ? (isCurrentTeam ? $('span.cb-font-20.text-bold') : $('div.cb-text-gray.cb-font-16')) 
        : $('div.cb-col.cb-col-100.cb-min-tm').eq(isCurrentTeam ? 1 : 0);
    return element.text().trim();
}

export function getTeamData(input: string, isBatting: boolean = false): ITeamData | {} {
    const regex = /(\w+)\s+(\d+)(?:\/(\d+))?(?:\s*&\s*(\d+)(?:\/(\d+))?)?(?:\s*\(\s*([\d.]+)\s*\))?/;
    const match = input.match(regex);
    if (!match) {
        writeLogInfo(['matchStats | getTeamData | input', input]);
        return {};
    }

    const [, name, score1, wickets1 = '10', score2, wickets2 = '10', overs] = match;
    const hasTwoInnings = score2 !== undefined;
    const score = hasTwoInnings ? score2 : score1;
    const wickets = hasTwoInnings ? wickets2 : wickets1;
    const previousInnings = hasTwoInnings ? { score: score1, wickets: wickets1 } : undefined;

    const result: ITeamData = { isBatting, name, score, wickets, previousInnings };

    if (overs && parseFloat(overs) > 0) {
        result.overs = overs;
    }

    return result;
}

export function getBatsmanData($, index: number): { name: string, runs: string, balls: string } {
    return {
        name: $('div.cb-col.cb-col-50').eq(index + 1).find('a').text(),
        runs: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2).text(),
        balls: $('div.cb-col.cb-col-10.ab.text-right').eq(index * 2 + 1).text()
    };
}