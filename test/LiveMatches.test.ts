import HttpClient from './HttpClient';
import chai, { assert } from 'chai';
import { StubModule } from './StubModule';

const ErrorMessage = 'Test failed due to error:';
const httpClient = new HttpClient(chai);

describe('LiveMatches API', function () {
    let stubObj: StubModule = new StubModule

    afterEach(() => {
        stubObj.restoreStubs();
    });

    it('retrieves all the live matches url and matchName', async function () {
        this.timeout(20000);
        try {
            const response = await httpClient.get('/liveMatches', {});
            assert.equal(response?.body?.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    });

    it('all matches retrieved are new matches (entry does not exist in db)', async function () {
        stubObj.stubModuleMethod('mongo', 'findAll').resolves([]);
        stubObj.stubModuleMethod('mongo', 'insertMany').resolves('mocked');
        this.timeout(20000);
        try {
            const response = await httpClient.get('/liveMatches', {});
            assert.equal(response?.body?.status, true);
        } catch (err) {
            assert.fail(`${ErrorMessage} ${err.message}`);
        }
    })
});