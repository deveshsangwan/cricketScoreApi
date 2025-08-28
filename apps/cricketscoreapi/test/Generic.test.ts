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
            assert.fail(`${ErrorMessage} ${err instanceof Error ? err.message : String(err)}`);
        }
    });

    describe('CORS', function () {
        it('returns a 403 status for an invalid origin', async function () {
            const { route } = testData.cors;
            httpClient.setOrigin('http://example.com');
            const res = await httpClient.get(route, {});
            assert.equal(res.status, 403, 'Expected 403 status for invalid origin');
        });

        it('returns a 403 status for an invalid header', async function () {
            const { route } = testData.cors;
            httpClient.setOrigin('http://local.deveshsangwan.com:3000');
            const res = await httpClient.get(route, { Origin: 'http://example.com' });
            assert.equal(res.status, 403, 'Expected 403 status for invalid header');
        });
    });
});
