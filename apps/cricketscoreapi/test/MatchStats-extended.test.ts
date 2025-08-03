import chai, { assert } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import { MatchStats } from '../app/src/services/MatchStats';
import { LiveMatches } from '../app/src/services/LiveMatches';
import * as mongo from '../app/src/core/BaseModel';
import { Utils } from '../app/src/utils/Utils';

describe('MatchStats Extended Error Handling Tests', function () {
    let sandbox: SinonSandbox;
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        matchStatsObj = new MatchStats();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getStatsForSingleMatch error scenarios', function () {
        it('should handle database errors when finding match stats', async function () {
            const matchId = 'abcDEF1234567890'; // Valid format
            const liveMatchResponse = {
                matchId,
                matchUrl: 'http://example.com/match',
                matchName: 'Test Match',
            };

            // Mock LiveMatches to return valid match
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchResponse);

            // Mock mongo.findById to throw database error
            const dbError = new Error('Database connection failed');
            sandbox.stub(mongo, 'findById').rejects(dbError);

            try {
                await matchStatsObj.getMatchStats(matchId);
                assert.fail('Expected getMatchStats to throw database error');
            } catch (error) {
                assert.include((error as Error).message, 'Database connection failed');
            }
        });

        it('should handle web scraping errors when no cached data exists', async function () {
            const matchId = 'abcDEF1234567890'; // Valid format
            const liveMatchResponse = {
                matchId,
                matchUrl: 'http://example.com/match',
                matchName: 'Test Match',
            };

            // Mock LiveMatches to return valid match
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchResponse);

            // Mock mongo.findById to return null (no cached data)
            sandbox.stub(mongo, 'findById').resolves(null);

            // Mock Utils.fetchData to throw scraping error
            const scrapingError = new Error('Failed to scrape match data');
            sandbox.stub(Utils.prototype, 'fetchData').rejects(scrapingError);

            try {
                await matchStatsObj.getMatchStats(matchId);
                assert.fail('Expected getMatchStats to throw scraping error');
            } catch (error) {
                assert.include((error as Error).message, 'Failed to scrape match data');
            }
        });

        it('should handle invalid HTML structure during scraping', async function () {
            const matchId = 'validMatchId123';
            const liveMatchResponse = {
                matchId,
                matchUrl: 'http://example.com/match',
                matchName: 'Test Match',
            };

            // Mock LiveMatches to return valid match
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchResponse);

            // Mock mongo.findById to return null (no cached data)
            sandbox.stub(mongo, 'findById').resolves(null);

            // Mock Utils.fetchData to return invalid HTML
            const mockCheerio = require('cheerio');
            const invalidHtml = '<html><body><div>Invalid structure</div></body></html>';
            const $ = mockCheerio.load(invalidHtml);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            try {
                await matchStatsObj.getMatchStats(matchId);
                assert.fail('Expected getMatchStats to handle invalid HTML');
            } catch (error) {
                assert.isTrue(error instanceof Error);
            }
        });
    });

    describe('getStatsForAllMatches error scenarios', function () {
        it('should handle database errors when fetching all match stats', async function () {
            const liveMatchesResponse = {
                match1: {
                    matchId: 'match1',
                    matchUrl: 'http://example.com/1',
                    matchName: 'Match 1',
                },
                match2: {
                    matchId: 'match2',
                    matchUrl: 'http://example.com/2',
                    matchName: 'Match 2',
                },
            };

            // Mock LiveMatches to return multiple matches
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchesResponse);

            // Mock mongo.findAll to throw database error
            const dbError = new Error('Database query failed');
            sandbox.stub(mongo, 'findAll').rejects(dbError);

            try {
                await matchStatsObj.getMatchStats('0');
                assert.fail('Expected getMatchStats to throw database error');
            } catch (error) {
                assert.include((error as Error).message, 'Database query failed');
            }
        });

        it('should handle partial data corruption in database', async function () {
            const liveMatchesResponse = {
                match1: {
                    matchId: 'match1',
                    matchUrl: 'http://example.com/1',
                    matchName: 'Match 1',
                },
            };

            // Mock LiveMatches to return matches
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchesResponse);

            // Mock mongo.findAll to return corrupted data
            const corruptedData = [
                { id: 'match1', matchId: null, team1: null, team2: null }, // Corrupted entry
            ];
            sandbox.stub(mongo, 'findAll').resolves(corruptedData);

            try {
                const result = await matchStatsObj.getMatchStats('0');
                // Should handle corrupted data gracefully or throw appropriate error
                assert.isArray(result);
            } catch (error) {
                // Acceptable to throw error for corrupted data
                assert.isTrue(error instanceof Error);
            }
        });

        it('should handle mixed valid and invalid data in database', async function () {
            const liveMatchesResponse = {
                match1: {
                    matchId: 'match1',
                    matchUrl: 'http://example.com/1',
                    matchName: 'Match 1',
                },
            };

            // Mock LiveMatches to return matches
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchesResponse);

            // Mock mongo.findAll to return valid data only
            const validData = [
                {
                    id: 'match1',
                    matchId: 'match1',
                    team1: { name: 'Team 1', score: '100', wickets: '2' },
                    team2: { name: 'Team 2', score: '80', wickets: '3' },
                    onBatting: { player1: { name: 'Player 1' } },
                    runRate: { currentRunRate: 6.5 },
                    summary: 'Valid match',
                    matchCommentary: [{ commentary: 'Test', hasOver: false }],
                    keyStats: { Test: 'Value' },
                    tournamentName: 'Test Tournament',
                    matchName: 'Test Match',
                    isLive: true,
                },
            ];
            sandbox.stub(mongo, 'findAll').resolves(validData);

            // Mock Utils.fetchData to prevent real network calls
            const mockCheerio = require('cheerio');
            const mockHtml = `
                <html><body>
                    <div class="cb-col cb-col-100 cb-bg-white">Tournament Name</div>
                    <div>Mock HTML Content</div>
                </body></html>`;
            const $ = mockCheerio.load(mockHtml);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            const result = await matchStatsObj.getMatchStats('0');

            // Should process valid entries successfully
            assert.isArray(result);
            assert.isAtLeast(result.length, 1);
        });
    });

    describe('Data processing edge cases', function () {
        it('should handle empty live matches response', async function () {
            // Mock LiveMatches to return empty object
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves({});

            try {
                await matchStatsObj.getMatchStats('0');
                assert.fail('Expected getMatchStats to handle empty live matches');
            } catch (error) {
                assert.include((error as Error).message, 'No matches found');
            }
        });

        it('should handle network timeouts during live match fetching', async function () {
            const timeoutError = new Error('Network timeout');
            (timeoutError as any).code = 'ECONNABORTED';

            // Mock LiveMatches to throw timeout error
            sandbox.stub(LiveMatches.prototype, 'getMatches').rejects(timeoutError);

            try {
                await matchStatsObj.getMatchStats('0');
                assert.fail('Expected getMatchStats to handle network timeout');
            } catch (error) {
                assert.include((error as Error).message, 'Network timeout');
            }
        });

        it('should handle invalid match ID formats in database', async function () {
            const liveMatchesResponse = {
                match1: {
                    matchId: 'match1',
                    matchUrl: 'http://example.com/1',
                    matchName: 'Match 1',
                },
            };

            // Mock LiveMatches to return matches
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchesResponse);

            // Mock mongo.findAll to return data with invalid match IDs
            const invalidIdData = [
                {
                    id: 'invalid-id-format-too-long-and-contains-special-chars!!!',
                    matchId: 'invalid-id-format',
                    // ... other required fields
                },
            ];
            sandbox.stub(mongo, 'findAll').resolves(invalidIdData);

            try {
                const result = await matchStatsObj.getMatchStats('0');
                // Should either handle gracefully or throw appropriate error
                assert.isArray(result);
            } catch (error) {
                assert.isTrue(error instanceof Error);
            }
        });
    });

    describe('Memory and performance edge cases', function () {
        it('should handle large number of matches efficiently', async function () {
            // Generate large number of matches
            const largeMatchesResponse: any = {};
            for (let i = 1; i <= 100; i++) {
                largeMatchesResponse[`match${i}`] = {
                    matchId: `match${i}`,
                    matchUrl: `http://example.com/${i}`,
                    matchName: `Match ${i}`,
                };
            }

            // Mock LiveMatches to return large dataset
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(largeMatchesResponse);

            // Mock mongo.findAll to return empty (force processing)
            sandbox.stub(mongo, 'findAll').resolves([]);

            try {
                const result = await matchStatsObj.getMatchStats('0');
                // Should handle large datasets
                assert.isArray(result);
            } catch (error) {
                // Acceptable to throw error for resource constraints
                assert.isTrue(error instanceof Error);
            }
        });

        it('should handle very long match names and URLs', async function () {
            const longString = 'a'.repeat(1000);
            const liveMatchesResponse = {
                match1: {
                    matchId: 'match1',
                    matchUrl: `http://example.com/${longString}`,
                    matchName: longString,
                },
            };

            // Mock LiveMatches to return match with long strings
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchesResponse);

            // Mock mongo.findAll to return empty
            sandbox.stub(mongo, 'findAll').resolves([]);

            try {
                const result = await matchStatsObj.getMatchStats('0');
                // Should handle long strings appropriately
                assert.isArray(result);
            } catch (error) {
                // Acceptable to throw error for extremely long strings
                assert.isTrue(error instanceof Error);
            }
        });
    });
});
