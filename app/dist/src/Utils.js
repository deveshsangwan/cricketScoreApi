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
const Logger_1 = require("../core/Logger");
const mongo = __importStar(require("../core/BaseModel"));
/**
 * Utility class providing common functionality across the application
 */
class Utils {
    DEFAULT_USER_AGENT = 'Mozilla/5.0 (compatible; CricketStatsBot/1.0)';
    REQUEST_TIMEOUT = 10000; // 10 seconds
    /**
     * Fetches and parses HTML data from a given URL
     * @param url - URL to fetch data from
     * @returns Promise resolving to Cheerio instance
     * @throws Error if fetch fails or status is not 200
     */
    async fetchData(url) {
        if (!url) {
            throw new Error('URL is required');
        }
        const options = this.prepareRequestOptions(url);
        try {
            const response = await (0, axios_1.default)(options);
            if (response.status === 200) {
                return cheerio.load(response.data);
            }
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }
        catch (error) {
            (0, Logger_1.writeLogError)(['Utils | fetchData | error', error]);
            throw error; // Let caller handle the error
        }
    }
    /**
     * Prepares request options for HTTP requests
     * @param url - Target URL
     * @returns AxiosRequestConfig containing request configuration
     */
    prepareRequestOptions(url) {
        return {
            url,
            timeout: this.REQUEST_TIMEOUT,
            headers: {
                'User-Agent': this.DEFAULT_USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9'
            },
            validateStatus: (status) => status === 200
        };
    }
    /**
     * Inserts or updates match statistics in the database
     * @param scrapedData - Match data to be inserted
     * @param matchId - Optional match ID for the record
     * @throws Error if database operation fails
     */
    async insertDataToMatchStatsTable(scrapedData, matchId) {
        if (!scrapedData) {
            throw new Error('Scraped data is required');
        }
        try {
            const dataToInsert = {
                ...scrapedData,
                id: matchId ?? scrapedData['matchId']
            };
            delete dataToInsert['matchId'];
            await mongo.insert(dataToInsert, 'matchstats');
        }
        catch (error) {
            (0, Logger_1.writeLogError)(['Utils | insertDataToMatchStatsTable | error', error]);
            throw error;
        }
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map