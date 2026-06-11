
import { MatchStats } from '../app/src/services/MatchStats';
import { getTeamData } from '../app/src/services/MatchStats/MatchUtils';
import { testData } from './TestData/MatchStats';
import { assert } from 'chai';
import sinon from 'sinon';
import { CricbuzzClient } from '../app/src/services/Cricbuzz/CricbuzzClient';

const TIMEOUT = 20000;

function assertResultSubset(result: any, expectedOutput: any) {
    const resultSubset = Object.keys(expectedOutput).reduce((subset: any, key) => {
        if (key in result) {
            subset[key] = result[key];
        }
        return subset;
    }, {});
    assert.deepEqual(resultSubset, expectedOutput);
}

describe('MatchStats | getMatchStats function', function () {
    this.timeout(TIMEOUT);
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        matchStatsObj = new MatchStats();
    });

    it('should throw an error when matchId is undefined or null', async () => {
        try {
            await matchStatsObj.getMatchStats(undefined as any);
            assert.fail('Expected getMatchStats to throw an error');
        } catch (error) {
            assert.equal((error as Error).message, 'Match Id is required');
        }
    });
});

describe('MatchStats | getTeamData function', function () {
    this.timeout(TIMEOUT);
    function runTestWithSubsetDeepEqual(inputString: string, expectedOutput: object) {
        try {
            const result = getTeamData(inputString);
            assertResultSubset(result, expectedOutput);
        } catch (error) {
            assert.fail(
                `Failed to get team data with input '${inputString}': ${(error as Error).message}`
            );
        }
    }

    function runTestWithDeepEqual(inputString: string, expectedOutput: object | null) {
        try {
            const result = getTeamData(inputString);
            assert.deepEqual(result, expectedOutput);
        } catch (error) {
            assert.fail(
                `Failed to get team data with input '${inputString}': ${(error as Error).message}`
            );
        }
    }

    it('returns correct team data for standard input', function () {
        const { inputString, expectedOutput } = testData.teamDataStandardCase;
        runTestWithSubsetDeepEqual(inputString, expectedOutput);
    });

    it('returns correct team data when overs are not provided', function () {
        const { inputString, expectedOutput } = testData.teamDataNoOvers;
        runTestWithSubsetDeepEqual(inputString, expectedOutput);
    });

    it('returns correct team data during the 2nd innings', function () {
        const { inputString, expectedOutput } = testData.secondInningsInProgress;
        runTestWithSubsetDeepEqual(inputString, expectedOutput);
    });

    it('returns correct team data when wickets are not provided', function () {
        const { inputString, expectedOutput } = testData.teamDataNoWickets;
        runTestWithSubsetDeepEqual(inputString, expectedOutput);
    });

    it('returns an empty object for invalid input string', function () {
        const inputString = 'invalid string';
        runTestWithDeepEqual(inputString, {});
    });

    it('returns an empty object for an empty input string', function () {
        const inputString = '';
        runTestWithDeepEqual(inputString, {});
    });
});

describe('MatchStats | InvalidMatchIdError handling', function () {
    this.timeout(TIMEOUT);
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        matchStatsObj = new MatchStats();
    });

    it('throws InvalidMatchIdError when matchId format is incorrect', async () => {
        // Test with various invalid formats
        const invalidIds = ['abc', '123', 'abcd1234', 'AAAAAAAAAAAAAAAAA', '!nvalid1dF0rmat!'];

        for (const invalidId of invalidIds) {
            try {
                await matchStatsObj.getMatchStats(invalidId);
                assert.fail(
                    `Expected getMatchStats to throw an InvalidMatchIdError for ID: ${invalidId}`
                );
            } catch (error) {
                assert.include((error as Error).message, `Invalid match id: ${invalidId}`);
            }
        }
    });

    it('accepts valid match IDs without throwing errors', async () => {
        // Import the LiveMatches class and mongo module to stub their methods
        const { LiveMatches } = require('../app/src/services/LiveMatches');
        const mongo = require('../app/src/core/BaseModel');

        // Stub the getMatches method on LiveMatches prototype
        const getMatchesStub = sinon.stub(LiveMatches.prototype, 'getMatches').resolves({
            matchUrl: 'test-url',
            matchName: 'Test Match',
            matchId: 'abcDEF1234567890',
        });

        // Stub mongo.findById to return mock data so it doesn't proceed to web scraping
        const mongoStub = sinon.stub(mongo, 'findById').resolves({
            id: 'abcDEF1234567890',
            team1: { name: 'Team 1', score: '100', wickets: '2', isBatting: true },
            team2: { name: 'Team 2', score: '80', wickets: '3', isBatting: false },
            onBatting: {
                player1: { name: 'Player 1', runs: '45', balls: '30' },
                player2: { name: 'Player 2', runs: '25', balls: '20' },
            },
            runRate: { currentRunRate: 6.5, requiredRunRate: 7.2 },
            summary: 'Test match in progress',
            matchCommentary: [{ commentary: 'Test commentary', hasOver: false }], // Cannot be empty array
            keyStats: { 'Test Stat': 'Test Value' }, // Cannot be empty object
            tournamentName: 'Test Tournament',
            matchName: 'Test Match',
            isLive: true,
        });
        const fetchJsonStub = sinon
            .stub(CricbuzzClient.prototype, 'fetchJson')
            .rejects(new Error('Cricbuzz unavailable'));

        // Create MatchStats instance after stubbing
        const testMatchStatsObj = new MatchStats();

        // Valid 16-character alphanumeric string
        const validId = 'abcDEF1234567890';

        try {
            const result = await testMatchStatsObj.getMatchStats(validId);
            // If we reach here, no error was thrown
            assert.isTrue(getMatchesStub.calledOnce);
            assert.isTrue(getMatchesStub.calledWith(validId));
            assert.isTrue(mongoStub.calledOnce);
            assert.equal((result as any).matchId, validId);
        } catch (error) {
            assert.fail(
                `Should not throw error for valid ID ${validId}: ${(error as Error).message}`
            );
        } finally {
            getMatchesStub.restore();
            mongoStub.restore();
            fetchJsonStub.restore();
        }
    });
});

describe('MatchStats | MatchIdRequriedError handling', function () {
    this.timeout(TIMEOUT);
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        matchStatsObj = new MatchStats();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('throws MatchIdRequriedError when matchId is not provided', async () => {
        // Test with null, undefined, and empty string
        const emptyValues = [null, undefined, ''];

        for (const emptyValue of emptyValues) {
            try {
                await matchStatsObj.getMatchStats(emptyValue as any);
                assert.fail(
                    `Expected getMatchStats to throw a MatchIdRequriedError for empty value: ${emptyValue}`
                );
            } catch (error) {
                assert.equal((error as Error).message, 'Match Id is required');
            }
        }
    });
});

describe('MatchStats | NoMatchesFoundError handling', function () {
    this.timeout(TIMEOUT);
    let matchStatsObj: MatchStats;
    let getMatchesStub: sinon.SinonStub;

    beforeEach(() => {
        // Import the LiveMatches class to stub its methods
        const { LiveMatches } = require('../app/src/services/LiveMatches');
        const mongo = require('../app/src/core/BaseModel');

        // Stub liveMatchesObj.getMatches to return an empty object (no matches)
        getMatchesStub = sinon.stub(LiveMatches.prototype, 'getMatches').resolves({});
        sinon.stub(mongo, 'findAll').resolves([]);

        // Create MatchStats instance after stubbing
        matchStatsObj = new MatchStats();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('throws NoMatchesFoundError when no live matches are available', async () => {
        try {
            // '0' is the special matchId that tells the service to get all matches
            await matchStatsObj.getMatchStats('0');
            assert.fail('Expected getMatchStats to throw a NoMatchesFoundError');
        } catch (error) {
            assert.include((error as Error).message, 'No matches found');
            assert.isTrue(getMatchesStub.calledWith('0'));
        }
    });
});
