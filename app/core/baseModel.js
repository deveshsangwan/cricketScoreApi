const Mongoose = require('mongoose');
const { writeLogInfo, writeLogError } = require('../core/logger');

const MODEL_NAMES = {
    LIVE_MATCHES: 'liveMatches',
    MATCH_STATS: 'matchStats'
};

// define model
const liveMatches = new Mongoose.Schema({
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

const matchStats = new Mongoose.Schema({
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

const LiveMatches = Mongoose.model(MODEL_NAMES.LIVE_MATCHES, liveMatches);
const MatchStats = Mongoose.model(MODEL_NAMES.MATCH_STATS, matchStats);

/**
 * Find all matches from a specified model
 * @param {String} modelName - The name of the model to query
 * @returns {Array} - An array of matches
 */
const findAll = async (modelName) => {
    try {
        const response = await Mongoose.model(modelName).find({});
        return response;
    } catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        writeLogError([`findAll ${collectionName} error: `, err]);
        throw err;
    }
};

/**
 * Find a match by its ID from a specified model
 * @param {String} matchId - The ID of the match to find
 * @param {String} modelName - The name of the model to query
 * @returns {Object} - The match object if found, null otherwise
 */
const findById = async (matchId, modelName) => {
    try {
        const response = await Mongoose.model(modelName).find({ _id: matchId });
        return response;
    } catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        writeLogError([`findById ${collectionName} error: `, err]);
        throw err;
    }
};

/**
 * Find a match ID by its URL
 * @param {String} matchUrl - The URL of the match to find
 * @returns {Object} - The match object if found, null otherwise
 */
const findIdByMatchUrl = async (matchUrl) => {
    try {
        return await Mongoose.model(MODEL_NAMES.LIVE_MATCHES).find({ matchUrl: matchUrl });
    } catch (err) {
        writeLogError(['findIdByMatchUrl error: ', err]);
        throw err;
    }
};

/**
 * Insert a new match or update if already exists
 * @param {Object} data - match data
 * @param {String} modelName - model name
 * @returns {Object} - response
 */
const insert = async (data, modelName) => {
    try {
        const Model = Mongoose.model(modelName);
        const response = await Model.findOneAndUpdate(
            { _id: data._id }, // find a document with `_id` same as `data._id`
            data, // document to insert when nothing was found
            { upsert: true, new: true, runValidators: true } // options
        );
        return response;
    } catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        writeLogError([`insert ${collectionName} error: `, err]);
        throw err;
    }
};


/**
 * Insert multiple matches into a specified model
 * @param {Array} matches - An array of match data to insert
 * @param {String} modelName - The name of the model to insert into
 * @returns {Array} - An array of the inserted match objects
 */
const insertMany = async (matches, modelName) => {
    try {
        const response = await Mongoose.model(modelName).insertMany(matches);
        return response;
    } catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        writeLogError([`insertMany ${collectionName} error: `, err]);
        throw err;
    }
};


module.exports = {
    findAll,
    findById,
    findIdByMatchUrl,
    insert,
    insertMany
};