"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const axios = require('axios');
const cheerio = require('cheerio');
const logger_1 = require("../core/logger");
const mongo = require('../core/baseModel');
class Utils {
    constructor() {
    }
    fetchData(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = this.prepareRequestOptions(url);
            try {
                const response = yield axios(options);
                if (response.status === 200) {
                    const $ = cheerio.load(response.data);
                    return Promise.resolve($);
                }
                throw new Error(`Error while fetching data from url: ${url}`);
            }
            catch (error) {
                (0, logger_1.writeLogError)(['Utils | scrapeData | error', error]);
                return Promise.reject(error);
            }
        });
    }
    prepareRequestOptions(url) {
        return {
            url,
            headers: {
                'User-Agent': 'request'
            }
        };
    }
    // function for inserting data into liveMatches table
    insertDataToLiveMatchesTable(matchesData) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataToInsert = Object.entries(matchesData).map(([key, value]) => ({
                _id: key,
                matchUrl: value.matchUrl,
                matchName: value.matchName
            }));
            yield mongo.insertMany(dataToInsert, 'liveMatches');
        });
    }
    // function for inserting data into matchStats table
    insertDataToMatchStatsTable(scrapedData, matchId) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataToInsert = Object.assign(Object.assign({}, scrapedData), { _id: matchId ? matchId : scrapedData['matchId'] });
            delete dataToInsert['matchId'];
            yield mongo.insert(dataToInsert, 'matchStats');
        });
    }
}
exports.Utils = Utils;
