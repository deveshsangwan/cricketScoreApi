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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const Logger_1 = require("@core/Logger");
const mongo = __importStar(require("@core/BaseModel"));
/**
 * Utility class providing common functionality across the application
 */
class Utils {
    DEFAULT_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
    REQUEST_TIMEOUT = 10000; // 10 seconds
    /**
     * Fetches and parses HTML data from a given URL
     * @param url - URL to fetch data from
     * @returns Promise resolving to Cheerio instance
     * @throws Error if fetch fails or status is not 200
     */
    async fetchData(url) {
        const startTime = Date.now();
        (0, Logger_1.writeLogDebug)(['Utils: fetchData - Starting request', { url }]);
        if (!url) {
            (0, Logger_1.writeLogError)(['Utils: fetchData - URL is required']);
            throw new Error('URL is required');
        }
        const options = this.prepareRequestOptions(url);
        (0, Logger_1.writeLogDebug)([
            'Utils: fetchData - Request options prepared',
            {
                url,
                timeout: options.timeout,
            },
        ]);
        try {
            const response = await (0, axios_1.default)(options);
            const duration = Date.now() - startTime;
            if (response.status === 200) {
                (0, Logger_1.writeLogDebug)([
                    'Utils: fetchData - Request successful',
                    {
                        url,
                        statusCode: response.status,
                        contentLength: response.data?.length,
                        duration: `${duration}ms`,
                    },
                ]);
                (0, Logger_1.logExternalAPICall)(url, 'GET', response.status, duration);
                (0, Logger_1.logPerformance)('Utils-fetchData', duration, { url, statusCode: response.status });
                return cheerio.load(response.data);
            }
            const errorMsg = `Failed to fetch data: ${response.status} ${response.statusText}`;
            (0, Logger_1.writeLogError)([
                'Utils: fetchData - Request failed',
                {
                    url,
                    statusCode: response.status,
                    statusText: response.statusText,
                    duration: `${duration}ms`,
                },
            ]);
            (0, Logger_1.logExternalAPICall)(url, 'GET', response.status, duration, errorMsg);
            throw new Error(errorMsg);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const statusCode = error.response?.status;
            const errorMessage = error.message || 'Unknown error';
            (0, Logger_1.writeLogError)([
                'Utils | fetchData | error',
                {
                    url,
                    error: errorMessage,
                    statusCode,
                    duration: `${duration}ms`,
                },
            ]);
            (0, Logger_1.logExternalAPICall)(url, 'GET', statusCode, duration, errorMessage);
            throw error;
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
                Accept: 'text/html,application/xhtml+xml,application/xml',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            validateStatus: (status) => status === 200,
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
            (0, Logger_1.writeLogError)(['Utils: insertDataToMatchStatsTable - Scraped data is required']);
            throw new Error('Scraped data is required');
        }
        const startTime = Date.now();
        (0, Logger_1.writeLogDebug)([
            'Utils: insertDataToMatchStatsTable - Starting',
            {
                matchId: matchId ?? scrapedData['matchId'],
                hasData: !!scrapedData,
            },
        ]);
        try {
            const dataToInsert = {
                ...scrapedData,
                id: matchId ?? scrapedData['matchId'],
            };
            delete dataToInsert['matchId'];
            (0, Logger_1.writeLogDebug)([
                'Utils: insertDataToMatchStatsTable - Inserting data',
                {
                    id: dataToInsert.id,
                    hasTeam1: !!dataToInsert.team1,
                    hasTeam2: !!dataToInsert.team2,
                },
            ]);
            await mongo.insert(dataToInsert, 'matchstats');
            const duration = Date.now() - startTime;
            (0, Logger_1.writeLogDebug)([
                'Utils: insertDataToMatchStatsTable - Successfully inserted',
                {
                    id: dataToInsert.id,
                    duration: `${duration}ms`,
                },
            ]);
        }
        catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error.message || 'Unknown error';
            (0, Logger_1.writeLogError)([
                'Utils | insertDataToMatchStatsTable | error',
                {
                    matchId: matchId ?? scrapedData['matchId'],
                    error: errorMessage,
                    duration: `${duration}ms`,
                },
            ]);
            (0, Logger_1.logDatabaseOperation)('insert', 'matchstats', false, duration, errorMessage);
            throw error;
        }
    }
}
exports.Utils = Utils;
//# sourceMappingURL=Utils.js.map