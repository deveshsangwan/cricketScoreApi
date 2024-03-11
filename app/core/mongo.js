require('dotenv').config();
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

        let mongoUrl = process.env.MONGO_URL;
        try {
            this.connection = await Mongoose.connect(mongoUrl);
            writeLogInfo(['Database connection successful']);
        } catch (err) {
            writeLogError(['Database connection error', err]);
        }
    }
}

module.exports = new Mongo();