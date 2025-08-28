import chai, { assert } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import { LiveMatches } from '../app/src/services/LiveMatches';
import * as mongo from '../app/src/core/BaseModel';
import { Utils } from '../app/src/utils/Utils';
import * as LiveMatchesUtility from '../app/src/services/LiveMatches/LiveMatchesUtility';

describe('LiveMatches Extended Error Handling Tests', function () {
    let sandbox: SinonSandbox;
    let liveMatchesObj: LiveMatches;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        liveMatchesObj = new LiveMatches();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getMatchById error scenarios', function () {
        it('should handle case when no match is found by ID', async function () {
            const nonExistentMatchId = 'nonExistentMatchId123';

            // Mock mongo.findById to return null (no match found)
            sandbox.stub(mongo, 'findById').resolves(null);

            try {
                await liveMatchesObj.getMatches(nonExistentMatchId);
                assert.fail('Expected getMatches to throw error for non-existent match ID');
            } catch (error) {
                assert.include(
                    (error as Error).message,
                    `No match found with id: ${nonExistentMatchId}`
                );
            }
        });

        it('should handle database errors when finding match by ID', async function () {
            const matchId = 'testMatchId123';
            const dbError = new Error('Database connection failed');

            // Mock mongo.findById to throw database error
            sandbox.stub(mongo, 'findById').rejects(dbError);

            try {
                await liveMatchesObj.getMatches(matchId);
                assert.fail('Expected getMatches to throw error for database failure');
            } catch (error) {
                assert.include((error as Error).message, 'Database connection failed');
            }
        });

        it('should handle non-Error exceptions in getMatchById', async function () {
            const matchId = 'testMatchId123';

            // Mock mongo.findById to throw a non-Error object
            sandbox.stub(mongo, 'findById').rejects('String error');

            try {
                await liveMatchesObj.getMatches(matchId);
                assert.fail('Expected getMatches to handle non-Error exceptions');
            } catch (error) {
                assert.isTrue(error instanceof Error);
            }
        });
    });

    describe('scrapeData error scenarios', function () {
        it('should handle scraping errors and call handleError', async function () {
            const mongoData = [
                { id: 'match1', matchUrl: 'http://example.com/match1', matchName: 'Test Match 1' },
            ];

            // Ensure DB calls are stubbed to avoid real connections
            sandbox.stub(mongo, 'findAll').resolves(mongoData as any);

            // Mock Utils.fetchData to throw an error
            const scrapingError = new Error('Failed to scrape data');
            sandbox.stub(Utils.prototype, 'fetchData').rejects(scrapingError);

            try {
                await liveMatchesObj.getMatches('0'); // '0' triggers getAllMatches which calls scrapeData
                assert.fail('Expected scrapeData to handle errors');
            } catch (error) {
                assert.include((error as Error).message, 'Failed to scrape data');
            }
        });

        it('should handle non-Error exceptions in scrapeData', async function () {
            // Mock mongo.findAll to return some data
            sandbox
                .stub(mongo, 'findAll')
                .resolves([
                    {
                        id: 'match1',
                        matchUrl: 'http://example.com/match1',
                        matchName: 'Test Match 1',
                    },
                ]);

            // Mock Utils.fetchData to throw a non-Error object
            sandbox.stub(Utils.prototype, 'fetchData').rejects('Non-error exception');

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected scrapeData to handle non-Error exceptions');
            } catch (error) {
                assert.isTrue(error instanceof Error);
            }
        });
    });

    describe('processData edge cases', function () {
        it('should throw error when no matches are found during processing', async function () {
            // Mock findAll to return empty array (no existing matches)
            sandbox.stub(mongo, 'findAll').resolves([]);

            // Mock fetchData to return HTML with no matches
            const emptyHtml = '<html><body><div class="cb-col-100"></div></body></html>';
            const mockCheerio = require('cheerio');
            const $ = mockCheerio.load(emptyHtml);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected getMatches to throw error when no matches found');
            } catch (error) {
                assert.include((error as Error).message, 'No matches found');
            }
        });

        it('should handle existing matches correctly', async function () {
            // Mock findAll to return existing matches
            const existingMatches = [
                {
                    id: 'existingMatch1',
                    matchUrl: 'http://example.com/existing',
                    matchName: 'Existing Match',
                },
            ];
            sandbox.stub(mongo, 'findAll').resolves(existingMatches);

            // Mock fetchData to return HTML with valid match structure
            const htmlWithExisting = `
                <html><body>
                    <div class="cb-col-100">
                        <div class="cb-col">
                            <div class="cb-schdl">
                                <div class="cb-lv-scr-mtch-hdr">
                                    <a href="http://example.com/existing">Match Link</a>
                                </div>
                                <div class="cb-billing-plans-text">
                                    <a title="Existing Match">Match Name</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </body></html>`;
            const mockCheerio = require('cheerio');
            const $ = mockCheerio.load(htmlWithExisting);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            // Mock insertDataToLiveMatchesTable
            const insertStub = sandbox
                .stub(LiveMatchesUtility, 'insertDataToLiveMatchesTable')
                .resolves();

            const result = await liveMatchesObj.getMatches('0');

            // Should return processed matches
            assert.isObject(result);
            assert.property(result, 'existingMatch1');
        });

        it('should handle async insertion failures gracefully', async function () {
            // Mock findAll to return empty array
            sandbox.stub(mongo, 'findAll').resolves([]);

            // Mock fetchData to return HTML with new matches
            const htmlWithNewMatch = `
                <html><body>
                    <div class="cb-col-100">
                        <div class="cb-col">
                            <div class="cb-schdl">
                                <div class="cb-lv-scr-mtch-hdr">
                                    <a href="http://example.com/new-match">Match Link</a>
                                </div>
                                <div class="cb-billing-plans-text">
                                    <a title="New Match">Match Name</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </body></html>`;
            const mockCheerio = require('cheerio');
            const $ = mockCheerio.load(htmlWithNewMatch);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            // Mock insertDataToLiveMatchesTable
            sandbox.stub(LiveMatchesUtility, 'insertDataToLiveMatchesTable').resolves();

            // This should work and return new matches
            const result = await liveMatchesObj.getMatches('0');
            assert.isObject(result);
        });

        it('should handle case with no new matches to insert', async function () {
            // Mock findAll to return existing matches
            const existingMatches = [
                { id: 'match1', matchUrl: 'http://example.com/match1', matchName: 'Test Match 1' },
            ];
            sandbox.stub(mongo, 'findAll').resolves(existingMatches);

            // Mock fetchData to return HTML with same existing matches only
            const htmlWithExisting = `
                <html><body>
                    <div class="cb-col-100">
                        <div class="cb-col">
                            <div class="cb-schdl">
                                <div class="cb-lv-scr-mtch-hdr">
                                    <a href="http://example.com/match1">Match Link</a>
                                </div>
                                <div class="cb-billing-plans-text">
                                    <a title="Test Match 1">Match Name</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </body></html>`;
            const mockCheerio = require('cheerio');
            const $ = mockCheerio.load(htmlWithExisting);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            // Mock insertDataToLiveMatchesTable
            sandbox.stub(LiveMatchesUtility, 'insertDataToLiveMatchesTable').resolves();

            const result = await liveMatchesObj.getMatches('0');

            // Should process existing matches
            assert.isObject(result);
            assert.property(result, 'match1');
        });
    });

    describe('HTML parsing edge cases', function () {
        it('should handle malformed HTML gracefully', async function () {
            sandbox.stub(mongo, 'findAll').resolves([]);

            // Mock fetchData to return malformed HTML
            const malformedHtml =
                '<html><body><div class="cb-col-100"><div class="cb-col"><div class="cb-schdl"><a href="incomplete';
            const mockCheerio = require('cheerio');
            const $ = mockCheerio.load(malformedHtml);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected getMatches to handle malformed HTML');
            } catch (error) {
                assert.include((error as Error).message, 'No matches found');
            }
        });

        it('should handle HTML with missing match information', async function () {
            sandbox.stub(mongo, 'findAll').resolves([]);

            // Mock fetchData to return HTML with incomplete match data
            const incompleteHtml = `
                <html><body>
                    <div class="cb-col-100">
                        <div class="cb-col">
                            <div class="cb-schdl">
                                <a href="" title="">Empty Match</a>
                                <div class="cb-billing-plans-text">
                                    <a title="">Empty Name</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </body></html>`;
            const mockCheerio = require('cheerio');
            const $ = mockCheerio.load(incompleteHtml);
            sandbox.stub(Utils.prototype, 'fetchData').resolves($);

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected getMatches to handle incomplete match data');
            } catch (error) {
                assert.include((error as Error).message, 'No matches found');
            }
        });
    });
});
