import { assert } from 'chai';
const sinon = require('sinon');
const Mongoose = require('mongoose');
const { findAll, findById, findIdByMatchUrl, insert, insertMany } = require('../../app/core/baseModel');

describe('BaseModel Error handling', () => {
    const error = new Error('Test error');
    afterEach(() => {
        sinon.restore();
    });

    it('findAll: should handle errors', async () => {
        const modelStub = sinon.stub(Mongoose, 'model').returns({
            find: sinon.stub().throws(error),
        });

        try {
            await findAll('matchStats');
        } catch (e) {
            assert.isTrue(modelStub.calledWith('matchStats'));
            assert.equal(e, error);
        }
    });

    it('findById: should handle errors', async () => {
        const findStub = sinon.stub().throws(error);
        const modelStub = sinon.stub(Mongoose, 'model').returns({
            find: findStub,
        });
    
        try {
            await findById('testId', 'matchStats');
        } catch (e) {
            assert.isTrue(modelStub.calledWith('matchStats'));
            assert.isTrue(findStub.calledWith({ _id: 'testId' }));
            assert.equal(e, error);
        }
    });

    it('findIdByMatchUrl: should handle errors', async () => {
        const findStub = sinon.stub().throws(error);
        const modelStub = sinon.stub(Mongoose, 'model').returns({
            find: findStub,
        });
    
        try {
            await findIdByMatchUrl('testUrl');
        } catch (e) {
            assert.isTrue(modelStub.calledWith('liveMatches'));
            assert.isTrue(findStub.calledWith({ matchUrl: 'testUrl' }));
            assert.equal(e, error);
        }
    });

    it('insert: should handle errors', async () => {
        const createStub = sinon.stub().throws(error);
        const modelStub = sinon.stub(Mongoose, 'model').returns({
            create: createStub,
        });
    
        try {
            await insert('testData', 'matchStats');
        } catch (e) {
            assert.isTrue(modelStub.calledWith('matchStats'));
            assert.isTrue(createStub.calledWith('testData'));
            assert.equal(e, error);
        }
    });

    it.only('insertMany: should handle errors', async () => {
        const insertManyStub = sinon.stub().throws(error);
        const modelStub = sinon.stub(Mongoose, 'model').returns({
            insertMany: insertManyStub,
        });
    
        try {
            await insertMany('testData', 'matchStats');
        } catch (e) {
            assert.isTrue(modelStub.calledWith('matchStats'));
            assert.isTrue(insertManyStub.calledWith('testData'));
            assert.equal(e, error);
        }
    });
});