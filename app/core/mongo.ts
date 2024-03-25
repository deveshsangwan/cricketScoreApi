import dotenv from 'dotenv';
import Mongoose, { Mongoose as MongooseType } from 'mongoose';
import { writeLogInfo, writeLogError } from './logger';

dotenv.config();

class Mongo {
    private connection: MongooseType | undefined;

    constructor() {
        this._connect();
    }

    private async _connect(): Promise<MongooseType | undefined> {
        if (this.connection) {
            return this.connection;
        }

        const mongoUrl: string = process.env.MONGO_URL || '';
        try {
            this.connection = await Mongoose.connect(mongoUrl);
            writeLogInfo(['Database connection successful']);
        } catch (err) {
            writeLogError(['Database connection error', err]);
        }
    }
}

export default new Mongo();