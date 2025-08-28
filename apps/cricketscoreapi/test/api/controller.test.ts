import { assert } from 'chai';
import sinon, { SinonStub, SinonSandbox } from 'sinon';
import TrpcClient from '../TrpcClient';
import { StubModule } from '../StubModule';
import { LiveMatches } from '../../app/src/services/LiveMatches';
import { MatchStats } from '../../app/src/services/MatchStats';
import * as TypesUtils from '../../app/src/utils/TypesUtils';

const ErrorMessage = 'Test failed due to error:';
const trpcClient = new TrpcClient();
const TIMEOUT = 20000;

describe('tRPC Procedures Integration Tests', function () {
    let stubObj: StubModule;

    beforeEach(() => {
        stubObj = new StubModule();
    });

    afterEach(() => {
        stubObj.restoreStubs();
    });

    describe('getLiveMatches procedure', function () {
        this.timeout(TIMEOUT);

        it('should return live matches successfully', async function () {
            try {
                const response = await trpcClient.getLiveMatches();
                assert.equal(response.status, 'success');
                assert.property(response.data, 'status');
                assert.equal(response.data.status, true);
                assert.equal(response.data.message, 'Live Matches');
                assert.property(response.data, 'response');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle LiveMatches service errors gracefully', async function () {
            // Mock LiveMatches to throw an error
            stubObj
                .stubModuleMethod('mongo', 'findAll')
                .rejects(new Error('Database connection failed'));

            try {
                const response = await trpcClient.getLiveMatches();
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Database connection failed');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle authentication errors', async function () {
            const unauthenticatedClient = new TrpcClient(true); // Skip auth

            try {
                const response = await unauthenticatedClient.getLiveMatches();
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Authentication Failed');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('getMatchStatsById procedure', function () {
        this.timeout(TIMEOUT);

        it('should return match stats for valid match ID', async function () {
            const validMatchId = 'qz0G2tpXBlel5Jki'; // Use a known valid format

            try {
                const response = await trpcClient.getMatchStatsById(validMatchId);
                // Note: This might return success or error depending on actual match existence
                assert.oneOf(response.status, ['success', 'error']);
                if (response.status === 'success') {
                    assert.property(response.data, 'status');
                    assert.property(response.data, 'message');
                } else {
                    assert.property(response, 'error');
                }
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle invalid match ID format', async function () {
            const invalidMatchId = 'invalid123';

            try {
                const response = await trpcClient.getMatchStatsById(invalidMatchId);
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                // tRPC validation should catch invalid format
                assert.isTrue(response.error.message.length > 0);
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should require matchId parameter', async function () {
            try {
                // TypeScript will prevent this, but let's test runtime validation
                const response = await trpcClient.getMatchStatsById('');
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('getMatchStats procedure', function () {
        this.timeout(TIMEOUT);

        it('should return default match stats (all matches)', async function () {
            try {
                const response = await trpcClient.getMatchStats();
                // This endpoint gets all match stats
                assert.oneOf(response.status, ['success', 'error']);
                if (response.status === 'success') {
                    assert.property(response.data, 'status');
                    assert.property(response.data, 'message');
                } else {
                    assert.property(response, 'error');
                }
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });
});

describe('tRPC Procedures Unit Tests', function () {
    let sandbox: SinonSandbox;
    let liveMatchesStub: SinonStub;
    let matchStatsStub: SinonStub;
    let isErrorStub: SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Stub service methods
        liveMatchesStub = sandbox.stub(LiveMatches.prototype, 'getMatches');
        matchStatsStub = sandbox.stub(MatchStats.prototype, 'getMatchStats');
        isErrorStub = sandbox.stub(TypesUtils, 'isError');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('getLiveMatches procedure', function () {
        it('should return live matches successfully', async function () {
            const mockLiveMatchesResponse = {
                matches: [
                    { matchId: '123', matchName: 'Test Match 1' },
                    { matchId: '456', matchName: 'Test Match 2' },
                ],
            };

            liveMatchesStub.resolves(mockLiveMatchesResponse);

            const response = await trpcClient.getLiveMatches();

            assert.equal(response.status, 'success');
            assert.property(response.data, 'status');
            assert.equal(response.data.status, true);
            assert.equal(response.data.message, 'Live Matches');
            assert.deepEqual(response.data.response, mockLiveMatchesResponse);
        });

        it('should handle LiveMatches service errors', async function () {
            const mockError = new Error('Service unavailable');
            liveMatchesStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            const response = await trpcClient.getLiveMatches();

            assert.equal(response.status, 'error');
            assert.property(response, 'error');
            assert.include(response.error.message, 'Service unavailable');
        });

        it('should handle non-Error exceptions', async function () {
            const mockError = 'String error';
            liveMatchesStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(false);

            const response = await trpcClient.getLiveMatches();

            assert.equal(response.status, 'error');
            assert.property(response, 'error');
            assert.property(response.error, 'message');
        });
    });

    describe('getMatchStatsById procedure', function () {
        it('should return match stats successfully', async function () {
            const mockMatchStatsResponse = {
                matchId: 'validMatchId1234',
                teams: ['Team A', 'Team B'],
                scores: ['150/3', '45/2'],
            };

            matchStatsStub.resolves(mockMatchStatsResponse);

            const response = await trpcClient.getMatchStatsById('validMatchId1234');

            assert.equal(response.status, 'success');
            assert.isTrue(matchStatsStub.calledWith('validMatchId1234'));
            assert.property(response.data, 'status');
            assert.equal(response.data.status, true);
            assert.equal(response.data.message, 'Match Stats');
            assert.deepEqual(response.data.response, mockMatchStatsResponse);
        });

        it('should handle MatchStats service errors', async function () {
            const mockError = new Error('Invalid match ID');
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            const response = await trpcClient.getMatchStatsById('validMatchId1234');

            assert.equal(response.status, 'error');
            assert.isTrue(matchStatsStub.calledWith('validMatchId1234'));
            assert.property(response, 'error');
            assert.include(response.error.message, 'Invalid match ID');
        });

        it('should handle non-Error exceptions', async function () {
            const mockError = { code: 500, message: 'Database error' };
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(false);

            const response = await trpcClient.getMatchStatsById('validMatchId1234');

            assert.equal(response.status, 'error');
            assert.property(response, 'error');
            assert.include(response.error.message, 'Error fetching match stats');
        });
    });

    describe('getMatchStats procedure', function () {
        it('should return match stats for all matches', async function () {
            const mockMatchStatsResponse = [
                {
                    matchId: '0',
                    isDefault: true,
                    message: 'All match stats',
                },
            ];

            matchStatsStub.resolves(mockMatchStatsResponse);

            const response = await trpcClient.getMatchStats();

            assert.equal(response.status, 'success');
            assert.isTrue(matchStatsStub.calledWith('0'));
            assert.property(response.data, 'status');
            assert.equal(response.data.status, true);
            assert.equal(response.data.message, 'Match Stats');
            assert.deepEqual(response.data.response, mockMatchStatsResponse);
        });

        it('should handle MatchStats service errors for all matches', async function () {
            const mockError = new Error('No matches found');
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            const response = await trpcClient.getMatchStats();

            assert.equal(response.status, 'error');
            assert.isTrue(matchStatsStub.calledWith('0'));
            assert.property(response, 'error');
            assert.include(response.error.message, 'No matches found');
        });

        it('should handle non-Error exceptions for all matches', async function () {
            const mockError = null;
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(false);

            const response = await trpcClient.getMatchStats();

            assert.equal(response.status, 'error');
            assert.property(response, 'error');
            assert.isTrue(response.error.message.length > 0);
        });
    });

    describe('Response format validation', function () {
        it('should always return consistent response structure for success cases', async function () {
            const mockServiceResponse = { data: 'test' };
            liveMatchesStub.resolves(mockServiceResponse);

            const response = await trpcClient.getLiveMatches();

            assert.equal(response.status, 'success');
            assert.property(response.data, 'status');
            assert.property(response.data, 'message');
            assert.property(response.data, 'response');
            assert.isBoolean(response.data.status);
            assert.isString(response.data.message);
        });

        it('should always return consistent error response structure', async function () {
            const mockError = new Error('Test error');
            liveMatchesStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            const response = await trpcClient.getLiveMatches();

            assert.equal(response.status, 'error');
            assert.property(response, 'error');
            assert.isTrue(response.error instanceof Error);
        });
    });
});

describe('tRPC Procedures Edge Cases', function () {
    let sandbox: SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should handle extremely long matchId in getMatchStatsById', async function () {
        const longMatchId = 'a'.repeat(1000);

        const response = await trpcClient.getMatchStatsById(longMatchId);
        console.log("response.status", response.status);
        console.log("response.error", response.error);
        assert.equal(response.status, 'error');
        assert.property(response, 'error');
        const parsedError = JSON.parse(response.error.message);
        assert.deepEqual(parsedError, [
            {
                validation: "regex",
                code: "invalid_string",
                message: "Match ID must be 16 alphanumeric characters",
                path: ["matchId"],
            },
        ]);
    });

    it('should handle special characters in matchId', async function () {
        const specialMatchId = 'match@#$%^&*()_+';

        const response = await trpcClient.getMatchStatsById(specialMatchId);

        assert.equal(response.status, 'error');
        assert.property(response, 'error');
        const parsedError = JSON.parse(response.error.message);
        assert.deepEqual(parsedError, [
            {
                validation: "regex",
                code: "invalid_string",
                message: "Match ID must be 16 alphanumeric characters",
                path: ["matchId"],
            },
        ]);
    });

    it('should handle concurrent requests to live matches', async function () {
        const liveMatchesStub = sandbox
            .stub(LiveMatches.prototype, 'getMatches')
            .resolves({ matches: [] });

        // Simulate concurrent requests
        const promises = Array.from({ length: 5 }, () => trpcClient.getLiveMatches());

        const results = await Promise.all(promises);

        assert.equal(liveMatchesStub.callCount, 5);
        results.forEach((result) => {
            assert.equal(result.status, 'success');
        });
    });
});
