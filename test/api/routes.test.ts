import type{ Request, Response } from 'express';
import chai, { assert } from 'chai';
import sinon from 'sinon';
import type { SinonStub, SinonSandbox } from 'sinon';
import { StubModule } from '../StubModule';
import HttpClient from '../HttpClient';

let httpClient = new HttpClient(chai);
const TIMEOUT = 20000;

describe('Routes API Integration Tests', function () {
    let stubObj: StubModule;

    beforeEach(() => {
        stubObj = new StubModule();
    });

    afterEach(() => {
        stubObj.restoreStubs();
    });

    describe('apiRequireAuth', () => {
        it('should return 401 if no auth header is provided', async () => {
            httpClient = new HttpClient(chai, true);
            const response = await httpClient.get('/liveMatches', {});
            assert.equal(response?.status, 401);
            assert.equal(response?.body?.status, false);
            assert.equal(response?.body?.statusMessage, '401 - Unauthorized');
            assert.equal(response?.body?.errorMessage, 'Authentication Failed');
        });
    });

    describe('errorHandler', () => {
        it('should return 500 if an error occurs', async () => {
            httpClient = new HttpClient(chai);
            stubObj.stubModuleMethod('mongo', 'findAll').rejects(new Error('Database connection failed'));
            console.log('errorHandler');
            const response = await httpClient.get('/liveMatches', {});
            console.log('response', response.body

            );
            assert.equal(response?.status, 500);
            assert.equal(response?.body?.status, false);
            assert.equal(response?.body?.error, 'Database connection failed');

        });
    });
});
