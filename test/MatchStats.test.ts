import HttpClient from './HttpClient';
import { MatchStats } from '../app/dist/services/MatchStats';
import { getTeamData } from '../app/dist/services/MatchStats/MatchUtils';
import { testData } from './TestData/MatchStats';
import chai, { assert } from 'chai';
import sinon from 'sinon';

const ErrorMessage = 'Test failed due to error:';
const httpClient = new HttpClient(chai);
const TIMEOUT = 20000;

function assertResultSubset(result, expectedOutput) {
    const resultSubset = Object.keys(expectedOutput).reduce((subset, key) => {
        if (key in result) {
            subset[key] = result[key];
        }
        return subset;
    }, {});
    assert.deepEqual(resultSubset, expectedOutput);
}

describe('MatchStats API', function () {
    this.timeout(TIMEOUT);

    it('retrieves a specific match by id', async function () {
        const id = 'nLSAYi2BckuKRVA8'; // replace with a valid match id

        try {
            const response = await httpClient.get(`/matchStats/${id}`, {});
            assert.equal(response?.body?.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('returns a 400 status for an invalid match id', async function () {
        const { id, expectedOutput } = testData.invalidMatchId;

        try {
            const res = await httpClient.get(`/matchStats/${id}`, {});
            assert.equal(res.status, 400);
            assert.deepEqual(res.body, expectedOutput);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('returns a 500 status for a valid but non-existent match id', async function () {
        const { id, expectedOutput } = testData.nonExistentMatchId;

        try {
            const response = await httpClient.get(`/matchStats/${id}`, {});
            assert.equal(response?.status, 500);
            assert.deepEqual(response?.body, expectedOutput);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('retrieves stats for all live matches', async function () {
        try {
            const response = await httpClient.get(`/matchStats`, {});
            assert.equal(response?.body?.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });
});

describe('MatchStats | getMatchStats function', function () {
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        matchStatsObj = new MatchStats();
    });

    it('should throw an error when matchId is undefined or null', async () => {
        try {
            await matchStatsObj.getMatchStats(undefined);
            assert.fail('Expected getMatchStats to throw an error');
        } catch (error) {
            assert.equal(error.message, 'Match Id is required');
        }
    });
});

describe('MatchStats | getTeamData function', function () {
    function runTestWithSubsetDeepEqual(inputString: string, expectedOutput: object) {
        try {
            const result = getTeamData(inputString);
            assertResultSubset(result, expectedOutput);
        } catch (error) {
            assert.fail(`Failed to get team data with input '${inputString}': ${error.message}`);
        }
    }

    function runTestWithDeepEqual(inputString: string, expectedOutput: object | null) {
        try {
            const result = getTeamData(inputString);
            assert.deepEqual(result, expectedOutput);
        } catch (error) {
            assert.fail(`Failed to get team data with input '${inputString}': ${error.message}`);
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

describe('MatchStats | getTournamentName function', function () {
    let $;
    const matchStatsObj: MatchStats = new MatchStats();

    beforeEach(() => {
        $ = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('throws an error if no elements found', async () => {
        const { input, expectedOutput } = testData.getTournamentNameErrorHandling;
        $.returns(input);
        try {
            await matchStatsObj.getTournamentName($);
            assert.fail('Expected getTournamentName to throw an error');
        } catch (error) {
            assert.isTrue($.calledWith('.cb-col.cb-col-100.cb-bg-white'));
            assert.equal(error.message, expectedOutput);
        }
    });
});

describe('MatchStats | InvalidMatchIdError handling', function () {
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
                assert.fail(`Expected getMatchStats to throw an InvalidMatchIdError for ID: ${invalidId}`);
            } catch (error) {
                assert.include(error.message, `Invalid match id: ${invalidId}`);
            }
        }
    });

    it('accepts valid match IDs without throwing errors', async () => {
        // Mock dependencies to prevent actual API calls
        const stub = sinon.stub(matchStatsObj['liveMatchesObj'], 'getMatches').resolves({});

        // Valid 16-character alphanumeric string
        const validId = 'abcDEF1234567890';

        try {
            await matchStatsObj.getMatchStats(validId);
            // If we reach here, no error was thrown
            assert.isTrue(stub.calledOnce);
            assert.isTrue(stub.calledWith(validId));
        } catch (error) {
            assert.fail(`Should not throw error for valid ID ${validId}: ${error.message}`);
        } finally {
            stub.restore();
        }
    });
});

describe('MatchStats | MatchIdRequriedError handling', function () {
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
                await matchStatsObj.getMatchStats(emptyValue);
                assert.fail(`Expected getMatchStats to throw a MatchIdRequriedError for empty value: ${emptyValue}`);
            } catch (error) {
                assert.equal(error.message, 'Match Id is required');
            }
        }
    });
});

describe('MatchStats | Error logging functionality', function () {
    let matchStatsObj: MatchStats;
    let cheerioStub;

    beforeEach(() => {
        matchStatsObj = new MatchStats();
        // Import the Logger module to stub the writeLogError function

        // Create a stub for the cheerio API
        cheerioStub = sinon.stub();
        cheerioStub.throws(new Error('Mock error in getMatchStatsByMatchId'));
    });

    afterEach(() => {
        sinon.restore();
    });

    it('throws error in getMatchStatsByMatchId', () => {
        try {
            // Access the private method using type casting to avoid TypeScript errors
            matchStatsObj.getMatchStatsByMatchId(cheerioStub, 'testMatchId');
            assert.fail('Expected getMatchStatsByMatchId to throw an error');
        } catch (error) {
            assert.include(error.message, 'Mock error in getMatchStatsByMatchId');
        }
    });
});


describe('MatchStats | NoMatchesFoundError handling', function () {
    let matchStatsObj: MatchStats;

    beforeEach(() => {
        matchStatsObj = new MatchStats();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('throws NoMatchesFoundError when no live matches are available', async () => {
        // Stub liveMatchesObj.getMatches to return an empty object (no matches)
        const getMatchesStub = sinon.stub(matchStatsObj['liveMatchesObj'], 'getMatches').resolves({});
        
        try {
            // '0' is the special matchId that tells the service to get all matches
            await matchStatsObj.getMatchStats('0');
            assert.fail('Expected getMatchStats to throw a NoMatchesFoundError');
        } catch (error) {
            assert.include(error.message, 'No matches found');
            assert.isTrue(getMatchesStub.calledWith('0'));
        }
    });
});