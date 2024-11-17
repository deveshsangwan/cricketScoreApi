import { assert } from 'chai';
import sinon from 'sinon';
import { findAll, findById, findIdByMatchUrl, /* insert, */ insertMany } from '../../app/dist/core/BaseModel';

describe('BaseModel Error handling', () => {
    const error = new Error('Test error');
    afterEach(() => {
        sinon.restore();
    });

    const testErrorHandling = async (method, modelReturn, modelArgs, expectedModelName, expectedArgs) => {
        const methodStub = sinon.stub().throws(error);
        // const modelStub = sinon.stub(Mongoose, 'model').returns(modelReturn(methodStub));

        try {
            await method(...modelArgs);
        } catch (e) {
            // assert.isTrue(modelStub.calledWith(expectedModelName));
            assert.isTrue(methodStub.calledWith(expectedArgs));
            assert.equal(e, error);
        }
    };

    it('findAll: should handle errors', async () => {
        await testErrorHandling(findAll, stub => ({ find: stub }), ['matchstats'], 'matchstats', sinon.match.any);
    });

    it('findById: should handle errors', async () => {
        await testErrorHandling(findById, stub => ({ find: stub }), ['testId', 'matchstats'], 'matchstats', { id: 'testId' });
    });

    it('findIdByMatchUrl: should handle errors', async () => {
        await testErrorHandling(findIdByMatchUrl, stub => ({ find: stub }), ['testUrl'], 'livematches', { matchUrl: 'testUrl' });
    });

    /* it('insert: should handle errors', async () => {
        await testErrorHandling(insert, stub => ({ findOneAndUpdate: stub }), [{ id: 'testId', matchName: 'testMatchName', onBatting: {}, summary: 'testSummary', team1: {}, team2: {}, tournamentName: 'testTournamentName', isLive: false }, 'matchstats'], 'matchstats', sinon.match.any);
    }); */

    it('insertMany: should handle errors', async () => {
        await testErrorHandling(insertMany, stub => ({ insertMany: stub }), [{ id: 'testId' }, 'matchstats'], 'matchstats', 'testData');
    });
});