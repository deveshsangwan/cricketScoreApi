/**
 * Utility functions for processing match statistics
 */

import { writeLogInfo } from '../../core/Logger';
import { ITeamData } from './MatchStatsInterfaces';

/**
 * Extracts team score string from the DOM
 * @param $ - Cheerio instance
 * @param isLive - Whether the match is currently live
 * @param isCurrentTeam - Whether this is the currently batting team
 * @returns Formatted score string
 */
export function getTeamScoreString($: any, isLive: boolean, isCurrentTeam: boolean): string {
    const selector = isLive
        ? (isCurrentTeam ? 'span.cb-font-20.text-bold' : 'div.cb-text-gray.cb-font-16')
        : 'div.cb-col.cb-col-100.cb-min-tm';
    
    const element = isLive 
        ? $(selector)
        : $(selector).eq(isCurrentTeam ? 1 : 0);

    return element.text().trim();
}

/**
 * Parses team score string into structured data
 * Handles single innings and two innings formats
 */
export function getTeamData(input: string, isBatting: boolean = false): ITeamData | Record<string, never> {
    const regex = /^(\w+)\s+(\d+)(?:\/(\d+))?(?:\s*&\s*(\d+)(?:\/(\d+))?)?(?:\s*\(\s*([\d.]+)\s*\))?$/;
    const match = input.match(regex);

    if (!match) {
        writeLogInfo(['matchStats | getTeamData | Invalid input format', input]);
        return {};
    }

    const [, name, score1, wickets1 = '10', score2, wickets2 = '10', overs] = match;
    const hasTwoInnings = score2 !== undefined;

    const result: ITeamData = {
        isBatting,
        name,
        score: hasTwoInnings ? score2 : score1,
        wickets: hasTwoInnings ? wickets2 : wickets1,
        ...(hasTwoInnings && {
            previousInnings: {
                score: score1,
                wickets: wickets1
            }
        })
    };

    if (overs && parseFloat(overs) > 0) {
        result.overs = overs;
    }

    return result;
}

/**
 * Extracts batsman statistics from the DOM
 */
export function getBatsmanData($: any, index: number): { 
    name: string;
    runs: string;
    balls: string;
} {
    const nameSelector = 'div.cb-col.cb-col-50';
    const statsSelector = 'div.cb-col.cb-col-10.ab.text-right';

    return {
        name: $(nameSelector).eq(index + 1).find('a').text(),
        runs: $(statsSelector).eq(index * 2).text(),
        balls: $(statsSelector).eq(index * 2 + 1).text()
    };
}

/**
 * Extracts current and required run rates from the DOM
 */
export function getRunRate($: any): {
    currentRunRate: string;
    requiredRunRate: string;
} {
    const selector = 'span.cb-font-12.cb-text-gray';
    const elements = $(selector);

    return {
        currentRunRate: elements.eq(0).text().trim(),
        requiredRunRate: elements.eq(1).text().trim() || ''
    };
}