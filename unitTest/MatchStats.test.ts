import { apiCall } from './Api';
import { MatchStats } from '../app/src/MatchStats';
import { getTeamData } from '../app/src/MatchStats/MatchUtils';
import { testData } from './TestData/MatchStats';
import { assert } from 'chai';
import sinon from 'sinon';

const ErrorMessage = 'Test failed due to error:';
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
            const body = await apiCall(`/matchStats/${id}`);
            assert.equal(body.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('returns a 500 status for an invalid match id', async function () {
        const { id, expectedOutput } = testData.invalidMatchId;

        try {
            const res = await apiCall(`/matchStats/${id}`);
            assert.equal(res.status, 500);
            assert.deepEqual(res.body, expectedOutput);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('returns a 500 status for a valid but non-existent match id', async function () {
        const { id, expectedOutput } = testData.nonExistentMatchId;

        try {
            const res = await apiCall(`/matchStats/${id}`);
            assert.equal(res.status, 500);
            assert.deepEqual(res.body, expectedOutput);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('retrieves stats for all live matches', async function () {
        try {
            const body = await apiCall(`/matchStats`);
            assert.equal(body.status, true);
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

    function runTestWithSubsetDeepEqual(inputString: string, expectedOutput: any) {
        try {
            const result = getTeamData(inputString);
            assertResultSubset(result, expectedOutput);
        } catch (error) {
            assert.fail(`Failed to get team data with input "${inputString}": ${error.message}`);
        }
    }

    function runTestWithDeepEqual(inputString: string, expectedOutput: any) {
        try {
            const result = getTeamData(inputString);
            assert.deepEqual(result, expectedOutput);
        } catch (error) {
            assert.fail(`Failed to get team data with input "${inputString}": ${error.message}`);
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
    let matchStatsObj: MatchStats = new MatchStats();

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