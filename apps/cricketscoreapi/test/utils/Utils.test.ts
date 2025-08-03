import { expect } from 'chai';
import * as sinon from 'sinon';
import { Utils } from '../../app/src/utils/Utils';
import * as Logger from '../../app/src/core/Logger';
import * as mongo from '../../app/src/core/BaseModel';
import type { MatchStatsResponse } from '../../../../packages/shared-types';

describe('Utils', () => {
    let utils: Utils;
    let loggerStubs: { [key: string]: sinon.SinonStub };
    let mongoInsertStub: sinon.SinonStub;

    const mockMatchStatsData: MatchStatsResponse = {
        matchId: 'test-match-123',
        isLive: true,
        team1: {
            isBatting: true,
            name: 'Team A',
            score: '150',
            overs: '20.0',
            wickets: '3',
        },
        team2: {
            isBatting: false,
            name: 'Team B',
            score: '120',
            overs: '18.0',
            wickets: '5',
        },
        onBatting: {
            player1: { name: 'Player 1', runs: '45', balls: '30' },
            player2: { name: 'Player 2', runs: '25', balls: '20' },
        },
        runRate: {
            currentRunRate: 7.5,
            requiredRunRate: 8.2,
        },
        summary: 'Team A needs 31 runs in 12 balls',
        tournamentName: 'Test Tournament',
        matchName: 'Team A vs Team B',
        keyStats: { sixes: '5', fours: '12' },
    };

    beforeEach(() => {
        utils = new Utils();

        // Mock all logger functions
        loggerStubs = {
            writeLogError: sinon.stub(Logger, 'writeLogError'),
            writeLogDebug: sinon.stub(Logger, 'writeLogDebug'),
            logExternalAPICall: sinon.stub(Logger, 'logExternalAPICall'),
            logDatabaseOperation: sinon.stub(Logger, 'logDatabaseOperation'),
            logPerformance: sinon.stub(Logger, 'logPerformance'),
        };

        // Mock mongo
        mongoInsertStub = sinon.stub(mongo, 'insert');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('fetchData', () => {
        it('should throw an error if URL is not provided', async () => {
            try {
                await utils.fetchData('');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('URL is required');
                expect(loggerStubs.writeLogError.calledOnce).to.be.true;
                expect(loggerStubs.writeLogError.calledWith(['Utils: fetchData - URL is required']))
                    .to.be.true;
            }
        });

        it('should throw an error if URL is null', async () => {
            try {
                await utils.fetchData(null as any);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('URL is required');
                expect(loggerStubs.writeLogError.calledOnce).to.be.true;
            }
        });

        it('should throw an error if URL is undefined', async () => {
            try {
                await utils.fetchData(undefined as any);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('URL is required');
                expect(loggerStubs.writeLogError.calledOnce).to.be.true;
            }
        });

        it('should log debug message when starting request', async () => {
            const testUrl = 'https://example.com/test';

            // This test verifies that the initial debug log is called
            // We don't need to wait for the full request to complete
            const fetchPromise = utils.fetchData(testUrl);

            // Give it a moment to log the initial message
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(
                loggerStubs.writeLogDebug.calledWith([
                    'Utils: fetchData - Starting request',
                    { url: testUrl },
                ])
            ).to.be.true;

            // Clean up the promise to avoid unhandled rejection warnings
            fetchPromise.catch(() => {});
        });
    });

    describe('insertDataToMatchStatsTable', () => {
        it('should throw an error if scrapedData is not provided', async () => {
            try {
                await utils.insertDataToMatchStatsTable(null as any, 'test-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('Scraped data is required');
                expect(
                    loggerStubs.writeLogError.calledWith([
                        'Utils: insertDataToMatchStatsTable - Scraped data is required',
                    ])
                ).to.be.true;
            }
        });

        it('should throw an error if scrapedData is undefined', async () => {
            try {
                await utils.insertDataToMatchStatsTable(undefined as any);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('Scraped data is required');
                expect(
                    loggerStubs.writeLogError.calledWith([
                        'Utils: insertDataToMatchStatsTable - Scraped data is required',
                    ])
                ).to.be.true;
            }
        });

        it('should throw an error if scrapedData is falsy', async () => {
            try {
                await utils.insertDataToMatchStatsTable(0 as any);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('Scraped data is required');
            }
        });

        it('should successfully insert data with provided matchId', async () => {
            const testMatchId = 'custom-match-456';
            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(mockMatchStatsData, testMatchId);

            expect(mongoInsertStub.calledOnce).to.be.true;

            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];
            const collection = insertCall.args[1];

            expect(collection).to.equal('matchstats');
            expect(insertedData.id).to.equal(testMatchId);
            expect(insertedData.matchId).to.be.undefined; // Should be removed
            expect(insertedData.team1).to.deep.equal(mockMatchStatsData.team1);
            expect(insertedData.team2).to.deep.equal(mockMatchStatsData.team2);
        });

        it('should successfully insert data using scrapedData matchId when no matchId provided', async () => {
            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(mockMatchStatsData);

            expect(mongoInsertStub.calledOnce).to.be.true;

            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            expect(insertedData.id).to.equal(mockMatchStatsData.matchId);
            expect(insertedData.matchId).to.be.undefined; // Should be removed
        });

        it('should handle mongo insert errors and rethrow them', async () => {
            const mongoError = new Error('Database connection failed');
            mongoInsertStub.rejects(mongoError);

            try {
                await utils.insertDataToMatchStatsTable(mockMatchStatsData, 'test-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.equal(mongoError);
                expect(
                    loggerStubs.writeLogError.calledWith([
                        'Utils | insertDataToMatchStatsTable | error',
                        sinon.match.object,
                    ])
                ).to.be.true;
                expect(
                    loggerStubs.logDatabaseOperation.calledWith(
                        'insert',
                        'matchstats',
                        false,
                        sinon.match.number,
                        'Database connection failed'
                    )
                ).to.be.true;
            }
        });

        it('should preserve all data fields except matchId during transformation', async () => {
            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(mockMatchStatsData, 'test-id');

            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            // Verify all fields are preserved except matchId
            expect(insertedData.isLive).to.equal(mockMatchStatsData.isLive);
            expect(insertedData.summary).to.equal(mockMatchStatsData.summary);
            expect(insertedData.tournamentName).to.equal(mockMatchStatsData.tournamentName);
            expect(insertedData.matchName).to.equal(mockMatchStatsData.matchName);
            expect(insertedData.onBatting).to.deep.equal(mockMatchStatsData.onBatting);
            expect(insertedData.runRate).to.deep.equal(mockMatchStatsData.runRate);
            expect(insertedData.keyStats).to.deep.equal(mockMatchStatsData.keyStats);
        });

        it('should log detailed debug information during insertion', async () => {
            mongoInsertStub.resolves();
            const testMatchId = 'debug-test-789';

            await utils.insertDataToMatchStatsTable(mockMatchStatsData, testMatchId);

            // Verify starting log
            expect(
                loggerStubs.writeLogDebug.calledWith([
                    'Utils: insertDataToMatchStatsTable - Starting',
                    { matchId: testMatchId, hasData: true },
                ])
            ).to.be.true;

            // Verify inserting log
            expect(
                loggerStubs.writeLogDebug.calledWith([
                    'Utils: insertDataToMatchStatsTable - Inserting data',
                    { id: testMatchId, hasTeam1: true, hasTeam2: true },
                ])
            ).to.be.true;

            // Verify success log
            expect(
                loggerStubs.writeLogDebug.calledWith([
                    'Utils: insertDataToMatchStatsTable - Successfully inserted',
                    { id: testMatchId, duration: sinon.match.string },
                ])
            ).to.be.true;
        });

        it('should handle data without optional fields', async () => {
            const minimalData: MatchStatsResponse = {
                matchId: 'minimal-123',
                team1: {
                    isBatting: true,
                    name: 'Team A',
                    score: '100',
                    wickets: '2',
                },
                team2: {
                    isBatting: false,
                    name: 'Team B',
                    score: '80',
                    wickets: '4',
                },
                onBatting: {
                    player1: { name: 'Player 1', runs: '20', balls: '15' },
                    player2: { name: 'Player 2', runs: '30', balls: '25' },
                },
                summary: 'Team A is batting',
                keyStats: {},
            };

            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(minimalData);

            expect(mongoInsertStub.calledOnce).to.be.true;

            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            expect(insertedData.id).to.equal(minimalData.matchId);
            expect(insertedData.isLive).to.be.undefined;
            expect(insertedData.runRate).to.be.undefined;
            expect(insertedData.tournamentName).to.be.undefined;
            expect(insertedData.matchName).to.be.undefined;
        });

        it('should handle case when scrapedData has no matchId and no custom matchId provided', async () => {
            const dataWithoutMatchId = { ...mockMatchStatsData };
            delete dataWithoutMatchId.matchId;

            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(dataWithoutMatchId);

            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            expect(insertedData.id).to.be.undefined;
        });

        it('should log error details when mongo operation fails', async () => {
            const mongoError = new Error('Connection timeout');
            mongoInsertStub.rejects(mongoError);

            try {
                await utils.insertDataToMatchStatsTable(mockMatchStatsData, 'timeout-test');
            } catch (error) {
                // Expected to throw
            }

            expect(
                loggerStubs.writeLogError.calledWith([
                    'Utils | insertDataToMatchStatsTable | error',
                    sinon.match
                        .has('matchId', 'timeout-test')
                        .and(sinon.match.has('error', 'Connection timeout'))
                        .and(sinon.match.has('duration')),
                ])
            ).to.be.true;
        });

        it('should handle unknown errors during mongo operation', async () => {
            const unknownError = { weird: 'error object' };
            mongoInsertStub.rejects(unknownError);

            try {
                await utils.insertDataToMatchStatsTable(mockMatchStatsData);
            } catch (error) {
                expect(error).to.equal(unknownError);
            }

            expect(
                loggerStubs.logDatabaseOperation.calledWith(
                    'insert',
                    'matchstats',
                    false,
                    sinon.match.number,
                    'Unknown error'
                )
            ).to.be.true;
        });
    });

    describe('Edge Cases and Boundary Testing', () => {
        it('should handle very large match data objects', async () => {
            const largeData: MatchStatsResponse = {
                ...mockMatchStatsData,
                keyStats: {},
            };

            // Add many key stats
            for (let i = 0; i < 1000; i++) {
                largeData.keyStats[`stat${i}`] = `value${i}`;
            }

            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(largeData);

            expect(mongoInsertStub.calledOnce).to.be.true;
            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            expect(Object.keys(insertedData.keyStats)).to.have.length(1000);
        });

        it('should handle special characters in team names and player names', async () => {
            const specialCharData: MatchStatsResponse = {
                ...mockMatchStatsData,
                team1: {
                    ...mockMatchStatsData.team1,
                    name: 'Tëam Ü@ñ!còdé',
                },
                team2: {
                    ...mockMatchStatsData.team2,
                    name: '팀 한글 名前',
                },
                onBatting: {
                    player1: { name: 'Plàyér Øné', runs: '45', balls: '30' },
                    player2: { name: 'プレイヤー2', runs: '25', balls: '20' },
                },
            };

            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(specialCharData);

            expect(mongoInsertStub.calledOnce).to.be.true;
            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            expect(insertedData.team1.name).to.equal('Tëam Ü@ñ!còdé');
            expect(insertedData.team2.name).to.equal('팀 한글 名前');
            expect(insertedData.onBatting.player1.name).to.equal('Plàyér Øné');
            expect(insertedData.onBatting.player2.name).to.equal('プレイヤー2');
        });

        it('should handle empty string values in match data', async () => {
            const emptyStringData: MatchStatsResponse = {
                ...mockMatchStatsData,
                summary: '',
                tournamentName: '',
                matchName: '',
                team1: {
                    ...mockMatchStatsData.team1,
                    score: '',
                    overs: '',
                    wickets: '',
                },
            };

            mongoInsertStub.resolves();

            await utils.insertDataToMatchStatsTable(emptyStringData);

            expect(mongoInsertStub.calledOnce).to.be.true;
            const insertCall = mongoInsertStub.getCall(0);
            const insertedData = insertCall.args[0];

            expect(insertedData.summary).to.equal('');
            expect(insertedData.team1.score).to.equal('');
        });
    });
});
