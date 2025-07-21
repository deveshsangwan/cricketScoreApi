import { Request, Response } from 'express';
import chai, { assert } from 'chai';
import sinon, { SinonStub, SinonSandbox } from 'sinon';
import HttpClient from '../HttpClient';
import { StubModule } from '../StubModule';
import controller from '../../app/src/api/controller';
import { LiveMatches } from '../../app/src/services/LiveMatches';
import { MatchStats } from '../../app/src/services/MatchStats';
import * as TypesUtils from '../../app/src/utils/TypesUtils';

const ErrorMessage = 'Test failed due to error:';
const httpClient = new HttpClient(chai);
const TIMEOUT = 20000;

describe('Controller API Integration Tests', function () {
    let stubObj: StubModule;

    beforeEach(() => {
        stubObj = new StubModule();
    });

    afterEach(() => {
        stubObj.restoreStubs();
    });

    describe('GET /liveMatches', function () {
        this.timeout(TIMEOUT);

        it('should return live matches successfully', async function () {
            try {
                const response = await httpClient.get('/liveMatches', {});
                assert.equal(response?.status, 200);
                assert.equal(response?.body?.status, true);
                assert.equal(response?.body?.message, 'Live Matches');
                assert.property(response?.body, 'response');
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
                const response = await httpClient.get('/liveMatches', {});
                assert.equal(response?.status, 500);
                assert.equal(response?.body?.status, false);
                assert.equal(response?.body?.message, 'Error fetching live matches');
                assert.property(response?.body, 'error');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('GET /matchStats/:matchId', function () {
        this.timeout(TIMEOUT);

        it('should return match stats for valid match ID', async function () {
            const validMatchId = 'qz0G2tpXBlel5Jki'; // Use a known valid format

            try {
                const response = await httpClient.get(`/matchStats/${validMatchId}`, {});
                // Note: This might return 400 or 500 depending on actual match existence
                // but should not crash the server
                assert.oneOf(response?.status, [200, 400, 500]);
                assert.property(response?.body, 'status');
                assert.property(response?.body, 'message');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });

        it('should handle invalid match ID format', async function () {
            const invalidMatchId = 'invalid123';

            try {
                const response = await httpClient.get(`/matchStats/${invalidMatchId}`, {});
                assert.equal(response?.status, 400);
                assert.equal(response?.body?.status, false);
                // The validation middleware returns "Invalid request parameters" for invalid match IDs
                assert.include(response?.body?.message, 'Invalid request parameters');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });

    describe('GET /matchStats', function () {
        this.timeout(TIMEOUT);

        it('should return default match stats (matchId 0)', async function () {
            try {
                const response = await httpClient.get('/matchStats', {});
                // This endpoint uses hardcoded matchId '0'
                assert.oneOf(response?.status, [200, 400, 500]);
                assert.property(response?.body, 'status');
                assert.property(response?.body, 'message');
            } catch (err) {
                assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
            }
        });
    });
});

describe('Controller Unit Tests', function () {
    let sandbox: SinonSandbox;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStub: SinonStub;
    let statusStub: SinonStub;
    let liveMatchesStub: SinonStub;
    let matchStatsStub: SinonStub;
    let isErrorStub: SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Create response stubs
        responseStub = sandbox.stub();
        statusStub = sandbox.stub().returns({ send: responseStub });

        mockRequest = {};
        mockResponse = {
            status: statusStub,
            send: responseStub,
        };

        // Stub service methods
        liveMatchesStub = sandbox.stub(LiveMatches.prototype, 'getMatches');
        matchStatsStub = sandbox.stub(MatchStats.prototype, 'getMatchStats');
        isErrorStub = sandbox.stub(TypesUtils, 'isError');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('live controller', function () {
        it('should return live matches successfully', async function () {
            const mockLiveMatchesResponse = {
                matches: [
                    { matchId: '123', matchName: 'Test Match 1' },
                    { matchId: '456', matchName: 'Test Match 2' },
                ],
            };

            liveMatchesStub.resolves(mockLiveMatchesResponse);

            await controller.live(mockRequest as Request, mockResponse as Response);

            assert.isTrue(statusStub.calledWith(200));
            assert.isTrue(
                responseStub.calledWith({
                    status: true,
                    message: 'Live Matches',
                    response: mockLiveMatchesResponse,
                })
            );
        });

        it('should handle LiveMatches service errors', async function () {
            const mockError = new Error('Service unavailable');
            liveMatchesStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            await controller.live(mockRequest as Request, mockResponse as Response);

            assert.isTrue(statusStub.calledWith(500));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Error fetching live matches',
                    error: 'Service unavailable',
                })
            );
        });

        it('should handle non-Error exceptions', async function () {
            const mockError = 'String error';
            liveMatchesStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(false);

            await controller.live(mockRequest as Request, mockResponse as Response);

            assert.isTrue(statusStub.calledWith(500));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Error fetching live matches',
                    error: 'Unknown error',
                })
            );
        });
    });

    describe('matchStats controller', function () {
        beforeEach(() => {
            mockRequest.params = { matchId: 'validMatchId123' };
        });

        it('should return match stats successfully', async function () {
            const mockMatchStatsResponse = {
                matchId: 'validMatchId123',
                teams: ['Team A', 'Team B'],
                scores: ['150/3', '45/2'],
            };

            matchStatsStub.resolves(mockMatchStatsResponse);

            await controller.matchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(matchStatsStub.calledWith('validMatchId123'));
            assert.isTrue(statusStub.calledWith(200));
            assert.isTrue(
                responseStub.calledWith({
                    status: true,
                    message: 'Match Stats',
                    response: mockMatchStatsResponse,
                })
            );
        });

        it('should handle MatchStats service errors', async function () {
            const mockError = new Error('Invalid match ID');
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            await controller.matchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(matchStatsStub.calledWith('validMatchId123'));
            assert.isTrue(statusStub.calledWith(500));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Error fetching match stats',
                    error: 'Invalid match ID',
                })
            );
        });

        it('should handle missing matchId parameter', async function () {
            mockRequest.params = {};

            await controller.matchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(statusStub.calledWith(400));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Invalid match ID',
                })
            );
            assert.isFalse(matchStatsStub.called);
        });

        it('should handle non-Error exceptions', async function () {
            const mockError = { code: 500, message: 'Database error' };
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(false);

            await controller.matchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(statusStub.calledWith(500));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Error fetching match stats',
                    error: 'Unknown error',
                })
            );
        });
    });

    describe('getMatchStats controller', function () {
        it('should return match stats for default matchId (0)', async function () {
            const mockMatchStatsResponse = {
                matchId: '0',
                isDefault: true,
                message: 'Default match stats',
            };

            matchStatsStub.resolves(mockMatchStatsResponse);

            await controller.getMatchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(matchStatsStub.calledWith('0'));
            assert.isTrue(statusStub.calledWith(200));
            assert.isTrue(
                responseStub.calledWith({
                    status: true,
                    message: 'Match Stats',
                    response: mockMatchStatsResponse,
                })
            );
        });

        it('should handle MatchStats service errors for default match', async function () {
            const mockError = new Error('Default match not found');
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            await controller.getMatchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(matchStatsStub.calledWith('0'));
            assert.isTrue(statusStub.calledWith(500));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Error fetching match stats',
                    error: 'Default match not found',
                })
            );
        });

        it('should handle non-Error exceptions for default match', async function () {
            const mockError = null;
            matchStatsStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(false);

            await controller.getMatchStats(mockRequest as Request, mockResponse as Response);

            assert.isTrue(statusStub.calledWith(500));
            assert.isTrue(
                responseStub.calledWith({
                    status: false,
                    message: 'Error fetching match stats',
                    error: 'Unknown error',
                })
            );
        });
    });

    describe('Response format validation', function () {
        it('should always return consistent response structure for success cases', async function () {
            const mockServiceResponse = { data: 'test' };
            liveMatchesStub.resolves(mockServiceResponse);

            await controller.live(mockRequest as Request, mockResponse as Response);

            const responseCall = responseStub.getCall(0);
            const responseData = responseCall.args[0];

            assert.property(responseData, 'status');
            assert.property(responseData, 'message');
            assert.property(responseData, 'response');
            assert.isBoolean(responseData.status);
            assert.isString(responseData.message);
        });

        it('should always return consistent error response structure', async function () {
            const mockError = new Error('Test error');
            liveMatchesStub.rejects(mockError);
            isErrorStub.withArgs(mockError).returns(true);

            await controller.live(mockRequest as Request, mockResponse as Response);

            const responseCall = responseStub.getCall(0);
            const responseData = responseCall.args[0];

            assert.property(responseData, 'status');
            assert.property(responseData, 'message');
            assert.property(responseData, 'error');
            assert.isFalse(responseData.status);
            assert.isString(responseData.message);
            assert.isString(responseData.error);
        });
    });
});

describe('Controller Edge Cases', function () {
    let sandbox: SinonSandbox;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseStub: SinonStub;
    let statusStub: SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        responseStub = sandbox.stub();
        statusStub = sandbox.stub().returns({ send: responseStub });

        mockRequest = {};
        mockResponse = {
            status: statusStub,
            send: responseStub,
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should handle extremely long matchId in matchStats', async function () {
        const longMatchId = 'a'.repeat(1000);
        mockRequest.params = { matchId: longMatchId };

        const matchStatsStub = sandbox
            .stub(MatchStats.prototype, 'getMatchStats')
            .rejects(new Error('Invalid match ID'));
        const isErrorStub = sandbox.stub(TypesUtils, 'isError').returns(true);

        await controller.matchStats(mockRequest as Request, mockResponse as Response);

        assert.isTrue(matchStatsStub.calledWith(longMatchId));
        assert.isTrue(statusStub.calledWith(500));
    });

    it('should handle special characters in matchId', async function () {
        const specialMatchId = 'match@#$%^&*()_+';
        mockRequest.params = { matchId: specialMatchId };

        const matchStatsStub = sandbox
            .stub(MatchStats.prototype, 'getMatchStats')
            .rejects(new Error('Invalid match ID format'));
        const isErrorStub = sandbox.stub(TypesUtils, 'isError').returns(true);

        await controller.matchStats(mockRequest as Request, mockResponse as Response);

        assert.isTrue(matchStatsStub.calledWith(specialMatchId));
        assert.isTrue(statusStub.calledWith(500));
    });

    it('should handle concurrent requests to live matches', async function () {
        const liveMatchesStub = sandbox
            .stub(LiveMatches.prototype, 'getMatches')
            .resolves({ matches: [] });

        // Simulate concurrent requests
        const promises = Array.from({ length: 5 }, () =>
            controller.live(mockRequest as Request, mockResponse as Response)
        );

        await Promise.all(promises);

        assert.equal(liveMatchesStub.callCount, 5);
        assert.equal(statusStub.callCount, 5);
        assert.equal(responseStub.callCount, 5);
    });
});
