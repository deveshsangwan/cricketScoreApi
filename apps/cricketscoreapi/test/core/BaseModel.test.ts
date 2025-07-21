import { assert } from 'chai';
import sinon from 'sinon';
import {
    findAll,
    findById,
    findIdByMatchUrl,
    insert,
    insertMany,
} from '../../app/src/core/BaseModel';
import prisma from '../../app/src/core/prisma';
import * as Logger from '../../app/src/core/Logger';

describe('BaseModel', () => {
    let loggerStub: sinon.SinonStub;

    beforeEach(() => {
        loggerStub = sinon.stub(Logger, 'writeLogError');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('findAll', () => {
        it('should retrieve all records from livematches model successfully', async () => {
            const mockData = [
                { 
                    id: '1', 
                    v: 1,
                    matchName: 'Test Match 1',
                    matchUrl: 'test1'
                },
                { 
                    id: '2', 
                    v: 2,
                    matchName: 'Test Match 2',
                    matchUrl: 'test2'
                }
            ];
            const findManyStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'livematches').value({ findMany: findManyStub });

            const result = await findAll('livematches');

            assert.deepEqual(result, mockData);
            assert.isTrue(findManyStub.calledOnce);
        });

        it('should retrieve all records from matchstats model successfully', async () => {
            const mockData = [
                { 
                    id: '1', 
                    matchName: 'Test Match 1',
                    createdAt: new Date(),
                    isLive: true,
                    summary: 'Test summary',
                    tournamentName: 'Test Tournament',
                    keyStats: {},
                    onBatting: { 
                        player1: { balls: '10', name: 'Player1', runs: '20' }, 
                        player2: { balls: '5', name: 'Player2', runs: '10' } 
                    },
                    runRate: { currentRunRate: 6.0, requiredRunRate: 5.5 },
                    team1: { 
                        name: 'Team1', 
                        score: '120/5', 
                        overs: '20.0',
                        isBatting: true,
                        wickets: '5',
                        previousInnings: null
                    },
                    team2: { 
                        name: 'Team2', 
                        score: '0/0', 
                        overs: '0.0',
                        isBatting: false,
                        wickets: '0',
                        previousInnings: null
                    },
                    matchCommentary: []
                }
            ];
            const findManyStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'matchstats').value({ findMany: findManyStub });

            const result = await findAll('matchstats');

            assert.deepEqual(result, mockData);
            assert.isTrue(findManyStub.calledOnce);
        });

        it('should handle errors for livematches model', async () => {
            const error = new Error('Database error');
            const findManyStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'livematches').value({ findMany: findManyStub });

            try {
                await findAll('livematches');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['findAll livematches error: ', error]));
            }
        });

        it('should handle errors for matchstats model', async () => {
            const error = new Error('Database error');
            const findManyStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'matchstats').value({ findMany: findManyStub });

            try {
                await findAll('matchstats');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['findAll matchstats error: ', error]));
            }
        });
    });

    describe('findById', () => {
        it('should find record by ID in livematches model successfully', async () => {
            const mockData = { 
                id: 'testId', 
                v: 1,
                matchName: 'Test Match',
                matchUrl: 'testUrl'
            };
            const findUniqueStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'livematches').value({ findUnique: findUniqueStub });

            const result = await findById('testId', 'livematches');

            assert.deepEqual(result, mockData);
            assert.isTrue(findUniqueStub.calledWith({ where: { id: 'testId' } }));
        });

        it('should find record by ID in matchstats model successfully', async () => {
            const mockData = { 
                id: 'testId', 
                matchName: 'Test Match',
                createdAt: new Date(),
                isLive: true,
                summary: 'Test summary',
                tournamentName: 'Test Tournament',
                keyStats: {},
                onBatting: { 
                    player1: { balls: '10', name: 'Player1', runs: '20' }, 
                    player2: { balls: '5', name: 'Player2', runs: '10' } 
                },
                runRate: { currentRunRate: 6.0, requiredRunRate: 5.5 },
                team1: { 
                    name: 'Team1', 
                    score: '120/5', 
                    overs: '20.0',
                    isBatting: true,
                    wickets: '5',
                    previousInnings: null
                },
                team2: { 
                    name: 'Team2', 
                    score: '0/0', 
                    overs: '0.0',
                    isBatting: false,
                    wickets: '0',
                    previousInnings: null
                },
                matchCommentary: []
            };
            const findUniqueStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'matchstats').value({ findUnique: findUniqueStub });

            const result = await findById('testId', 'matchstats');

            assert.deepEqual(result, mockData);
            assert.isTrue(findUniqueStub.calledWith({ where: { id: 'testId' } }));
        });

        it('should return null when record not found in livematches', async () => {
            const findUniqueStub = sinon.stub().resolves(null);
            sinon.stub(prisma, 'livematches').value({ findUnique: findUniqueStub });

            const result = await findById('nonexistent', 'livematches');

            assert.isNull(result);
        });

        it('should return null when record not found in matchstats', async () => {
            const findUniqueStub = sinon.stub().resolves(null);
            sinon.stub(prisma, 'matchstats').value({ findUnique: findUniqueStub });

            const result = await findById('nonexistent', 'matchstats');

            assert.isNull(result);
        });

        it('should handle errors for livematches model', async () => {
            const error = new Error('Database error');
            const findUniqueStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'livematches').value({ findUnique: findUniqueStub });

            try {
                await findById('testId', 'livematches');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['findById livematches error: ', error]));
            }
        });

        it('should handle errors for matchstats model', async () => {
            const error = new Error('Database error');
            const findUniqueStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'matchstats').value({ findUnique: findUniqueStub });

            try {
                await findById('testId', 'matchstats');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['findById matchstats error: ', error]));
            }
        });
    });

    describe('findIdByMatchUrl', () => {
        it('should find record by match URL successfully', async () => {
            const mockData = { 
                id: 'testId', 
                v: 1,
                matchName: 'Test Match',
                matchUrl: 'testUrl'
            };
            const findUniqueStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'livematches').value({ findUnique: findUniqueStub });

            const result = await findIdByMatchUrl('testUrl');

            assert.deepEqual(result, mockData);
            assert.isTrue(findUniqueStub.calledWith({ where: { matchUrl: 'testUrl' } }));
        });

        it('should return null when match URL not found', async () => {
            const findUniqueStub = sinon.stub().resolves(null);
            sinon.stub(prisma, 'livematches').value({ findUnique: findUniqueStub });

            const result = await findIdByMatchUrl('nonexistent');

            assert.isNull(result);
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            const findUniqueStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'livematches').value({ findUnique: findUniqueStub });

            try {
                await findIdByMatchUrl('testUrl');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['findIdByMatchUrl error: ', error]));
            }
        });
    });

    describe('insert', () => {
        it('should insert/update record in livematches model successfully', async () => {
            const mockData = { 
                id: 'testId', 
                v: 1,
                matchName: 'Test Match',
                matchUrl: 'testUrl'
            };
            const upsertStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'livematches').value({ upsert: upsertStub });

            const testData = { id: 'testId', matchUrl: 'testUrl', someField: 'value' };
            const result = await insert(testData, 'livematches');

            assert.deepEqual(result, mockData);
            assert.isTrue(upsertStub.calledWith({
                where: { id: 'testId' },
                update: { matchUrl: 'testUrl', someField: 'value' },
                create: {
                    id: 'testId',
                    matchUrl: 'testUrl',
                    someField: 'value',
                    createdAt: sinon.match.date
                }
            }));
        });

        it('should insert/update record in matchstats model successfully', async () => {
            const mockData = { 
                id: 'testId', 
                matchName: 'Test Match',
                createdAt: new Date(),
                isLive: true,
                summary: 'Test summary',
                tournamentName: 'Test Tournament',
                keyStats: {},
                onBatting: { 
                    player1: { balls: '10', name: 'Player1', runs: '20' }, 
                    player2: { balls: '5', name: 'Player2', runs: '10' } 
                },
                runRate: { currentRunRate: 6.0, requiredRunRate: 5.5 },
                team1: { 
                    name: 'Team1', 
                    score: '120/5', 
                    overs: '20.0',
                    isBatting: true,
                    wickets: '5',
                    previousInnings: null
                },
                team2: { 
                    name: 'Team2', 
                    score: '0/0', 
                    overs: '0.0',
                    isBatting: false,
                    wickets: '0',
                    previousInnings: null
                },
                matchCommentary: []
            };
            const upsertStub = sinon.stub().resolves(mockData);
            sinon.stub(prisma, 'matchstats').value({ upsert: upsertStub });

            const testData = { id: 'testId', matchName: 'Test Match', someField: 'value' };
            const result = await insert(testData, 'matchstats');

            assert.deepEqual(result, mockData);
            assert.isTrue(upsertStub.calledWith({
                where: { id: 'testId' },
                update: { matchName: 'Test Match', someField: 'value' },
                create: {
                    id: 'testId',
                    matchName: 'Test Match',
                    someField: 'value',
                    createdAt: sinon.match.date
                }
            }));
        });

        it('should handle errors for livematches model', async () => {
            const error = new Error('Database error');
            const upsertStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'livematches').value({ upsert: upsertStub });

            try {
                await insert({ id: 'testId' }, 'livematches');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['insert livematches error: ', error]));
            }
        });

        it('should handle errors for matchstats model', async () => {
            const error = new Error('Database error');
            const upsertStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'matchstats').value({ upsert: upsertStub });

            try {
                await insert({ id: 'testId' }, 'matchstats');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['insert matchstats error: ', error]));
            }
        });
    });

    describe('insertMany', () => {
        it('should insert multiple records in livematches model successfully', async () => {
            const mockResponse = { count: 2 };
            const createManyStub = sinon.stub().resolves(mockResponse);
            sinon.stub(prisma, 'livematches').value({ createMany: createManyStub });

            const testData = [
                { id: '1', matchUrl: 'test1' },
                { id: '2', matchUrl: 'test2' }
            ];
            const result = await insertMany(testData, 'livematches');

            assert.deepEqual(result, mockResponse);
            assert.isTrue(createManyStub.calledWith({ data: testData }));
        });

        it('should insert multiple records in matchstats model successfully', async () => {
            const mockResponse = { count: 2 };
            const createManyStub = sinon.stub().resolves(mockResponse);
            sinon.stub(prisma, 'matchstats').value({ createMany: createManyStub });

            const testData = [
                { id: '1', matchName: 'Match 1' },
                { id: '2', matchName: 'Match 2' }
            ];
            const result = await insertMany(testData, 'matchstats');

            assert.deepEqual(result, mockResponse);
            assert.isTrue(createManyStub.calledWith({ data: testData }));
        });

        it('should return undefined when matches array is empty for livematches', async () => {
            const result = await insertMany([], 'livematches');

            assert.isUndefined(result);
        });

        it('should return undefined when matches array is empty for matchstats', async () => {
            const result = await insertMany([], 'matchstats');

            assert.isUndefined(result);
        });

        it('should handle errors for livematches model', async () => {
            const error = new Error('Database error');
            const createManyStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'livematches').value({ createMany: createManyStub });

            try {
                await insertMany([{ id: 'testId' }], 'livematches');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['insertMany livematches error: ', error]));
            }
        });

        it('should handle errors for matchstats model', async () => {
            const error = new Error('Database error');
            const createManyStub = sinon.stub().rejects(error);
            sinon.stub(prisma, 'matchstats').value({ createMany: createManyStub });

            try {
                await insertMany([{ id: 'testId' }], 'matchstats');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.equal(err, error);
                assert.isTrue(loggerStub.calledWith(['insertMany matchstats error: ', error]));
            }
        });
    });

    describe('executeOnModel', () => {
        it('should throw error for unknown model', async () => {
            // This tests the default case in executeOnModel switch statement
            // We can't directly test executeOnModel as it's not exported, but we can test it indirectly
            // by calling functions with invalid model names
            
            try {
                // @ts-ignore - Testing invalid model name
                await findAll('invalidModel' as any);
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.include((err as Error).message, 'Unknown model: invalidModel');
            }
        });
    });
});
