const Mongoose = require('mongoose');
const { writeLogInfo, writeLogError } = require(__basedir + 'app/core/logger');

class Mongo {
    constructor() {
        this._connect();
    }

    _connect() {
        let mongoUrl = 'mongodb+srv://devsangwan2001:DfAPHGxiB4OXF3xR@cricketscorecluster.c87xfpu.mongodb.net/CricketScoreApi?retryWrites=true&w=majority';
        Mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
            .then(() => {
                writeLogInfo(['Database connection successful']);
            })
            .catch(err => {
                writeLogError(['Database connection error', err]);
            })
    }
}

module.exports = new Mongo();