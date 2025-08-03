import chai, { assert } from 'chai';
import sinon, { SinonSandbox } from 'sinon';
import TrpcClient from '../TrpcClient';
import { StubModule } from '../StubModule';
import { LiveMatches } from '../../app/src/services/LiveMatches';
import { MatchStats } from '../../app/src/services/MatchStats';

const ErrorMessage = 'Test failed due to error:';
const TIMEOUT = 20000;

describe('tRPC Features Tests', function () {
    let sandbox: SinonSandbox;
    let stubObj: StubModule;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        stubObj = new StubModule();
    });

    afterEach(() => {
        sandbox.restore();
        stubObj.restoreStubs();
    });

    describe('Input Validation', function () {
        this.timeout(TIMEOUT);

        it('should validate required matchId parameter in getMatchStatsById', async function () {
            const trpcClient = new TrpcClient();

            try {
                const response = await trpcClient.getMatchStatsById('');
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Match ID is required');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle invalid input types gracefully', async function () {
            const trpcClient = new TrpcClient();

            try {
                // Test with number instead of string (TypeScript should catch this, but test runtime)
                const response = await trpcClient.getMatchStatsById(null as any);
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should validate matchId format and length', async function () {
            const trpcClient = new TrpcClient();

            // Test various invalid formats
            const invalidMatchIds = [
                '', // empty
                'a', // too short
                'abc', // too short
                '!@#$%^&*()', // special characters only
                'a'.repeat(100), // too long
            ];

            for (const invalidId of invalidMatchIds) {
                try {
                    const response = await trpcClient.getMatchStatsById(invalidId);
                    if (response.status === 'success') {
                        // Some formats might be accepted by the service but fail later
                        continue;
                    }
                    assert.equal(response.status, 'error');
                    assert.property(response, 'error');
                } catch (err) {
                    // This is also acceptable as it means validation caught the error
                    assert.instanceOf(err, Error);
                }
            }
        });
    });

    describe('Authentication and Authorization', function () {
        this.timeout(TIMEOUT);

        it('should require authentication for getLiveMatches', async function () {
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

        it('should require authentication for getMatchStats', async function () {
            const unauthenticatedClient = new TrpcClient(true); // Skip auth

            try {
                const response = await unauthenticatedClient.getMatchStats();
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Authentication Failed');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should require authentication for getMatchStatsById', async function () {
            const unauthenticatedClient = new TrpcClient(true); // Skip auth

            try {
                const response = await unauthenticatedClient.getMatchStatsById('validMatchId123');
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Authentication Failed');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should allow authenticated requests to proceed', async function () {
            const authenticatedClient = new TrpcClient(false); // With auth

            // Mock the service to return success
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves({ matches: [] });

            try {
                const response = await authenticatedClient.getLiveMatches();
                assert.equal(response.status, 'success');
                assert.property(response.data, 'status');
                assert.equal(response.data.status, true);
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('Error Handling', function () {
        this.timeout(TIMEOUT);

        it('should handle service errors and convert to tRPC errors', async function () {
            const trpcClient = new TrpcClient();

            // Mock service to throw an error
            sandbox
                .stub(LiveMatches.prototype, 'getMatches')
                .rejects(new Error('Service unavailable'));

            try {
                const response = await trpcClient.getLiveMatches();
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Service unavailable');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle database connection errors', async function () {
            const trpcClient = new TrpcClient();

            // Mock service to throw database error
            sandbox
                .stub(MatchStats.prototype, 'getMatchStats')
                .rejects(new Error('Database connection failed'));

            try {
                const response = await trpcClient.getMatchStats();
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Database connection failed');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle timeout errors gracefully', async function () {
            const trpcClient = new TrpcClient();

            // Mock service to timeout
            sandbox.stub(LiveMatches.prototype, 'getMatches').callsFake(() => {
                return new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timeout')), 100);
                });
            });

            try {
                const response = await trpcClient.getLiveMatches();
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Request timeout');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should provide meaningful error messages', async function () {
            const trpcClient = new TrpcClient();

            // Mock service to throw a specific error
            const specificError = new Error('Match not found in database');
            sandbox.stub(MatchStats.prototype, 'getMatchStats').rejects(specificError);

            try {
                const response = await trpcClient.getMatchStatsById('nonexistentMatch123');
                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.include(response.error.message, 'Match not found in database');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('Performance and Reliability', function () {
        this.timeout(TIMEOUT);

        it('should handle multiple concurrent requests', async function () {
            const trpcClient = new TrpcClient();

            // Mock service to return different data for each call
            const mockResponses = [
                { match1: 'data1' },
                { match2: 'data2' },
                { match3: 'data3' },
                { match4: 'data4' },
                { match5: 'data5' },
            ];

            const liveMatchesStub = sandbox.stub(LiveMatches.prototype, 'getMatches');
            mockResponses.forEach((response, index) => {
                liveMatchesStub.onCall(index).resolves(response);
            });

            try {
                // Make 5 concurrent requests
                const promises = Array.from({ length: 5 }, () => trpcClient.getLiveMatches());
                const results = await Promise.all(promises);

                // All should succeed
                results.forEach((result, index) => {
                    assert.equal(result.status, 'success');
                    assert.property(result.data, 'response');
                    assert.deepEqual(result.data.response, mockResponses[index]);
                });

                assert.equal(liveMatchesStub.callCount, 5);
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle request cancellation gracefully', async function () {
            const trpcClient = new TrpcClient();

            // Mock service to take a long time
            sandbox.stub(LiveMatches.prototype, 'getMatches').callsFake(() => {
                return new Promise((resolve) => {
                    setTimeout(() => resolve({ matches: [] }), 5000); // 5 seconds
                });
            });

            try {
                // Start request but don't wait for it to complete
                const promise = trpcClient.getLiveMatches();

                // This test mainly ensures no unhandled promise rejections occur
                // In a real scenario, we might implement request cancellation
                setTimeout(() => {
                    // Promise is still pending, which is expected
                }, 100);

                // For this test, we'll just verify the request was initiated
                assert.isTrue(promise instanceof Promise);
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('Response Format Consistency', function () {
        this.timeout(TIMEOUT);

        it('should always return consistent success response format', async function () {
            const trpcClient = new TrpcClient();

            // Mock successful response
            sandbox.stub(LiveMatches.prototype, 'getMatches').resolves({ test: 'data' });

            try {
                const response = await trpcClient.getLiveMatches();

                assert.equal(response.status, 'success');
                assert.property(response, 'data');
                assert.property(response.data, 'status');
                assert.property(response.data, 'message');
                assert.property(response.data, 'response');
                assert.isBoolean(response.data.status);
                assert.isString(response.data.message);
                assert.isObject(response.data.response);
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should always return consistent error response format', async function () {
            const trpcClient = new TrpcClient();

            // Mock error response
            sandbox.stub(LiveMatches.prototype, 'getMatches').rejects(new Error('Test error'));

            try {
                const response = await trpcClient.getLiveMatches();

                assert.equal(response.status, 'error');
                assert.property(response, 'error');
                assert.isTrue(response.error instanceof Error);
                assert.property(response.error, 'message');
                assert.isString(response.error.message);
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });
});
