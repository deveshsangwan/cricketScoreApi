const Mongoose = require('mongoose');

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
                console.log('Database connection successful');
            })
            .catch(err => {
                console.error('Database connection error');
            })
    }
}

module.exports = new Mongo();