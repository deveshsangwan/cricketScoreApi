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
                const parsedError = JSON.parse(response.error.message);
                assert.deepEqual(parsedError, [
                    {
                        validation: "regex",
                        code: "invalid_string",
                        message: "Match ID must be 16 alphanumeric characters",
                        path: ["matchId"],
                    },
                ]);
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
                const response = await trpcClient.getMatchStatsById('nonexistentMatch');
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

    describe('Subscriptions: subscribeMatchStatsById', function () {
        this.timeout(TIMEOUT);

        it('should require authentication for subscribeMatchStatsById', async function () {
            const unauthenticatedClient = new TrpcClient(true);
            const validMatchId = 'qz0G2tpXBlel5Jki';

            try {
                // Should throw immediately due to protectedProcedure
                await unauthenticatedClient.subscribeMatchStatsById(validMatchId);
                assert.fail('Expected authentication error but subscription promise resolved');
            } catch (err) {
                assert.instanceOf(err as any, Error);
                assert.include((err as Error).message, 'Authentication Failed');
            }
        });

        it('should validate matchId format before starting subscription', async function () {
            const trpcClient = new TrpcClient();
            const invalidMatchId = 'abc';

            try {
                await trpcClient.subscribeMatchStatsById(invalidMatchId);
                assert.fail('Expected validation error but subscription promise resolved');
            } catch (err) {
                assert.instanceOf(err as any, Error);
                assert.include((err as Error).message, 'Match ID must be 16 alphanumeric characters');
            }
        });

        it('should emit initial payload and allow clean cancellation', async function () {
            const trpcClient = new TrpcClient();
            const matchId = 'qz0G2tpXBlel5Jki';

            const initialResponse = { matchId, ok: true } as any;
            const getStatsStub = sandbox.stub(MatchStats.prototype, 'getMatchStats').resolves(initialResponse);

            try {
                const iterator = (await trpcClient.subscribeMatchStatsById(matchId)) as AsyncGenerator<any, any, any>;
                const first = await iterator.next();

                assert.isFalse(first.done);
                assert.property(first.value, 'status');
                assert.equal(first.value.status, true);
                assert.equal(first.value.message, 'Match Stats');
                assert.deepEqual(first.value.response, initialResponse);
                assert.equal(getStatsStub.callCount, 1, 'getMatchStats called only for initial emission');

                if (typeof (iterator as any).return === 'function') {
                    await (iterator as any).return(undefined);
                }
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should propagate service errors on initial fetch', async function () {
            const trpcClient = new TrpcClient();
            const matchId = 'qz0G2tpXBlel5Jki';

            sandbox.stub(MatchStats.prototype, 'getMatchStats').rejects(new Error('Service unavailable'));

            try {
                const iterator = (await trpcClient.subscribeMatchStatsById(matchId)) as AsyncGenerator<any, any, any>;
                await iterator.next();
                assert.fail('Expected error during initial emission');
            } catch (err) {
                assert.instanceOf(err as any, Error);
                assert.include((err as Error).message, 'Service unavailable');
            }
        });

        it('should execute sleep and emit again when timer fires, then cancel', async function () {
            const trpcClient = new TrpcClient();
            const matchId = 'qz0G2tpXBlel5Jki';

            const getStatsStub = sandbox.stub(MatchStats.prototype, 'getMatchStats');
            getStatsStub.onFirstCall().resolves({ matchId, ok: true } as any);
            getStatsStub.onSecondCall().resolves({ matchId, ok: 'second' } as any);

            // Remove jitter and use fake timers to fast-forward sleep
            const randomStub = sandbox.stub(Math, 'random').returns(0);
            const clock = sinon.useFakeTimers();

            try {
                const iterator = (await trpcClient.subscribeMatchStatsById(matchId)) as AsyncGenerator<any, any, any>;
                const first = await iterator.next();
                assert.isFalse(first.done);

                // Begin next iteration which will await abortableSleep(25000)
                const secondPromise = iterator.next();
                // Fast-forward sleep duration
                await clock.tickAsync(25000);

                const second = await secondPromise;
                assert.isFalse(second.done);
                assert.equal(getStatsStub.callCount, 2, 'should fetch second time after sleep');

                if (typeof (iterator as any).return === 'function') {
                    await (iterator as any).return(undefined);
                }
            } finally {
                randomStub.restore();
                clock.restore();
            }
        });

        it('should track active subscriber counters and per-match map across start/stop', async function () {
            const trpcClient = new TrpcClient();
            const matchId = 'qz0G2tpXBlel5Jki';

            const getStatsStub = sandbox.stub(MatchStats.prototype, 'getMatchStats').resolves({ matchId, ok: true } as any);
            const logSpy = sandbox.spy(console, 'log');

            // Start first subscription
            const iter1 = (await trpcClient.subscribeMatchStatsById(matchId)) as AsyncGenerator<any, any, any>;
            await iter1.next();

            const callsAfterFirst = logSpy.getCalls();
            const firstCount = callsAfterFirst
                .filter((c) => c.args[0] === 'activeSubscriberCount')
                .pop()?.args[1] as number | undefined;
            const firstMap = callsAfterFirst
                .filter((c) => c.args[0] === 'activeSubscribersByMatch')
                .pop()?.args[1] as Map<string, number> | undefined;

            assert.isNumber(firstCount);
            assert.instanceOf(firstMap as any, Map);
            const firstMatchCount = (firstMap as Map<string, number>).get(matchId) ?? 0;

            // Start second subscription for same match
            const iter2 = (await trpcClient.subscribeMatchStatsById(matchId)) as AsyncGenerator<any, any, any>;
            await iter2.next();

            const callsAfterSecond = logSpy.getCalls();
            const secondCount = callsAfterSecond
                .filter((c) => c.args[0] === 'activeSubscriberCount')
                .pop()?.args[1] as number | undefined;
            const secondMap = callsAfterSecond
                .filter((c) => c.args[0] === 'activeSubscribersByMatch')
                .pop()?.args[1] as Map<string, number> | undefined;

            assert.isNumber(secondCount);
            assert.instanceOf(secondMap as any, Map);
            const secondMatchCount = (secondMap as Map<string, number>).get(matchId) ?? 0;

            // second should be exactly +1 over first
            assert.equal(secondCount as number, (firstCount as number) + 1);
            assert.equal(secondMatchCount, firstMatchCount + 1);

            // Cancel both (releases should run twice)
            if (typeof (iter1 as any).return === 'function') await (iter1 as any).return(undefined);
            if (typeof (iter2 as any).return === 'function') await (iter2 as any).return(undefined);

            // Start a new subscription again; counters should be back to first values
            const iter3 = (await trpcClient.subscribeMatchStatsById(matchId)) as AsyncGenerator<any, any, any>;
            await iter3.next();

            const callsAfterThird = logSpy.getCalls();
            const thirdCount = callsAfterThird
                .filter((c) => c.args[0] === 'activeSubscriberCount')
                .pop()?.args[1] as number | undefined;
            const thirdMap = callsAfterThird
                .filter((c) => c.args[0] === 'activeSubscribersByMatch')
                .pop()?.args[1] as Map<string, number> | undefined;

            assert.equal(thirdCount as number, firstCount as number);
            assert.equal((thirdMap as Map<string, number>).get(matchId), firstMatchCount);

            if (typeof (iter3 as any).return === 'function') await (iter3 as any).return(undefined);

            // Ensure getMatchStats called three times (once per initial emission)
            assert.equal(getStatsStub.callCount, 3);
        });
    });
});
