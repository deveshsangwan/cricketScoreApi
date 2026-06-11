import { assert } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import { LiveMatches } from '../app/src/services/LiveMatches';
import * as mongo from '../app/src/core/BaseModel';
import * as LiveMatchesUtility from '../app/src/services/LiveMatches/LiveMatchesUtility';
import { CricbuzzClient } from '../app/src/services/Cricbuzz/CricbuzzClient';
import {
    cricbuzzLiveScoresHtml,
    cricbuzzNoMatchesHtml,
} from './fixtures/Cricbuzz';
import { extractCricbuzzMatchIdFromUrl } from '../app/src/services/Cricbuzz/CricbuzzUtils';

const TIMEOUT = 20000;

describe('LiveMatches Extended Error Handling Tests', function () {
    this.timeout(TIMEOUT);
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
            sandbox.stub(mongo, 'findById').rejects(new Error('Database connection failed'));

            try {
                await liveMatchesObj.getMatches(matchId);
                assert.fail('Expected getMatches to throw error for database failure');
            } catch (error) {
                assert.include((error as Error).message, 'Database connection failed');
            }
        });

        it('should handle non-Error exceptions in getMatchById', async function () {
            sandbox.stub(mongo, 'findById').rejects('String error');

            try {
                await liveMatchesObj.getMatches('testMatchId123');
                assert.fail('Expected getMatches to handle non-Error exceptions');
            } catch (error) {
                assert.isTrue(error instanceof Error);
            }
        });
    });

    describe('Cricbuzz match parsing', function () {
        it('should extract Cricbuzz numeric match IDs from current URLs', function () {
            assert.equal(
                extractCricbuzzMatchIdFromUrl(
                    '/live-cricket-scores/153737/aus-vs-ban-2nd-odi'
                ),
                '153737'
            );
            assert.equal(
                extractCricbuzzMatchIdFromUrl(
                    'https://www.cricbuzz.com/live-cricket-scorecard/153737/aus-vs-ban'
                ),
                '153737'
            );
            assert.isNull(extractCricbuzzMatchIdFromUrl('/cricket-news'));
        });

        it('should dedupe live-score links by Cricbuzz numeric match ID', async function () {
            sandbox.stub(mongo, 'findAll').resolves([]);
            sandbox.stub(CricbuzzClient.prototype, 'fetchHtml').resolves(cricbuzzLiveScoresHtml);
            const insertStub = sandbox
                .stub(LiveMatchesUtility, 'insertDataToLiveMatchesTable')
                .resolves();

            const result = await liveMatchesObj.getMatches('0');
            const matches = Object.values(result as Record<string, any>);

            assert.lengthOf(matches, 2);
            assert.deepEqual(
                matches.map((match) => match.matchName).sort(),
                ['Australia vs Bangladesh, 2nd ODI', 'India A vs Afghanistan A, 2nd Match']
            );
            assert.isTrue(insertStub.calledOnce);
            assert.lengthOf(Object.keys(insertStub.firstCall.args[0]), 2);
        });

        it('should reuse existing app IDs when Cricbuzz slugs change', async function () {
            sandbox.stub(mongo, 'findAll').resolves([
                {
                    id: 'existingMatch123',
                    matchUrl: '/live-cricket-scores/153737/aus-vs-ban-2nd-odi-very-old-slug',
                    matchName: 'Old Match Name',
                },
            ]);
            sandbox.stub(CricbuzzClient.prototype, 'fetchHtml').resolves(cricbuzzLiveScoresHtml);
            const insertStub = sandbox
                .stub(LiveMatchesUtility, 'insertDataToLiveMatchesTable')
                .resolves();

            const result = (await liveMatchesObj.getMatches('0')) as Record<string, any>;

            assert.property(result, 'existingMatch123');
            assert.equal(
                result.existingMatch123.matchUrl,
                '/live-cricket-scores/153737/aus-vs-ban-2nd-odi-old-slug'
            );
            assert.equal(
                result.existingMatch123.matchName,
                'Australia vs Bangladesh, 2nd ODI'
            );
            assert.isTrue(insertStub.calledOnce);
            assert.lengthOf(Object.keys(insertStub.firstCall.args[0]), 1);
        });

        it('should throw error when no live-score match links are found', async function () {
            sandbox.stub(mongo, 'findAll').resolves([]);
            sandbox.stub(CricbuzzClient.prototype, 'fetchHtml').resolves(cricbuzzNoMatchesHtml);

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected getMatches to throw error when no matches found');
            } catch (error) {
                assert.include((error as Error).message, 'No matches found');
            }
        });
    });

    describe('scrapeData error scenarios', function () {
        it('should handle Cricbuzz client errors', async function () {
            sandbox.stub(mongo, 'findAll').resolves([]);
            sandbox
                .stub(CricbuzzClient.prototype, 'fetchHtml')
                .rejects(new Error('Failed to scrape data'));

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected scrapeData to handle errors');
            } catch (error) {
                assert.include((error as Error).message, 'Failed to scrape data');
            }
        });

        it('should handle non-Error exceptions during scraping', async function () {
            sandbox.stub(mongo, 'findAll').resolves([]);
            sandbox.stub(CricbuzzClient.prototype, 'fetchHtml').rejects('Non-error exception');

            try {
                await liveMatchesObj.getMatches('0');
                assert.fail('Expected scrapeData to handle non-Error exceptions');
            } catch (error) {
                assert.isTrue(error instanceof Error);
            }
        });
    });
});
