import HttpClient from './HttpClient';
import { testData } from './TestData/Generic';
import chai, { assert } from 'chai';
const ErrorMessage = 'Test failed due to error:';
const httpClient = new HttpClient(chai);

describe('Generic API', function () {
    it('returns a 404 status for an invalid route / non-existent route', async function () {
        const { route, expectedOutput } = testData.invalidRoute;

        try {
            const res = await httpClient.get(route, {});
            assert.equal(res.status, 404);
            assert.deepEqual(res.body, expectedOutput);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });
});