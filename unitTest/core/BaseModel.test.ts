import { assert } from 'chai';
const sinon = require('sinon');
const Mongoose = require('mongoose');
const { findAll, findById, findIdByMatchUrl, insert, insertMany } = require('../../app/core/baseModel');

describe('BaseModel Error handling', () => {
    const error = new Error('Test error');
    afterEach(() => {
        sinon.restore();
    });

    const testErrorHandling = async (method, modelReturn, modelArgs, expectedModelName, expectedArgs) => {
        const methodStub = sinon.stub().throws(error);
        const modelStub = sinon.stub(Mongoose, 'model').returns(modelReturn(methodStub));

        try {
            await method(...modelArgs);
        } catch (e) {
            assert.isTrue(modelStub.calledWith(expectedModelName));
            assert.isTrue(methodStub.calledWith(expectedArgs));
            assert.equal(e, error);
        }
    };

    it('findAll: should handle errors', async () => {
        await testErrorHandling(findAll, stub => ({ find: stub }), ['matchStats'], 'matchStats', sinon.match.any);
    });

    it('findById: should handle errors', async () => {
        await testErrorHandling(findById, stub => ({ find: stub }), ['testId', 'matchStats'], 'matchStats', { _id: 'testId' });
    });

    it('findIdByMatchUrl: should handle errors', async () => {
        await testErrorHandling(findIdByMatchUrl, stub => ({ find: stub }), ['testUrl'], 'liveMatches', { matchUrl: 'testUrl' });
    });

    it('insert: should handle errors', async () => {
        await testErrorHandling(insert, stub => ({ create: stub }), ['testData', 'matchStats'], 'matchStats', 'testData');
    });

    it('insertMany: should handle errors', async () => {
        await testErrorHandling(insertMany, stub => ({ insertMany: stub }), ['testData', 'matchStats'], 'matchStats', 'testData');
    });
});