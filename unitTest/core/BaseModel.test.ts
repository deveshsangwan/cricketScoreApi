import { assert } from 'chai';
import sinon from 'sinon';
import Mongoose from 'mongoose';
import { findAll, findById, findIdByMatchUrl, insert, insertMany } from '../../app/dist/core/BaseModel';

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
        await testErrorHandling(insert, stub => ({ findOneAndUpdate: stub }), [{ _id: 'testId' }, 'matchStats'], 'matchStats', sinon.match.any);
    });

    it('insertMany: should handle errors', async () => {
        await testErrorHandling(insertMany, stub => ({ insertMany: stub }), ['testData', 'matchStats'], 'matchStats', 'testData');
    });
});