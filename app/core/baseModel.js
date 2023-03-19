const Mongoose = require('mongoose');
const { LiveMatches } = require('../src/LiveMatches/LiveMatches');

// define model
const liveMatches = new Mongoose.Schema({
    // add ttl of 1 minutes
    createdAt: {
        type: Date,
        default: Date.now
    },
    _id: {
        type: String,
        required: true
    },
    matchUrl: {
        type: String,
        required: true
    }
});

// find all matches
const findAll = () => {
    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).find({ });
        
        resolve(response);
    });
}

// find match by id
const findById = (matchId) => {
    return new Promise((resolve, reject) => {
        Mongoose.model('liveMatches', liveMatches).find({ _id: matchId }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

// insert one match
const insert = (matchId, matchUrl) => {
    LiveMatches.index({ createdAt: 1 }, { expireAfterSeconds: 30 });
    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).create({ _id: matchId, matchUrl: matchUrl });
        resolve(response);
    });
}


// insert multiple matches
const insertMany = (matches) => {
    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).insertMany(matches);
        resolve(response);
    });
}


module.exports = {
    findAll,
    findById,
    insert,
    insertMany
}