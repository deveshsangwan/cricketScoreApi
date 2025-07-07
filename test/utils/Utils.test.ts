import { expect } from 'chai';
import * as sinon from 'sinon';
import { Utils } from '../../app/src/utils/Utils';

describe('Utils', () => {
    let utils: Utils;

    beforeEach(() => {
        utils = new Utils();
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
            }
        });
    });

    describe('insertDataToMatchStatsTable', () => {
        it('should throw an error if scrapedData is not provided', async () => {
            try {
                await utils.insertDataToMatchStatsTable(null as any, 'test-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect((error as Error).message).to.equal('Scraped data is required');
            }
        });
    });
});
