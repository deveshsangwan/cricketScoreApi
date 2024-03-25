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
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMany = exports.insert = exports.findIdByMatchUrl = exports.findById = exports.findAll = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Logger_1 = require("./Logger");
var MODEL_NAMES;
(function (MODEL_NAMES) {
    MODEL_NAMES["LIVE_MATCHES"] = "liveMatches";
    MODEL_NAMES["MATCH_STATS"] = "matchStats";
})(MODEL_NAMES || (MODEL_NAMES = {}));
// define model
const liveMatches = new mongoose_1.Schema({
    _id: {
        type: String,
        required: true
    },
    matchUrl: {
        type: String,
        required: true
    },
    matchName: {
        type: String,
        required: true
    },
});
const matchStats = new mongoose_1.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    _id: {
        type: String,
        required: true
    },
    team1: {
        type: Object,
        required: true
    },
    team2: {
        type: Object,
        required: true
    },
    onBatting: {
        type: Object,
        required: true
    },
    summary: {
        type: Object,
        required: true
    },
    tournamentName: {
        type: String,
        required: true
    },
    matchName: {
        type: String,
        required: true
    },
});
const LiveMatches = mongoose_1.default.model(MODEL_NAMES.LIVE_MATCHES, liveMatches);
const MatchStats = mongoose_1.default.model(MODEL_NAMES.MATCH_STATS, matchStats);
/**
 * Find all matches from a specified model
 * @param {String} modelName - The name of the model to query
 * @returns {Array} - An array of matches
 */
const findAll = async (modelName) => {
    try {
        const response = await mongoose_1.default.model(modelName).find({});
        return response;
    }
    catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        (0, Logger_1.writeLogError)([`findAll ${collectionName} error: `, err]);
        throw err;
    }
};
exports.findAll = findAll;
/**
 * Find a match by its ID from a specified model
 * @param {String} matchId - The ID of the match to find
 * @param {String} modelName - The name of the model to query
 * @returns {Object} - The match object if found, null otherwise
 */
const findById = async (matchId, modelName) => {
    try {
        const response = await mongoose_1.default.model(modelName).find({ _id: matchId });
        return response;
    }
    catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        (0, Logger_1.writeLogError)([`findById ${collectionName} error: `, err]);
        throw err;
    }
};
exports.findById = findById;
/**
 * Find a match ID by its URL
 * @param {String} matchUrl - The URL of the match to find
 * @returns {Object} - The match object if found, null otherwise
 */
const findIdByMatchUrl = async (matchUrl) => {
    try {
        return await mongoose_1.default.model(MODEL_NAMES.LIVE_MATCHES).find({ matchUrl: matchUrl });
    }
    catch (err) {
        (0, Logger_1.writeLogError)(['findIdByMatchUrl error: ', err]);
        throw err;
    }
};
exports.findIdByMatchUrl = findIdByMatchUrl;
/**
 * Insert a new match or update if already exists
 * @param {Object} data - match data
 * @param {String} modelName - model name
 * @returns {Object} - response
 */
const insert = async (data, modelName) => {
    try {
        const Model = mongoose_1.default.model(modelName);
        const response = await Model.findOneAndUpdate({ _id: data._id }, // find a document with `_id` same as `data._id`
        data, // document to insert when nothing was found
        { upsert: true, new: true, runValidators: true } // options
        );
        return response;
    }
    catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        (0, Logger_1.writeLogError)([`insert ${collectionName} error: `, err]);
        throw err;
    }
};
exports.insert = insert;
/**
 * Insert multiple matches into a specified model
 * @param {Array} matches - An array of match data to insert
 * @param {String} modelName - The name of the model to insert into
 * @returns {Array} - An array of the inserted match objects
 */
const insertMany = async (matches, modelName) => {
    try {
        const response = await mongoose_1.default.model(modelName).insertMany(matches);
        return response;
    }
    catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        (0, Logger_1.writeLogError)([`insertMany ${collectionName} error: `, err]);
        throw err;
    }
};
exports.insertMany = insertMany;
//# sourceMappingURL=BaseModel.js.map