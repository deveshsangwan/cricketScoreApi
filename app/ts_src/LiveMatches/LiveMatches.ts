import { Promise as promise } from 'bluebird';
const axios = require('axios');
const cheerio = require('cheerio');
const randomstring = require("randomstring");
const mongo = require('../../core/baseModel');
const _ = require('underscore');

export class LiveMatches {
    constructor() {
    }

    public getMatches(matchId = "0"): Promise<{}> {
        return new promise(async (resolve, reject) => {
            if (matchId != "0") {
                const mongoData = await mongo.findById(matchId);

                if (mongoData.length) {
                    mongoData[0]['matchId'] = mongoData[0]['_id'];
                    delete mongoData[0]['_id'];
                    return resolve(mongoData[0]);
                }
            }
            const mongoData = await mongo.findAll();
            const scrapedData = await this.scrapeData(mongoData);

            return resolve(scrapedData);
        });
    }

    public scrapeData(mongoData): Promise<{}> {
        return new promise(async (resolve, reject) => {
            const options = {
                url: 'https://www.cricbuzz.com/cricket-match/live-scores',
                headers: {
                    'User-Agent': 'request'
                }
            };

            const matchesData = {}, matchesData1 = {};

            try {
                const response = await axios(options);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);
            
                    $('.cb-col-100 .cb-col .cb-schdl').each((i, el) => {
                        const matchUrl = $(el).find('.cb-lv-scr-mtch-hdr a').attr('href');
                        const matchName = $(el).find('.cb-billing-plans-text a').attr('title');
            
                        // if already exists in db, then add it to matchesData
                        if (mongoData.length && mongoData.find((item) => item.matchUrl === matchUrl)) {
                            const matchId = mongoData.find((item) => item.matchUrl === matchUrl)._id;
                            matchesData1[matchId] = {
                                matchUrl,
                                matchName
                            };
                        } else if (matchUrl && matchName) {
                            const matchId = randomstring.generate({
                                length: 16,
                                charset: 'alphanumeric'
                            });
                            matchesData[matchId] = {
                                matchUrl,
                                matchName
                            };
                        }
                    });
            
                    // insert new matches into db
                    let dataToInsert = [];
                    for (let key in matchesData) {
                        dataToInsert.push({
                            _id: key,
                            matchUrl: matchesData[key].matchUrl,
                            matchName: matchesData[key].matchName
                        });
                    }
                    await mongo.insertMany(dataToInsert);
            
                    return resolve(_.extend(matchesData1, matchesData));
                }
            } catch (error) {
                return reject(error);
            }
        });
    }
}