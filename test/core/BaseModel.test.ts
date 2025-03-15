import { assert } from 'chai';
import sinon from 'sinon';
import {
    findAll,
    findById,
    findIdByMatchUrl,
    /* insert, */ insertMany,
} from '../../app/dist/core/BaseModel';

describe('BaseModel Error handling', () => {
    const error = new Error('Test error');
    afterEach(() => {
        sinon.restore();
    });

    const testErrorHandling = async (
        method,
        modelArgs,
        expectedArgs
    ) => {
        const methodStub = sinon.stub().throws(error);

        try {
            await method(...modelArgs);
        } catch (e) {
            assert.isTrue(methodStub.calledWith(expectedArgs));
            assert.equal(e, error);
        }
    };

    it('findAll: should handle errors', async () => {
        await testErrorHandling(
            findAll,
            ['matchstats'],
            sinon.match.any
        );
    });

    it('findById: should handle errors', async () => {
        await testErrorHandling(
            findById,
            ['testId', 'matchstats'],
            { id: 'testId' }
        );
    });

    it('findIdByMatchUrl: should handle errors', async () => {
        await testErrorHandling(
            findIdByMatchUrl,
            ['testUrl'],
            { matchUrl: 'testUrl' }
        );
    });

    it('insertMany: should handle errors', async () => {
        await testErrorHandling(
            insertMany,
            [{ id: 'testId' }, 'matchstats'],
            'testData'
        );
    });
});
