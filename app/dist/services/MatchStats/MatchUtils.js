"use strict";
/**
 * Utility functions for processing match statistics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamScoreString = getTeamScoreString;
exports.getTeamData = getTeamData;
exports.getBatsmanData = getBatsmanData;
exports.getRunRate = getRunRate;
exports.getMatchCommentary = getMatchCommentary;
exports.getKeyStats = getKeyStats;
const Logger_1 = require("@core/Logger");
/**
 * Extracts team score string from the DOM
 * @param $ - Cheerio instance
 * @param isLive - Whether the match is currently live
 * @param isCurrentTeam - Whether this is the currently batting team
 * @returns Formatted score string
 */
function getTeamScoreString($, isLive, isCurrentTeam) {
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
function getTeamData(input, isBatting = false) {
    (0, Logger_1.writeLogDebug)(['MatchUtils: getTeamData - Processing input', { input, isBatting }]);
    const regex = /^(?<name>\w+)\s+(?<score1>\d+)(?:\/(?<wickets1>\d+))?(?:\s*&\s*(?<score2>\d+)(?:\/(?<wickets2>\d+))?)?(?:\s*\(\s*(?<overs>[\d.]+)\s*\))?$/;
    const match = input.match(regex);
    if (!match || !match.groups) {
        (0, Logger_1.writeLogInfo)(['matchStats | getTeamData | Invalid input format', input]);
        return {};
    }
    const { name, score1, wickets1 = '10', score2, wickets2 = '10', overs } = match.groups;
    const hasTwoInnings = score2 !== undefined;
    (0, Logger_1.writeLogDebug)([
        'MatchUtils: getTeamData - Parsed team data',
        {
            name,
            score1,
            wickets1,
            score2,
            wickets2,
            overs,
            hasTwoInnings,
        },
    ]);
    const result = {
        isBatting,
        name: name || '',
        score: hasTwoInnings ? score2 || '' : score1 || '',
        wickets: hasTwoInnings ? wickets2 : wickets1,
        ...(hasTwoInnings && {
            previousInnings: {
                score: score1 || '',
                wickets: wickets1 || '',
            },
        }),
    };
    const parsedOvers = parseFloat(overs || '0');
    if (!isNaN(parsedOvers) && parsedOvers > 0) {
        result.overs = overs;
    }
    (0, Logger_1.writeLogDebug)(['MatchUtils: getTeamData - Result', result]);
    return result;
}
/**
 * Extracts batsman statistics from the DOM
 */
function getBatsmanData($, index) {
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
function getRunRate($) {
    const selector = 'span.cb-font-12.cb-text-gray';
    const elements = $(selector);
    let currentRunRateElement = elements.eq(0).text().trim();
    let requiredRunRateElement = elements.eq(1).text().trim();
    let currentRunRate = 0, requiredRunRate = 0;
    if (currentRunRateElement.includes('CRR')) {
        currentRunRate = Number(currentRunRateElement.split(':')[1]?.trim() || '0');
    }
    if (requiredRunRateElement.includes('RRR')) {
        requiredRunRate = Number(requiredRunRateElement.split(':')[1]?.trim() || '0');
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
function getMatchCommentary($) {
    (0, Logger_1.writeLogDebug)(['MatchUtils: getMatchCommentary - Starting commentary extraction']);
    // commentaries are in the format of "over: commentary"
    // but sometimes the over is not present
    // if over is present then the selector is "p.cb-col.cb-col-90"
    // else the selector is "p.cb-col.cb-col-100"
    const result = [];
    // Get all commentary elements in DOM order
    const allCommentaryElements = $('p.cb-col.cb-col-90, p.cb-col.cb-col-100');
    const allOverElements = $('div.cb-ovr-num');
    (0, Logger_1.writeLogDebug)([
        'MatchUtils: getMatchCommentary - Found elements',
        {
            commentaryElements: allCommentaryElements.length,
            overElements: allOverElements.length,
        },
    ]);
    allCommentaryElements.each((index, el) => {
        const commentary = $(el).text().trim();
        if (!commentary)
            return;
        // Check if this is a 90% width commentary (has associated over)
        if ($(el).hasClass('cb-col-90')) {
            // Try to find corresponding over
            const overElement = allOverElements.eq(index);
            const overText = overElement.text().trim();
            result.push({
                over: overText || undefined,
                commentary,
                hasOver: !!overText,
            });
        }
        else {
            // 100% width commentary (no over)
            result.push({
                commentary,
                hasOver: false,
            });
        }
    });
    const filteredResult = result.filter((item) => item.commentary.trim().length > 0);
    (0, Logger_1.writeLogDebug)([
        'MatchUtils: getMatchCommentary - Extracted commentary',
        {
            totalItems: result.length,
            filteredItems: filteredResult.length,
        },
    ]);
    return filteredResult;
}
/**
 * Extracts the key stats from the DOM
 */
function getKeyStats($) {
    const parentSelector = 'div.cb-min-itm-rw';
    const keySelector = 'span.text-bold';
    const valueSelector = 'span:not(.text-bold)';
    const element = $(parentSelector).find(keySelector);
    const valueElement = $(parentSelector).find(valueSelector);
    // map the key: value pairs
    const result = {};
    element.each((index, el) => {
        const key = $(el).text().trim();
        const value = valueElement.eq(index).text().trim();
        result[key] = value;
    });
    return result;
}
//# sourceMappingURL=MatchUtils.js.map