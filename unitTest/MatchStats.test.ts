import { apiCall } from './Api';
import { MatchStats } from '../app/ts_src/MatchStats';
import { testData } from './MatchStats.test.data';
import chai from 'chai';

const { assert } = chai;
const ErrorMessage = 'Test failed due to error:';

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
    it('should GET a specific match by id', async function () {
        this.timeout(20000);
        const id = 'nLSAYi2BckuKRVA8'; // replace with a valid match id
    
        try {
            const body = await apiCall(`/live/${id}`);
            assert.equal(body.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('should GET stats of all the live matches', async function () {
        this.timeout(20000);
        try {
            const body = await apiCall(`/live1`);
            assert.equal(body.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });
});

describe('MatchStats | getTeamData function', function () {
    let matchStatsObj: MatchStats;

    function runTestWithSubsetDeepEqual(inputString: string, expectedOutput: any) {
        try {
            const result = (matchStatsObj as any).getTeamData(inputString);
            assertResultSubset(result, expectedOutput);
        } catch (error) {
            assert.fail(`Failed to get team data with input "${inputString}": ${error.message}`);
        }
    }

    function runTestWithDeepEqual(inputString: string, expectedOutput: any) {
        try {
            const result = (matchStatsObj as any).getTeamData(inputString);
            assert.deepEqual(result, expectedOutput);
        } catch (error) {
            assert.fail(`Failed to get team data with input "${inputString}": ${error.message}`);
        }
    }

    beforeEach(() => {
        matchStatsObj = new MatchStats();
    });

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