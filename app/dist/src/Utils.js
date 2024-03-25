"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const logger_1 = require("../core/logger");
const mongo = __importStar(require("../core/baseModel"));
class Utils {
    constructor() {
    }
    async fetchData(url) {
        const options = this.prepareRequestOptions(url);
        try {
            const response = await (0, axios_1.default)(options);
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
    }
    prepareRequestOptions(url) {
        return {
            url,
            headers: {
                'User-Agent': 'request'
            }
        };
    }
    // function for inserting data into matchStats table
    async insertDataToMatchStatsTable(scrapedData, matchId) {
        const dataToInsert = { ...scrapedData, _id: matchId ?? scrapedData['matchId'] };
        delete dataToInsert['matchId'];
        await mongo.insert(dataToInsert, 'matchStats');
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map