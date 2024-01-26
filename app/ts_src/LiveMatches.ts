import { Utils } from './Utils';
import { writeLogInfo, writeLogError } from '../core/logger';
const cheerio = require('cheerio');
const randomstring = require("randomstring");
const mongo = require('../core/baseModel');
const _ = require('underscore');

export class LiveMatches {
    private tableName: string;
    private utilsObj: Utils;

    constructor() {
        this.tableName = 'liveMatches';
        this.utilsObj = new Utils();
    }

    public async getMatches(matchId = "0"): Promise<{}> {
        if (matchId !== "0") {
            try {
                const mongoData = await mongo.findById(matchId, this.tableName);

                if (mongoData.length) {
                    mongoData[0]['matchId'] = mongoData[0]['_id'];
                    delete mongoData[0]['_id'];
                    return mongoData[0];
                } else {
                    throw new Error(`No match found with id: ${matchId}`);
                }
            } catch (error) {
                writeLogError(['LiveMatches | getMatches | error', error]);
                throw error;
            }
        }

        try {
            const mongoData = await mongo.findAll(this.tableName);
            const scrapedData = await this.scrapeData(mongoData);
            return scrapedData;
        } catch (error) {
            writeLogError(['LiveMatches | getMatches | error', error]);
            throw error;
        }
    }

    private async scrapeData(mongoData): Promise<{}> {
        try {
            let url = 'https://www.cricbuzz.com/cricket-match/live-scores';
            const response = await this.utilsObj.fetchData(url);
            let matchesData = this.processData(response, mongoData);
            // matches data is an array of 2 objects insert the second into db as first is already present and return both after combining
            await this.insertData(matchesData[1]);
            matchesData = _.extend(matchesData[0], matchesData[1]);
            return matchesData;
        } catch (error) {
            writeLogError(['LiveMatches | scrapeData | error', error])
            throw error;
        }
    }

    private processData($, mongoData) {
        const matchesData = {}, matchesData1 = {};
        $('.cb-col-100 .cb-col .cb-schdl').each((i, el) => {
            const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
            const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            if (matchUrl && matchName) {
                const existingMatch = mongoData.find((item) => item.matchUrl === matchUrl);
                if (existingMatch) {
                    matchesData1[existingMatch._id] = { matchUrl, matchName };
                } else {
                    const matchId = randomstring.generate({ length: 16, charset: 'alphanumeric' });
                    matchesData[matchId] = { matchUrl, matchName };
                }
            }
        });
        return [matchesData1, matchesData];
    }

    private async insertData(matchesData: { [key: string]: { matchUrl: string, matchName: string } }) {
        const dataToInsert = Object.entries(matchesData).map(([key, value]) => ({
            _id: key,
            matchUrl: value.matchUrl,
            matchName: value.matchName
        }));

        await mongo.insertMany(dataToInsert, this.tableName);
    }

}