/**
 * Utility functions for processing match statistics
 */

import { CheerioAPI } from 'cheerio';
import { writeLogInfo } from '@core/Logger';
import { CommentaryData, ITeamData, PlayerData, RunRateData } from '@types';

/**
 * Extracts team score string from the DOM
 * @param $ - Cheerio instance
 * @param isLive - Whether the match is currently live
 * @param isCurrentTeam - Whether this is the currently batting team
 * @returns Formatted score string
 */
export function getTeamScoreString($: any, isLive: boolean, isCurrentTeam: boolean): string {
    const selector = isLive
        ? isCurrentTeam
            ? 'span.cb-font-20.text-bold'
            : 'div.cb-text-gray.cb-font-16'
        : 'div.cb-col.cb-col-100.cb-min-tm';

    const element = isLive ? $(selector) : $(selector).eq(isCurrentTeam ? 1 : 0);

    return element.text().trim();
}

/**
 * Parses team score string into structured data
 * Handles single innings and two innings formats
 */
export function getTeamData(input: string, isBatting: boolean = false): ITeamData {
    const regex =
        /^(?<name>\w+)\s+(?<score1>\d+)(?:\/(?<wickets1>\d+))?(?:\s*&\s*(?<score2>\d+)(?:\/(?<wickets2>\d+))?)?(?:\s*\(\s*(?<overs>[\d.]+)\s*\))?$/;
    const match = input.match(regex);

    if (!match || !match.groups) {
        writeLogInfo(['matchStats | getTeamData | Invalid input format', input]);
        return {} as ITeamData;
    }

    const { name, score1, wickets1 = '10', score2, wickets2 = '10', overs } = match.groups;
    const hasTwoInnings = score2 !== undefined;

    const result: ITeamData = {
        isBatting,
        name,
        score: hasTwoInnings ? score2 : score1,
        wickets: hasTwoInnings ? wickets2 : wickets1,
        ...(hasTwoInnings && {
            previousInnings: {
                score: score1,
                wickets: wickets1,
            },
        }),
    };

    const parsedOvers = parseFloat(overs);
    if (!isNaN(parsedOvers) && parsedOvers > 0) {
        result.overs = overs;
    }

    return result;
}

/**
 * Extracts batsman statistics from the DOM
 */
export function getBatsmanData($: CheerioAPI, index: number): PlayerData {
    const nameSelector = 'div.cb-col.cb-col-50';
    const statsSelector = 'div.cb-col.cb-col-10.ab.text-right';

    return {
        name: $(nameSelector)
            .eq(index + 1)
            .find('a')
            .text(),
        runs: $(statsSelector)
            .eq(index * 2)
            .text(),
        balls: $(statsSelector)
            .eq(index * 2 + 1)
            .text(),
    };
}

/**
 * Extracts current and required run rates from the DOM
 */
export function getRunRate($: CheerioAPI): RunRateData {
    const selector = 'span.cb-font-12.cb-text-gray';
    const elements = $(selector);

    let currentRunRateElement = elements.eq(0).text().trim();
    let requiredRunRateElement = elements.eq(1).text().trim();
    let currentRunRate = 0, requiredRunRate = 0;

    if (currentRunRateElement.includes('CRR')) {
        currentRunRate = Number(currentRunRateElement.split(':')[1].trim());
    }

    if (requiredRunRateElement.includes('RRR')) {
        requiredRunRate = Number(requiredRunRateElement.split(':')[1].trim());
    }

    return {
        currentRunRate,
        requiredRunRate,
    };
}

/**
 * Extracts the match commentary from the DOM
 * @param $ - Cheerio instance
 * @returns Array of commentary objects
 */
export function getMatchCommentary($: CheerioAPI): CommentaryData[] {
    // commentaries are in the format of "over: commentary"
    // but sometimes the over is not present
    // if over is present then the selector is "p.cb-col.cb-col-90"
    // else the selector is "p.cb-col.cb-col-100"
    
    const result: CommentaryData[] = [];
    
    // Get all commentary elements in DOM order
    const allCommentaryElements = $('p.cb-col.cb-col-90, p.cb-col.cb-col-100');
    const allOverElements = $('div.cb-ovr-num');
    
    allCommentaryElements.each((index, el) => {
        const commentary = $(el).text().trim();
        if (!commentary) return;
        
        // Check if this is a 90% width commentary (has associated over)
        if ($(el).hasClass('cb-col-90')) {
            // Try to find corresponding over
            const overElement = allOverElements.eq(index);
            const overText = overElement.text().trim();
            
            result.push({
                over: overText || undefined,
                commentary,
                hasOver: !!overText
            });
        } else {
            // 100% width commentary (no over)
            result.push({
                commentary,
                hasOver: false
            });
        }
    });
    
    return result.filter(item => item.commentary.trim().length > 0);
}

/**
 * Extracts the key stats from the DOM
 */
export function getKeyStats($: CheerioAPI): { [key: string]: string } {
    const parentSelector = 'div.cb-min-itm-rw';
    const keySelector = 'span.text-bold';
    const valueSelector = 'span:not(.text-bold)';
    const element = $(parentSelector).find(keySelector);
    console.log('Key Stats:', element.text().trim());
    const valueElement = $(parentSelector).find(valueSelector);
    console.log('Value Stats:', valueElement.text().trim());

    // map the key: value pairs
    const result: { [key: string]: string } = {};
    element.each((index, el) => {
        const key = $(el).text().trim();
        const value = valueElement.eq(index).text().trim();
        result[key] = value;
    });

    return result;
}