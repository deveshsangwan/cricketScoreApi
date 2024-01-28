const Mongoose = require('mongoose');
const { writeLogInfo, writeLogError } = require(__basedir + 'app/core/logger');

class Mongo {
    constructor() {
        this._connect();
    }

    async _connect() {
        if (this.connection) {
            return this.connection;
        }

        let mongoUrl = 'mongodb+srv://devsangwan2001:DfAPHGxiB4OXF3xR@cricketscorecluster.c87xfpu.mongodb.net/CricketScoreApi?retryWrites=true&w=majority';
        try {
            this.connection = await Mongoose.connect(mongoUrl, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            writeLogInfo(['Database connection successful']);
        } catch (err) {
            writeLogError(['Database connection error', err]);
        }
    }
}

module.exports = new Mongo();