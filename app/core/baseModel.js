const Mongoose = require('mongoose');
const { writeLogInfo, writeLogError } = require('../core/logger');

// define model
const liveMatches = new Mongoose.Schema({
    // add ttl of 1 minutes
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
    // add ttl of 1 minutes
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

const LiveMatches = Mongoose.model('liveMatches', liveMatches);
const MatchStats = Mongoose.model('matchStats', matchStats);

// find all matches
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

// find match by id
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

// find id by match url
const findIdByMatchUrl = (matchUrl) => {
    return new Promise((resolve, reject) => {
        Mongoose.model('liveMatches', liveMatches).find({ matchUrl: matchUrl });
    }).catch(err => {
        writeLogError(["findIdByMatchUrl error: ", err]);
    });
}

// insert one match
const insert = async (data, modelName) => {
    try {
        const response = await Mongoose.model(modelName).create(data);
        return response;
    } catch (err) {
        const collectionName = modelName === 'matchStats' ? 'MATCH_STATS' : 'LIVE_MATCHES';
        writeLogError([`insert ${collectionName} error: `, err]);
        throw err;
    }
};


// insert multiple matches
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
}