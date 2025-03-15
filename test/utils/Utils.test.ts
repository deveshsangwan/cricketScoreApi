import { expect } from 'chai';
import * as sinon from 'sinon';
import { Utils } from '../../app/dist/utils/Utils';

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
                expect(error.message).to.equal('URL is required');
            }
        });
    });
    
    describe('insertDataToMatchStatsTable', () => {
        it('should throw an error if scrapedData is not provided', async () => {
            try {
                await utils.insertDataToMatchStatsTable(null, 'test-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.message).to.equal('Scraped data is required');
            }
        });
    });
});