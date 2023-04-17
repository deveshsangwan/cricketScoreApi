const Mongoose = require('mongoose');

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

// find all matches
const findAll = (stats = false) => {
    if (stats) {
        return new Promise(async (resolve, reject) => {
            let response = await Mongoose.model('matchStats', matchStats).find({});
            resolve(response);
        }).catch(err => {
            console.log("findAll MATCH_STATS error: ", err);
        });
    }

    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).find({});
        resolve(response);
    }).catch(err => {
        console.log("findAll LIVE_MATCHES error: ", err);
    });
}

// find match by id
const findById = (matchId, stats = false) => {
    if (stats) {
        return new Promise(async (resolve, reject) => {
            let response = await Mongoose.model('matchStats', matchStats).find({ _id: matchId });
            resolve(response);
        }).catch(err => {
            console.log("findById MATCH_STATS error: ", err);
        });
    }
    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).find({ _id: matchId });
        resolve(response);
    }).catch(err => {
        console.log("findById LIVE_MATCHES error: ", err);
    });
}

// find id by match url
const findIdByMatchUrl = (matchUrl) => {
    return new Promise((resolve, reject) => {
        Mongoose.model('liveMatches', liveMatches).find({ matchUrl: matchUrl });
    }).catch(err => {
        console.log("findIdByMatchUrl error: ", err);
    });
}

// insert one match
const insert = (data, stats = false) => {
    if (stats) {
        return new Promise(async (resolve, reject) => {
            let response = await Mongoose.model('matchStats', matchStats).create(data);
            resolve(response);
        }).catch(err => {
            console.log("insert MATCH_STATS error: ", err);
        });
    }
    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).create(data);
        resolve(response);
    }).catch(err => {
        console.log("insert LIVE_MATCHES error: ", err);
    });
}


// insert multiple matches
const insertMany = (matches, stats = false) => {
    if (stats) {
        return new Promise(async (resolve, reject) => {
            let response = await Mongoose.model('matchStats', matchStats).insertMany(matches);
            resolve(response);
        }).catch(err => {
            console.log("insertMany MATCH_STATS error: ", err);
        });
    }
    return new Promise(async (resolve, reject) => {
        let response = await Mongoose.model('liveMatches', liveMatches).insertMany(matches);
        resolve(response);
    }).catch(err => {
        console.log("insertMany LIVE_MATCHES error: ", err);
    });
}


module.exports = {
    findAll,
    findById,
    findIdByMatchUrl,
    insert,
    insertMany
}