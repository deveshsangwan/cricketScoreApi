import { apiCall } from './Api';
import { assert } from 'chai';
const ErrorMessage = 'Test failed due to error:';

describe('LiveMatches API', function () {
    it('retrieves all the live matches url and matchName', async function () {
        this.timeout(20000);
        try {
            const body = await apiCall(`/liveMatches`);
            assert.equal(body.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });
});