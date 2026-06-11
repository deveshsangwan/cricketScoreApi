import { assert } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import { MatchStats } from '../app/src/services/MatchStats';
import { LiveMatches } from '../app/src/services/LiveMatches';
import * as mongo from '../app/src/core/BaseModel';
import { CricbuzzClient } from '../app/src/services/Cricbuzz/CricbuzzClient';
import { Utils } from '../app/src/utils/Utils';
import {
    cricbuzzCompletedCommentary,
    cricbuzzCompletedScorecard,
    cricbuzzInProgressCommentary,
    cricbuzzPreviewCommentary,
    cricbuzzPreviewScorecard,
} from './fixtures/Cricbuzz';

const TIMEOUT = 20000;

describe('MatchStats Extended Cricbuzz JSON Tests', function () {
    this.timeout(TIMEOUT);
    let sandbox: SinonSandbox;
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        matchStatsObj = new MatchStats();
    });

    afterEach(() => {
        sandbox.restore();
    });

    function stubLiveMatch(matchId: string, cricbuzzMatchId: string, matchName: string) {
        return sandbox.stub(LiveMatches.prototype, 'getMatches').resolves({
            matchId,
            matchUrl: `/live-cricket-scores/${cricbuzzMatchId}/${matchName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')}`,
            matchName,
        });
    }

    function stubBackgroundUpsert() {
        return sandbox.stub(Utils.prototype, 'insertDataToMatchStatsTable').resolves();
    }

    describe('getStatsForSingleMatch JSON mapping', function () {
        it('maps in-progress commentary JSON into the existing response shape', async function () {
            const matchId = 'abcDEF1234567890';
            stubLiveMatch(matchId, '153737', 'Australia vs Bangladesh');
            sandbox.stub(mongo, 'findById').resolves(null);
            const fetchJsonStub = sandbox
                .stub(CricbuzzClient.prototype, 'fetchJson')
                .resolves(cricbuzzInProgressCommentary);
            const upsertStub = stubBackgroundUpsert();

            const result = await matchStatsObj.getMatchStats(matchId);

            assert.isNotArray(result);
            const match = result as any;
            assert.equal(match.matchId, matchId);
            assert.equal(match.matchName, 'Australia vs Bangladesh');
            assert.equal(match.tournamentName, 'Australia tour of Bangladesh, 2026');
            assert.deepInclude(match.team1, {
                name: 'BAN',
                score: '',
                wickets: '',
                isBatting: false,
            });
            assert.deepInclude(match.team2, {
                name: 'AUS',
                score: '0',
                wickets: '2',
                overs: '1.1',
                isBatting: true,
            });
            assert.deepEqual(match.onBatting, {
                player1: { name: 'Josh Inglis', runs: '0', balls: '2' },
                player2: { name: 'Matt Renshaw', runs: '0', balls: '0' },
            });
            assert.deepEqual(match.runRate, {
                currentRunRate: 0,
                requiredRunRate: 0,
            });
            assert.equal(match.summary, 'Australia opt to bat');
            assert.isTrue(match.isLive);
            assert.deepEqual(match.keyStats, {
                Partnership: '0(3)',
                'Last Wicket': 'Cooper Connolly c Litton Das b Mustafizur Rahman 0(1)',
                Toss: 'Australia Batting',
                Recent: 'W',
            });
            assert.lengthOf(match.matchCommentary, 2);
            assert.equal(
                match.matchCommentary[0].commentary,
                'Mustafizur Rahman to Cooper Connolly, out Caught by Litton Das!!'
            );
            assert.equal(match.matchCommentary[0].over, '1.1');
            assert.isTrue(fetchJsonStub.calledOnceWith('/api/mcenter/comm/153737'));
            assert.isTrue(upsertStub.calledOnce);
        });

        it('uses scorecard JSON as the completed-score fallback', async function () {
            const matchId = 'complete12345678';
            stubLiveMatch(matchId, '159932', 'Netherlands vs Canada');
            sandbox.stub(mongo, 'findById').resolves(null);
            const fetchJsonStub = sandbox.stub(CricbuzzClient.prototype, 'fetchJson');
            fetchJsonStub.onFirstCall().resolves(cricbuzzCompletedCommentary);
            fetchJsonStub.onSecondCall().resolves(cricbuzzCompletedScorecard);
            stubBackgroundUpsert();

            const result = (await matchStatsObj.getMatchStats(matchId)) as any;

            assert.equal(result.summary, 'Canada won by 2 wkts');
            assert.isFalse(result.isLive);
            assert.deepInclude(result.team1, {
                name: 'NED',
                score: '214',
                wickets: '10',
                overs: '47.6',
                isBatting: false,
            });
            assert.deepInclude(result.team2, {
                name: 'CAN',
                score: '218',
                wickets: '8',
                overs: '49.5',
                isBatting: false,
            });
            assert.deepEqual(result.onBatting, {
                player1: { name: '', runs: '', balls: '' },
                player2: { name: '', runs: '', balls: '' },
            });
            assert.equal(fetchJsonStub.firstCall.args[0], '/api/mcenter/comm/159932');
            assert.equal(fetchJsonStub.secondCall.args[0], '/api/mcenter/scorecard/159932');
        });

        it('handles preview matches with no score data', async function () {
            const matchId = 'preview123456789';
            stubLiveMatch(matchId, '156905', 'ARCS Andheri vs Aakash Tigers MWS');
            sandbox.stub(mongo, 'findById').resolves(null);
            const fetchJsonStub = sandbox.stub(CricbuzzClient.prototype, 'fetchJson');
            fetchJsonStub.onFirstCall().resolves(cricbuzzPreviewCommentary);
            fetchJsonStub.onSecondCall().resolves(cricbuzzPreviewScorecard);
            stubBackgroundUpsert();

            const result = (await matchStatsObj.getMatchStats(matchId)) as any;

            assert.equal(result.summary, 'Match starts at Jun 11, 08:30 GMT');
            assert.isFalse(result.isLive);
            assert.deepInclude(result.team1, {
                name: 'AA',
                score: '',
                wickets: '',
                isBatting: false,
            });
            assert.deepInclude(result.team2, {
                name: 'ATMWS',
                score: '',
                wickets: '',
                isBatting: false,
            });
            assert.deepEqual(result.matchCommentary, []);
            assert.deepEqual(result.keyStats, {});
            assert.isTrue(fetchJsonStub.calledTwice);
        });
    });

    describe('cache and error handling', function () {
        it('returns cached DB data when fresh Cricbuzz fetch fails', async function () {
            const matchId = 'cache12345678901';
            const cachedMatch = {
                id: matchId,
                createdAt: new Date(),
                team1: { name: 'Team 1', score: '100', wickets: '2', isBatting: true },
                team2: { name: 'Team 2', score: '80', wickets: '3', isBatting: false },
                onBatting: {
                    player1: { name: 'Player 1', runs: '45', balls: '30' },
                    player2: { name: 'Player 2', runs: '25', balls: '20' },
                },
                runRate: { currentRunRate: 6.5, requiredRunRate: 7.2 },
                summary: 'Cached match in progress',
                matchCommentary: [{ commentary: 'Cached commentary', hasOver: false }],
                keyStats: { Cached: 'Value' },
                tournamentName: 'Cached Tournament',
                matchName: 'Cached Match',
                isLive: true,
            };

            stubLiveMatch(matchId, '153737', 'Australia vs Bangladesh');
            sandbox.stub(mongo, 'findById').resolves(cachedMatch);
            sandbox
                .stub(CricbuzzClient.prototype, 'fetchJson')
                .rejects(new Error('Cricbuzz unavailable'));

            const result = await matchStatsObj.getMatchStats(matchId);

            assert.deepEqual(result, {
                matchId,
                team1: cachedMatch.team1,
                team2: cachedMatch.team2,
                onBatting: cachedMatch.onBatting,
                runRate: cachedMatch.runRate,
                summary: cachedMatch.summary,
                matchCommentary: cachedMatch.matchCommentary,
                keyStats: cachedMatch.keyStats,
                tournamentName: cachedMatch.tournamentName,
                matchName: cachedMatch.matchName,
                isLive: cachedMatch.isLive,
            });
        });

        it('propagates fresh fetch errors when no cache exists', async function () {
            const matchId = 'nocache123456789';
            stubLiveMatch(matchId, '153737', 'Australia vs Bangladesh');
            sandbox.stub(mongo, 'findById').resolves(null);
            sandbox
                .stub(CricbuzzClient.prototype, 'fetchJson')
                .rejects(new Error('Cricbuzz unavailable'));

            try {
                await matchStatsObj.getMatchStats(matchId);
                assert.fail('Expected getMatchStats to throw the Cricbuzz fetch error');
            } catch (error) {
                assert.include((error as Error).message, 'Cricbuzz unavailable');
            }
        });

        it('throws database errors while looking up cached single-match stats', async function () {
            const matchId = 'dberror123456789';
            stubLiveMatch(matchId, '153737', 'Australia vs Bangladesh');
            sandbox.stub(mongo, 'findById').rejects(new Error('Database connection failed'));

            try {
                await matchStatsObj.getMatchStats(matchId);
                assert.fail('Expected getMatchStats to throw database error');
            } catch (error) {
                assert.include((error as Error).message, 'Database connection failed');
            }
        });
    });

    describe('all-match handling', function () {
        it('throws NoMatchesFoundError when live match discovery returns an empty object', async function () {
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves({});
            sandbox.stub(mongo, 'findAll').resolves([]);

            try {
                await matchStatsObj.getMatchStats('0');
                assert.fail('Expected getMatchStats to throw when no matches are available');
            } catch (error) {
                assert.include((error as Error).message, 'No matches found');
            }
        });

        it('fetches fresh data for all live matches and upserts the cache', async function () {
            const liveMatchesResponse = {
                allMatch12345678: {
                    matchId: 'allMatch12345678',
                    matchUrl: '/live-cricket-scores/153737/aus-vs-ban',
                    matchName: 'Australia vs Bangladesh',
                },
            };
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves(liveMatchesResponse);
            sandbox.stub(mongo, 'findAll').resolves([]);
            sandbox
                .stub(CricbuzzClient.prototype, 'fetchJson')
                .resolves(cricbuzzInProgressCommentary);
            const upsertStub = stubBackgroundUpsert();

            const result = (await matchStatsObj.getMatchStats('0')) as any[];

            assert.lengthOf(result, 1);
            assert.equal(result[0].matchId, 'allMatch12345678');
            assert.equal(result[0].matchName, 'Australia vs Bangladesh');
            assert.isTrue(upsertStub.calledOnce);
        });
    });
});
